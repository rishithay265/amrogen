import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Lead } from '../db/schema'

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export interface QualificationResult {
  metrics: {
    currentCost: number | null
    expectedSavings: number | null
    roiTimeline: string | null
  }
  economicBuyer: {
    identified: boolean
    name: string | null
    title: string | null
  }
  decisionCriteria: string[]
  decisionProcess: {
    timeline: string | null
    steps: string[]
    stakeholders: string[]
  }
  identifyPain: Array<{
    painPoint: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    impact: string
  }>
  champion: {
    exists: boolean
    name: string | null
    influenceLevel: string | null
  }
  qualificationScore: number
  recommendation: 'disqualify' | 'nurture' | 'advance_to_sales' | 'fast_track'
}

const MEDDIC_SCHEMA = {
  type: 'object',
  properties: {
    metrics: {
      type: 'object',
      properties: {
        currentCost: { type: ['number', 'null'] },
        expectedSavings: { type: ['number', 'null'] },
        roiTimeline: { type: ['string', 'null'] }
      }
    },
    economicBuyer: {
      type: 'object',
      properties: {
        identified: { type: 'boolean' },
        name: { type: ['string', 'null'] },
        title: { type: ['string', 'null'] }
      }
    },
    decisionCriteria: {
      type: 'array',
      items: { type: 'string' }
    },
    decisionProcess: {
      type: 'object',
      properties: {
        timeline: { type: ['string', 'null'] },
        steps: { type: 'array', items: { type: 'string' } },
        stakeholders: { type: 'array', items: { type: 'string' } }
      }
    },
    identifyPain: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          painPoint: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          impact: { type: 'string' }
        }
      }
    },
    champion: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
        name: { type: ['string', 'null'] },
        influenceLevel: { type: ['string', 'null'] }
      }
    },
    qualificationScore: {
      type: 'number',
      minimum: 0,
      maximum: 100
    },
    recommendation: {
      type: 'string',
      enum: ['disqualify', 'nurture', 'advance_to_sales', 'fast_track']
    }
  },
  required: ['metrics', 'economicBuyer', 'identifyPain', 'qualificationScore', 'recommendation']
}

export async function qualifyLead(lead: Lead): Promise<QualificationResult> {
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  const prompt = `
Qualify this lead using the MEDDIC framework:

Lead Information:
- Company: ${lead.company}
- Contact: ${lead.name}, ${lead.title}
- Email: ${lead.email}
- Source: ${lead.source}
- Pain Points Mentioned: ${lead.painPoints.join(', ')}
- Budget Signals: ${lead.budget ? `$${lead.budget}` : 'Unknown'}
- Timeline: ${lead.timeline || 'Unknown'}

Provide a complete MEDDIC qualification analysis with a score from 0-100 and a recommendation.
`

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: MEDDIC_SCHEMA as any
      }
    })

    const response = result.response
    const text = response.text()
    return JSON.parse(text) as QualificationResult
  } catch (error) {
    console.error('Qualification error:', error)
    
    // Fallback qualification
    return {
      metrics: {
        currentCost: null,
        expectedSavings: null,
        roiTimeline: null
      },
      economicBuyer: {
        identified: false,
        name: null,
        title: null
      },
      decisionCriteria: ['Price', 'Features', 'Support'],
      decisionProcess: {
        timeline: lead.timeline,
        steps: ['Evaluation', 'Proposal', 'Decision'],
        stakeholders: [lead.name]
      },
      identifyPain: lead.painPoints.map(p => ({
        painPoint: p,
        severity: 'medium' as const,
        impact: 'Operational efficiency'
      })),
      champion: {
        exists: false,
        name: null,
        influenceLevel: null
      },
      qualificationScore: lead.qualificationScore,
      recommendation: lead.qualificationScore > 70 ? 'advance_to_sales' : 'nurture'
    }
  }
}
