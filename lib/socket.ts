import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let adminSocket: Socket | null = null;

export const getSocket = (token: string) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return socket;
};

export const getAdminSocket = (token: string) => {
  if (!adminSocket) {
    adminSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return adminSocket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
