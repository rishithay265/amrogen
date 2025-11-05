import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { env } from "@/server/env";
import type { Lead, QualificationReport } from "@/server/types";

const meddicSchema = {
  type: "object",
  properties: {
    framework: { type: "string", enum: ["MEDDIC"] },
    metrics: {
      type: "object",
      properties: {
        currentCost: { type: "number" },
        expectedSavings: { type: "number" },
        roiTimeline: { type: "string" },
      },
    },
    economicBuyer: {
      type: "object",
      properties: {
        identified: { type: "boolean" },
        name: { type: "string" },
        title: { type: "string" },
      },
    },
    decisionCriteria: {
      type: "array",
      items: { type: "string" },
    },
    decisionProcess: {
      type: "object",
      properties: {
        timeline: { type: "string" },
        steps: { type: "array", items: { type: "string" } },
        stakeholders: { type: "array", items: { type: "string" } },
      },
    },
    pains: {
      type: "array",
      items: {
        type: "object",
        properties: {
          painPoint: { type: "string" },
          severity: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          impact: { type: "string" },
        },
      },
    },
    champion: {
      type: "object",
      properties: {
        exists: { type: "boolean" },
        name: { type: "string" },
        influenceLevel: { type: "string" },
      },
    },
    qualificationScore: { type: "number" },
    recommendation: {
      type: "string",
      enum: ["disqualify", "nurture", "advance_to_sales", "fast_track"],
    },
    summary: { type: "string" },
  },
  required: [
    "framework",
    "metrics",
    "economicBuyer",
    "decisionCriteria",
    "decisionProcess",
    "pains",
    "champion",
    "qualificationScore",
    "recommendation",
    "summary",
  ],
} as const;

const meddicZod = z.object({
  framework: z.literal("MEDDIC"),
  metrics: z.object({
    currentCost: z.number().optional(),
    expectedSavings: z.number().optional(),
    roiTimeline: z.string().optional(),
  }),
  economicBuyer: z.object({
    identified: z.boolean(),
    name: z.string().optional(),
    title: z.string().optional(),
  }),
  decisionCriteria: z.array(z.string()),
  decisionProcess: z.object({
    timeline: z.string().optional(),
    steps: z.array(z.string()),
    stakeholders: z.array(z.string()),
  }),
  pains: z.array(
    z.object({
      painPoint: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      impact: z.string(),
    })
  ),
  champion: z.object({
    exists: z.boolean(),
    name: z.string().optional(),
    influenceLevel: z.string().optional(),
  }),
  qualificationScore: z.number(),
  recommendation: z.enum(["disqualify", "nurture", "advance_to_sales", "fast_track"]),
  summary: z.string(),
});

type MeddicPayload = z.infer<typeof meddicZod>;

export class GeminiService {
  private client: GoogleGenerativeAI;

  constructor() {
    if (!env.geminiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    this.client = new GoogleGenerativeAI(env.geminiKey);
  }

  async qualifyLead(lead: Lead): Promise<QualificationReport> {
    const model = this.client.getGenerativeModel({
      model: env.geminiQualificationModel,
    });

    const prompt = `Generate a rigorous MEDDIC qualification for the following lead. Return JSON only.

Lead Profile:
- Name: ${lead.fullName}
- Company: ${lead.company}
- Domain: ${lead.companyDomain ?? "unknown"}
- Job Title: ${lead.jobTitle ?? "unknown"}
- Industry: ${lead.industry ?? "unknown"}
- Employees: ${lead.employeeCount ?? "unknown"}
- Annual Revenue: ${lead.annualRevenue ?? "unknown"}
- Source: ${lead.source}
- Pains: ${lead.pains.length ? lead.pains.join(", ") : "unspecified"}
- Intent Topics: ${lead.intentTopics.length ? lead.intentTopics.join(", ") : "unspecified"}
`; 

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
        responseSchema: meddicSchema,
      },
    });

    const text = result.response.text();
    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    const parsed: MeddicPayload = meddicZod.parse(JSON.parse(text));

    return {
      framework: parsed.framework,
      metrics: {
        currentCost: parsed.metrics.currentCost,
        expectedSavings: parsed.metrics.expectedSavings,
        roiTimeline: parsed.metrics.roiTimeline,
      },
      economicBuyer: parsed.economicBuyer,
      decisionCriteria: parsed.decisionCriteria,
      decisionProcess: parsed.decisionProcess,
      pains: parsed.pains,
      champion: parsed.champion,
      qualificationScore: parsed.qualificationScore,
      recommendation: parsed.recommendation,
      summary: parsed.summary,
    } satisfies QualificationReport;
  }

  static validateEnvironment() {
    if (!env.geminiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
  }
}

