import { NextResponse } from "next/server";
import { store } from "@/server/storage/file-store";
import { leadInputSchema } from "@/lib/validators/lead";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await store.listLeads();
  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = leadInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const payload = {
    ...parsed.data,
    companyDomain: parsed.data.companyDomain || undefined,
  };

  const lead = await store.upsertLead(payload);
  return NextResponse.json({ lead }, { status: 201 });
}

