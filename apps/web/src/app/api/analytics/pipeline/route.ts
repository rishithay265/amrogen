import { NextRequest, NextResponse } from "next/server";

import { serializePipelineAnalytics } from "../../../../lib/mappers";
import { getPipelineAnalytics } from "../../../../server/analytics";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const analytics = await getPipelineAnalytics(workspaceId ?? undefined);

  return NextResponse.json({ analytics: serializePipelineAnalytics(analytics) });
}
