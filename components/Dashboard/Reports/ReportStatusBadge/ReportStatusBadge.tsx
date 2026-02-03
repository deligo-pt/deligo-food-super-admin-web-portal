"use client";

import { USER_STATUS } from "@/consts/user.const";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react";

type TUserStatus = keyof typeof USER_STATUS;

interface IProps {
  status: TUserStatus;
}

export default function ReportStatusBadge({ status }: IProps) {
  const config: Record<
    TUserStatus,
    {
      bg: string;
      text: string;
      icon: React.ReactNode;
    }
  > = {
    PENDING: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: <ClockIcon size={12} />,
    },
    SUBMITTED: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: <AlertCircleIcon size={12} />,
    },
    APPROVED: {
      bg: "bg-[#DC3173]/20",
      text: "text-[#DC3173]",
      icon: <CheckCircleIcon size={12} />,
    },
    REJECTED: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <XCircleIcon size={12} />,
    },
    BLOCKED: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: <XCircleIcon size={12} />,
    },
  };
  const { bg, text, icon } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${bg} ${text}`}
    >
      {icon}
      {status}
    </span>
  );
}
