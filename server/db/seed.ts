import { dbPool } from './client'
import dotenv from 'dotenv'

dotenv.config()

const sampleLeads = [
  {
    id: 'lead_1',
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    company: 'TechCorp Inc',
    title: 'VP of Sales',
    source: 'linkedin',
    status: 'qualified',
    qualificationScore: 85,
    engagementScore: 72,
    painPoints: ['Manual data entry', 'Slow lead response', 'Poor CRM data quality'],
    budget: 50000,
    timeline: 'Q1 2025'
  },
  {
    id: 'lead_2',
    name: 'Sarah Johnson',
    email: 'sarah.j@innovate.io',
    company: 'Innovate Solutions',
    title: 'Director of Marketing',
    source: 'web_form',
    status: 'contacted',
    qualificationScore: 78,
    engagementScore: 65,
    painPoints: ['Lead qualification inefficiency', 'Lack of personalization'],
    budget: 35000,
    timeline: 'Q2 2025'
  },
  {
    id: 'lead_3',
    name: 'Michael Chen',
    email: 'm.chen@saascompany.com',
    company: 'SaaS Company Ltd',
    title: 'CEO',
    source: 'referral',
    status: 'proposal',
    qualificationScore: 92,
    engagementScore: 88,
    painPoints: ['Tool fragmentation', 'High sales cycle time', 'Low conversion rates'],
    budget: 100000,
    timeline: 'Immediate'
  }
]

async function seed() {
  try {
    console.log('Seeding database...')

    for (const lead of sampleLeads) {
      await dbPool.query(
        `INSERT INTO leads (id, name, email, company, title, source, status, qualification_score, engagement_score, pain_points, budget, timeline, tags, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO NOTHING`,
        [
          lead.id,
          lead.name,
          lead.email,
          lead.company,
          lead.title,
          lead.source,
          lead.status,
          lead.qualificationScore,
          lead.engagementScore,
          JSON.stringify(lead.painPoints),
          lead.budget,
          lead.timeline,
          JSON.stringify(['high-priority']),
          JSON.stringify({ enriched: true })
        ]
      )
    }

    console.log('✓ Database seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('✗ Seeding failed:', error)
    process.exit(1)
  }
}

seed()
