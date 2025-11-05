import { Queue, QueueEvents } from "bullmq";

import redis from "../redis";

import type {
  AnalyticsJobData,
  FollowUpJobData,
  JobNames,
  LeadIntakeJobData,
  OutreachJobData,
  QualificationJobData,
} from "./types";

type QueuePayloadMap = {
  "lead:intake": LeadIntakeJobData;
  "lead:qualification": QualificationJobData;
  "outreach:dispatch": OutreachJobData;
  "followup:execute": FollowUpJobData;
  "analytics:refresh": AnalyticsJobData;
};

const queueRegistry = new Map<JobNames, Queue<any>>();
const queueEventsRegistry = new Map<JobNames, QueueEvents>();

const queueOptions = {
  connection: redis.duplicate(),
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
  },
};

const queueEventsOptions = {
  connection: redis.duplicate(),
};

export const getQueue = <TName extends JobNames>(name: TName) => {
  if (!queueRegistry.has(name)) {
    const queue = new Queue<QueuePayloadMap[TName]>(name, queueOptions);
    queueRegistry.set(name, queue);
  }

  return queueRegistry.get(name)! as Queue<QueuePayloadMap[TName]>;
};

export const getQueueEvents = (name: JobNames) => {
  if (!queueEventsRegistry.has(name)) {
    const events = new QueueEvents(name, queueEventsOptions);
    queueEventsRegistry.set(name, events);
  }

  return queueEventsRegistry.get(name)!;
};

export const closeQueues = async () => {
  await Promise.all(
    [...queueRegistry.values()].map(async (queue) => {
      await queue.close();
    }),
  );
  queueRegistry.clear();

  await Promise.all(
    [...queueEventsRegistry.values()].map(async (events) => {
      await events.close();
    }),
  );
  queueEventsRegistry.clear();
};
