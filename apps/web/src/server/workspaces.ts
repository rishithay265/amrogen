import prisma, { Prisma } from "@amrogen/database";

export type WorkspaceWithIntegrations = Prisma.WorkspaceGetPayload<{
  include: {
    integrationCredentials: true;
    webhookSubscriptions: true;
  };
}>;

export async function getWorkspaces(): Promise<WorkspaceWithIntegrations[]> {
  return prisma.workspace.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      integrationCredentials: true,
      webhookSubscriptions: true,
    },
  });
}

export async function createWorkspace(input: {
  name: string;
  slug: string;
  timezone: string;
}) {
  return prisma.workspace.create({
    data: {
      name: input.name,
      slug: input.slug,
      timezone: input.timezone,
    },
  });
}
