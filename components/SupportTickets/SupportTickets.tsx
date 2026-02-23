/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Button } from "@/components/ui/button";
import { USER_ROLE } from "@/consts/user.const";
import { useAdminChatSocket, useChatSocket } from "@/hooks/use-chat-socket";
import { useTranslation } from "@/hooks/use-translation";
import { getMessagesByRoom } from "@/services/chat/chat";
import { TMeta, TResponse } from "@/types";
import {
  TAdminSupportMessage,
  TConversation,
  TConversationStatus,
  TMessage,
} from "@/types/chat.type";
import { getCookie } from "@/utils/cookies";
import { fetchData } from "@/utils/requests";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

// Status Styling
const STATUS: Record<TConversationStatus, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-pink-100 text-pink-700",
  // resolved: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-200 text-gray-700",
};

interface IProps {
  conversationsData: { data: TConversation[]; meta?: TMeta };
}

export default function SupportTickets({ conversationsData }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
  ];

  const [messages, setMessages] = useState<TMessage[]>([]);
  const [query, setQuery] = useState("");

  const [conversation, setConversation] = useState<TConversation | null>(null);
  const [conversations, setConversations] = useState<TConversation[]>(
    conversationsData?.data || [],
  );

  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const accessToken = getCookie("accessToken");

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const sendReply = async (e: FormEvent) => {
    e.preventDefault();
    const text = textRef.current?.value.trim() ?? "";
    if (!text) return;

    sendMessage(text);

    // reset
    if (textRef.current) textRef.current.value = "";
    textRef.current?.focus();
  };

  const handleCloseConversation = async () => {
    setConversations((prev) => {
      const currentConversationIndex = prev.findIndex(
        (c) => c.room === conversation?.room,
      );
      prev[currentConversationIndex].status = "CLOSED";
      return prev;
    });
    setConversation(null);
  };

  const getConversation = async (room: string) => {
    try {
      const result = (await fetchData(`/support/conversations/${room}`, {
        headers: { authorization: accessToken },
      })) as TResponse<TConversation>;

      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: result.message,
        };
      }

      return {
        success: false,
        data: null,
        message: result.message || "Get conversation failed",
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        success: false,
        data: error?.response?.data || error,
        message: error?.response?.data?.message || "Get conversation failed",
      };
    }
  };

  const getNewConversation = async (message: TAdminSupportMessage) => {
    let newConversation = {} as TConversation;

    const result = await getConversation(message?.room);
    if (result.success) {
      newConversation = result.data;
    }

    setConversations((prev) => {
      const isConversationExist = prev?.find((c) => c.room === message?.room);

      if (!isConversationExist) {
        return [newConversation, ...prev];
      }
      const filteredConversations = prev.filter((c) => c.room !== message.room);

      isConversationExist!.lastMessage = message.messagePreview;
      // isConversationExist!.lastMessageTime = message.message
      //   ?.createdAt as unknown as string;
      return [newConversation, ...filteredConversations];
    });
  };

  useAdminChatSocket({
    token: accessToken as string,
    onMessage: (msg) => getNewConversation(msg as TAdminSupportMessage),
    onClosed: () => console.log("CLOSED"),
    onError: (msg) => console.log(msg),
  });

  const { sendMessage, closeConversation } = useChatSocket({
    room: conversation?.room as string,
    token: accessToken as string,
    onMessage: (msg) => {
      if (msg.room === conversation?.room) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    },
    onTyping: (data) => {},
    onClosed: () => handleCloseConversation(),
    onError: (msg) => console.log(msg),
  });

  useEffect(() => {
    if (!!conversation) {
      getMessagesByRoom(conversation?.room).then((result) => {
        if (result.success) {
          setMessages(result.data);
        } else {
          setMessages([]);
        }
      });
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Header */}
      <TitleHeader title={t("support_tickets")} subtitle={t("manage_issues")} />

      <AllFilters sortOptions={sortOptions} />

      {/* Card Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {conversations?.map((c) => (
          <div
            key={c._id}
            onClick={() => setConversation(c)}
            className="cursor-pointer bg-white rounded-3xl p-5 shadow-sm border hover:shadow-lg transition group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`px-3 py-1 text-xs rounded-full ${STATUS[c.status]}`}
              >
                {c.status.replace("_", " ")}
              </span>

              <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-[#DC3173] transition" />
            </div>

            {/* Subject */}
            <h2 className="text-lg font-semibold leading-tight group-hover:text-[#DC3173] transition">
              {c.lastMessage || "-"}
            </h2>

            {/* User */}
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-[#DC3173]/10 text-[#DC3173] font-semibold flex items-center justify-center">
                {c.participants?.[0]?.name?.[0]}
              </div>
              <div className="text-sm">
                <p className="font-medium">
                  {c.participants?.[0]?.name?.trim() || t("no_name_provided")}
                </p>
                <p className="text-xs text-gray-500">
                  {c.participants?.[0]?.role === USER_ROLE.VENDOR
                    ? t("vendor")
                    : c.participants?.[0]?.role === USER_ROLE.FLEET_MANAGER
                      ? t("fleet_manager")
                      : t("user")}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(c.createdAt as Date, {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t">
              <p className="text-xs text-gray-500">
                {t("id")}: {c.ticketId}
              </p>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#DC3173] transition" />
            </div>
          </div>
        ))}
      </div>

      {/* Drawer */}
      {!!conversation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full sm:w-[420px] h-full bg-white rounded-l-3xl p-6 flex flex-col shadow-xl animate-slide-in">
            {/* Top */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold w-10/12 leading-tight">
                {conversation.ticketId}
              </h2>
              <button
                onClick={() => setConversation(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-between gap-3">
              {/* User */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#DC3173]/10 text-[#DC3173] font-semibold flex items-center justify-center text-lg">
                  {conversation?.participants?.[0]?.name?.[0]}
                </div>
                <div>
                  <p className="font-medium">
                    {conversation?.participants?.[0]?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {conversation?.participants?.[0]?.role}
                  </p>
                </div>
              </div>

              {/* Close Conversation Button */}
              <div className="text-center">
                <Button
                  onClick={closeConversation}
                  size="sm"
                  variant="ghost"
                  className="border border-gray-200 py-1"
                >
                  Close Ticket
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto custom-scroll pr-2 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-4 rounded-2xl border text-sm leading-relaxed ${
                    m.senderRole === "ADMIN" || m.senderRole === "SUPER_ADMIN"
                      ? "ml-auto bg-[#DC3173]/20 border-[#DC3173]/30"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">
                    {m.senderRole === "ADMIN" || m.senderRole === "SUPER_ADMIN"
                      ? "You"
                      : conversation?.participants?.[0]?.name}{" "}
                    •{" "}
                    {formatDistanceToNow(m.createdAt as Date, {
                      addSuffix: true,
                    })}
                  </p>
                  {m.message}
                </div>
              ))}

              <div ref={endRef} />
            </div>

            {/* Reply */}
            <div className="mt-4 pt-4 border-t">
              <form onSubmit={sendReply} className="flex items-end gap-3">
                <textarea
                  ref={textRef}
                  rows={2}
                  placeholder={t("write_a_reply")}
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 resize-none focus:ring-2 focus:ring-[#DC3173]/40 outline-none"
                />
                <button className="px-5 py-3 rounded-2xl bg-[#DC3173] text-white font-semibold">
                  {t("send")}
                </button>
              </form>
            </div>
          </div>

          <style jsx>{`
            @keyframes slide-in {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .animate-slide-in {
              animation: slide-in 0.25s ease-out;
            }

            .custom-scroll::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #ff8fb2, #dc3173);
              border-radius: 999px;
            }
          `}</style>
        </div>
      )}

      {/* Pagination */}
      {!!conversationsData?.meta?.totalPage && (
        <div className="my-4">
          <PaginationComponent
            totalPages={conversationsData?.meta?.totalPage as number}
          />
        </div>
      )}
    </div>
  );
}
