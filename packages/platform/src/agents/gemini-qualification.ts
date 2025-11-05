import prisma, { LeadStatus, LeadPriority } from "@amrogen/database";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { env } from "../env";

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const qualificationSchema = z.object({
  metrics: z.object({
    current_cost: z.number().nullable(),
    expected_savings: z.number().nullable(),
    roi_timeline: z.string().nullable(),
  }),
  economic_buyer: z.object({
    identified: z.boolean(),
    name: z.string().nullable(),
    title: z.string().nullable(),
  }),
  decision_criteria: z.array(z.string()),
  decision_process: z.object({
    timeline: z.string().nullable(),
    steps: z.array(z.string()),
    stakeholders: z.array(z.string()),
  }),
  identify_pain: z.array(
    z.object({
      pain_point: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      impact: z.string(),
    }),
  ),
  champion: z.object({
    exists: z.boolean(),
    name: z.string().nullable(),
    influence_level: z.string().nullable(),
  }),
  qualification_score: z.number().min(0).max(100),
  recommendation: z.enum(["disqualify", "nurture", "advance_to_sales", "fast_track"]),
});

const QUALIFICATION_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    metrics: {
      type: "object",
      properties: {
        current_cost: { type: "number", nullable: true },
        expected_savings: { type: "number", nullable: true },
        roi_timeline: { type: "string", nullable: true },
      },
      required: ["current_cost", "expected_savings", "roi_timeline"],
    },
    economic_buyer: {
      type: "object",
      properties: {
        identified: { type: "boolean" },
        name: { type: "string", nullable: true },
        title: { type: "string", nullable: true },
      },
      required: ["identified", "name", "title"],
    },
    decision_criteria: {
      type: "array",
      items: { type: "string" },
    },
    decision_process: {
      type: "object",
      properties: {
        timeline: { type: "string", nullable: true },
        steps: { type: "array", items: { type: "string" } },
        stakeholders: { type: "array", items: { type: "string" } },
      },
      required: ["timeline", "steps", "stakeholders"],
    },
    identify_pain: {
      type: "array",
      items: {
        type: "object",
        properties: {
          pain_point: { type: "string" },
          severity: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          impact: { type: "string" },
        },
        required: ["pain_point", "severity", "impact"],
      },
    },
    champion: {
      type: "object",
      properties: {
        exists: { type: "boolean" },
        name: { type: "string", nullable: true },
        influence_level: { type: "string", nullable: true },
      },
      required: ["exists", "name", "influence_level"],
    },
    qualification_score: { type: "number" },
    recommendation: {
      type: "string",
      enum: ["disqualify", "nurture", "advance_to_sales", "fast_track"],
    },
  },
  required: [
    "metrics",
    "economic_buyer",
    "decision_criteria",
    "decision_process",
    "identify_pain",
    "champion",
    "qualification_score",
    "recommendation",
  ],
};

const recommendationToStatus: Record<string, LeadStatus> = {
  disqualify: LeadStatus.DISQUALIFIED,
  nurture: LeadStatus.NURTURE,
  advance_to_sales: LeadStatus.QUALIFIED,
  fast_track: LeadStatus.OPPORTUNITY,
};

const scoreToPriority = (score: number): LeadPriority => {
  if (score >= 80) return LeadPriority.CRITICAL;
  if (score >= 60) return LeadPriority.HIGH;
  if (score >= 40) return LeadPriority.MEDIUM;
  return LeadPriority.LOW;
};

export type QualificationResult = z.infer<typeof qualificationSchema>;

export async function qualifyLead(workspaceId: string, leadId: string): Promise<QualificationResult> {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId },
    include: {
      company: true,
      interactions: {
        orderBy: { sentAt: "desc" },
        take: 3,
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

  const prompt = `Apply the MEDDIC qualification framework.

Lead
- Name: ${lead.firstName} ${lead.lastName}
- Title: ${lead.title ?? "Unknown"}
- Status: ${lead.status}
- Priority: ${lead.priority}
- Source: ${lead.source}
- Score: ${lead.score}
- Fit score: ${lead.fitScore ?? "n/a"}
- Intent score: ${lead.intentScore ?? "n/a"}
- Tags: ${(lead.tags ?? []).join(", ") || "n/a"}

Company
- Name: ${lead.company?.name ?? "Unknown"}
- Domain: ${lead.company?.domain ?? "n/a"}
- Industry: ${lead.company?.industry ?? "n/a"}
- Employees: ${lead.company?.employees ?? "n/a"}
- Revenue: ${lead.company?.revenue ?? "n/a"}

Engagement Snippets
${lead.interactions
    .map(
      (interaction) =>
        `- ${interaction.channel} ${interaction.direction} on ${interaction.sentAt.toISOString()}: ${interaction.content.substring(0, 280)}`,
    )
    .join("\n") || "- No recent engagement"}

Intent Signals
${lead.intentSignals
    .map((signal) => `- ${signal.provider} (${signal.topic ?? "general"}) score ${signal.score}`)
    .join("\n") || "- None"}

Return JSON matching the provided schema.`;

  const generation = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: QUALIFICATION_RESPONSE_SCHEMA as any,
    },
  });

  const text = generation.response?.text();

  if (!text) {
    throw new Error("Gemini did not return a response");
  }

  let parsed: QualificationResult;

  try {
    parsed = qualificationSchema.parse(JSON.parse(text));
  } catch (error) {
    throw new Error(`Qualification parse error: ${(error as Error).message}\nResponse: ${text}`);
  }

  const recommendation = recommendationToStatus[parsed.recommendation];
  const priority = scoreToPriority(parsed.qualification_score);

  await prisma.$transaction([
    prisma.qualificationSnapshot.create({
      data: {
        leadId,
        framework: "MEDDIC",
        qualificationScore: parsed.qualification_score,
        recommendation: parsed.recommendation,
        metrics: parsed.metrics,
        economicBuyer: parsed.economic_buyer,
        decisionCriteria: parsed.decision_criteria,
        decisionProcess: parsed.decision_process,
        painPoints: parsed.identify_pain,
        champion: parsed.champion,
      },
    }),
    prisma.lead.update({
      where: { id: leadId },
      data: {
        status: recommendation,
        priority,
        score: parsed.qualification_score,
        lastQualifiedAt: new Date(),
      },
    }),
  ]);

  return parsed;
}
