"use client";

import { io, type Socket } from "socket.io-client";

type AmrogenSocket = Socket<
  Record<string, never>,
  {
    "amrogen:event": (payload: {
      type: string;
      workspaceId: string;
      leadId?: string;
      payload?: Record<string, unknown>;
    }) => void;
  }
>;

let socket: AmrogenSocket | null = null;

export function getSocket(): AmrogenSocket {
  if (socket) {
    return socket;
  }

  const url =
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    `${typeof window !== "undefined" ? window.location.origin : ""}`;

  socket = io(url, {
    transports: ["websocket"],
    path: "/socket.io",
    withCredentials: true,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
