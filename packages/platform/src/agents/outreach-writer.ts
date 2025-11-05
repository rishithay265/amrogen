import prisma, { SequenceStep } from "@amrogen/database";
import { query } from "@anthropic-ai/claude-agent-sdk";

type ComposeEmailInput = {
  leadId: string;
  step: SequenceStep;
};

export type OutreachEmail = {
  subject: string;
  htmlBody: string;
  textBody: string;
};

const OUTREACH_SYSTEM_PROMPT = `You are the Outreach Specialist Agent. You create compelling, hyper-personalized sales emails for B2B prospects. You always:
- Reference the prospect's pain points.
- Highlight relevant outcomes and social proof.
- Include a clear, single CTA aligned with the sequence stage.

Return JSON with subject, htmlBody, and textBody fields only.`;

async function buildContext(leadId: string) {
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
      intentSignals: {
        orderBy: { capturedAt: "desc" },
        take: 3,
      },
    },
  });

  if (!lead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  return lead;
}

export async function composeOutreachEmail(input: ComposeEmailInput): Promise<OutreachEmail> {
  const lead = await buildContext(input.leadId);

  const qualification = lead.qualificationSnapshots.at(0);
  const recentInteraction = lead.interactions.at(0);

  const pains = Array.isArray(qualification?.painPoints)
    ? (qualification!.painPoints as unknown[])
    : [];

  const painSummary = pains
    .map((pain: any) => `${pain.pain_point ?? pain.description ?? ""} (${pain.severity ?? "unknown"})`)
    .filter(Boolean)
    .join("; ");

  const context = `Prospect: ${lead.firstName} ${lead.lastName} (${lead.title ?? "Unknown role"})
Company: ${lead.company?.name ?? "Unknown"}
Industry: ${lead.company?.industry ?? "n/a"}
Employees: ${lead.company?.employees ?? "n/a"}
Score: ${lead.score}
Priority: ${lead.priority}
Status: ${lead.status}
Key pains: ${painSummary || "n/a"}
Intent signals: ${lead.intentSignals.map((signal: any) => `${signal.provider} -> ${signal.topic ?? "general"} (${signal.score})`).join("; ") || "n/a"}
Recent interaction: ${recentInteraction ? `${recentInteraction.channel} ${recentInteraction.direction} ${recentInteraction.sentAt.toISOString()} ${recentInteraction.status ?? ""}` : "none"}

Sequence step:
- Order: ${input.step.order}
- Channel: ${input.step.channel}
- Wait hours: ${input.step.waitHours}
- Prompt guidance: ${input.step.aiPrompt}
- Template: ${input.step.template ?? "n/a"}

Write a concise, professional email that matches the instructions.`;

  const response = query({
    prompt: context,
    options: {
      model: "claude-3-7-sonnet-20250219",
      systemPrompt: OUTREACH_SYSTEM_PROMPT,
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
        throw new Error(`Outreach writer failed with subtype ${message.subtype}`);
      }
    }
  }

  if (!final) {
    throw new Error("Outreach writer did not return a result");
  }

  const parsed = JSON.parse(final) as OutreachEmail;

  if (!parsed.subject || !parsed.htmlBody || !parsed.textBody) {
    throw new Error(`Incomplete outreach email: ${final}`);
  }

  return parsed;
}
