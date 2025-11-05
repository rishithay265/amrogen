import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import http from 'http'
import { dbPool, connectRedis } from './db/client'
import { runOrchestrator } from './agents/orchestrator'
import { qualifyLead } from './agents/qualification'
import { discoverLeads } from './agents/discovery'
import { generateOutreachSequence, sendEmail } from './agents/outreach'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Get all leads
app.get('/api/leads', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query
    
    let query = 'SELECT * FROM leads WHERE 1=1'
    const params: any[] = []
    
    if (status) {
      query += ' AND status = $1'
      params.push(status)
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(Number(limit), Number(offset))
    
    const result = await dbPool.query(query, params)
    
    res.json({
      leads: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        company: row.company,
        title: row.title,
        source: row.source,
        status: row.status,
        qualificationScore: row.qualification_score,
        engagementScore: row.engagement_score,
        painPoints: row.pain_points,
        budget: row.budget,
        timeline: row.timeline,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        assignedTo: row.assigned_to,
        tags: row.tags,
        metadata: row.metadata
      })),
      total: result.rowCount
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    res.status(500).json({ error: 'Failed to fetch leads' })
  }
})

// Get single lead
app.get('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const leadResult = await dbPool.query('SELECT * FROM leads WHERE id = $1', [id])
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' })
    }
    
    const activitiesResult = await dbPool.query(
      'SELECT * FROM activities WHERE lead_id = $1 ORDER BY timestamp DESC',
      [id]
    )
    
    const lead = leadResult.rows[0]
    res.json({
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        title: lead.title,
        source: lead.source,
        status: lead.status,
        qualificationScore: lead.qualification_score,
        engagementScore: lead.engagement_score,
        painPoints: lead.pain_points,
        budget: lead.budget,
        timeline: lead.timeline,
        createdAt: lead.created_at,
        updatedAt: lead.updated_at,
        assignedTo: lead.assigned_to,
        tags: lead.tags,
        metadata: lead.metadata
      },
      activities: activitiesResult.rows.map(row => ({
        id: row.id,
        leadId: row.lead_id,
        type: row.type,
        subject: row.subject,
        content: row.content,
        outcome: row.outcome,
        sentBy: row.sent_by,
        agentName: row.agent_name,
        timestamp: row.timestamp,
        metadata: row.metadata
      }))
    })
  } catch (error) {
    console.error('Error fetching lead:', error)
    res.status(500).json({ error: 'Failed to fetch lead' })
  }
})

