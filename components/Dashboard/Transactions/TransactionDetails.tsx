"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TTransaction } from "@/types/transaction.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import { motion, Variants } from "framer-motion";
import {
  ArrowDownLeftIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  CircleXIcon,
  InfoIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const typeConfig: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    icon: React.ReactNode;
  }
> = {
  earning: {
    label: "Earning",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <ArrowUpRightIcon className="w-4 h-4" />,
  },
  payout: {
    label: "Payout",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <ArrowUpRightIcon className="w-4 h-4" />,
  },
  fee: {
    label: "Fee",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: <ArrowDownLeftIcon className="w-4 h-4" />,
  },
};

export default function TransactionDetails({
  transaction,
}: {
  transaction: TTransaction;
}) {
  const router = useRouter();

  console.log(transaction);

  const config = typeConfig[transaction.type] || typeConfig.earning;

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 18,
      },
    },
  } as Variants;

  return (
    <motion.div
      className="min-h-screen p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Back */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => router.push("/admin/transaction-history")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Transactions
        </button>
      </motion.div>

      {/* Header */}
      <TitleHeader
        title="Transaction Details"
        subtitle="Full details of the transaction"
      />

      {/* Hero */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${transaction.positive ? "bg-green-50" : "bg-red-50"}`}
            >
              {transaction.positive ? (
                <ArrowUpRightIcon className="w-8 h-8 text-green-500" />
              ) : (
                <ArrowDownLeftIcon className="w-8 h-8 text-red-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}
                >
                  {config.label}
                </span>
                <span className="text-gray-400 text-xs font-mono">
                  ID: {transaction.transactionId}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {transaction.description}
              </p>
              <p className="text-gray-400 text-sm mt-0.5">
                {format(transaction.createdAt, "do MMM yyyy, h:mm a")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-lg md:text-2xl font-bold text-[#DC3173]`}>
              €{formatPrice(transaction.amount || 0)}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-2">
              {transaction.status === "PENDING" && (
                <InfoIcon className="w-4 h-4 text-amber-500" />
              )}
              {transaction.status === "SUCCESS" && (
                <CheckCircle2Icon className="w-4 h-4 text-green-500" />
              )}
              {transaction.status === "FAILED" && (
                <CircleXIcon className="w-4 h-4 text-destructive" />
              )}
              <span
                className={`text-sm font-medium capitalize ${transaction.status === "PENDING" ? "text-amber-500" : transaction.status === "SUCCESS" ? "text-green-500" : "text-destructive"}`}
              >
                {transaction.status}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two-column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Details */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <ShoppingBagIcon className="w-4 h-4 text-[#DC3173]" />
            Order Details
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Order ID",
                value: `#${transaction.orderId}`,
                mono: true,
              },
              {
                label: "Order Total",
                value: `€${formatPrice(transaction.items?.reduce((acc, item) => acc + item.price * item.qty, 0) || 0)}`,
              },
              {
                label: "Payment Method",
                value: transaction.paymentMethod,
              },
              {
                label: "Delivery Address",
                value: transaction.deliveryAddress,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0 gap-4"
              >
                <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold shrink-0">
                  {item.label}
                </span>
                <span
                  className={`text-sm text-gray-900 font-medium text-right ${item.mono ? "font-mono" : ""}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Customer Info */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#DC3173]" />
            Customer
          </h3>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
            <div className="w-12 h-12 bg-[#DC3173]/10 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-[#DC3173]" />
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {transaction.customer?.name?.firstName}{" "}
                {transaction.customer?.name?.lastName}
              </p>
              <p className="text-sm text-gray-400">
                {transaction.customer?.contactNumber || "-"}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              {
                label: "Payment",
                value: transaction.paymentMethod,
              },
              {
                label: "Status",
                value: "Verified Customer",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                  {item.label}
                </span>
                <span className="text-sm text-gray-900 font-medium">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Items Ordered */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
      >
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-[#DC3173]" />
          Items Ordered
        </h3>
        <div className="space-y-2 mb-4">
          {transaction.items?.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-[#DC3173]/10 text-[#DC3173] rounded-lg flex items-center justify-center text-xs font-bold">
                  x{item.qty}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                €{formatPrice(item.price || 0)}
              </span>
            </div>
          ))}
        </div>
        {/* Earnings breakdown */}
        {/* <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order Total</span>
            <span className="font-medium text-gray-900">
              €{transaction.orderTotal}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Platform Fee</span>
            <span className="font-medium text-red-500">
              -€{transaction.platformFee}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2 mt-2">
            <span className="text-[#DC3173]">Your Earning</span>
            <span className="text-[#DC3173] text-base">
              +€{transaction.netEarning}
            </span>
          </div>
        </div> */}
      </motion.div>
    </motion.div>
  );
}
