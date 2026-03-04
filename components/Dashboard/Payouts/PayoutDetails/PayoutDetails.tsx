"use client";

import {
  PaymentMethodBadge,
  RecipientCard,
  StatusBadge,
  StatusTimeline,
} from "@/components/Dashboard/Payouts/PayoutDetails/PayoutDetailsComponents";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TPayout } from "@/types/payout.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  ExternalLink,
  Hash,
  ImageIcon,
  Landmark,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PayoutDetails({ payout }: { payout: TPayout }) {
  const router = useRouter();

  return (
    <div className="min-h-screen p-6">
      {/* Back Button */}
      <div className="mb-4">
        <span
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[#DC3173] hover:underline mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Payouts
        </span>
      </div>

      {/* Header */}
      <TitleHeader
        title="Payout Details"
        subtitle="View the details of a payout"
      />

      {/* Payout Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {payout.payoutId}
            </h1>
            <StatusBadge status={payout.status} />
            <PaymentMethodBadge method={payout.paymentMethod} />
          </div>
          <p className="text-gray-500">
            Created {format(payout.createdAt, "do MMM yyyy")} · Last updated{" "}
            {format(payout.updatedAt, "do MMM yyyy")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Card */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Payout Amount
                </p>
                <p className="text-5xl font-extrabold text-gray-900">
                  €{payout.amount}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DC3173]/10 text-[#DC3173]">
                    {payout.payoutCategory}
                  </span>
                </div>
              </div>
              <div className="p-6 bg-[#DC3173]/10 rounded-2xl text-[#DC3173]">
                <CreditCard size={48} />
              </div>
            </div>

            {payout.remarks && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Remarks
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {payout.remarks}
                </p>
              </div>
            )}
          </motion.div>

          {/* Bank Details Card */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#DC3173]/10 rounded-xl text-[#DC3173]">
                <Landmark size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Bank Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Account Holder
                </p>
                <p className="font-semibold text-gray-900">
                  {payout.bankDetails.accountHolderName}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Bank Name
                </p>
                <p className="font-semibold text-gray-900">
                  {payout.bankDetails.bankName}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl sm:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  IBAN
                </p>
                <p className="font-mono font-semibold text-gray-900 tracking-wider">
                  {payout.bankDetails.iban}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  SWIFT / BIC
                </p>
                <p className="font-mono font-semibold text-gray-900">
                  {payout.bankDetails.swiftCode}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Bank Reference ID
                </p>
                <p className="font-mono font-semibold text-gray-900">
                  {payout.bankReferenceId || "—"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payout Proof Card */}
          {payout.payoutProof && (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-xl text-green-600">
                    <ImageIcon size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Payout Proof
                  </h2>
                </div>
                <a
                  href={payout.payoutProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#DC3173] font-medium hover:underline"
                >
                  <ExternalLink size={14} />
                  Open Full Size
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <Image
                  src={payout.payoutProof}
                  alt="Payout proof"
                  className="w-full object-cover max-h-72"
                  width={300}
                  height={300}
                />
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          {/* Status Timeline */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
          >
            <StatusTimeline status={payout.status} />
          </motion.div>

          {/* Recipient Info */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
            }}
          >
            <RecipientCard payout={payout} />
          </motion.div>

          {/* Timestamps */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.35,
            }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Timestamps</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created At
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {format(payout.createdAt, "do MMM yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Updated
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {format(payout.updatedAt, "do MMM yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                  <Hash size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Internal ID
                  </p>
                  <p className="text-sm font-mono text-gray-700 mt-0.5 break-all">
                    {payout._id}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
