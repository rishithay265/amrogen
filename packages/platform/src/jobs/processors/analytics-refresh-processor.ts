import { Worker } from "bullmq";

import prisma from "@amrogen/database";

import redis from "../../redis";
import type { AnalyticsJobData } from "../types";

const minutesBetween = (start?: Date | null, end?: Date | null) => {
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / 60000);
};

export const createAnalyticsWorker = () =>
  new Worker<AnalyticsJobData>(
    "analytics:refresh",
    async (job) => {
      const { workspaceId, windowStart, windowEnd } = job.data;

      const leads = await prisma.lead.findMany({
        where: { workspaceId },
        select: { id: true, status: true, score: true },
      });

      for (const lead of leads) {
        const interactions = await prisma.interaction.findMany({
          where: {
            leadId: lead.id,
            sentAt: {
              gte: windowStart,
              lte: windowEnd,
            },
          },
          orderBy: { sentAt: "asc" },
        });

        const outbound = interactions.find((interaction) => interaction.direction === "OUTBOUND");
        const inbound = interactions.find((interaction) => interaction.direction === "INBOUND");

        await prisma.leadAnalytics.upsert({
          where: {
            leadId_metricDate: {
              leadId: lead.id,
              metricDate: windowStart,
            },
          },
          update: {
            touches: interactions.length,
            responseTimeMinutes: minutesBetween(outbound?.sentAt, inbound?.sentAt),
            conversionProbability: lead.score / 100,
            pipelineStage: lead.status,
          },
          create: {
            workspaceId,
            leadId: lead.id,
            metricDate: windowStart,
            touches: interactions.length,
            responseTimeMinutes: minutesBetween(outbound?.sentAt, inbound?.sentAt),
            conversionProbability: lead.score / 100,
            pipelineStage: lead.status,
          },
        });
      }
    },
    {
      connection: redis.duplicate(),
      concurrency: 1,
    },
  );
