import { Worker } from "bullmq";

import prisma, { Prisma, ChannelType, InteractionDirection, TaskStatus } from "@amrogen/database";

import { composeFollowUpEmail } from "../../agents/followup-writer";
import { sendTransactionalEmail } from "../../integrations/sendgrid";
import { env } from "../../env";
import redis from "../../redis";
import { publishEvent } from "../../events/publisher";
import type { FollowUpJobData } from "../types";

export const createFollowUpWorker = () =>
  new Worker<FollowUpJobData>(
    "followup:execute",
    async (job) => {
      const { taskId, workspaceId, leadId } = job.data;

      const task = await prisma.followUpTask.findUnique({ where: { id: taskId } });
      if (!task) {
        throw new Error(`Follow-up task ${taskId} not found`);
      }

      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) {
        throw new Error(`Lead ${leadId} not found`);
      }

      const email = await composeFollowUpEmail(task);

      await sendTransactionalEmail({
        to: lead.email,
        from: env.OUTREACH_FROM_EMAIL,
        subject: email.subject,
        html: email.htmlBody,
        text: email.textBody,
        categories: ["amrogen", "follow-up"],
        customArgs: {
          leadId,
          taskId,
        },
      });

      await prisma.interaction.create({
        data: {
          leadId,
          channel: ChannelType.EMAIL,
          direction: InteractionDirection.OUTBOUND,
          subject: email.subject,
          content: email.htmlBody,
          sentAt: new Date(),
          status: "sent",
        },
      });

      await prisma.followUpTask.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await prisma.timelineEvent.create({
        data: {
          workspaceId,
          leadId,
          eventType: "followup.completed",
          actorType: "agent",
          actorId: "followup-automation",
          summary: task.notes ?? "Automated follow-up sent",
          data: {
            taskId,
          } as Prisma.JsonObject,
          occurredAt: new Date(),
        },
      });

      await publishEvent({
        type: "followup.completed",
        workspaceId,
        leadId,
        payload: {
          taskId,
        },
      });
    },
    {
      connection: redis.duplicate(),
      concurrency: 3,
    },
  );
