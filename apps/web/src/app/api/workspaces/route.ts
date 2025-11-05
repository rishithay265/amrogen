import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { createWorkspace, getWorkspaces } from "../../../server/workspaces";

const createWorkspaceSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  timezone: z.string().min(1),
});

export async function GET() {
  const workspaces = await getWorkspaces();
  return NextResponse.json({ workspaces });
}

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = createWorkspaceSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const workspace = await createWorkspace(parsed.data);
  return NextResponse.json({ workspace }, { status: 201 });
}
