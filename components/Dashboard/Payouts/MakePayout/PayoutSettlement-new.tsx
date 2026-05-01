"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TPayout } from "@/types/payout.type";
import { formatPrice } from "@/utils/formatPrice";
import { removeUnderscore } from "@/utils/formatter";
import { parsePayoutXml } from "@/utils/parsers/parsePayoutXML";
import { settlePayoutSchema } from "@/validations/payout/settle-payout.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { motion, Variants } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowLeftRightIcon,
  CalendarIcon,
  EuroIcon,
  FileDigitIcon,
  FileIcon,
  HashIcon,
  MessageSquareIcon,
  SendIcon,
  UploadCloudIcon,
  UserIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface IProps {
  payout: TPayout;
}

type TSettlePayoutForm = z.infer<typeof settlePayoutSchema>;

export default function PayoutSettlement({ payout }: IProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<TSettlePayoutForm>({
    resolver: zodResolver(settlePayoutSchema),
    defaultValues: {
      bankReferenceId: "",
      iban: "",
      accountHolderName: "",
      paymentDate: "",
      amount: 0,
      remarks: "",
      transferType: "NORMAL",
    },
  });

  const [file, setFile] = useState<File | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [fileError, setFileError] = useState("");

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const isXml =
        selected.type === "text/xml" ||
        selected.type === "application/xml" ||
        selected.name.endsWith(".xml");

      if (!isXml) {
        setFileError("Please upload a valid XML file");
        return;
      }

      if (selected.size > 5 * 1024 * 1024) {
        setFileError("File must be under 5MB");
        return;
      }

      setFile(selected);
      setFileError("");

      if (fileInputRef.current) fileInputRef.current.value = "";

      const parseResult = await parsePayoutXml(selected);
      if (parseResult.success) {
        form.setValue("bankReferenceId", parseResult.data?.bankReferenceId);
        form.setValue("iban", parseResult.data?.iban);
        form.setValue("accountHolderName", parseResult.data?.accountHolderName);
        form.setValue("paymentDate", parseResult.data?.paymentDate);
        form.setValue("amount", parseResult.data?.amount);
        form.setValue("transferType", parseResult.data?.transferType);

        setFileError("");
        return;
      }

      setFileError("Failed to parse XML file");
      toast.error("Failed to parse XML file");
    }
  };

  const removeFile = () => {
    setFile(null);
    form.setValue("bankReferenceId", "");
    form.setValue("iban", "");
    form.setValue("accountHolderName", "");
    form.setValue("paymentDate", "");
    form.setValue("amount", 0);
    form.setValue("transferType", "NORMAL");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const finalizePayment = async (data: TSettlePayoutForm) => {
    if (!file) {
      setFileError("Payout proof image is required");
      return;
    }

    if (fileError) {
      return;
    }

    setIsSettling(true);
    const toastId = toast.loading("Settling Payout...");

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append(
      "data",
      JSON.stringify({
        ...data,
        payoutId: payout.payoutId,
      }),
    );

    // const result = await catchAsync<null>(async () => {
    //   return (await postData(
    //     `/payouts/finalize-settlement/${payout.payoutId}`,
    //     formData,
    //     {
    //       headers: {
    //         "Content-Type": "multipart/form-data",
    //       },
    //     },
    //   )) as unknown as TResponse<null>;
    // });

    const result = {
      success: true,
      message: "Settled successfully",
    };

    if (result.success) {
      toast.success(result.message || "Payout settled successfully!", {
        id: toastId,
      });
      router.push(
        payout.userModel === "Vendor"
          ? "/admin/vendor-payouts"
          : payout.userModel === "FleetManager"
            ? "/admin/fleet-manager-payouts"
            : "/admin/delivery-partner-payouts",
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
                  : payout.userModel === "FleetManager"
                    ? "/admin/fleet-manager-payouts"
                    : "/admin/delivery-partner-payouts",
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
              <p className="text-black/70">
                {removeUnderscore(payout.paymentMethod)}
              </p>
              <p className="font-medium">
                {format(payout.createdAt, "do MMM yyyy")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(finalizePayment)}
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
          >
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Payout Proof Document <span className="text-red-400">*</span>
                </label>
                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${fileError ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-[#DC3173]/40 hover:bg-[#DC3173]/3"}`}
                  >
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <UploadCloudIcon className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload proof document
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      XML only up to 5MB
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
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xml, application/xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {fileError && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {fileError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Bank Reference ID */}
                <FormField
                  control={form.control}
                  name="bankReferenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Bank Reference ID{" "}
                        <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <HashIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <Input
                            {...field}
                            disabled
                            placeholder="e.g. SEPA-TXN-20251108-001"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border transition-all outline-none font-mono text-sm border-gray-200 bg-gray-50 focus:bg-white focus:border-[#DC3173] focus:ring-2 focus:ring-[#DC3173]/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* IBAN of Destination */}
                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        IBAN <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileDigitIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <Input
                            {...field}
                            disabled
                            placeholder="e.g. DE89 3704 0044 0532 0130 00"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border transition-all outline-none font-mono text-sm border-gray-200 bg-gray-50 focus:bg-white focus:border-[#DC3173] focus:ring-2 focus:ring-[#DC3173]/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Account Holder Name */}
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Account Holder Name{" "}
                        <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <Input
                            {...field}
                            disabled
                            placeholder="e.g. Francisco Silva"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border transition-all outline-none font-mono text-sm border-gray-200 bg-gray-50 focus:bg-white focus:border-[#DC3173] focus:ring-2 focus:ring-[#DC3173]/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Date */}
                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Payment Date <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <Input
                            {...field}
                            disabled
                            type="date"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border transition-all outline-none font-mono text-sm border-gray-200 bg-gray-50 focus:bg-white focus:border-[#DC3173] focus:ring-2 focus:ring-[#DC3173]/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Amount <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <EuroIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <Input
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            disabled
                            type="number"
                            placeholder="e.g. 1000.00"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border transition-all outline-none font-mono text-sm border-gray-200 bg-gray-50 focus:bg-white focus:border-[#DC3173] focus:ring-2 focus:ring-[#DC3173]/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Transfer Type */}
                <FormField
                  control={form.control}
                  name="transferType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Transfer Type <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ArrowLeftRightIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <Input
                            value={removeUnderscore(field.value)}
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled
                            placeholder="e.g. Normal"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border transition-all outline-none font-mono text-sm border-gray-200 bg-gray-50 focus:bg-white focus:border-[#DC3173] focus:ring-2 focus:ring-[#DC3173]/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remarks */}
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Remarks <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MessageSquareIcon className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                          <Textarea
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="Any additional notes about this settlement..."
                            className="w-full h-24 pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#DC3173] focus:ring-2 focus:ring-[#DC3173]/20 outline-none transition-all text-sm resize-none"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <motion.button
                type="submit"
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="flex items-center gap-2 bg-[#DC3173] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#c42a65] transition-colors"
                disabled={isSettling}
              >
                <SendIcon className="w-4 h-4" />
                Submit Settlement
              </motion.button>
            </div>
          </motion.form>
        </Form>
      </motion.div>
    </div>
  );
}
