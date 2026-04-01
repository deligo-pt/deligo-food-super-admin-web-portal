"use client";

import {
  TSupportTicket,
  TTicketStatus,
  TUserModel,
} from "@/types/support.type";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  BikeIcon,
  BriefcaseIcon,
  ClockIcon,
  ShieldUserIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react";

const StatusBadge = ({ status }: { status: TTicketStatus }) => {
  const styles = {
    OPEN: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    CLOSED: "bg-[#DC3173]/10 text-[#DC3173]",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const RoleBadge = ({ role }: { role: TUserModel }) => {
  const styles = {
    Vendor: "bg-purple-100 text-purple-700",
    DeliveryPartner: "bg-blue-100 text-blue-700",
    FleetManager: "bg-emerald-100 text-emerald-700",
    Customer: "bg-amber-100 text-amber-700",
    Admin: "bg-gray-100 text-gray-700",
  };

  const icons = {
    Vendor: <StoreIcon size={12} />,
    DeliveryPartner: <BikeIcon size={12} />,
    FleetManager: <BriefcaseIcon size={12} />,
    Customer: <UserIcon size={12} />,
    Admin: <ShieldUserIcon size={12} />,
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${styles[role] ?? "bg-gray-100 text-gray-600"}`}
    >
      {icons[role] ?? null}
      {role}
    </span>
  );
};

export default function SingleTicketCard({
  ticket,
  index,
  onClick,
}: {
  ticket: TSupportTicket;
  index: number;
  onClick: (ticket: TSupportTicket) => void;
}) {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      transition={{
        delay: index * 0.05,
      }}
      onClick={() => onClick(ticket)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-[#DC3173]/30 transition-all group flex flex-col relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-[#DC3173]" />

      <div className="flex items-start justify-between mb-3">
        <RoleBadge role={ticket.userModel} />
        <StatusBadge status={ticket.status} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
          {ticket.userId?.name?.firstName?.charAt(0)}
          {ticket.userId?.name?.lastName?.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 truncate">
            {ticket.userId?.name?.firstName}
            {""}
            {ticket.userId?.name?.lastName}
            {!ticket.userId?.name?.firstName &&
              !ticket.userId?.name?.lastName &&
              ticket.userId?.email?.split("@")?.[0]}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {ticket.userId?.email}
          </p>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-mono font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
          {ticket.ticketId}
        </span>
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#DC3173] transition-colors">
        {ticket.category}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
        {ticket.lastMessage || "-"}
      </p>

      <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <ClockIcon size={12} />
          {formatDistanceToNow(ticket.lastMessageTime as string, {
            addSuffix: true,
          })}
        </span>
        <div>
          <ArrowRightIcon
            size={14}
            className="text-gray-400 group-hover:text-[#DC3173] transition-colors"
          />
        </div>
      </div>
    </motion.div>
  );
}
