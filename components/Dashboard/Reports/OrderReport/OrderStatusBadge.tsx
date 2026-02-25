"use client";

import { ORDER_STATUS } from "@/consts/order.const";
import {
    AlertCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    TruckIcon,
    PackageIcon,
    RefreshCcwIcon,
    XCircleIcon,
} from "lucide-react";

type TOrderStatus = keyof typeof ORDER_STATUS;

interface IProps {
    status: TOrderStatus;
}

export default function OrderStatusBadge({ status }: IProps) {
    const config: Record<
        TOrderStatus,
        {
            bg: string;
            text: string;
            icon: React.ReactNode;
            label: string;
        }
    > = {
        /* ===== INITIAL ===== */
        PENDING: {
            bg: "bg-amber-100",
            text: "text-amber-700",
            icon: <ClockIcon size={12} />,
            label: "Pending",
        },

        ACCEPTED: {
            bg: "bg-blue-100",
            text: "text-blue-700",
            icon: <CheckCircleIcon size={12} />,
            label: "Accepted",
        },

        REJECTED: {
            bg: "bg-red-100",
            text: "text-red-700",
            icon: <XCircleIcon size={12} />,
            label: "Rejected",
        },

        /* ===== PREPARATION ===== */
        PREPARING: {
            bg: "bg-indigo-100",
            text: "text-indigo-700",
            icon: <PackageIcon size={12} />,
            label: "Preparing",
        },

        READY_FOR_PICKUP: {
            bg: "bg-purple-100",
            text: "text-purple-700",
            icon: <PackageIcon size={12} />,
            label: "Ready for Pickup",
        },

        /* ===== DELIVERY ASSIGNMENT ===== */
        AWAITING_PARTNER: {
            bg: "bg-yellow-100",
            text: "text-yellow-700",
            icon: <ClockIcon size={12} />,
            label: "Awaiting Partner",
        },

        DISPATCHING: {
            bg: "bg-cyan-100",
            text: "text-cyan-700",
            icon: <RefreshCcwIcon size={12} />,
            label: "Dispatching",
        },

        ASSIGNED: {
            bg: "bg-sky-100",
            text: "text-sky-700",
            icon: <TruckIcon size={12} />,
            label: "Assigned",
        },

        REASSIGNMENT_NEEDED: {
            bg: "bg-orange-100",
            text: "text-orange-700",
            icon: <AlertCircleIcon size={12} />,
            label: "Reassignment Needed",
        },

        /* ===== IN TRANSIT ===== */
        PICKED_UP: {
            bg: "bg-teal-100",
            text: "text-teal-700",
            icon: <TruckIcon size={12} />,
            label: "Picked Up",
        },

        ON_THE_WAY: {
            bg: "bg-blue-200",
            text: "text-blue-800",
            icon: <TruckIcon size={12} />,
            label: "On the Way",
        },

        /* ===== FINAL ===== */
        DELIVERED: {
            bg: "bg-green-100",
            text: "text-green-700",
            icon: <CheckCircleIcon size={12} />,
            label: "Delivered",
        },

        CANCELED: {
            bg: "bg-gray-200",
            text: "text-gray-700",
            icon: <XCircleIcon size={12} />,
            label: "Canceled",
        },
    };

    const { bg, text, icon, label } = config[status];

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}
        >
            {icon}
            {label}
        </span>
    );
}