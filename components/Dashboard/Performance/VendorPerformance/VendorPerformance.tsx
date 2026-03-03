"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import VendorPerformanceTable from "@/components/Dashboard/Performance/VendorPerformance/VendorPerformanceTable";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TMeta } from "@/types";
import { TVendorPerformanceData } from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { Award, EuroIcon, Star, TrendingUp } from "lucide-react";

interface IProps {
  vendorPerformanceData: { data: TVendorPerformanceData; meta?: TMeta };
}

export function VendorPerformance({ vendorPerformanceData }: IProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header */}
      <TitleHeader
        title="Vendor Performance Analytics"
        subtitle="Comprehensive insights into restaurant performance and trends"
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
                    vendorPerformanceData.data?.vendorPerformanceStat
                      ?.mostOrders?.vendorPhoto
                  }
                  alt="Vendor Photo"
                />
                <AvatarFallback>
                  {vendorPerformanceData.data?.vendorPerformanceStat?.mostOrders?.vendorName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-semibold">
                {
                  vendorPerformanceData.data?.vendorPerformanceStat?.mostOrders
                    ?.vendorName
                }
              </p>
              <p className="text-[#DC3173] text-sm">
                {vendorPerformanceData.data?.vendorPerformanceStat?.mostOrders?.ordersCount?.toLocaleString()}{" "}
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
                    vendorPerformanceData.data?.vendorPerformanceStat
                      ?.highestRating?.vendorPhoto
                  }
                  alt={
                    vendorPerformanceData.data?.vendorPerformanceStat
                      ?.highestRating?.vendorName
                  }
                />
                <AvatarFallback>
                  {vendorPerformanceData.data?.vendorPerformanceStat?.highestRating?.vendorPhoto?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-bold">
                {
                  vendorPerformanceData.data?.vendorPerformanceStat
                    ?.highestRating?.vendorName
                }
              </p>
              <p className="text-[#DC3173] text-sm">
                {vendorPerformanceData.data?.vendorPerformanceStat
                  ?.highestRating?.rating?.average || 0}{" "}
                stars (
                {vendorPerformanceData.data?.vendorPerformanceStat
                  ?.highestRating?.rating?.totalReviews || 0}{" "}
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
            <span className="font-medium">Highest Revenue</span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    vendorPerformanceData.data?.vendorPerformanceStat
                      ?.highestRevenue?.vendorPhoto
                  }
                  alt={
                    vendorPerformanceData.data?.vendorPerformanceStat
                      ?.highestRevenue?.vendorName
                  }
                />
                <AvatarFallback>
                  {vendorPerformanceData.data?.vendorPerformanceStat?.highestRevenue?.vendorName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-bold">
                {
                  vendorPerformanceData.data?.vendorPerformanceStat
                    ?.highestRevenue?.vendorName
                }
              </p>
              <p className="text-[#DC3173] text-sm">
                €
                {formatPrice(
                  vendorPerformanceData.data?.vendorPerformanceStat
                    ?.highestRevenue?.revenue || 0,
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Orders & Revenue Trend
              </h3>
              <p className="text-sm text-gray-500">
                Daily performance over the past months
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#DC3173]" />
                <span className="text-gray-600">Orders</span>
              </div>
            </div>
          </div>
          <AnalyticsChart
            data={vendorPerformanceData.data?.vendorMonthlyPerformance}
            type="bar"
            dataKey="totalOrders"
            xKey="month"
            height={250}
          />
        </motion.div>

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
            {vendorPerformanceData.data?.topVendorPerformers
              ?.sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .map((vendor, index) => (
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
                        src={vendor.vendorPhoto}
                        alt={vendor.vendorName}
                      />
                      <AvatarFallback>
                        {vendor.vendorName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {vendor.vendorName}
                    </p>
                    <p className="text-xs text-gray-500">
                      €{formatPrice(vendor.totalRevenue || 0)} revenue
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium">{vendor.rating}</span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Vendor Performance Table */}
      <VendorPerformanceTable
        vendors={vendorPerformanceData.data?.vendorPerformance}
      />

      {/* Pagination */}
      {!!vendorPerformanceData?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={vendorPerformanceData.meta?.totalPage || 0}
          />
        </motion.div>
      )}
    </div>
  );
}
