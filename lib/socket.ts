import { io, Socket } from "socket.io-client";

/*
 * Transports are left at Socket.IO's default (HTTP long-polling first, then
 * upgrade to a websocket), as in the customer app. The test server's nginx
 * answers a websocket-only connection with 400 (24 Nov 2026), so
 * `transports: ["websocket"]` never connected there and admin support
 * messages were silently lost.
 */

let socket: Socket | null = null;
let adminSocket: Socket | null = null;
let SOSSocket: Socket | null = null;

export const getSocket = (token: string) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      withCredentials: true,
    });
  }
  return socket;
};

export const getAdminSocket = (token: string) => {
  if (!adminSocket) {
    adminSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      withCredentials: true,
    });
  }
  return adminSocket;
};

export const getSOSSocket = (token: string) => {
  if (!SOSSocket) {
    SOSSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      withCredentials: true,
    });
  }
  return SOSSocket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
