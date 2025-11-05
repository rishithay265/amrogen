import { addMinutes } from "date-fns";
import { Worker } from "bullmq";

import prisma, { Prisma, TaskStatus, TaskType } from "@amrogen/database";

import { orchestrateLead } from "../../agents/claude-orchestrator";
import { qualifyLead } from "../../agents/gemini-qualification";
import { getQueue } from "../queues";
import redis from "../../redis";
import { publishEvent } from "../../events/publisher";
import type { QualificationJobData } from "../types";

export const createQualificationWorker = () =>
  new Worker<QualificationJobData>(
    "lead:qualification",
    async (job) => {
      const { workspaceId, leadId } = job.data;

      const qualification = await qualifyLead(workspaceId, leadId);
      const decision = await orchestrateLead(workspaceId, leadId);

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: decision.nextStatus,
          priority: decision.priority,
        },
      });

      await prisma.timelineEvent.create({
        data: {
          workspaceId,
          leadId,
          eventType: "qualification.completed",
          actorType: "agent",
          actorId: "gemini-qualification",
          summary: `Qualification score ${qualification.qualification_score} with recommendation ${qualification.recommendation}`,
          data: {
            qualification,
            decision,
          } as Prisma.JsonObject,
          occurredAt: new Date(),
        },
      });

      const followUpTasks = await Promise.all(
        decision.actions
          .filter((action) => action.type === "schedule_followup")
          .map(async (action) => {
            const dueAt = action.dueWithinMinutes
              ? addMinutes(new Date(), action.dueWithinMinutes)
              : null;

            return prisma.followUpTask.create({
              data: {
                workspaceId,
                leadId,
                type: TaskType.FOLLOW_UP,
                status: TaskStatus.PENDING,
                dueAt,
                notes: action.description,
                metadata: (action.payload ?? {}) as Prisma.JsonObject,
              },
            });
          }),
      );

      const sequenceAction = decision.actions.find((action) => action.type === "launch_sequence");
      const sequenceId = sequenceAction?.payload && typeof sequenceAction.payload.sequenceId === "string"
        ? (sequenceAction.payload.sequenceId as string)
        : undefined;

      switch (decision.routeToQueue) {
        case "outreach:dispatch": {
          await getQueue("outreach:dispatch").add("outreach:dispatch", {
            workspaceId,
            leadId,
            priority: decision.priority,
            status: decision.nextStatus,
            sequenceId,
          });
          break;
        }
        case "followup:execute": {
          await Promise.all(
            followUpTasks.map((task) =>
              getQueue("followup:execute").add(
                "followup:execute",
                {
                  workspaceId,
                  leadId,
                  taskId: task.id,
                },
                {
                  delay:
                    task.dueAt && task.dueAt.getTime() > Date.now()
                      ? task.dueAt.getTime() - Date.now()
                      : 0,
                },
              ),
            ),
          );
          break;
        }
        case "lead:qualification": {
          await getQueue("lead:qualification").add(
            "lead:qualification",
            {
              workspaceId,
              leadId,
              reason: "requalification",
            },
            {
              delay: 15 * 60 * 1000,
            },
          );
          break;
        }
        default:
          break;
      }

      await publishEvent({
        type: "lead.qualified",
        workspaceId,
        leadId,
        payload: {
          score: qualification.qualification_score,
          recommendation: qualification.recommendation,
        },
      });

      return {
        leadId,
        qualification,
        decision,
      };
    },
    {
      connection: redis.duplicate(),
      concurrency: 2,
    },
  );
