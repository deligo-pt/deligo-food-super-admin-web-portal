"use client";

import { useChatSocket } from "@/hooks/use-chat-socket";
import { getMessagesByRoom } from "@/services/chat/chat";
import { TMessage } from "@/types/chat.type";
import { getCookie } from "@/utils/cookies";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

interface Props {
  room: string;
}

export default function ChatWithVendorPanel({ room }: Props) {
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [status, setStatus] = useState<"OPEN" | "IN_PROGRESS" | "CLOSED">(
    "OPEN"
  );
  const [handledBy, setHandledBy] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const accessToken = getCookie("accessToken");
  const decoded = jwtDecode(accessToken || "") as { id: string };
  const adminId = decoded?.id;

  // Load messages on room change
  useEffect(() => {
    getMessagesByRoom(room).then((result) => setMessages(result.data));
  }, [room]);

  const { sendMessage, closeConversation } = useChatSocket({
    room,
    token: accessToken as string,
    onMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
      setStatus("IN_PROGRESS");
      setHandledBy(msg.senderId);
    },
    onClosed: () => {
      setStatus("CLOSED");
      setHandledBy(null);
    },
    onError: () => {},
  });

  const isLocked =
    status === "IN_PROGRESS" && handledBy !== null && handledBy !== adminId;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m._id} className="mb-2">
            <b>{m.senderRole}</b>: {m.message}
          </div>
        ))}
      </div>

      <div className="border-t p-3">
        {isLocked && (
          <div className="text-sm text-red-500 mb-2">
            Another admin is handling this conversation
          </div>
        )}

        <input
          className="w-full border p-2"
          value={input}
          disabled={isLocked || status === "CLOSED"}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex gap-2 mt-2">
          <button
            disabled={isLocked || status === "CLOSED"}
            onClick={() => {
              sendMessage(input);
              setInput("");
            }}
          >
            Send
          </button>

          {status !== "CLOSED" && !isLocked && (
            <button onClick={closeConversation}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
}
