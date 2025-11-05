import { query } from '@anthropic-ai/claude-agent-sdk'
import type { Lead } from '../db/schema'

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the Sales Orchestrator Agent, responsible for coordinating an autonomous sales team. Your goals:

1. Analyze every incoming lead and determine optimal handling strategy
2. Delegate to specialized agents based on lead characteristics
3. Monitor progress and intervene when agents need guidance
4. Maintain detailed context about each opportunity
5. Optimize for conversion rate, not just speed

Decision Framework:
- Hot leads (engaged recently, score > 70) → Immediate outreach by Outreach Agent
- Cold leads (no engagement, score < 40) → Lead Discovery Agent for warming
- Qualified but waiting (score 40-70) → Follow-up Agent with nurture sequence
- Unqualified → Data enrichment then re-evaluation

You have access to full CRM, email systems, and communication tools.`

export interface OrchestratorResult {
  decision: 'outreach' | 'nurture' | 'qualify' | 'enrich'
  priority: 'high' | 'medium' | 'low'
  reasoning: string
  nextActions: string[]
}

export async function runOrchestrator(lead: Lead): Promise<OrchestratorResult> {
  const result = query({
    prompt: `
New lead received:
- Name: ${lead.name}
- Company: ${lead.company}
- Title: ${lead.title}
- Source: ${lead.source}
- Engagement Score: ${lead.engagementScore}/100
- Qualification Score: ${lead.qualificationScore}/100
- Pain Points: ${lead.painPoints.join(', ')}

Analyze this lead and determine:
1. Which specialized agent should handle it?
2. What's the priority level?
3. What initial actions should be taken?
4. Any red flags or special considerations?

Respond in JSON format with: decision, priority, reasoning, and nextActions array.
    `,
    options: {
      model: 'claude-sonnet-4-5-20250929',
      systemPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
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
      console.error('Failed to parse orchestrator response:', e)
    }
  }

  // Fallback decision
  return {
    decision: lead.qualificationScore > 70 ? 'outreach' : 'qualify',
    priority: lead.engagementScore > 70 ? 'high' : 'medium',
    reasoning: 'Automatic decision based on scores',
    nextActions: ['Qualify lead', 'Send initial outreach']
  }
}
