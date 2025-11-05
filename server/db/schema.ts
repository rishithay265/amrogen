export interface Lead {
  id: string
  name: string
  email: string
  company: string
  title: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  qualificationScore: number
  engagementScore: number
  painPoints: string[]
  budget: number | null
  timeline: string | null
  createdAt: Date
  updatedAt: Date
  assignedTo: string | null
  tags: string[]
  metadata: Record<string, any>
}

export interface Activity {
  id: string
  leadId: string
  type: 'email' | 'call' | 'meeting' | 'linkedin_message' | 'note'
  subject: string
  content: string
  outcome: string | null
  sentBy: 'agent' | 'human'
  agentName: string | null
  timestamp: Date
  metadata: Record<string, any>
}

export interface Campaign {
  id: string
  name: string
  type: 'cold_outreach' | 'demo_follow_up' | 'nurture' | 'reengagement'
  status: 'active' | 'paused' | 'completed'
  leadsCount: number
  responseRate: number
  conversionRate: number
  createdAt: Date
  updatedAt: Date
}

export interface AgentPerformance {
  agentName: string
  messagesSent: number
  responseRate: number
  qualificationAccuracy: number
  leadsProcessed: number
  costPerLead: number
  period: string
}

export interface DealStage {
  stage: string
  count: number
  value: number
  conversionRate: number
}

export const SQL_SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  source VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  qualification_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  pain_points JSONB DEFAULT '[]',
  budget DECIMAL(12, 2),
  timeline VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_to VARCHAR(255),
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(255) PRIMARY KEY,
  lead_id VARCHAR(255) REFERENCES leads(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  outcome TEXT,
  sent_by VARCHAR(50) NOT NULL,
  agent_name VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  leads_count INTEGER DEFAULT 0,
  response_rate DECIMAL(5, 2) DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp);
`
