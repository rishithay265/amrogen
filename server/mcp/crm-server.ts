import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk'
import { z } from 'zod'
import { dbPool } from '../db/client'
import type { Lead, Activity } from '../db/schema'

export const crmServer = createSdkMcpServer({
  name: 'crm-integration',
  version: '1.0.0',
  tools: [
    tool(
      'get_lead',
      'Retrieve complete lead information from CRM',
      {
        lead_id: z.string().describe('CRM lead ID'),
        include_history: z.boolean().optional().describe('Include activity history')
      },
      async (args) => {
        try {
          const leadResult = await dbPool.query(
            'SELECT * FROM leads WHERE id = $1',
            [args.lead_id]
          )

          if (leadResult.rows.length === 0) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ error: 'Lead not found' })
              }]
            }
          }

          const lead = leadResult.rows[0]
          let response: any = {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            company: lead.company,
            title: lead.title,
            status: lead.status,
            qualificationScore: lead.qualification_score,
            engagementScore: lead.engagement_score,
            painPoints: lead.pain_points,
            budget: lead.budget,
            timeline: lead.timeline
          }

          if (args.include_history) {
            const activitiesResult = await dbPool.query(
              'SELECT * FROM activities WHERE lead_id = $1 ORDER BY timestamp DESC LIMIT 10',
              [args.lead_id]
            )
            response.activities = activitiesResult.rows
          }

          return {
            content: [{
              type: 'text',
              text: JSON.stringify(response, null, 2)
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: String(error) })
            }],
            isError: true
          }
        }
      }
    ),

    tool(
      'update_lead_stage',
      'Move lead to different pipeline stage',
      {
        lead_id: z.string().describe('Lead ID'),
        stage: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).describe('New stage'),
        notes: z.string().optional().describe('Optional notes about the stage change')
      },
      async (args) => {
        try {
          await dbPool.query(
            'UPDATE leads SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [args.stage, args.lead_id]
          )

          if (args.notes) {
            const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            await dbPool.query(
              'INSERT INTO activities (id, lead_id, type, subject, content, sent_by, agent_name) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [activityId, args.lead_id, 'note', 'Stage Change', args.notes, 'agent', 'orchestrator']
            )
          }

          return {
            content: [{
              type: 'text',
              text: `Lead ${args.lead_id} moved to ${args.stage}`
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: String(error) })
            }],
            isError: true
          }
        }
      }
    ),

    tool(
      'log_activity',
      'Log interaction with lead',
      {
        lead_id: z.string().describe('Lead ID'),
        activity_type: z.enum(['email', 'call', 'meeting', 'linkedin_message']).describe('Type of activity'),
        subject: z.string().describe('Activity subject'),
        content: z.string().describe('Activity content/notes'),
        outcome: z.string().optional().describe('Outcome of the interaction')
      },
      async (args) => {
        try {
          const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          await dbPool.query(
            'INSERT INTO activities (id, lead_id, type, subject, content, outcome, sent_by, agent_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [activityId, args.lead_id, args.activity_type, args.subject, args.content, args.outcome || null, 'agent', 'outreach']
          )

          return {
            content: [{
              type: 'text',
              text: 'Activity logged successfully'
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: String(error) })
            }],
            isError: true
          }
        }
      }
    ),

    tool(
      'search_leads',
      'Search for leads by criteria',
      {
        status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
        min_score: z.number().optional().describe('Minimum qualification score'),
        limit: z.number().optional().default(20).describe('Maximum number of results')
      },
      async (args) => {
        try {
          let query = 'SELECT * FROM leads WHERE 1=1'
          const params: any[] = []
          let paramCount = 1

          if (args.status) {
            query += ` AND status = $${paramCount}`
            params.push(args.status)
            paramCount++
          }

          if (args.min_score) {
            query += ` AND qualification_score >= $${paramCount}`
            params.push(args.min_score)
            paramCount++
          }

          query += ` ORDER BY created_at DESC LIMIT $${paramCount}`
          params.push(args.limit)

          const result = await dbPool.query(query, params)

          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result.rows, null, 2)
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: String(error) })
            }],
            isError: true
          }
        }
      }
    )
  ]
})
