"use client";

import { getAdminSocket, getSocket } from "@/lib/socket";
import { TMessage } from "@/types/chat.type";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

interface Props {
  room?: string;
  token: string;
  onMessage: (msg: TMessage) => void;
  onClosed: () => void;
  onError: (msg: string) => void;
}

interface AdminProps {
  token: string;
  onMessage: (msg: { message: TMessage; room: string }) => void;
  onClosed: () => void;
  onError: (msg: string) => void;
}

export function useAdminChatSocket({
  token,
  onMessage,
  onClosed,
  onError,
}: AdminProps) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getAdminSocket(token);
    socketRef.current = socket;

    socket.emit("join-conversation", "admin-notifications-room");

    socket.on("new-support-ticket", onMessage);
    socket.on("conversation-closed", onClosed);
    socket.on("chat-error", (e) => onError(e.message));

    return () => {
      socket.off("new-message");
      socket.off("conversation-closed");
      socket.off("chat-error");
      socket.off("new-support-ticket");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function useChatSocket({
  room,
  token,
  onMessage,
  onClosed,
  onError,
}: Props) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket(token);
    socketRef.current = socket;

    socket.emit("join-conversation", { room });
    socket.on("join-conversation", (data) => {
      console.log("Ticket received:", data);
    });

    socket.on("new-message", onMessage);
    socket.on("conversation-closed", onClosed);
    socket.on("chat-error", (e) => onError(e.message));

    return () => {
      socket.off("new-message");
      socket.off("conversation-closed");
      socket.off("chat-error");
      socket.off("new-support-ticket");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  const sendMessage = (message: string) => {
    socketRef.current?.emit("send-message", {
      room,
      message,
    });
  };

  const markRead = () => {
    socketRef.current?.emit("mark-read", { room });
  };

  const closeConversation = () => {
    socketRef.current?.emit("close-conversation", { room });
  };

  return { sendMessage, markRead, closeConversation };
}
