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
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { AnimatePresence } from "framer-motion";
import { MessageSquareIcon } from "lucide-react";
import { useState } from "react";

const STATUS: Record<TConversationStatus, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-pink-100 text-pink-700",
  CLOSED: "bg-gray-200 text-gray-700",
};

interface IProps {
  ticketData: { data: TSupportTicket[]; meta?: TMeta };
}
const sortFields = ["newest", "oldest"] as SortOptionKey[];

export default function SupportTickets({ ticketData }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t, sortFields);

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
      const existedTicketIndex = prev?.findIndex(
        (c) => c.ticketId === message?.ticketId,
      );

      if (existedTicketIndex === -1) {
        prev.shift();
        return [newTicket, ...prev];
      }

      prev[existedTicketIndex] = newTicket;

      return prev;
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
        subtitle={t("manage_and_respond_support_requests")}
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
              {t("no_tickets_found")}
            </h3>
            <p className="text-gray-500">
              {t("try_adjusting_your_search_or_filters")}
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
