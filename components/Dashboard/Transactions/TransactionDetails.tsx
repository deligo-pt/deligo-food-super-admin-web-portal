"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/store/store";
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
  GiftIcon,
  InfoIcon,
  PercentCircleIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const typeConfig: Record<
  TTransaction['type'],
  {
    label: string;
    bg: string;
    text: string;
    icon: React.ReactNode;
  }
> = {
  // --- Payments & Earnings (Green) ---
  ORDER_PAYMENT: {
    label: "Order Payment",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    icon: <ArrowUpRightIcon className="w-4 h-4" />,
  },
  VENDOR_EARNING: {
    label: "Vendor Earning",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <ArrowUpRightIcon className="w-4 h-4" />,
  },
  FLEET_EARNING: {
    label: "Fleet Earning",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <ArrowUpRightIcon className="w-4 h-4" />,
  },
  DELIVERY_PARTNER_EARNING: {
    label: "Delivery Partner Earning",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <ArrowUpRightIcon className="w-4 h-4" />,
  },

  // --- Settlements & Payouts (Blue) ---
  VENDOR_SETTLEMENT: {
    label: "Vendor Settlement",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <WalletIcon className="w-4 h-4" />,
  },
  FLEET_SETTLEMENT: {
    label: "Fleet Settlement",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <WalletIcon className="w-4 h-4" />,
  },
  DELIVERY_PARTNER_SETTLEMENT: {
    label: "Delivery Settlement",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <WalletIcon className="w-4 h-4" />,
  },

  // --- Commissions & Charges (Purple/Indigo) ---
  PLATFORM_COMMISSION: {
    label: "Platform Commission",
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: <PercentCircleIcon className="w-4 h-4" />,
  },
  PLATFORM_SERVICE_CHARGE: {
    label: "Service Charge",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    icon: <PercentCircleIcon className="w-4 h-4" />,
  },
  PLATFORM_TAX_COLLECTION: {
    label: "Tax Collection",
    bg: "bg-slate-100",
    text: "text-slate-700",
    icon: <PercentCircleIcon className="w-4 h-4" />,
  },

  // --- Expenses & Purchases (Red/Rose) ---
  INGREDIENT_PURCHASE: {
    label: "Ingredient Purchase",
    bg: "bg-rose-100",
    text: "text-rose-700",
    icon: <ShoppingBagIcon className="w-4 h-4" />,
  },

  // --- Rewards & Bonuses (Amber/Orange) ---
  REFERRAL_BONUS: {
    label: "Referral Bonus",
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: <GiftIcon className="w-4 h-4" />,
  },
};

export default function TransactionDetails({
  transaction,
}: {
  transaction: TTransaction;
}) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const router = useRouter();

  const config = typeConfig[transaction.type];

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

  const isSettlmentTrx = transaction.type === 'VENDOR_SETTLEMENT' || transaction.type === 'FLEET_SETTLEMENT' || transaction.type === 'DELIVERY_PARTNER_SETTLEMENT';

  return (
    <motion.div
      className="min-h-screen space-y-6"
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
          {t("back_to_transactions")}
        </button>
      </motion.div>

      {/* Header */}
      <TitleHeader
        title={t("transactions_details")}
        subtitle={t("full_details_of_the_transaction")}
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
                  {t("id")}: {transaction.transactionId}
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

      {/* settlement details */}
      {isSettlmentTrx && <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
      >
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
          <ShoppingBagIcon className="w-4 h-4 text-[#DC3173]" />
          {t("settlement_details")}
        </h3>
        <div className="space-y-3">
          {[
            {
              label: t("type"),
              value: transaction.type,
            },
            {
              label: t("payment_method"),
              value: transaction.paymentMethod,
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
                className={`text-sm text-gray-900 font-medium text-right`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>}

      {/* Two-column */}
      {!isSettlmentTrx && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Details */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <ShoppingBagIcon className="w-4 h-4 text-[#DC3173]" />
            {t("order_details")}
          </h3>
          <div className="space-y-3">
            {[
              {
                label: t("order_id"),
                value: `#${transaction.orderId}`,
                mono: true,
              },
              {
                label: t("order_total"),
                value: `€${formatPrice(transaction.items?.reduce((acc, item) => acc + item.price * item.qty, 0) || 0)}`,
              },
              {
                label: t("payment_method"),
                value: transaction.paymentMethod,
              },
              {
                label: t("delivery_address"),
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
            {t("customer")}
          </h3>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
            <div className="w-12 h-12 bg-[#DC3173]/10 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-[#DC3173]" />
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {transaction.customer?.name?.firstName || "N/"}{" "}
                {transaction.customer?.name?.lastName || "A"}
              </p>
              <p className="text-sm text-gray-400">
                {transaction.customer?.contactNumber || "-"}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              {
                label: t("payment"),
                value: transaction.paymentMethod,
              },
              {
                label: t("status"),
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
      </div>}

      {/* Items Ordered */}
      {(transaction?.items && transaction?.items?.length > 0) && <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
      >
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-[#DC3173]" />
          {t("items_ordered")}
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
                  {item.name?.[lang]}
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
      </motion.div>}
    </motion.div>
  );
}
