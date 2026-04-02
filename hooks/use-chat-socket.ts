"use client";

import { getAdminSocket, getSocket } from "@/lib/socket";
import { TAdminSupportMessage } from "@/types/chat.type";
import {
  TSupportMessage,
  TUserModel,
  TUserTypingPayload,
} from "@/types/support.type";
import { File } from "node:buffer";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

interface AdminProps {
  token: string;
  onMessage: (msg: TAdminSupportMessage) => void;
  onError?: (msg: string) => void;
}

export function useAdminChatSocket({ token, onMessage, onError }: AdminProps) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getAdminSocket(token);
    socketRef.current = socket;

    socket.emit("join-conversation", "admin-notifications-room");

    socket.on("incoming-notification", onMessage);
    socket.on("chat-error", (e) => onError && onError(e.message));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const turnOffEvents = () => {
    socketRef.current?.off("chat-error");
    socketRef.current?.off("incoming-notification");
  };

  return { turnOffEvents };
}

interface Props {
  ticketId?: string;
  token: string;
  onMessage: (msg: TSupportMessage) => void;
  onClosed: () => void;
  onRead: () => void;
  onError: (msg: string) => void;
  onTyping: (data: TUserTypingPayload) => void;
}

export function useChatSocket({
  ticketId,
  token,
  onMessage,
  onClosed,
  onError,
  onTyping,
  onRead,
}: Props) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket(token);
    socketRef.current = socket;

    socket.emit("join-conversation", { ticketId });

    socket.on("new-message", onMessage);
    socket.on("user-typing", onTyping);
    socket.on("read-update", onRead);
    socket.on("conversation-closed", onClosed);
    socket.on("chat-error", (e) => onError(e.message));

    return () => {
      socket.off("new-message");
      socket.off("user-typing");
      socket.off("read-update");
      socket.off("conversation-closed");
      socket.off("chat-error");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const sendMessage = (payload: {
    ticketId: string;
    message: string;
    attachments?: File[];
    targetUserObjectId?: string;
    targetUserId: string;
    targetUserModel: TUserModel;
    messageType: TSupportMessage["messageType"];
  }) => {
    socketRef.current?.emit("send-message", payload);
  };

  const makeTyping = (isTyping: boolean) => {
    socketRef.current?.emit("typing", { ticketId, isTyping });
  };

  const markRead = () => {
    socketRef.current?.emit("mark-read", { ticketId });
  };

  const closeConversation = () => {
    socketRef.current?.emit("close-conversation", { ticketId });
  };

  const leaveConversation = () => {
    socketRef.current?.emit("leave-conversation", { ticketId });
  };

  return {
    sendMessage,
    markRead,
    makeTyping,
    closeConversation,
    leaveConversation,
  };
}
