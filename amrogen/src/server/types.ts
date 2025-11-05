export type LeadStage =
  | "new"
  | "research"
  | "qualified"
  | "nurture"
  | "outreach"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type LeadTemperature = "cold" | "warm" | "hot";

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  company: string;
  companyDomain?: string;
  jobTitle?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  linkedInUrl?: string;
  source: string;
  timezone?: string;
  stage: LeadStage;
  temperature: LeadTemperature;
  priorityScore: number;
  intentTopics: string[];
  pains: string[];
  enrichmentNotes?: string;
  qualificationSummary?: string;
  outreachSummary?: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export type AgentStepStatus = "pending" | "running" | "succeeded" | "failed" |
  "skipped";

export interface AgentStep {
  id: string;
  label: string;
  agent: "orchestrator" | "discovery" | "qualification" | "outreach" | "follow_up";
  model?: string;
  startedAt: string;
  completedAt?: string;
  status: AgentStepStatus;
  outputSummary?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export type AgentRunStatus = "created" | "running" | "completed" | "errored";

export interface AgentRun {
  id: string;
  leadId: string;
  status: AgentRunStatus;
  createdAt: string;
  updatedAt: string;
  orchestratorVersion: string;
  steps: AgentStep[];
  qualificationReport?: QualificationReport;
  outreachSequence?: OutreachSequence;
  browserTrace?: HyperbrowserTrace;
  costBreakdownUsd?: number;
}

export interface QualificationMetrics {
  currentCost?: number;
  expectedSavings?: number;
  roiTimeline?: string;
}

export interface QualificationReport {
  framework: "MEDDIC" | "BANT";
  metrics: QualificationMetrics;
  economicBuyer?: {
    identified: boolean;
    name?: string;
    title?: string;
  };
  decisionCriteria: string[];
  decisionProcess: {
    timeline?: string;
    steps: string[];
    stakeholders: string[];
  };
  pains: Array<{
    painPoint: string;
    severity: "low" | "medium" | "high" | "critical";
    impact: string;
  }>;
  champion?: {
    exists: boolean;
    name?: string;
    influenceLevel?: string;
  };
  qualificationScore: number;
  recommendation: "disqualify" | "nurture" | "advance_to_sales" | "fast_track";
  summary: string;
}

export interface OutreachTouch {
  channel: "email" | "linkedin" | "call" | "sms" | "ads";
  objective: string;
  personalization: string;
  scheduledFor: string;
  draftContent: string;
  assets?: string[];
}

export interface OutreachSequence {
  persona: string;
  totalTouches: number;
  touches: OutreachTouch[];
  ctaFocus: string;
}

export interface HyperbrowserAction {
  taskId: string;
  status: "queued" | "running" | "completed" | "failed";
  summary: string;
  outputUrl?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface HyperbrowserTrace {
  sessionId?: string;
  actions: HyperbrowserAction[];
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface AmroGenState {
  leads: Lead[];
  agentRuns: AgentRun[];
  activityLog: ActivityLogEntry[];
  version: number;
  lastUpdated: string;
}

export interface LeadInput {
  fullName: string;
  email: string;
  company: string;
  companyDomain?: string;
  jobTitle?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  linkedInUrl?: string;
  source: string;
  timezone?: string;
  pains?: string[];
  intentTopics?: string[];
}

