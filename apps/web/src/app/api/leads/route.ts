import { NextRequest, NextResponse } from "next/server";

import { serializeLead } from "../../../lib/mappers";
import { leadCreateSchema } from "../../../lib/validation";
import { getLeads, queueLeadIntake } from "../../../server/leads";

export async function GET() {
  const leads = await getLeads();

  return NextResponse.json({ leads: leads.map(serializeLead) });
}

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = leadCreateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const payload = parsed.data;

  await queueLeadIntake({
    workspaceId: payload.workspaceId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    title: payload.title,
    source: payload.source,
    company: payload.company
      ? {
          name: payload.company.name,
          domain: payload.company.domain?.replace(/^https?:\/\//, "").toLowerCase(),
        }
      : undefined,
    metadata: payload.metadata,
  });

  return NextResponse.json({ status: "queued" }, { status: 202 });
}
