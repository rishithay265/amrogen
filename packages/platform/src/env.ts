import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  GOOGLE_API_KEY: z.string().min(1),
  SENDGRID_API_KEY: z.string().min(1),
  OUTREACH_FROM_EMAIL: z.string().email(),
  SALESFORCE_CLIENT_ID: z.string().min(1).optional(),
  SALESFORCE_CLIENT_SECRET: z.string().min(1).optional(),
  SALESFORCE_USERNAME: z.string().min(1).optional(),
  SALESFORCE_PASSWORD: z.string().min(1).optional(),
  SALESFORCE_SECURITY_TOKEN: z.string().min(1).optional(),
  HUBSPOT_ACCESS_TOKEN: z.string().min(1).optional(),
  PIPEDRIVE_API_TOKEN: z.string().min(1).optional(),
  CLEARBIT_API_KEY: z.string().min(1).optional(),
  ZOOMINFO_API_KEY: z.string().min(1).optional(),
  APOLLO_API_KEY: z.string().min(1).optional(),
  HYPERBROWSER_API_KEY: z.string().min(1).optional(),
  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_MESSAGING_SERVICE_SID: z.string().min(1).optional(),
  SLACK_BOT_TOKEN: z.string().min(1).optional(),
  SLACK_SIGNING_SECRET: z.string().min(1).optional(),
  ENCRYPTION_KEY: z.string().min(32),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = (() => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      `Invalid platform environment variables: ${JSON.stringify(
        parsed.error.format(),
        null,
        2,
      )}`,
    );
  }

  return parsed.data;
})();
