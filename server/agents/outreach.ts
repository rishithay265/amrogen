import { query } from '@anthropic-ai/claude-agent-sdk'
import type { Lead } from '../db/schema'

const OUTREACH_SYSTEM_PROMPT = `You are the Outreach Specialist Agent. Your mission is to create compelling, personalized outreach that resonates with prospects.

Guidelines:
1. ALWAYS personalize based on:
   - Company recent news/events
   - Specific pain points identified
   - Prospect's role and responsibilities
   - Industry trends affecting them

2. Multi-touch sequence structure:
   - Touch 1: Value-focused, problem acknowledgment
   - Touch 2: Social proof, case study
   - Touch 3: Specific ROI data
   - Touch 4-6: Varied content types (video, whitepaper, comparison)

3. Timing optimization:
   - B2B optimal: Tuesday-Thursday, 10am-2pm local time
   - Avoid Mondays and Fridays
   - Space touches 2-3 days apart
   - Accelerate for hot leads

4. Never use:
   - Generic templates
   - Pushy language
   - Multiple CTAs in one message
   - Deceptive subject lines

You have access to email platforms, CRM, and content library.`

export interface OutreachSequence {
  emails: Array<{
    touchNumber: number
    subject: string
    body: string
    sendDelay: string
    cta: string
  }>
  channels: string[]
  totalTouches: number
  estimatedDuration: string
}

export async function generateOutreachSequence(
  lead: Lead,
  sequenceType: 'cold_outreach' | 'demo_follow_up' | 'nurture' | 'reengagement' = 'cold_outreach'
): Promise<OutreachSequence> {
  const result = query({
    prompt: `
Create a personalized multi-touch outreach sequence for:

Lead Details:
- Name: ${lead.name}
- Title: ${lead.title}
- Company: ${lead.company}
- Industry: ${lead.metadata?.industry || 'Technology'}
- Pain Points: ${lead.painPoints.join(', ')}
- Budget: ${lead.budget ? `$${lead.budget}` : 'Unknown'}
- Timeline: ${lead.timeline || 'Unknown'}

Sequence Type: ${sequenceType}

Create a 5-touch email sequence with:
1. Highly personalized subject lines
2. Value-focused body copy
3. Clear, single CTAs
4. Optimal send timing

Return as JSON with: emails array (touchNumber, subject, body, sendDelay, cta), channels array, totalTouches, estimatedDuration.
    `,
    options: {
      model: 'claude-sonnet-4-5-20250929',
      systemPrompt: OUTREACH_SYSTEM_PROMPT,
      maxTurns: 3,
      permissionMode: 'bypassPermissions',
    }
  })

  let responseText = ''
  for await (const message of result) {
    if (message.type === 'assistant') {
      const textContent = message.message.content.find((c: any) => c.type === 'text')
      if (textContent) {
        responseText += textContent.text
      }
    } else if (message.type === 'result') {
      break
    }
  }

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch (e) {
      console.error('Failed to parse outreach response:', e)
    }
  }

  // Fallback sequence
  return {
    emails: [
      {
        touchNumber: 1,
        subject: `Quick question about ${lead.company}'s sales process`,
        body: `Hi ${lead.name},\n\nI noticed ${lead.company} is experiencing ${lead.painPoints[0] || 'challenges with sales automation'}. We've helped similar companies reduce their sales cycle time by 40%.\n\nWould you be open to a brief 15-minute conversation about how we could help?\n\nBest regards`,
        sendDelay: 'Immediate',
        cta: 'Schedule 15-min call'
      },
      {
        touchNumber: 2,
        subject: `How ${lead.company} compares to industry leaders`,
        body: `Hi ${lead.name},\n\nI wanted to share a case study of how a company similar to ${lead.company} improved their conversion rates by 30% using our platform.\n\nWould you like me to send over the details?\n\nBest regards`,
        sendDelay: '2 days',
        cta: 'View case study'
      }
    ],
    channels: ['email', 'linkedin'],
    totalTouches: 5,
    estimatedDuration: '2 weeks'
  }
}

export async function sendEmail(params: {
  to: string
  subject: string
  body: string
  leadId: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('Sending email:', params)
  
  // In production, this would integrate with SendGrid, Gmail API, etc.
  // For now, simulate sending
  return {
    success: true,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
