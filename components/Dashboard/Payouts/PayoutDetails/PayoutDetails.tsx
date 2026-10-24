"use client";

import {
  PaymentMethodBadge,
  RecipientCard,
  StatusBadge,
  StatusTimeline,
} from "@/components/Dashboard/Payouts/PayoutDetails/PayoutDetailsComponents";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TPayout } from "@/types/payout.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarMinus,
  CalendarPlus,
  CreditCard,
  ExternalLink,
  ImageIcon,
  Landmark,
  Package,
  Receipt,
  Tag,
  User,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const payoutLinks = {
  VENDOR: "/admin/vendor-payouts",
  FLEET_MANAGER: "/admin/fleet-manager-payouts",
  DELIVERY_PARTNER: "/admin/delivery-partner-payouts",
} as const;

export default function PayoutDetails({ payout }: { payout: TPayout }) {
  const { t } = useTranslation();
  const router = useRouter();

  const userRole = payout.userId?.role as "VENDOR" | "FLEET_MANAGER" | "DELIVERY_PARTNER";
  const settlePath = `${payoutLinks[userRole]}/${payout.payoutId}/settle`;

  return (
    <div className="min-h-screen pb-12">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[#DC3173] hover:underline transition-colors"
        >
          <ArrowLeft size={18} />
          {t("back_to_payouts")}
        </button>
      </div>

      {/* Header */}
      <TitleHeader
        title={t("payout_details")}
        subtitle={t("view_the_details_of_a_payout")}
        extraComponent={
          payout.status === "PENDING" && (
            <Button
              onClick={() => router.push(settlePath)}
              className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white font-semibold px-6"
            >
              <Wallet size={16} className="mr-2" />
              {t("settle_payout")}
            </Button>
          )
        }
      />

      {/* Top Info Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {payout.payoutId}
            </h1>
            <StatusBadge status={payout.status} />
            {payout.payoutCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                <Tag size={12} />
                {payout.payoutCategory}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {t("created")} {format(new Date(payout.createdAt), "do MMM yyyy, HH:mm")} ·{" "}
            {t("last_updated")} {format(new Date(payout.updatedAt), "do MMM yyyy, HH:mm")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ──────────────── LEFT COLUMN ──────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                  {t("payout_amount")}
                </p>
                <p className="text-5xl font-extrabold text-gray-900">
                  €{formatPrice(payout.amount)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <PaymentMethodBadge method={payout.paymentMethod} />
                </div>
              </div>
              <div className="p-6 bg-[#DC3173]/10 rounded-2xl text-[#DC3173]">
                <CreditCard size={48} />
              </div>
            </div>

            {payout.remarks && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t("remarks")}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {payout.remarks}
                </p>
              </div>
            )}
          </motion.div>

          {/* Included Orders */}
          {payout.includedOrders && payout.includedOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {t("included_orders")}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {payout.includedOrders.length} order
                    {payout.includedOrders.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {payout.includedOrders.map((order, idx) => (
                  <div
                    key={order.orderId + idx}
                    className="px-6 py-5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Receipt size={16} className="text-gray-400" />
                        <span className="font-mono font-semibold text-gray-900">
                          {order.orderId}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {format(new Date(order.orderCreatedAt), "do MMM yyyy, HH:mm")}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                          {t("gross")}
                        </p>
                        <p className="font-semibold text-gray-900">
                          €{formatPrice(order.grossEarnings)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                          {t("platform_fee")}
                        </p>
                        <p className="font-semibold text-red-600">
                          -€{formatPrice(order.platformDeduction)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                          {t("tax")}
                        </p>
                        <p className="font-semibold text-gray-700">
                          €{formatPrice(order.taxAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                          {t("sdr_reimb")}
                        </p>
                        <p className="font-semibold text-gray-700">
                          €{formatPrice(order.sdrReimbursement ?? 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                          {t("net_payout")}
                        </p>
                        <p className="font-bold text-[#DC3173]">
                          €{formatPrice(order.netPayout)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bank Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#DC3173]/10 rounded-xl text-[#DC3173]">
                <Landmark size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t("bank_details")}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t("bank_name")}
                </p>
                <p className="font-semibold text-gray-900">
                  {payout.userId?.bankDetails?.bankName || "—"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t("account_holder")}
                </p>
                <p className="font-semibold text-gray-900">
                  {payout.userId?.bankDetails?.accountHolderName || "—"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t("iban")}
                </p>
                <p className="font-mono font-semibold text-gray-900 tracking-wider break-all">
                  {payout.userId?.bankDetails?.iban || "—"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t("swift_code")}
                </p>
                <p className="font-mono font-semibold text-gray-900">
                  {payout.userId?.bankDetails?.swiftCode || "—"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl sm:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t("bank_reference_id")}
                </p>
                <p className="font-mono font-semibold text-gray-900">
                  {payout.bankReferenceId || "—"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payout Proof */}
          {payout.payoutProof && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-xl text-green-600">
                    <ImageIcon size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {t("payout_proof")}
                  </h2>
                </div>
                <a
                  href={payout.payoutProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#DC3173] font-medium hover:underline"
                >
                  <ExternalLink size={14} />
                  {t("open_full_size")}
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <Image
                  src={payout.payoutProof}
                  alt="Payout proof"
                  className="w-full object-cover max-h-80"
                  width={800}
                  height={400}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* ──────────────── RIGHT COLUMN ──────────────── */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatusTimeline status={payout.status} />
          </motion.div>

          {/* Recipient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <RecipientCard payout={payout} />
          </motion.div>

          {/* Extra Recipient Details (NIF + Role) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gray-100 rounded-xl text-gray-600">
                <User size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t("recipient_details")}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("user_id")}
                </p>
                <p className="font-mono text-sm font-medium text-gray-900 mt-0.5">
                  {payout.userId?.userId || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  NIF
                </p>
                <p className="font-mono text-sm font-medium text-gray-900 mt-0.5">
                  {payout.userId?.NIF || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("role")}
                </p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {payout.userId?.role || payout.userModel || "—"}
                </p>
              </div>
              {payout.senderId && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t("initiated_by")}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {payout.senderId?.name?.firstName} {payout.senderId?.name?.lastName}
                    <span className="text-gray-500 ml-1">
                      ({payout.senderId?.role || payout.senderModel})
                    </span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Timestamps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t("timestamps")}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                  <CalendarPlus size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t("start_date")}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {payout.startDate
                      ? format(new Date(payout.startDate), "do MMM yyyy, HH:mm")
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                  <CalendarMinus size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t("end_date")}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {payout.endDate
                      ? format(new Date(payout.endDate), "do MMM yyyy, HH:mm")
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                  <CalendarCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t("payment_date")}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {payout.paymentDate
                      ? format(new Date(payout.paymentDate), "do MMM yyyy, HH:mm")
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Date Range (if present) */}
              {payout.dateRange?.from && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    {t("date_range")}
                  </p>
                  <p className="text-sm text-gray-700">
                    {format(new Date(payout.dateRange.from), "do MMM yyyy")}
                    {payout.dateRange.to &&
                      payout.dateRange.to !== payout.dateRange.from && (
                        <> → {format(new Date(payout.dateRange.to), "do MMM yyyy")}</>
                      )}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}