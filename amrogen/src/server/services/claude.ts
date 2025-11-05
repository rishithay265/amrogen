import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "@/server/env";
import type { Lead, QualificationReport, OutreachSequence } from "@/server/types";

const outreachSchema = z.object({
  persona: z.string(),
  cta_focus: z.string(),
  touches: z
    .array(
      z.object({
        channel: z.enum(["email", "linkedin", "call", "sms", "ads"]),
        objective: z.string(),
        personalization: z.string(),
        scheduled_for: z.string(),
        draft_content: z.string(),
        assets: z.array(z.string()).optional(),
      })
    )
    .min(3)
    .max(8),
});

const outreachResultSchema = outreachSchema.extend({
  total_touches: z.number().int().min(3).max(8),
});

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    if (!env.anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    this.client = new Anthropic({ apiKey: env.anthropicKey });
  }

  async generateOutreach(
    lead: Lead,
    qualification: QualificationReport
  ): Promise<OutreachSequence> {
    const response = await this.client.messages.create({
      system:
        "You are the AmroGen Outreach Agent. Build multi-touch, hyper-personalized sequences grounded in the provided lead dossier and MEDDIC analysis. Respond with pure JSON that matches the schema: { persona: string, cta_focus: string, total_touches: number (3-8), touches: Array<{ channel: 'email'|'linkedin'|'call'|'sms'|'ads', objective: string, personalization: string, scheduled_for: ISO8601 datetime string, draft_content: string, assets?: string[] }> }.",
      model: env.anthropicModel,
      max_output_tokens: 1_200,
      temperature: 0.4,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Lead dossier:\n${JSON.stringify(lead, null, 2)}\n\nQualification report:\n${JSON.stringify(
                qualification,
                null,
                2
              )}`,
            },
          ],
        },
      ],
    });

    const raw = response.content[0];
    if (!raw) {
      throw new Error("Claude returned an empty response");
    }

    type TextBlock = { type: string; text?: string; output_text?: string };
    const block = raw as TextBlock;
    const textPayload = block.text ?? block.output_text;
    if (typeof textPayload !== "string") {
      throw new Error("Unexpected response shape from Claude");
    }
    const payload = outreachResultSchema.parse(JSON.parse(textPayload));

    return {
      persona: payload.persona,
      ctaFocus: payload.cta_focus,
      totalTouches: payload.total_touches,
      touches: payload.touches.map((touch) => ({
        channel: touch.channel,
        objective: touch.objective,
        personalization: touch.personalization,
        scheduledFor: touch.scheduled_for,
        draftContent: touch.draft_content,
        assets: touch.assets,
      })),
    };
  }

  static validateEnvironment() {
    if (!env.anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
  }
}

