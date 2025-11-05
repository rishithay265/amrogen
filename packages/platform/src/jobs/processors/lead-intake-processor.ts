import { Worker } from "bullmq";

import prisma, { Prisma, LeadStatus, LeadPriority, LeadSource } from "@amrogen/database";

import { clearbitClient } from "../../integrations/enrichment/clearbit";
import { apolloClient } from "../../integrations/enrichment/apollo";
import { zoomInfoClient } from "../../integrations/enrichment/zoominfo";
import { publishEvent } from "../../events/publisher";
import { getQueue } from "../queues";
import redis from "../../redis";
import type { LeadIntakeJobData } from "../types";

const getDefaultPriority = (source: LeadSource) => {
  switch (source) {
    case LeadSource.INTENT_DATA:
    case LeadSource.REFERRAL:
    case LeadSource.OUTBOUND:
      return LeadPriority.HIGH;
    case LeadSource.WEBSITE:
    case LeadSource.EVENT:
      return LeadPriority.MEDIUM;
    default:
      return LeadPriority.LOW;
  }
};

const sanitizeDomain = (domain?: string | null) => domain?.toLowerCase().trim() ?? null;

async function upsertCompany(workspaceId: string, companyInput?: { name: string; domain?: string }) {
  if (!companyInput) {
    return null;
  }

  const domain = sanitizeDomain(companyInput.domain);

  if (domain) {
    const existing = await prisma.company.findFirst({ where: { domain } });

    if (existing) {
      if (existing.workspaceId !== workspaceId) {
        return existing;
      }

      return prisma.company.update({
        where: { id: existing.id },
        data: {
          name: companyInput.name,
        },
      });
    }
  }

  return prisma.company.create({
    data: {
      workspaceId,
      name: companyInput.name,
      domain,
    },
  });
}

async function enrichCompany(companyId: string, domain?: string | null) {
  if (!domain) return;

  try {
    const clearbitData = await clearbitClient.enrichCompany(domain);

    await prisma.company.update({
      where: { id: companyId },
      data: {
        industry: clearbitData.category?.industry ?? undefined,
        employees: clearbitData.metrics?.employees ?? undefined,
        revenue: clearbitData.metrics?.estimatedAnnualRevenue ?? undefined,
        linkedinUrl: clearbitData.site?.linkedin?.handle
          ? `https://www.linkedin.com/${clearbitData.site.linkedin.handle}`
          : undefined,
        enrichedAt: new Date(),
      },
    });

    await prisma.companyEnrichment.create({
      data: {
        companyId,
        provider: "clearbit",
        payload: clearbitData as unknown as Prisma.JsonObject,
      },
    });
  } catch (error) {
    console.warn("Clearbit enrichment failed", error);
  }

  try {
    const zoomInfo = await zoomInfoClient.enrichCompany(domain);

    await prisma.companyEnrichment.create({
      data: {
        companyId,
        provider: "zoominfo",
        payload: zoomInfo as unknown as Prisma.JsonObject,
      },
    });
  } catch (error) {
    console.warn("ZoomInfo enrichment failed", error);
  }

  try {
    const apollo = await apolloClient.enrichCompany(domain);

    await prisma.companyEnrichment.create({
      data: {
        companyId,
        provider: "apollo",
        payload: apollo as unknown as Prisma.JsonObject,
      },
    });
  } catch (error) {
    console.warn("Apollo enrichment failed", error);
  }
}

async function processLeadIntake(job: { data: LeadIntakeJobData }) {
  const { workspaceId, payload, source } = job.data;

  const company = await upsertCompany(workspaceId, payload.company);

  const lead = await prisma.lead.upsert({
    where: { email: payload.email },
    update: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      title: payload.title,
      source,
      status: LeadStatus.NEW,
      priority: getDefaultPriority(source),
      companyId: company?.id,
      metadata: (payload.metadata ?? {}) as Prisma.JsonObject,
    },
    create: {
      workspaceId,
      companyId: company?.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      title: payload.title,
      source,
      status: LeadStatus.NEW,
      priority: getDefaultPriority(source),
      tags: [],
      metadata: (payload.metadata ?? {}) as Prisma.JsonObject,
    },
  });

  if (company) {
    void enrichCompany(company.id, company.domain);
  }

  // Schedule qualification step
  await getQueue("lead:qualification").add("lead:qualification", {
    workspaceId,
    leadId: lead.id,
    reason: "new_lead",
  });

  await publishEvent({
    type: "lead.created",
    workspaceId,
    leadId: lead.id,
    payload: {
      source,
    },
  });

  return lead.id;
}

export const createLeadIntakeWorker = () =>
  new Worker<LeadIntakeJobData>(
    "lead:intake",
    async (job) => {
      return processLeadIntake(job);
    },
    {
      connection: redis.duplicate(),
      concurrency: 3,
    },
  );
