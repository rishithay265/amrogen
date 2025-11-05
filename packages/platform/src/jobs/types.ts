import { LeadStatus, LeadPriority, LeadSource } from "@amrogen/database";

export type LeadPayload = {
  workspaceId: string;
  leadId: string;
};

export type LeadIntakeJobData = {
  workspaceId: string;
  source: LeadSource;
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title?: string;
    company?: {
      name: string;
      domain?: string;
    };
    metadata?: Record<string, unknown>;
  };
};

export type QualificationJobData = LeadPayload & {
  reason: "new_lead" | "requalification";
};

export type OutreachJobData = LeadPayload & {
  priority: LeadPriority;
  status: LeadStatus;
  sequenceId?: string;
};

export type FollowUpJobData = LeadPayload & {
  taskId: string;
};

export type AnalyticsJobData = {
  workspaceId: string;
  windowStart: Date;
  windowEnd: Date;
};

export type JobNames =
  | "lead:intake"
  | "lead:qualification"
  | "outreach:dispatch"
  | "followup:execute"
  | "analytics:refresh";
