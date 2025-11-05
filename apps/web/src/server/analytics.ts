import prisma from "@amrogen/database";

export type PipelineAnalytics = {
  totals: {
    status: Record<string, number>;
    priority: Record<string, number>;
  };
  velocity: Array<{
    date: string;
    created: number;
    qualified: number;
    responded: number;
  }>;
  recentLeads: Array<{
    id: string;
    name: string;
    company?: string | null;
    status: string;
    probability: number | null;
    touches: number;
  }>;
};

export async function getPipelineAnalytics(workspaceId?: string): Promise<PipelineAnalytics> {
  const whereClause = workspaceId ? { workspaceId } : undefined;

  const [statusCounts, priorityCounts, analytics] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], where: whereClause, _count: true }),
    prisma.lead.groupBy({ by: ["priority"], where: whereClause, _count: true }),
    prisma.leadAnalytics.findMany({
      where: whereClause,
      orderBy: { metricDate: "desc" },
      take: 30,
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: { select: { name: true } },
            status: true,
          },
        },
      },
    }),
  ]);

  const velocity = analytics
    .map((record) => ({
      date: record.metricDate.toISOString().slice(0, 10),
      created: record.newLeads,
      qualified: record.qualifiedLeads,
      responded: record.respondedLeads,
    }))
    .reverse();

  const totals = {
    status: statusCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    priority: priorityCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.priority] = item._count;
      return acc;
    }, {}),
  };

  const recentLeads = analytics.slice(0, 8).map((record) => ({
    id: record.lead.id,
    name: `${record.lead.firstName} ${record.lead.lastName}`.trim(),
    company: record.lead.company?.name ?? null,
    status: record.lead.status,
    probability: record.conversionProbability,
    touches: record.touches ?? 0,
  }));

  return { totals, velocity, recentLeads };
}
