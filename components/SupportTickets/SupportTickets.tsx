/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import SingleTicketCard from "@/components/SupportTickets/SingleTicketCard";
import SupportChatSheet from "@/components/SupportTickets/SupportChatSheet";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useAdminChatSocket } from "@/hooks/use-chat-socket";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta, TResponse } from "@/types";
import { TAdminSupportMessage, TConversationStatus } from "@/types/chat.type";
import { TSupportTicket, TTicketStatus } from "@/types/support.type";
import { getCookie } from "@/utils/cookies";
import { fetchData } from "@/utils/requests";
import { AnimatePresence } from "framer-motion";
import { MessageSquareIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS: Record<TConversationStatus, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-pink-100 text-pink-700",
  CLOSED: "bg-gray-200 text-gray-700",
};

interface IProps {
  ticketData: { data: TSupportTicket[]; meta?: TMeta };
}

export default function SupportTickets({ ticketData }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
  ];

  const [ticket, setTicket] = useState<TSupportTicket | null>(null);
  const [tickets, setTickets] = useState<TSupportTicket[]>(
    ticketData?.data || [],
  );

  const accessToken = getCookie("accessToken");

  const updateTicketStatus = (ticketId: string, status: TTicketStatus) => {
    setTickets((prev) => {
      const currentTicketIndex = prev.findIndex((c) => c.ticketId === ticketId);
      if (currentTicketIndex !== -1) {
        prev[currentTicketIndex].status = status;
      }
      return [...prev];
    });

    if (ticket?.ticketId) {
      setTicket((prev) => {
        if (prev?.ticketId === ticketId) {
          return { ...prev, status };
        }
        return prev;
      });
    }
  };

  const getTicket = async (ticketId: string) => {
    try {
      const result = (await fetchData(`/support/tickets`, {
        params: {
          ticketId,
        },
      })) as TResponse<TSupportTicket[]>;

      if (result.success) {
        return {
          success: true,
          data: result.data?.[0] || {},
        };
      }

      return {
        success: false,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
      };
    }
  };

  const getNewTicket = async (message: TAdminSupportMessage) => {
    let newTicket = {} as TSupportTicket;

    const result = await getTicket(message?.ticketId);
    if (result.success) {
      newTicket = result.data as TSupportTicket;
    }

    setTickets((prev) => {
      const isTicketExist = prev?.find((c) => c.ticketId === message?.ticketId);

      if (!isTicketExist) {
        return [newTicket, ...prev];
      }

      const filteredTickets = prev.filter(
        (c) => c.ticketId !== message.ticketId,
      );

      return [newTicket, ...filteredTickets];
    });
  };

  useAdminChatSocket({
    token: accessToken as string,
    onMessage: (msg) => getNewTicket(msg as TAdminSupportMessage),
    onError: (msg) => console.log(msg),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <TitleHeader
        title={t("support_tickets")}
        subtitle="Manage and respond to support requests from all platform users"
      />

      <AllFilters sortOptions={sortOptions} />

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets?.map((ticket, i) => (
          <SingleTicketCard
            key={ticket._id}
            ticket={ticket}
            index={i}
            onClick={(ticket) => setTicket(ticket)}
          />
        ))}
        {ticketData?.meta?.total === 0 && (
          <div className="col-span-full py-12 text-center">
            <div className="inline-flex p-4 bg-white rounded-full text-gray-300 mb-3 shadow-sm">
              <MessageSquareIcon size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No tickets found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {ticket && (
          <SupportChatSheet
            ticket={ticket}
            closeChatSheet={() => setTicket(null)}
            updateStatus={updateTicketStatus}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      {/* {!!ticket && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full sm:w-[420px] h-full bg-white rounded-l-3xl p-6 flex flex-col shadow-xl animate-slide-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold w-10/12 leading-tight">
                {ticket.ticketId}
              </h2>
              <button
                onClick={() => setTicket(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-between gap-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#DC3173]/10 text-[#DC3173] font-semibold flex items-center justify-center text-lg">
                  {ticket?.participants?.[0]?.name?.[0]}
                </div>
                <div>
                  <p className="font-medium">
                    {ticket?.participants?.[0]?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ticket?.participants?.[0]?.role}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button
                  size="sm"
                  variant="ghost"
                  className="border border-gray-200 py-1"
                >
                  Close Ticket
                </Button>
              </div>
            </div>

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
                      : ticket?.participants?.[0]?.name}{" "}
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
      )} */}

      {/* Pagination */}
      {!!ticketData?.meta?.totalPage && (
        <div className="my-4">
          <PaginationComponent
            totalPages={ticketData?.meta?.totalPage as number}
          />
        </div>
      )}
    </div>
  );
}
