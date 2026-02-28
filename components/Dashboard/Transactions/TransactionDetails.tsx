"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TTransaction } from "@/types/transaction.type";
import { format } from "date-fns";
import { motion, Variants } from "framer-motion";
import {
  ArrowDownLeftIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  ReceiptIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const transaction: TTransaction = {
  _id: "1",
  transactionId: "T-2402",
  type: "earning",
  description: "Order #DG-9031 Completed",
  amount: "12.90",
  positive: true,
  status: "settled",
  orderId: "DG-9031",
  orderTotal: "15.90",
  platformFee: "3.00",
  netEarning: "12.90",
  customer: "João Silva",
  customerOrders: 8,
  paymentMethod: "Card",
  deliveryAddress: "Rua Augusta 45, Lisboa, 1100-048",
  items: [
    {
      name: "Burger Combo Deluxe",
      qty: 1,
      price: "12.50",
    },
    {
      name: "Cola 33cl",
      qty: 1,
      price: "3.40",
    },
  ],
  relatedTransactions: [
    {
      id: "T-2401",
      desc: "Weekly Payout (SEPA)",
      amount: "84.50",
      date: "2025-11-08",
      positive: true,
    },
    {
      id: "T-2403",
      desc: "Platform Service Fee",
      amount: "2.50",
      date: "2025-11-07",
      positive: false,
    },
  ],
  createdAt: "2025-11-08T09:30:00Z",
  updatedAt: "2025-11-08T09:30:00Z",
};

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

export default function TransactionDetails() {
  const router = useRouter();

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
          onClick={() => router.push("/vendor/transactions")}
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
            <p
              className={`text-lg md:text-2xl font-bold ${transaction.positive ? "text-green-500" : "text-red-500"}`}
            >
              {transaction.positive ? "+" : "-"}€{transaction.amount}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-2">
              <CheckCircle2Icon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium capitalize">
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
                value: `€${transaction.orderTotal}`,
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
                <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold flex-shrink-0">
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
              <p className="font-bold text-gray-900">{transaction.customer}</p>
              <p className="text-sm text-gray-400">
                {transaction.customerOrders} previous orders
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
                <span className="w-6 h-6 bg-[#DC3173]/10 text-[#DC3173] rounded-lg flex items-center justify-center text-xs font-bold">
                  {item.qty}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                €{item.price}
              </span>
            </div>
          ))}
        </div>
        {/* Earnings breakdown */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
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
        </div>
      </motion.div>

      {/* Related Transactions */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
      >
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
          <ReceiptIcon className="w-4 h-4 text-[#DC3173]" />
          Related Transactions
        </h3>
        <div className="space-y-3">
          {transaction.relatedTransactions?.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.4 + i * 0.08,
              }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.positive ? "bg-green-100" : "bg-red-100"}`}
                >
                  {t.positive ? (
                    <ArrowUpRightIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownLeftIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.desc}</p>
                  <p className="text-xs text-gray-400">
                    {t.date} · {t.id}
                  </p>
                </div>
              </div>
              <span
                className={`font-bold text-sm ${t.positive ? "text-green-500" : "text-red-500"}`}
              >
                {t.positive ? "+" : "-"}€{t.amount}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
