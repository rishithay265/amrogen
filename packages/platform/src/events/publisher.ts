import redis from "../redis";

export type PlatformEvent = {
  type: string;
  workspaceId: string;
  leadId?: string;
  payload?: Record<string, unknown>;
};

const CHANNEL = "amrogen:events";

export const publishEvent = async (event: PlatformEvent) => {
  await redis.publish(CHANNEL, JSON.stringify(event));
};
