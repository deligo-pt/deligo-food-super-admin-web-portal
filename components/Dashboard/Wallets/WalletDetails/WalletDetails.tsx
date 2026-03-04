"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Button } from "@/components/ui/button";
import { TWalletDetails } from "@/types/wallet.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import {
  ArrowLeft,
  BikeIcon,
  CheckCircle2,
  History,
  StoreIcon,
  UserIcon,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  wallet: TWalletDetails;
}

export default function WalletDetails({ wallet }: IProps) {
  const brandColor = "#DC3173";
  const router = useRouter();

  return (
    <div className="min-h-screen p-6">
      {/* Back Button */}
      <div className="mb-4">
        <span
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[#DC3173] hover:underline mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to Wallets
        </span>
      </div>

      {/* Header */}
      <TitleHeader
        title="Wallet Details"
        subtitle="View the details of a wallet"
      />

      <div className="md:flex justify-between gap-6 mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{wallet.walletId}</h1>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Active Wallet
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
              {wallet.userModel}
            </span>
          </div>
          <p className="text-gray-500 mt-2 text-sm">
            Created: {format(wallet.createdAt, "do MMM yyyy, hh:mm a")}
          </p>
        </div>

        <div>
          <Button className="bg-[#DC3173] hover:bg-[#DC3173]/90">
            Make Payout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Financials Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Overview Card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Total Earnings
                </p>
                <h2
                  className="text-5xl font-black tracking-tight"
                  style={{ color: brandColor }}
                >
                  €{formatPrice(wallet.totalEarnings || 0)}
                </h2>
                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold text-white uppercase rounded bg-[#DC3173]">
                  Lifetime Revenue
                </span>
              </div>
              <div className="p-4 rounded-xl bg-pink-50">
                <Wallet className="w-8 h-8" style={{ color: brandColor }} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Unpaid Earnings
                </p>
                <p className="text-xl font-bold text-gray-800">
                  €{formatPrice(wallet.totalUnpaidEarnings || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Rider Payable
                </p>
                <p className="text-xl font-bold text-gray-800">
                  €{formatPrice(wallet.totalRiderPayable || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Fleet Earnings
                </p>
                <p className="text-xl font-bold text-gray-800">
                  €{formatPrice(wallet.totalFleetEarnings || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Columns */}
        <div className="space-y-6">
          {/* Account Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-50 flex items-center gap-2">
              <div className="p-1.5 bg-pink-50 rounded-md">
                {wallet.userModel === "Vendor" && (
                  <StoreIcon
                    className="w-4 h-4"
                    style={{ color: brandColor }}
                  />
                )}
                {wallet.userModel === "FleetManager" && (
                  <UserIcon className="w-4 h-4" style={{ color: brandColor }} />
                )}
                {wallet.userModel === "DeliveryPartner" && (
                  <BikeIcon className="w-4 h-4" style={{ color: brandColor }} />
                )}
                {wallet.userModel === "Customer" && (
                  <UserIcon className="w-4 h-4" style={{ color: brandColor }} />
                )}
              </div>
              <h3 className="font-bold text-gray-800">
                {wallet.userModel === "Vendor" && "Vendor"}{" "}
                {wallet.userModel === "FleetManager" && "Fleet Manager"}{" "}
                {wallet.userModel === "DeliveryPartner" && "Delivery Partner"}{" "}
                {wallet.userModel === "Customer" && "Customer"} Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Full Name
                </label>
                <p className="text-sm font-semibold">
                  {wallet.userId?.name?.firstName}{" "}
                  {wallet.userId?.name?.lastName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block">
                  Email
                </label>
                <p className="text-sm font-medium">{wallet.userId?.email}</p>
              </div>
            </div>
          </div>

          {/* Settlement Status Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center justify-between">
              Settlement Status
              <History className="w-4 h-4 text-gray-400" />
            </h3>

            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100"></div>

              <div className="space-y-8 relative">
                <div className="flex gap-4">
                  <div
                    className="z-10 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: brandColor }}
                  >
                    <CheckCircle2
                      className="w-4 h-4"
                      style={{ color: brandColor }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Last Settlement</p>
                    <p className="text-xs text-gray-500">
                      {wallet.lastSettlementDate
                        ? format(wallet.lastSettlementDate, "do MMM yyyy")
                        : "No settlements yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
