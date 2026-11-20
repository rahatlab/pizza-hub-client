import io from "socket.io-client";
import type { Socket as IOClient } from "socket.io-client";

let socket: IOClient | null = null;

export function getSocket(token: string): IOClient {
  if (!socket) {
    socket = io(
      typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:5000")
        : "http://localhost:5000",
      {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
