/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import ChatWithVendorPanel from "@/components/Chat/ChatWithVendors/ChatWithVendorPanel";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { TMeta } from "@/types";
import { TConversation } from "@/types/chat.type";
import { getCookie } from "@/utils/cookies";
import { useState } from "react";
import ConversationList from "./ConversationList";

interface IProps {
  conversationsData: { data: TConversation[]; meta?: TMeta };
}

export default function ChatWithVendors({ conversationsData }: IProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const accessToken = getCookie("accessToken");

  const { sendMessage } = useChatSocket({
    room: "admin-notifications-room",
    token: accessToken as string,
    onMessage: (msg) => {},
    onClosed: () => {},
    onError: () => {},
    onNewTicket: (msg) => {
      console.log(msg);
      const isExist = conversationsData?.data?.find((c) => c.room === msg.room);
      if (isExist?.room) return;
      conversationsData.data.unshift({
        _id: "temp-id-" + Math.random().toString(36).substring(2, 15),
        room: msg.room,
        status: "OPEN",
        lastMessage: msg.message,
        participants: [],
        handledBy: null,
        lastMessageTime: new Date().toISOString(),
        type: "SUPPORT",
        unreadCount: { admin: 1 },
        createdAt: new Date(),
      });
    },
  });

  return (
    <div className="grid grid-cols-3 h-screen">
      <ConversationList
        conversations={conversationsData.data}
        selectedRoom={selectedRoom}
        onSelect={setSelectedRoom}
      />

      <div className="col-span-2 border-l">
        {selectedRoom ? (
          <ChatWithVendorPanel room={selectedRoom} />
        ) : (
          <div className="p-6 text-gray-500">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
