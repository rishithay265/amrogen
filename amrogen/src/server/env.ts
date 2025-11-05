import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL: z
    .string()
    .min(1)
    .default("claude-3-5-sonnet-latest"),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_QUALIFICATION_MODEL: z
    .string()
    .min(1)
    .default("gemini-2.0-flash"),
  HYPERBROWSER_API_KEY: z.string().min(1).optional(),
  HYPERBROWSER_BASE_URL: z
    .string()
    .url()
    .default("https://api.hyperbrowser.ai"),
  AMROGEN_DATA_PATH: z
    .string()
    .min(1)
    .default(`${process.cwd()}/data/amrogen-state.json`),
});

const parsed = envSchema.parse({
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_QUALIFICATION_MODEL: process.env.GEMINI_QUALIFICATION_MODEL,
  HYPERBROWSER_API_KEY: process.env.HYPERBROWSER_API_KEY,
  HYPERBROWSER_BASE_URL: process.env.HYPERBROWSER_BASE_URL,
  AMROGEN_DATA_PATH: process.env.AMROGEN_DATA_PATH,
});

export const env = {
  anthropicKey: parsed.ANTHROPIC_API_KEY ?? null,
  anthropicModel: parsed.ANTHROPIC_MODEL,
  geminiKey: parsed.GEMINI_API_KEY ?? null,
  geminiQualificationModel: parsed.GEMINI_QUALIFICATION_MODEL,
  hyperbrowserKey: parsed.HYPERBROWSER_API_KEY ?? null,
  hyperbrowserBaseUrl: parsed.HYPERBROWSER_BASE_URL,
  dataPath: parsed.AMROGEN_DATA_PATH,
};

export function assertProductionIntegrations() {
  const missing: string[] = [];
  if (!env.anthropicKey) missing.push("ANTHROPIC_API_KEY");
  if (!env.geminiKey) missing.push("GEMINI_API_KEY");
  if (!env.hyperbrowserKey) missing.push("HYPERBROWSER_API_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables to run orchestration: ${missing.join(", ")}`
    );
  }
}

