import IORedis from "ioredis";

import { env } from "./env";

const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on("error", (error) => {
  console.error("Redis connection error", error);
});

export default redis;
