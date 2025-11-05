import prisma, { FollowUpTask } from "@amrogen/database";
import { query } from "@anthropic-ai/claude-agent-sdk";

type FollowUpEmail = {
  subject: string;
  htmlBody: string;
  textBody: string;
};

const FOLLOW_UP_PROMPT = `You are the Follow-up Agent. Craft empathetic follow-up messages that acknowledge prior interactions, handle objections, and provide value. Return JSON with subject, htmlBody, textBody.`;

async function loadLeadContext(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
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
    },
  });

  if (!lead) throw new Error(`Lead ${leadId} not found`);
  return lead;
}

export async function composeFollowUpEmail(task: FollowUpTask): Promise<FollowUpEmail> {
  const lead = await loadLeadContext(task.leadId);
  const lastInteraction = lead.interactions.at(0);

  const prompt = `Lead: ${lead.firstName} ${lead.lastName} (${lead.title ?? "Unknown role"}) at ${lead.company?.name ?? "Unknown company"}
Status: ${lead.status}
Priority: ${lead.priority}
Latest interaction: ${lastInteraction ? `${lastInteraction.channel} ${lastInteraction.direction} on ${lastInteraction.sentAt.toISOString()} status ${lastInteraction.status ?? "unknown"}` : "none"}
Task notes: ${task.notes ?? "No additional notes"}
Objection/context: ${JSON.stringify(task.metadata ?? {})}

Write a concise follow-up email with a single CTA.`;

  const response = query({
    prompt,
    options: {
      model: "claude-3-7-sonnet-20250219",
      systemPrompt: FOLLOW_UP_PROMPT,
      maxTurns: 6,
      includePartialMessages: false,
    },
  });

  let final: string | undefined;

  for await (const message of response) {
    if (message.type === "result") {
      if (message.subtype === "success") {
        final = message.result;
      } else {
        throw new Error(`Follow-up writer failed with subtype ${message.subtype}`);
      }
    }
  }

  if (!final) {
    throw new Error("Follow-up writer did not return a result");
  }

  const parsed = JSON.parse(final) as FollowUpEmail;
  return parsed;
}
