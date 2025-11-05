import { PrismaClient } from "@prisma/client";

export const createPrismaClient = () =>
  new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "colorless",
  });

const globalForPrisma = globalThis as unknown as {
  __amrogenPrisma__?: PrismaClient;
};

const prisma = globalForPrisma.__amrogenPrisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__amrogenPrisma__ = prisma;
}

export default prisma;
export * from "@prisma/client";
