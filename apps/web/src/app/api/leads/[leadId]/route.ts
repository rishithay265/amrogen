import { NextRequest, NextResponse } from "next/server";

import { LeadPriority, LeadStatus } from "@amrogen/database";
import { z } from "zod";

import { serializeLead } from "../../../../lib/mappers";
import { getLeadById, updateLead } from "../../../../server/leads";

const leadUpdateSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  priority: z.nativeEnum(LeadPriority).optional(),
  ownerName: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await context.params;
  const lead = await getLeadById(leadId);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ lead: serializeLead(lead) });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await context.params;
  const json = await request.json();
  const parsed = leadUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const lead = await getLeadById(leadId);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const updated = await updateLead(leadId, {
    status: parsed.data.status ?? lead.status,
    priority: parsed.data.priority ?? lead.priority,
    ownerName: parsed.data.ownerName ?? lead.ownerName,
    tags: parsed.data.tags ?? lead.tags,
  });

  return NextResponse.json({ lead: serializeLead(updated) });
}
