import { z } from "zod";

export const leadCreateSchema = z.object({
  workspaceId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  title: z.string().optional(),
  source: z
    .enum([
      "MANUAL",
      "IMPORT",
      "WEBSITE",
      "PARTNER",
      "EVENT",
      "INTENT_DATA",
      "ENRICHED",
      "REFERRAL",
      "OUTBOUND",
    ])
    .default("MANUAL"),
  company: z
    .object({
      name: z.string().min(1),
      domain: z.string().min(1).optional(),
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
