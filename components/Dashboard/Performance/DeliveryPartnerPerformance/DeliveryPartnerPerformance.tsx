"use client";

import CustomizedCharts from "@/components/common/CustomizedChart/CustomizedChart";
import DeliveryPartnerPerformanceTable from "@/components/Dashboard/Performance/DeliveryPartnerPerformance/DeliveryPartnerPerformanceTable";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TMeta } from "@/types";
import { TPartnerPerformanceData } from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { Award, EuroIcon, Star, TrendingUp } from "lucide-react";

interface IProps {
  partnerPerformanceData: { data: TPartnerPerformanceData; meta?: TMeta };
}

export default function DeliveryPartnerPerformance({
  partnerPerformanceData,
}: IProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <TitleHeader
        title="Delivery Partner Performance Analytics"
        subtitle="Comprehensive insights into delivery partner performance"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            delay: 0.6,
          }}
          className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#DC3173]/20 text-[#DC3173] rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="font-medium">Most Orders</span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    partnerPerformanceData?.data?.topCards?.mostOrders
                      ?.partnerPhoto
                  }
                  alt={`${
                    partnerPerformanceData?.data?.topCards?.mostOrders
                      ?.partnerName?.firstName
                  } ${
                    partnerPerformanceData?.data?.topCards?.mostOrders
                      ?.partnerName?.lastName
                  }`}
                />
                <AvatarFallback>
                  {partnerPerformanceData?.data?.topCards?.mostOrders?.partnerName?.firstName?.charAt(
                    0,
                  )}
                  {partnerPerformanceData?.data?.topCards?.mostOrders?.partnerName?.lastName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-semibold">
                {
                  partnerPerformanceData?.data?.topCards?.mostOrders
                    ?.partnerName?.firstName
                }{" "}
                {
                  partnerPerformanceData?.data?.topCards?.mostOrders
                    ?.partnerName?.lastName
                }
              </p>
              <p className="text-[#DC3173] text-sm">
                {partnerPerformanceData?.data?.topCards?.mostOrders?.ordersCount?.toLocaleString() ||
                  0}{" "}
                orders this month
              </p>
            </div>
          </div>
        </motion.div>
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
            delay: 0.5,
          }}
          className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#DC3173]/20 text-[#DC3173] rounded-lg">
              <Star size={20} />
            </div>
            <span className="font-medium">Highest Rated</span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    partnerPerformanceData?.data?.topCards?.highestRated
                      ?.partnerPhoto
                  }
                  alt={`${
                    partnerPerformanceData?.data?.topCards?.highestRated
                      ?.partnerName?.firstName
                  } ${
                    partnerPerformanceData?.data?.topCards?.highestRated
                      ?.partnerName?.lastName
                  }`}
                />
                <AvatarFallback>
                  {partnerPerformanceData?.data?.topCards?.highestRated?.partnerName?.firstName?.charAt(
                    0,
                  )}
                  {partnerPerformanceData?.data?.topCards?.highestRated?.partnerName?.lastName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-bold">
                {
                  partnerPerformanceData?.data?.topCards?.highestRated
                    ?.partnerName?.firstName
                }{" "}
                {
                  partnerPerformanceData?.data?.topCards?.highestRated
                    ?.partnerName?.lastName
                }
              </p>
              <p className="text-[#DC3173] text-sm">
                {partnerPerformanceData?.data?.topCards?.highestRated?.rating
                  ?.average || 0}{" "}
                stars (
                {partnerPerformanceData?.data?.topCards?.highestRated?.rating
                  ?.totalRatings || 0}{" "}
                reviews)
              </p>
            </div>
          </div>
        </motion.div>
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
            delay: 0.4,
          }}
          className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#DC3173]/20 text-[#DC3173] rounded-lg">
              <EuroIcon size={20} />
            </div>
            <span className="font-medium">Highest Earnings</span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    partnerPerformanceData?.data?.topCards?.highestEarnings
                      ?.partnerPhoto
                  }
                  alt={`${
                    partnerPerformanceData?.data?.topCards?.highestEarnings
                      ?.partnerName?.firstName
                  } ${
                    partnerPerformanceData?.data?.topCards?.highestEarnings
                      ?.partnerName?.lastName
                  }`}
                />
                <AvatarFallback>
                  {partnerPerformanceData?.data?.topCards?.highestEarnings?.partnerName?.firstName?.charAt(
                    0,
                  )}
                  {partnerPerformanceData?.data?.topCards?.highestEarnings?.partnerName?.lastName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-bold">
                {
                  partnerPerformanceData?.data?.topCards?.highestEarnings
                    ?.partnerName?.firstName
                }{" "}
                {
                  partnerPerformanceData?.data?.topCards?.highestEarnings
                    ?.partnerName?.lastName
                }
              </p>
              <p className="text-[#DC3173] text-sm">
                €
                {formatPrice(
                  partnerPerformanceData?.data?.topCards?.highestEarnings
                    ?.earnings || 0,
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <CustomizedCharts
            title="Orders Performance"
            description="Monthly performance over the last 6 months"
            data={partnerPerformanceData?.data?.earningsPerformance || []}
            xLabel="Month"
            xKey="month"
            yLabel="No of Orders"
            yKey="totalOrders"
            delay={0.2}
            isBGNeed={false}
          />
        </div>

        {/* Top Performers */}
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
            delay: 0.3,
          }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-[#DC3173]" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
          </div>
          <div className="space-y-4">
            {partnerPerformanceData?.data?.topPerformers?.map((dp, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-yellow-100 text-yellow-700" : index === 1 ? "bg-gray-200 text-gray-600" : "bg-amber-100 text-amber-700"}`}
                >
                  {index + 1}
                </div>
                <div>
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={dp.profilePhoto}
                      alt={`${dp?.name?.firstName} ${dp?.name?.lastName}`}
                    />
                    <AvatarFallback>{dp?.initials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {dp?.name?.firstName} {dp?.name?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    €{formatPrice(dp?.totalEarnings || 0)} earnings
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="font-medium">{dp.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* partner Performance Table */}
      <DeliveryPartnerPerformanceTable
        partners={partnerPerformanceData?.data?.partnerPerformance}
      />

      {/* Pagination */}
      {!!partnerPerformanceData?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={partnerPerformanceData?.meta?.totalPage as number}
          />
        </motion.div>
      )}
    </div>
  );
}
