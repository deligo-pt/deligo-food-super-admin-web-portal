"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TResponse } from "@/types";
import { TPayout } from "@/types/payout.type";
import { catchAsync } from "@/utils/catchAsync";
import { formatPrice } from "@/utils/formatPrice";
import { postData } from "@/utils/requests";
import { format } from "date-fns";
import { motion, Variants } from "framer-motion";
import {
  ArrowLeftIcon,
  FileIcon,
  HashIcon,
  ImageIcon,
  MessageSquareIcon,
  SendIcon,
  UploadCloudIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

interface IProps {
  payout: TPayout;
}

export default function PayoutSettlement({ payout }: IProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bankRefId, setBankRefId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [errors, setErrors] = useState<{
    file?: string;
    bankRefId?: string;
  }>({});

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          file: "Please upload an image file",
        }));
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "File must be under 5MB",
        }));
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setErrors((prev) => ({
        ...prev,
        file: undefined,
      }));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    const newErrors: {
      file?: string;
      bankRefId?: string;
    } = {};

    if (!file) newErrors.file = "Payout proof image is required";
    if (!bankRefId.trim())
      newErrors.bankRefId = "Bank Reference ID is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSettling(true);
    const toastId = toast.loading("Settling Payout...");

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append(
      "data",
      JSON.stringify({
        bankReferenceId: bankRefId,
        remarks,
      }),
    );

    const result = await catchAsync<null>(async () => {
      return (await postData(
        `/payouts/finalize-settlement/${payout.payoutId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )) as unknown as TResponse<null>;
    });

    if (result.success) {
      toast.success(result.message || "Payout settled successfully!", {
        id: toastId,
      });
      router.push(
        payout.userModel === "Vendor"
          ? "/admin/vendor-payouts"
          : "/admin/fleet-manager-payouts",
      );
      setIsSettling(false);
      return;
    }

    toast.error(result.message || "Payout settlement failed", {
      id: toastId,
    });
    setIsSettling(false);
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back */}
        <motion.div variants={itemVariants} className="mb-4">
          <button
            onClick={() =>
              router.push(
                payout.userModel === "Vendor"
                  ? "/admin/vendor-payouts"
                  : "/admin/fleet-manager-payouts",
              )
            }
            className="flex items-center gap-2 text-[#DC3173] transition-colors text-sm font-medium hover:underline"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>

        {/* Header */}
        <TitleHeader
          title="Final Settlement"
          subtitle="Submit proof and bank reference to finalize this payout"
        />

        {/* Payout Summary Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white shadow rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#DC3173]/10 rounded-xl flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-[#DC3173]" />
              </div>
              <div>
                <p className="text-black/70 text-xs font-medium">
                  {payout.payoutId}
                </p>
                <p className="text-2xl font-bold">
                  €{formatPrice(Number(payout.amount) || 0)}
                </p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-black/70">{payout.paymentMethod}</p>
              <p className="font-medium">
                {format(payout.createdAt, "do MMM yyyy")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
        >
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Payout Proof Image <span className="text-red-400">*</span>
              </label>
              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${errors.file ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-[#DC3173]/40 hover:bg-[#DC3173]/3"}`}
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <UploadCloudIcon className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload proof image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, JPEG up to 5MB
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl p-4 relative">
                  <button
                    onClick={removeFile}
                    className="absolute top-3 right-3 w-7 h-7 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors"
                  >
                    <XIcon className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </button>
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Proof"
                      className="w-full h-48 object-cover rounded-xl"
                      width={300}
                      height={300}
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-2">
                      <FileIcon className="w-8 h-8 text-[#DC3173]" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3 px-1">
                    <ImageIcon className="w-4 h-4 text-green-500" />
                    <p className="text-xs text-green-600 font-medium">
                      {file.name}
                    </p>
                    <span className="text-xs text-gray-400 ml-auto">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {errors.file && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  {errors.file}
                </p>
              )}
            </div>

            {/* Bank Reference ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Bank Reference ID <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <HashIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bankRefId}
                  onChange={(e) => {
                    setBankRefId(e.target.value);
                    if (e.target.value.trim())
                      setErrors((prev) => ({
                        ...prev,
                        bankRefId: undefined,
                      }));
                  }}
                  placeholder="e.g. SEPA-TXN-20251108-001"
                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl border transition-all outline-none font-mono text-sm ${errors.bankRefId ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#DC3173] focus:ring-2 focus:ring-[#DC3173]/20"}`}
                />
              </div>
              {errors.bankRefId && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  {errors.bankRefId}
                </p>
              )}
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Remarks <span className="text-gray-300">(Optional)</span>
              </label>
              <div className="relative">
                <MessageSquareIcon className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any additional notes about this settlement..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#DC3173] focus:ring-2 focus:ring-[#DC3173]/20 outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-[#DC3173] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#c42a65] transition-colors"
              disabled={isSettling}
            >
              <SendIcon className="w-4 h-4" />
              Submit Settlement
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
