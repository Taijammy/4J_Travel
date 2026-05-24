import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

let socket: Socket | null = null;

export const getSocket = (userId: string, driverId?: string): Socket => {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      query:             { userId, role: "customer" },
      transports:        ["websocket"],
      reconnection:      true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { socket };
