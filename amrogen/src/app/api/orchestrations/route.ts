import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/server/storage/file-store";
import { LeadOrchestrator } from "@/server/services/orchestrator";
import { leadInputSchema } from "@/lib/validators/lead";

const orchestrateSchema = z.union([
  z.object({ leadId: z.string().min(6), lead: z.undefined().optional() }),
  z.object({ lead: leadInputSchema, leadId: z.undefined().optional() }),
]);

export const dynamic = "force-dynamic";

export async function GET() {
  const [runs, leads] = await Promise.all([store.listAgentRuns(), store.listLeads()]);
  const leadMap = new Map(leads.map((lead) => [lead.id, lead] as const));
  const payload = runs.map((run) => ({
    ...run,
    lead: leadMap.get(run.leadId) ?? null,
  }));
  return NextResponse.json({ runs: payload });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = orchestrateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const orchestrator = new LeadOrchestrator();

  try {
    if ("leadId" in parsed.data && parsed.data.leadId) {
      const existing = await store.getLeadById(parsed.data.leadId);
      if (!existing) {
        return NextResponse.json(
          { error: `Lead ${parsed.data.leadId} not found` },
          { status: 404 }
        );
      }
      const result = await orchestrator.orchestrateLead(
        {
          fullName: existing.fullName,
          email: existing.email,
          company: existing.company,
          companyDomain: existing.companyDomain,
          jobTitle: existing.jobTitle,
          industry: existing.industry,
          employeeCount: existing.employeeCount,
          annualRevenue: existing.annualRevenue,
          linkedInUrl: existing.linkedInUrl,
          source: existing.source,
          timezone: existing.timezone,
          pains: existing.pains,
          intentTopics: existing.intentTopics,
        },
        existing.id
      );
      return NextResponse.json(result, { status: 201 });
    }

    const result = await orchestrator.orchestrateLead({
      ...parsed.data.lead,
      companyDomain: parsed.data.lead.companyDomain || undefined,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Orchestrator error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown orchestration failure",
      },
      { status: 500 }
    );
  }
}

