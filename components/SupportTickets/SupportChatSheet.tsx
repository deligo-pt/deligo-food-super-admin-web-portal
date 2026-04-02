"use client";

import SupportRoleBadge from "@/components/SupportTickets/SupportRoleBadge";
import SupportStatusBadge from "@/components/SupportTickets/SupportStatusBadge";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { cn } from "@/lib/utils";
import { getMessagesReq } from "@/services/dashboard/support/support.service";
import {
  TSupportMessage,
  TSupportTicket,
  TTicketStatus,
  TUserTypingPayload,
} from "@/types/support.type";
import { getCookie } from "@/utils/cookies";
import { removeUnderscore } from "@/utils/formatter";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { CheckCheckIcon, CheckIcon, Send, Tag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface IProps {
  ticket: TSupportTicket;
  closeChatSheet: () => void;
  updateStatus: (ticketId: string, status: TTicketStatus) => void;
}

export default function SupportChatSheet({
  ticket,
  closeChatSheet,
  updateStatus,
}: IProps) {
  const msgEndRef = useRef<HTMLDivElement | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<TSupportMessage[]>([]);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typing, setTyping] = useState(false);
  const [timeoutState, setTimeoutState] = useState<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  const accessToken = getCookie("accessToken");
  const decoded = (accessToken ? jwtDecode(accessToken) : {}) as {
    userId: string;
  };

  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const handleSendMessage = async (text: string) => {
    if (!text) return;

    sendMessage({
      ticketId: ticket.ticketId,
      message: text,
      targetUserObjectId: ticket.userId?._id || "",
      targetUserId: decoded?.userId || "",
      targetUserModel: ticket.userModel,
      messageType: "TEXT",
    });

    if (ticket.status === "OPEN") {
      updateStatus(ticket.ticketId, "IN_PROGRESS");
    }

    // reset textarea
    setChatInput("");
  };

  // const handleCloseTicket = async () => {
  //   setTickets((prev) => {
  //     const currentTicketIndex = prev.findIndex(
  //       (c) => c.ticketId === ticket?.ticketId,
  //     );
  //     prev[currentTicketIndex].status = "CLOSED";
  //     return prev;
  //   });
  //   setTicket(null);
  // };

  const { sendMessage, leaveConversation, makeTyping } = useChatSocket({
    ticketId: ticket?.ticketId,
    token: accessToken as string,
    onMessage: (msg) => {
      if (msg.ticketId === ticket?.ticketId) {
        setMessages((prev) => {
          if (prev.length >= 50) {
            prev.shift();
          }
          return [...prev, msg];
        });
        scrollToBottom();
      }
    },
    onTyping: (data: TUserTypingPayload) => {
      if (data.userId !== decoded?.userId) {
        setOtherUserTyping(data.isTyping);
      }
    },
    onClosed: () => {},
    onRead: () => {},
    onError: (msg) => console.log(msg),
  });

  const handleMessageTyping = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(chatInput);
    }

    if (e.key !== "Enter") {
      if (!typing) {
        setTyping(true);
        makeTyping(true);
      }

      clearTimeout(timeoutState);
      setTimeoutState(
        setTimeout(() => {
          setTyping(false);
          makeTyping(false);
        }, 2000),
      );
    } else {
      clearTimeout(timeoutState);
      setTyping(false);
      makeTyping(false);
    }
  };

  useEffect(() => {
    if (!!ticket) {
      getMessagesReq(ticket?.ticketId, { limit: "50" }).then((result) => {
        setMessages(result.data);
      });
    }
  }, [ticket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      leaveConversation();
    };
  }, [leaveConversation]);

  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        onClick={closeChatSheet}
        className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-51"
      />
      <motion.div
        initial={{
          x: "100%",
        }}
        animate={{
          x: 0,
        }}
        exit={{
          x: "100%",
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
        }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-52 flex flex-col border-l border-gray-100"
      >
        {/* Sheet Header */}
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col gap-4 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
                {ticket.userId?.name?.firstName?.charAt(0)}
                {ticket.userId?.name?.lastName?.charAt(0)}
                {!ticket.userId?.name?.firstName &&
                  !ticket.userId?.name?.lastName &&
                  (ticket.userId?.email
                    ?.split("@")?.[0]
                    ?.charAt(0)
                    ?.toUpperCase() ??
                    "U")}
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {ticket.userId?.name?.firstName}{" "}
                  {ticket.userId?.name?.lastName}
                  {!ticket.userId?.name?.firstName &&
                    !ticket.userId?.name?.lastName &&
                    ticket.userId?.email?.split("@")?.[0]}
                </p>
                <div className="flex items-center gap-2">
                  <SupportRoleBadge role={ticket.userModel} />
                </div>
              </div>
            </div>
            <button
              onClick={closeChatSheet}
              className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-gray-500">
                {ticket.ticketId}
              </span>
              <SupportStatusBadge status={ticket.status} />
            </div>
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              {ticket.lastMessage}
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <Tag size={12} /> {removeUnderscore(ticket.category)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            Created: {format(ticket.createdAt, "dd MMMM yyyy; hh:mm a")}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50">
          {messages.map((msg) => {
            const isAdmin =
              msg.senderRole === "ADMIN" || msg.senderRole === "SUPER_ADMIN";

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
              >
                <p className="text-xs text-gray-400 mb-1 px-1">
                  {!isAdmin &&
                    !ticket.userId?.name?.firstName &&
                    !ticket.userId?.name?.lastName &&
                    ticket.userId?.email?.split("@")?.[0]}
                  {isAdmin && "You"}
                  {!isAdmin && ticket.userId?.name?.firstName}{" "}
                  {!isAdmin && ticket.userId?.name?.lastName}
                </p>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${isAdmin ? "bg-[#DC3173] text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"}`}
                >
                  {msg.message}
                  <div className="flex justify-between items-center mt-1 gap-2">
                    <span
                      className={cn(
                        "text-xs block text-right",
                        isAdmin ? "text-gray-300" : "text-gray-400",
                      )}
                    >
                      {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                    </span>
                    {isAdmin &&
                      (msg.readBy?.[ticket?.userId?._id] ? (
                        <CheckCheckIcon size={16} className="text-indigo-400" />
                      ) : (
                        <CheckIcon size={16} className="text-gray-300" />
                      ))}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={msgEndRef} />

          {otherUserTyping && (
            <div className="flex items-center justify-center">
              <span className="text-xs text-gray-500">
                {!ticket.userId?.name?.firstName &&
                  !ticket.userId?.name?.lastName &&
                  ticket.userId?.email?.split("@")?.[0]}
                {ticket.userId?.name?.firstName} {ticket.userId?.name?.lastName}{" "}
                is typing...
              </span>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#DC3173] focus-within:ring-2 focus-within:ring-[#DC3173]/20 transition-all p-1">
              <textarea
                rows={1}
                value={chatInput}
                onChange={(e) => setChatInput(e.target?.value?.trim())}
                onKeyDown={handleMessageTyping}
                placeholder="Type a reply..."
                className="w-full bg-transparent px-3 py-2 outline-none text-sm resize-none max-h-32 min-h-[40px]"
              />
            </div>
            <button
              onClick={() => handleSendMessage(chatInput)}
              disabled={!chatInput.trim()}
              className="p-3 bg-[#DC3173] text-white rounded-xl hover:bg-[#DC3173]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
