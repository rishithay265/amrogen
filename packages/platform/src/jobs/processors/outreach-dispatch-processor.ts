import { Worker } from "bullmq";

import prisma, {
  Prisma,
  ChannelType,
  InteractionDirection,
  SequenceEnrollmentStatus,
  SequenceStatus,
} from "@amrogen/database";

import { composeOutreachEmail } from "../../agents/outreach-writer";
import { sendTransactionalEmail } from "../../integrations/sendgrid";
import { env } from "../../env";
import { publishEvent } from "../../events/publisher";
import { getQueue } from "../queues";
import redis from "../../redis";
import type { OutreachJobData } from "../types";

const determineSequence = async (workspaceId: string, sequenceId?: string | null) => {
  if (sequenceId) {
    return prisma.outreachSequence.findFirst({
      where: { id: sequenceId, workspaceId, status: SequenceStatus.ACTIVE },
      include: { steps: { orderBy: { order: "asc" } } },
    });
  }

  return prisma.outreachSequence.findFirst({
    where: { workspaceId, status: SequenceStatus.ACTIVE },
    orderBy: { createdAt: "asc" },
    include: { steps: { orderBy: { order: "asc" } } },
  });
};

const getNextStep = async (enrollmentId: string, sequenceSteps: { id: string; order: number }[]) => {
  const completed = await prisma.sequenceEvent.findMany({
    where: { sequenceEnrollmentId: enrollmentId, eventType: "step.completed" },
    select: { stepId: true },
  });
  const completedIds = new Set(completed.map((event) => event.stepId));
  return sequenceSteps.find((step) => !completedIds.has(step.id)) ?? null;
};

export const createOutreachWorker = () =>
  new Worker<OutreachJobData>(
    "outreach:dispatch",
    async (job) => {
      const { workspaceId, leadId, sequenceId } = job.data;

      const sequence = await determineSequence(workspaceId, sequenceId);

      if (!sequence || sequence.steps.length === 0) {
        await prisma.timelineEvent.create({
          data: {
            workspaceId,
            leadId,
            eventType: "outreach.sequence_missing",
            actorType: "system",
            summary: "No active outreach sequence available",
            occurredAt: new Date(),
            data: {
              sequenceId,
            } as Prisma.JsonObject,
          },
        });
        return;
      }

      let enrollment = await prisma.sequenceEnrollment.findFirst({
        where: { leadId, sequenceId: sequence.id },
      });

      if (!enrollment) {
        enrollment = await prisma.sequenceEnrollment.create({
          data: {
            leadId,
            sequenceId: sequence.id,
            status: SequenceEnrollmentStatus.IN_PROGRESS,
          },
        });
      }

      const nextStep = await getNextStep(enrollment.id, sequence.steps);

      if (!nextStep) {
        await prisma.sequenceEnrollment.update({
          where: { id: enrollment.id },
          data: {
            status: SequenceEnrollmentStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        await prisma.timelineEvent.create({
          data: {
            workspaceId,
            leadId,
            eventType: "outreach.sequence_completed",
            actorType: "agent",
            actorId: "outreach-automation",
            summary: `Sequence ${sequence.name} completed`,
            occurredAt: new Date(),
          },
        });
        return;
      }

      const step = sequence.steps.find((candidate) => candidate.id === nextStep.id)!;

      const email = await composeOutreachEmail({ leadId, step });

      const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { company: true } });
      if (!lead) throw new Error(`Lead ${leadId} not found`);

      await sendTransactionalEmail({
        to: lead.email,
        from: env.OUTREACH_FROM_EMAIL,
        subject: email.subject,
        html: email.htmlBody,
        text: email.textBody,
        categories: ["amrogen", "outreach-step"],
        customArgs: {
          leadId,
          sequenceId: sequence.id,
          stepId: step.id,
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

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          lastContactAt: new Date(),
        },
      });

      await prisma.sequenceEvent.create({
        data: {
          sequenceEnrollmentId: enrollment.id,
          stepId: step.id,
          eventType: "step.completed",
          payload: { subject: email.subject } as Prisma.JsonObject,
        },
      });

      const stepIndex = sequence.steps.findIndex((candidate) => candidate.id === step.id);
      const upcomingStep = sequence.steps[stepIndex + 1];

      if (upcomingStep) {
        const delay = upcomingStep.waitHours * 60 * 60 * 1000;
        await getQueue("outreach:dispatch").add(
          "outreach:dispatch",
          {
            workspaceId,
            leadId,
            status: job.data.status,
            priority: job.data.priority,
            sequenceId: sequence.id,
          },
          {
            delay,
          },
        );
      } else {
        await prisma.sequenceEnrollment.update({
          where: { id: enrollment.id },
          data: {
            status: SequenceEnrollmentStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      }

      await publishEvent({
        type: "outreach.sent",
        workspaceId,
        leadId,
        payload: {
          sequenceId: sequence.id,
          stepId: step.id,
          subject: email.subject,
        },
      });
    },
    {
      connection: redis.duplicate(),
      concurrency: 3,
    },
  );
