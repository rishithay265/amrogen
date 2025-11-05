import type { PipelineAnalytics } from "../server/analytics";
import type { LeadWithRelations } from "../server/leads";
import type { WorkspaceWithIntegrations } from "../server/workspaces";

import type { LeadRecord, PipelineAnalyticsView, WorkspaceSummary } from "./types";

const toIso = (date: Date | null | undefined) => (date ? date.toISOString() : null);

export const serializeLead = (lead: LeadWithRelations): LeadRecord => ({
  id: lead.id,
  workspaceId: lead.workspaceId,
  firstName: lead.firstName,
  lastName: lead.lastName,
  email: lead.email,
  phone: lead.phone,
  title: lead.title,
  ownerName: lead.ownerName,
  status: lead.status,
  priority: lead.priority,
  source: lead.source,
  score: lead.score,
  tags: lead.tags ?? [],
  createdAt: lead.createdAt.toISOString(),
  updatedAt: lead.updatedAt.toISOString(),
  company: lead.company
      ? {
          id: lead.company.id,
          name: lead.company.name,
          domain: lead.company.domain,
          industry: lead.company.industry,
          employeeCount: lead.company.employees ?? null,
          location: buildCompanyLocation(lead.company),
        }
    : null,
  qualificationSnapshots:
    lead.qualificationSnapshots?.map((snapshot) => ({
      id: snapshot.id,
      methodology: snapshot.framework,
      summary: snapshot.notes,
      budget: extractString(snapshot.metrics, "budget"),
      authority: extractString(snapshot.economicBuyer, "summary"),
      timeline: extractString(snapshot.decisionProcess, "timeline"),
      painPoints: extractStringArray(snapshot.painPoints),
      probability: snapshot.qualificationScore,
      capturedAt: snapshot.createdAt.toISOString(),
      metadata: snapshot.metrics as Record<string, unknown> | null,
    })) ?? [],
  interactions:
    lead.interactions?.map((interaction) => ({
      id: interaction.id,
      channel: String(interaction.channel),
      direction: String(interaction.direction),
      subject: interaction.subject,
      contentPreview: interaction.content?.slice(0, 140) ?? null,
      sentAt: interaction.sentAt?.toISOString() ?? new Date().toISOString(),
      status: interaction.status ?? "pending",
    })) ?? [],
  followUpTasks:
    lead.followUpTasks?.map((task) => ({
      id: task.id,
      status: task.status,
      type: task.type,
      dueAt: toIso(task.dueAt),
      completedAt: toIso(task.completedAt),
      notes: task.notes,
    })) ?? [],
  sequenceEnrollments:
    lead.sequenceEnrollments?.map((enrollment) => ({
      id: enrollment.id,
      status: enrollment.status,
      startedAt: toIso(enrollment.startedAt),
      sequence: {
        id: enrollment.sequence.id,
        name: enrollment.sequence.name,
        status: String(enrollment.sequence.status),
      },
      events:
        enrollment.events?.map((event) => ({
          id: event.id,
          eventType: event.eventType,
          occurredAt: event.occurredAt.toISOString(),
        })) ?? [],
    })) ?? [],
});

const buildCompanyLocation = (company: LeadWithRelations["company"]): string | null => {
  if (!company) {
    return null;
  }

  const parts = [company.city, company.state, company.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

const extractString = (value: unknown, key: string): string | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const raw = record[key];
  return typeof raw === "string" && raw.trim().length > 0 ? raw : null;
};

const extractStringArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const filtered = value.filter((item) => typeof item === "string" && item.trim().length > 0) as string[];
  return filtered.length ? filtered : null;
};

export const serializePipelineAnalytics = (
  analytics: PipelineAnalytics,
): PipelineAnalyticsView => ({
  totals: analytics.totals,
  velocity: analytics.velocity,
  recentLeads: analytics.recentLeads,
});

export const serializeWorkspace = (
  workspace: WorkspaceWithIntegrations,
): WorkspaceSummary => ({
  id: workspace.id,
  name: workspace.name,
  slug: workspace.slug,
  timezone: workspace.timezone ?? "UTC",
  createdAt: workspace.createdAt.toISOString(),
  integrations:
    workspace.integrationCredentials?.map((credential) => ({
      id: credential.id,
      provider: credential.provider,
      connected: Boolean(credential.accessToken),
      metadata: credential.metadata as Record<string, unknown> | null,
    })) ?? [],
});
