"use client";

import SupportChatInput from "@/components/SupportTickets/SupportChatInput";
import SupportMessageItem from "@/components/SupportTickets/SupportMessageItem";
import SupportRoleBadge from "@/components/SupportTickets/SupportRoleBadge";
import SupportStatusBadge from "@/components/SupportTickets/SupportStatusBadge";
import { USER_ROLE } from "@/consts/user.const";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { getMessagesReq } from "@/services/dashboard/support/support.service";
import {
  TSupportMessage,
  TSupportTicket,
  TTicketStatus,
  TUserTypingPayload,
} from "@/types/support.type";
import { getCookie } from "@/utils/cookies";
import { removeUnderscore } from "@/utils/formatter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { Loader2, Tag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface IProps {
  ticket: TSupportTicket;
  closeChatSheet: () => void;
  updateStatus: (ticketId: string, status: TTicketStatus) => void;
}

const MESSAGE_LIMIT = 50;

export default function SupportChatSheet({
  ticket,
  closeChatSheet,
  updateStatus,
}: IProps) {
  const isInitialLoad = useRef(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<TSupportMessage[]>([]);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typing, setTyping] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPage: 1,
    isLoadingMore: false,
  });

  const hasMore = pagination.page < pagination.totalPage;

  const accessToken = getCookie("accessToken");
  const decoded = (accessToken ? jwtDecode(accessToken) : {}) as {
    userId: string;
  };

  const scrollToBottom = (isSmooth: boolean = true) => {
    if (msgEndRef.current) {
      msgEndRef.current.scrollIntoView({
        behavior: isSmooth ? "smooth" : "auto",
        block: "end",
      });
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) {
      setChatInput("");
      return;
    }

    const optimisticMsg: TSupportMessage = {
      _id: `temp-${Date.now()}`,
      ticketId: ticket.ticketId,
      senderId: decoded?.userId,
      senderRole: USER_ROLE.ADMIN,
      message: text.trim(),
      messageType: "TEXT",
      attachments: [],
      readBy: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => {
      const updatedList = [...prev, optimisticMsg];
      return updatedList.length > MESSAGE_LIMIT * pagination.page
        ? updatedList.slice(1)
        : updatedList;
    });

    setTimeout(() => scrollToBottom(true), 50);

    sendMessage({
      ticketId: ticket.ticketId,
      message: text.trim(),
      targetUserObjectId: ticket.userId?._id || "",
      targetUserId: ticket.userId?.userId || "",
      targetUserModel: ticket.userModel,
      messageType: "TEXT",
    });

    if (ticket.status === "OPEN") {
      updateStatus(ticket.ticketId, "IN_PROGRESS");
    }

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

  const { sendMessage, leaveConversation, makeTyping, markRead } =
    useChatSocket({
      ticketId: ticket?.ticketId,
      token: accessToken as string,
      onMessage: (msg) => {
        if (msg.ticketId === ticket?.ticketId) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            const optimisticIndex = prev.findIndex(
              (m) =>
                m._id.startsWith("temp-") &&
                m.message === msg.message &&
                m.senderId === msg.senderId,
            );
            if (optimisticIndex !== -1) {
              const newMessages = [...prev];
              newMessages[optimisticIndex] = msg;
              return newMessages;
            }
            const updatedList = [...prev, msg];
            return updatedList.length > MESSAGE_LIMIT * pagination.page
              ? updatedList.slice(1)
              : updatedList;
          });
        }
      },
      onTyping: (data: TUserTypingPayload) => {
        if (data.userId !== decoded?.userId) {
          setOtherUserTyping(data.isTyping);
        }
      },
      onClosed: () => {},
      onRead: (data) => {
        if (
          data.ticketId === ticket.ticketId &&
          data.userId === ticket.userId.userId
        ) {
          setLastReadAt(data.time);
        }
      },
      onError: (msg) => console.log(msg),
    });

  const handleMessageTyping = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(chatInput);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      setTyping(false);
      makeTyping(false);

      return;
    }

    if (!typing) {
      setTyping(true);
      makeTyping(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      makeTyping(false);
    }, 2000);
  };

  const loadMoreMessages = async () => {
    if (pagination.isLoadingMore || !hasMore) return;

    setPagination((prev) => ({ ...prev, isLoadingMore: true }));

    const container = chatContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;

    const nextPage = pagination.page + 1;
    const result = await getMessagesReq(ticket.ticketId, {
      limit: MESSAGE_LIMIT.toString(),
      page: nextPage.toString(),
    });

    if (result.data.length > 0) {
      setMessages((prev) => [...result.data, ...prev]);
      setPagination({
        page: result.meta?.page || nextPage,
        totalPage: result.meta?.totalPage || 1,
        isLoadingMore: false,
      });

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - previousScrollHeight;
        }
      });
      return;
    }

    setPagination((prev) => ({ ...prev, isLoadingMore: false }));
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    if (container.scrollTop <= 20 && hasMore && !pagination.isLoadingMore) {
      loadMoreMessages();
    }
  };

  const handleMarkRead = () => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    const isLastMsgFromMe = lastMsg.senderId === decoded?.userId;
    if (!isLastMsgFromMe) {
      markRead();
    }
  };

  useEffect(() => {
    if (!!ticket) {
      getMessagesReq(ticket?.ticketId, {
        limit: MESSAGE_LIMIT.toString(),
      }).then((result) => {
        setMessages(result.data);
        setPagination({
          page: result.meta?.page || 1,
          totalPage: result.meta?.totalPage || 1,
          isLoadingMore: false,
        });
      });
    }
  }, [ticket]);

  useEffect(() => {
    if (messages.length > 0) {
      const container = chatContainerRef.current;
      if (!container) return;

      const scrollFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      const isNearBottom = scrollFromBottom <= 150;

      if (isInitialLoad.current) {
        scrollToBottom(false);
        isInitialLoad.current = false;
      } else if (isNearBottom) {
        scrollToBottom(true);
      }

      if (isNearBottom) {
        handleMarkRead();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    if (otherUserTyping) {
      const container = chatContainerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <=
          150;
        if (isNearBottom) {
          scrollToBottom(true);
        }
      }
    }
  }, [otherUserTyping]);

  useEffect(() => {
    return () => {
      leaveConversation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50"
        >
          {pagination.isLoadingMore && (
            <div className="flex justify-center py-2 animate-in fade-in duration-300">
              <Loader2 className="h-6 w-6 animate-spin text-[#DC3173]" />
            </div>
          )}

          {messages.map((msg) => (
            <SupportMessageItem
              key={msg._id}
              msg={msg}
              userInfo={ticket.userId}
              lastReadAt={lastReadAt}
            />
          ))}

          {otherUserTyping && (
            <div className="flex flex-col gap-1 items-center mb-0">
              <span className="text-xs text-gray-500">
                {!ticket.userId?.name?.firstName &&
                  !ticket.userId?.name?.lastName &&
                  ticket.userId?.email?.split("@")?.[0]}
                {ticket.userId?.name?.firstName} {ticket.userId?.name?.lastName}{" "}
                is typing...
              </span>
              <div className="flex justify-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.12s" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.24s" }}
                />
              </div>
            </div>
          )}

          <div ref={msgEndRef} />
        </div>

        {/* Message Input */}
        <SupportChatInput
          onSend={handleSendMessage}
          onTyping={handleMessageTyping}
        />
      </motion.div>
    </>
  );
}
