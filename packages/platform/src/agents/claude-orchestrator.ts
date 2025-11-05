import prisma from "@amrogen/database";
import { LeadPriority, LeadStatus } from "@amrogen/database";
import { query } from "@anthropic-ai/claude-agent-sdk";

type AgentAssignment =
  | "lead-discovery"
  | "qualification"
  | "outreach"
  | "follow-up";

type QueueRouting = "lead:intake" | "lead:qualification" | "outreach:dispatch" | "followup:execute";

export type OrchestratorAction = {
  type:
    | "enrich_lead"
    | "qualify_lead"
    | "launch_sequence"
    | "schedule_followup"
    | "human_review"
    | "sync_crm"
    | "notify_slack";
  description: string;
  dueWithinMinutes?: number;
  payload?: Record<string, unknown>;
};

export type OrchestratorDecision = {
  assignedAgent: AgentAssignment;
  routeToQueue: QueueRouting;
  priority: LeadPriority;
  confidence: number;
  nextStatus: LeadStatus;
  actions: OrchestratorAction[];
  specialConsiderations: string[];
};

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the Sales Orchestrator Agent, responsible for coordinating an autonomous sales team. Your goals:

1. Analyze every incoming lead and determine optimal handling strategy
2. Delegate to specialized agents based on lead characteristics
3. Monitor progress and intervene when agents need guidance
4. Maintain detailed context about each opportunity
5. Optimize for conversion rate, not just speed

Decision Framework:
- Hot leads (recent engagement or high scores) → immediate outreach by Outreach Agent.
- Cold leads (no engagement) → Lead Discovery Agent for warming and enrichment.
- Qualified but waiting → Follow-up Agent with nurture sequence.
- Unqualified or incomplete → Data enrichment then re-evaluation.

Output JSON ONLY with keys: assignedAgent, routeToQueue, priority, confidence (0-1), nextStatus, actions (array), specialConsiderations (array of strings).
Each action MUST include: type, description, optional dueWithinMinutes, and payload (object for machine-readable data, such as {"sequenceId":"..."} or {"followUpType":"call"}).
Ensure instructions never yield prose outside JSON.`;

export async function orchestrateLead(workspaceId: string, leadId: string): Promise<OrchestratorDecision> {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId },
    include: {
      company: true,
      interactions: {
        orderBy: { sentAt: "desc" },
        take: 5,
      },
      qualificationSnapshots: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      sequenceEnrollments: {
        include: {
          sequence: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      intentSignals: {
        orderBy: { capturedAt: "desc" },
        take: 3,
      },
    },
  });

  if (!lead) {
    throw new Error(`Lead ${leadId} not found in workspace ${workspaceId}`);
  }

  const recentInteraction = lead.interactions.at(0);
  const lastQualification = lead.qualificationSnapshots.at(0);
  const lastSequence = lead.sequenceEnrollments.at(0);

  const prompt = `Lead context:
- Name: ${lead.firstName} ${lead.lastName}
- Title: ${lead.title ?? "Unknown"}
- Email: ${lead.email}
- Company: ${lead.company?.name ?? "Unknown"}
- Status: ${lead.status}
- Priority: ${lead.priority}
- Source: ${lead.source}
- Score: ${lead.score}
- Fit score: ${lead.fitScore ?? "n/a"}
- Intent score: ${lead.intentScore ?? "n/a"}
- Last contact: ${lead.lastContactAt?.toISOString() ?? "never"}
- Last qualification score: ${lastQualification?.qualificationScore ?? "n/a"}
- Last qualification recommendation: ${lastQualification?.recommendation ?? "n/a"}
- Currently enrolled sequence: ${lastSequence?.sequence.name ?? "none"}
- Sequence status: ${lastSequence?.status ?? "n/a"}
- Latest interaction summary: ${recentInteraction ? `${recentInteraction.channel} ${recentInteraction.direction} at ${recentInteraction.sentAt.toISOString()} with status ${recentInteraction.status ?? "unknown"}` : "none"}
- Intent signals: ${lead.intentSignals
    .map((signal) => `${signal.provider} (${signal.topic ?? "general"}): ${signal.score}`)
    .join("; ") || "none"}

Deliver a JSON decision strictly following the schema provided in the system prompt.`;

  const response = query({
    prompt,
    options: {
      model: "claude-3-7-sonnet-20250219",
      systemPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
      maxTurns: 8,
      includePartialMessages: false,
      allowedTools: ["Task", "Read", "Write"],
    },
  });

  let finalResult: string | undefined;

  for await (const message of response) {
    if (message.type === "result") {
      if (message.subtype === "success") {
        finalResult = message.result;
      } else {
        throw new Error(`Claude orchestrator failed with subtype ${message.subtype}`);
      }
    }
  }

  if (!finalResult) {
    throw new Error("Claude orchestrator did not return a result");
  }

  let parsed: OrchestratorDecision;

  try {
    parsed = JSON.parse(finalResult) as OrchestratorDecision;
  } catch (error) {
    throw new Error(`Failed to parse orchestrator response: ${(error as Error).message}\nResponse: ${finalResult}`);
  }

  return parsed;
}
