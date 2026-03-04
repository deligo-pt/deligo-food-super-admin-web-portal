"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { rejectPayoutReq } from "@/services/dashboard/payout/payout";
import { TPayout, TVendorPayout } from "@/types/payout.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import { motion, Variants } from "framer-motion";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  MessageSquareIcon,
  WalletIcon,
  XCircleIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  payout: TPayout;
}

export default function RejectPayout({ payout }: IProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

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

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    if (reason.trim().length < 5) {
      setError("Reason must be at least 5 characters");
      return;
    }

    setIsRejecting(true);
    const toastId = toast.loading("Rejecting Payout...");

    const result = await rejectPayoutReq(payout.payoutId, { reason });

    if (result.success) {
      toast.success(result.message || "Payout rejected successfully!", {
        id: toastId,
      });
      router.push(
        payout.userModel === "Vendor"
          ? "/admin/vendor-payouts"
          : "/admin/fleet-manager-payouts",
      );
      setIsRejecting(false);
      return;
    }

    toast.error(result.message || "Payout rejection failed", { id: toastId });
    console.log(result);
    setIsRejecting(false);
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back */}
        <motion.div variants={itemVariants}>
          <button
            onClick={() =>
              router.push(
                payout.userModel === "Vendor"
                  ? "/admin/vendor-payouts"
                  : "/admin/fleet-manager-payouts",
              )
            }
            className="flex items-center gap-2 text-[#DC3173] transition-colors text-sm font-medium hover:underline mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>

        {/* Header */}
        <TitleHeader
          title="Reject Payout"
          subtitle="Provide a reason for rejecting this payout request"
        />

        {/* Payout Summary */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#DC3173]/10 rounded-xl flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-[#DC3173]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  {payout.payoutId}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  €{formatPrice(Number(payout.amount) || 0)}
                </p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-400">{payout.paymentMethod}</p>
              <p className="text-gray-700 font-medium">
                {format(payout.createdAt, "do MMM yyyy")}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                {payout.userModel === "Vendor" ? "Vendor" : "Fleet Manager"}
              </p>
              <p className="text-sm text-gray-900 font-medium mt-0.5">
                {(payout.userId as TVendorPayout["userId"]).name?.firstName +
                  " " +
                  (payout.userId as TVendorPayout["userId"]).name?.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                IBAN
              </p>
              <p className="text-sm text-gray-900 font-mono mt-0.5">
                {(payout.userId as TVendorPayout["userId"])?.bankDetails?.iban}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 my-6"
        >
          <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">
              This action cannot be undone
            </p>
            <p className="text-red-600 text-xs mt-0.5">
              Rejecting this payout will notify the vendor and the amount will
              be returned to their available balance.
            </p>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Reason for Rejection <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MessageSquareIcon className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim().length >= 10) setError("");
                }}
                placeholder="Explain why this payout is being rejected..."
                rows={5}
                className={`w-full pl-10 pr-4 py-3.5 rounded-xl border transition-all outline-none text-sm resize-none ${error ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#DC3173] focus:ring-2 focus:ring-[#DC3173]/20"}`}
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>
            )}
            <p className="text-gray-400 text-xs mt-2">
              {reason.length} characters · Minimum 5 required
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
              disabled={isRejecting}
            >
              <XCircleIcon className="w-4 h-4" />
              Reject Payout
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
