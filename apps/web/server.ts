import { createServer } from "http";

import next from "next";
import { Server as SocketIOServer } from "socket.io";

import { redis } from "@amrogen/platform";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function main() {
  await app.prepare();

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: dev ? "*" : process.env.WEB_ORIGIN ?? "*",
    },
  });

  const subscriber = redis.duplicate();
  await subscriber.subscribe("amrogen:events");

  subscriber.on("message", (_channel, message) => {
    try {
      const event = JSON.parse(message);
      io.emit("amrogen:event", event);
    } catch (error) {
      console.error("Failed to parse event", error);
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected ${socket.id}`);
    socket.on("disconnect", () => console.log(`Socket disconnected ${socket.id}`));
  });

  const shutdown = async () => {
    await subscriber.unsubscribe("amrogen:events");
    await subscriber.quit();
    io.close();
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  httpServer.listen(port, hostname, () => {
    console.log(`AmroGen web server ready on http://${hostname}:${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