// Create new lead
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, company, title, source, painPoints = [], budget, timeline } = req.body
    
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await dbPool.query(
      `INSERT INTO leads (id, name, email, company, title, source, pain_points, budget, timeline, tags, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [leadId, name, email, company, title, source, JSON.stringify(painPoints), budget, timeline, JSON.stringify([]), JSON.stringify({})]
    )
    
    // Emit event to frontend
    io.emit('lead:created', { leadId, name, company })
    
    // Trigger orchestrator in background
    const leadResult = await dbPool.query('SELECT * FROM leads WHERE id = $1', [leadId])
    const lead = leadResult.rows[0]
    
    runOrchestrator({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      title: lead.title,
      source: lead.source,
      status: lead.status,
      qualificationScore: lead.qualification_score || 0,
      engagementScore: lead.engagement_score || 0,
      painPoints: lead.pain_points || [],
      budget: lead.budget,
      timeline: lead.timeline,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      assignedTo: lead.assigned_to,
      tags: lead.tags || [],
      metadata: lead.metadata || {}
    }).then(decision => {
      io.emit('lead:processed', { leadId, decision })
    }).catch(err => {
      console.error('Orchestrator error:', err)
    })
    
    res.json({ success: true, leadId })
  } catch (error) {
    console.error('Error creating lead:', error)
    res.status(500).json({ error: 'Failed to create lead' })
  }
})

// Qualify lead endpoint
app.post('/api/leads/:id/qualify', async (req, res) => {
  try {
    const { id } = req.params
    
    const leadResult = await dbPool.query('SELECT * FROM leads WHERE id = $1', [id])
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' })
    }
    
    const lead = leadResult.rows[0]
    const qualification = await qualifyLead({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      title: lead.title,
      source: lead.source,
      status: lead.status,
      qualificationScore: lead.qualification_score || 0,
      engagementScore: lead.engagement_score || 0,
      painPoints: lead.pain_points || [],
      budget: lead.budget,
      timeline: lead.timeline,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      assignedTo: lead.assigned_to,
      tags: lead.tags || [],
      metadata: lead.metadata || {}
    })
    
    // Update lead with qualification score
    await dbPool.query(
      'UPDATE leads SET qualification_score = $1, metadata = metadata || $2 WHERE id = $3',
      [qualification.qualificationScore, JSON.stringify({ qualification }), id]
    )
    
    io.emit('lead:qualified', { leadId: id, qualification })
    
    res.json({ success: true, qualification })
  } catch (error) {
    console.error('Error qualifying lead:', error)
    res.status(500).json({ error: 'Failed to qualify lead' })
  }
})

// Generate outreach sequence
app.post('/api/leads/:id/outreach', async (req, res) => {
  try {
    const { id } = req.params
    const { sequenceType = 'cold_outreach' } = req.body
    
    const leadResult = await dbPool.query('SELECT * FROM leads WHERE id = $1', [id])
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' })
    }
    
    const lead = leadResult.rows[0]
    const sequence = await generateOutreachSequence({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      title: lead.title,
      source: lead.source,
      status: lead.status,
      qualificationScore: lead.qualification_score || 0,
      engagementScore: lead.engagement_score || 0,
      painPoints: lead.pain_points || [],
      budget: lead.budget,
      timeline: lead.timeline,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      assignedTo: lead.assigned_to,
      tags: lead.tags || [],
      metadata: lead.metadata || {}
    }, sequenceType as any)
    
    res.json({ success: true, sequence })
  } catch (error) {
    console.error('Error generating outreach:', error)
    res.status(500).json({ error: 'Failed to generate outreach' })
  }
})

// Discover new leads
app.post('/api/discover', async (req, res) => {
  try {
    const { jobTitles, companySize, location, keywords, maxResults } = req.body
    
    const result = await discoverLeads({
      jobTitles,
      companySize,
      location,
      keywords,
      maxResults
    })
    
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('Error discovering leads:', error)
    res.status(500).json({ error: 'Failed to discover leads' })
  }
})

// Analytics endpoints
app.get('/api/analytics/pipeline', async (req, res) => {
  try {
    const result = await dbPool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(budget), 0) as total_value,
        ROUND(AVG(qualification_score), 2) as avg_score
      FROM leads
      GROUP BY status
      ORDER BY 
        CASE status
          WHEN 'new' THEN 1
          WHEN 'contacted' THEN 2
          WHEN 'qualified' THEN 3
          WHEN 'proposal' THEN 4
          WHEN 'negotiation' THEN 5
          WHEN 'closed_won' THEN 6
          WHEN 'closed_lost' THEN 7
        END
    `)
    
    res.json({ pipeline: result.rows })
  } catch (error) {
    console.error('Error fetching pipeline analytics:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

app.get('/api/analytics/summary', async (req, res) => {
  try {
    const stats = await dbPool.query(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE status = 'qualified') as qualified_leads,
        COUNT(*) FILTER (WHERE status = 'closed_won') as won_deals,
        COALESCE(SUM(budget) FILTER (WHERE status = 'closed_won'), 0) as total_revenue,
        ROUND(AVG(qualification_score), 2) as avg_qualification_score,
        ROUND(AVG(engagement_score), 2) as avg_engagement_score
      FROM leads
    `)
    
    const recentActivity = await dbPool.query(`
      SELECT COUNT(*) as activity_count
      FROM activities
      WHERE timestamp > NOW() - INTERVAL '7 days'
    `)
    
    res.json({
      summary: {
        ...stats.rows[0],
        recent_activities: recentActivity.rows[0].activity_count
      }
    })
  } catch (error) {
    console.error('Error fetching summary:', error)
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
})

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Start server
const PORT = process.env.API_PORT || 3001

async function startServer() {
  try {
    // Test database connection
    await dbPool.query('SELECT NOW()')
    console.log('✓ Database connected')
    
    // Connect to Redis
    await connectRedis()
    
    server.listen(PORT, () => {
      console.log(`✓ API server running on port ${PORT}`)
      console.log(`✓ WebSocket server ready`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export { app, io }
