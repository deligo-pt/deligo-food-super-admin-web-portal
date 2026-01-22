"use client";

import { useTranslation } from "@/hooks/use-translation";
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

const RecentOrders = ({ recentOrders }: IProps) => {
  const { t } = useTranslation();

  const STATUS_MAP = {
    PENDING: { label: t("pending"), color: "text-amber-500", icon: ClockIcon },
    ACCEPTED: { label: t("accepted"), color: "text-blue-500", icon: ThumbsUpIcon },
    REJECTED: { label: t("rejected"), color: "text-red-500", icon: XCircleIcon },
    PREPARING: {
      label: t("preparing"),
      color: "text-yellow-500",
      icon: ThumbsUpIcon,
    },
    READY_FOR_PICKUP: {
      label: t("ready_for_pickup"),
      color: "text-green-500",
      icon: ThumbsUpIcon,
    },
    AWAITING_PARTNER: {
      label: t("awaiting_partner"),
      color: "text-teal-500",
      icon: ThumbsUpIcon,
    },
    DISPATCHING: {
      label: t("dispatching"),
      color: "text-cyan-500",
      icon: TruckIcon,
    },
    REASSIGNMENT_NEEDED: {
      label: t("reassignment_needed"),
      color: "text-red-600",
      icon: XCircleIcon,
    },
    ASSIGNED: {
      label: t("assigned"),
      color: "text-indigo-500",
      icon: UserCheckIcon,
    },
    PICKED_UP: {
      label: t("picked_up"),
      color: "text-purple-500",
      icon: PackageCheckIcon,
    },
    ON_THE_WAY: { label: t("on_the_way"), color: "text-sky-500", icon: TruckIcon },
    DELIVERED: {
      label: t("delivered"),
      color: "text-green-500",
      icon: CheckCircle2Icon,
    },
    CANCELED: { label: t("cancelled"), color: "text-gray-500", icon: BanIcon },
  };

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
      <h3 className="text-lg font-semibold mb-4">{t("recent_orders")}</h3>
      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {recentOrders.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">{t("no_recent_orders_found")}</p>
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
          {t("view_all_orders")}
        </Link>
      </div>
    </div>
  );
};
export default RecentOrders;
