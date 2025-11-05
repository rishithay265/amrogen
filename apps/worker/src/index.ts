import "dotenv/config";

import prisma from "@amrogen/database";

import {
  createLeadIntakeWorker,
  createQualificationWorker,
  createOutreachWorker,
  createFollowUpWorker,
  createAnalyticsWorker,
  getQueue,
} from "@amrogen/platform";

const workers = [
  createLeadIntakeWorker(),
  createQualificationWorker(),
  createOutreachWorker(),
  createFollowUpWorker(),
  createAnalyticsWorker(),
];

workers.forEach((worker) => {
  worker.on("error", (error) => {
    console.error(`Worker ${worker.name} error`, error);
  });
});

const scheduleAnalytics = async () => {
  const queue = getQueue("analytics:refresh");
  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const windowEnd = now;

  const workspaces = await prisma.workspace.findMany({ select: { id: true } });

  await Promise.all(
    workspaces.map((workspace) =>
      queue.add("analytics:refresh", {
        workspaceId: workspace.id,
        windowStart,
        windowEnd,
      }),
    ),
  );
};

void scheduleAnalytics();
setInterval(scheduleAnalytics, 60 * 60 * 1000);

const shutdown = async () => {
  await Promise.all(workers.map((worker) => worker.close()));
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
