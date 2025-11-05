import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { getQueue } from "@amrogen/platform";
import { createFollowUpTask, getLeadById } from "../../../../../server/leads";

const followUpSchema = z.object({
  workspaceId: z.string().min(1),
  notes: z.string().min(1),
  dueAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await context.params;
  const json = await request.json();
  const parsed = followUpSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const lead = await getLeadById(leadId);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const task = await createFollowUpTask(lead.id, {
    workspaceId: parsed.data.workspaceId,
    note: parsed.data.notes,
    dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    metadata: parsed.data.metadata ?? null,
  });

  const queue = getQueue("followup:execute");

  await queue.add(
    "followup:execute",
    {
      workspaceId: parsed.data.workspaceId,
      leadId: lead.id,
      taskId: task.id,
    },
    {
      delay:
        task.dueAt && task.dueAt.getTime() > Date.now()
          ? task.dueAt.getTime() - Date.now()
          : 0,
    },
  );

  return NextResponse.json({ task }, { status: 201 });
}
