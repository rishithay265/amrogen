import prisma, {
  LeadPriority,
  LeadSource,
  LeadStatus,
  Prisma,
  TaskStatus,
  TaskType,
} from "@amrogen/database";

const leadInclude = {
  company: true,
  interactions: {
    orderBy: { sentAt: "desc" },
    take: 20,
  },
  qualificationSnapshots: {
    orderBy: { createdAt: "desc" },
    take: 5,
  },
  followUpTasks: {
    orderBy: { createdAt: "desc" },
  },
  sequenceEnrollments: {
    include: {
      sequence: true,
      events: {
        orderBy: { occurredAt: "desc" },
        take: 10,
      },
    },
  },
} satisfies Prisma.LeadInclude;

export type LeadWithRelations = Prisma.LeadGetPayload<{
  include: typeof leadInclude;
}>;

export async function getLeads(): Promise<LeadWithRelations[]> {
  return prisma.lead.findMany({
    orderBy: { updatedAt: "desc" },
    include: leadInclude,
  });
}

export async function getLeadById(id: string): Promise<LeadWithRelations | null> {
  return prisma.lead.findUnique({ where: { id }, include: leadInclude });
}

export type LeadUpdateInput = {
  status?: LeadStatus;
  priority?: LeadPriority;
  ownerName?: string | null;
  tags?: string[];
};

export async function updateLead(id: string, data: LeadUpdateInput) {
  return prisma.lead.update({
    where: { id },
    data,
    include: leadInclude,
  });
}

export type LeadCreatePayload = {
  workspaceId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  title?: string | null;
  source?: LeadSource;
  company?: {
    name: string;
    domain?: string | null;
  } | null;
  metadata?: Record<string, unknown> | null;
};

export async function queueLeadIntake(payload: LeadCreatePayload) {
  const { getQueue } = await import("@amrogen/platform");
  const queue = getQueue("lead:intake");

  await queue.add("lead:intake", {
    workspaceId: payload.workspaceId,
    source: payload.source ?? LeadSource.MANUAL,
    payload: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      title: payload.title,
      company: payload.company
        ? {
            name: payload.company.name,
            domain: payload.company.domain,
          }
        : undefined,
      metadata: payload.metadata as Prisma.JsonObject | undefined,
    },
  });
}

export async function createFollowUpTask(
  leadId: string,
  data: {
    workspaceId: string;
    ownerName?: string | null;
    note: string;
    dueAt?: Date | null;
    metadata?: Record<string, unknown> | null;
    type?: TaskType;
  },
) {
  return prisma.followUpTask.create({
    data: {
      leadId,
      workspaceId: data.workspaceId,
      notes: data.note,
      type: data.type ?? TaskType.FOLLOW_UP,
      status: TaskStatus.PENDING,
      dueAt: data.dueAt ?? null,
      metadata: (data.metadata ?? undefined) as Prisma.JsonObject | undefined,
      assignedToUserId: null,
    },
  });
}
