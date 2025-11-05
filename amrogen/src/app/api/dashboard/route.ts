import { NextResponse } from "next/server";
import { buildDashboardPayload } from "@/server/services/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await buildDashboardPayload();
  return NextResponse.json(data);
}

