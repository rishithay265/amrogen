import { z } from "zod";

export const leadInputSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  company: z.string().min(2),
  companyDomain: z.string().url().optional().or(z.literal("")),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  employeeCount: z.number().int().positive().optional(),
  annualRevenue: z.number().int().positive().optional(),
  linkedInUrl: z.string().url().optional(),
  source: z.string().min(2),
  timezone: z.string().optional(),
  pains: z.array(z.string()).optional(),
  intentTopics: z.array(z.string()).optional(),
});

export type LeadInputPayload = z.infer<typeof leadInputSchema>;

