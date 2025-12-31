"use client";

import { TRecentOrder } from "@/types/analytics.type";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  BanIcon,
  CheckCircle2Icon,
  ClockIcon,
  PackageCheckIcon,
  ThumbsUpIcon,
  TruckIcon,
  UserCheckIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";

interface IProps {
  recentOrders: TRecentOrder[];
}

const STATUS_MAP = {
  PENDING: { label: "Pending", color: "text-amber-500", icon: ClockIcon },
  ACCEPTED: { label: "Accepted", color: "text-blue-500", icon: ThumbsUpIcon },
  REJECTED: { label: "Rejected", color: "text-red-500", icon: XCircleIcon },
  PREPARING: {
    label: "Preparing",
    color: "text-yellow-500",
    icon: ThumbsUpIcon,
  },
  READY_FOR_PICKUP: {
    label: "Ready For Pickup",
    color: "text-green-500",
    icon: ThumbsUpIcon,
  },
  AWAITING_PARTNER: {
    label: "Awaiting Partner",
    color: "text-teal-500",
    icon: ThumbsUpIcon,
  },
  DISPATCHING: {
    label: "Dispatching",
    color: "text-cyan-500",
    icon: TruckIcon,
  },
  REASSIGNMENT_NEEDED: {
    label: "Reassignment Needed",
    color: "text-red-600",
    icon: XCircleIcon,
  },
  ASSIGNED: {
    label: "Assigned",
    color: "text-indigo-500",
    icon: UserCheckIcon,
  },
  PICKED_UP: {
    label: "Picked Up",
    color: "text-purple-500",
    icon: PackageCheckIcon,
  },
  ON_THE_WAY: { label: "On The Way", color: "text-sky-500", icon: TruckIcon },
  DELIVERED: {
    label: "Delivered",
    color: "text-green-500",
    icon: CheckCircle2Icon,
  },
  CANCELED: { label: "Canceled", color: "text-gray-500", icon: BanIcon },
};

const RecentOrders = ({ recentOrders }: IProps) => {
  const container = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    show: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100 h-full">
      <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {recentOrders.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No recent orders found</p>
          </div>
        )}
        {recentOrders.map((order, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            variants={item}
          >
            <div>
              <p className="font-medium text-sm">{order.orderId}</p>
              <p className="text-xs text-gray-500">
                {order.customerId?.name?.firstName}{" "}
                {order.customerId?.name?.lastName}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center">
                {(() => {
                  const statusConfig =
                    STATUS_MAP[order.orderStatus] || STATUS_MAP.PENDING;
                  const Icon = statusConfig.icon;

                  return (
                    <span
                      className={`flex items-center text-xs font-medium ${statusConfig.color}`}
                    >
                      <Icon size={14} className="mr-1" />
                      {statusConfig.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <div className="text-center mt-4">
        <Link
          href="/admin/all-orders"
          className="w-full text-[#DC3173] text-sm font-medium hover:underline"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
};
export default RecentOrders;
