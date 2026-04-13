"use client";

import CustomizedCharts from "@/components/common/CustomizedChart/CustomizedChart";
import FleetManagerPerformanceTable from "@/components/Dashboard/Performance/FleetManagerPerformance/FleetManagerPerformanceTable";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TMeta } from "@/types";
import { TFleetPerformanceData } from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { Award, EuroIcon, Star, TrendingUp } from "lucide-react";

interface IProps {
  fleetPerformanceData: { data: TFleetPerformanceData; meta?: TMeta };
}

export default function FleetManagerPerformance({
  fleetPerformanceData,
}: IProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <TitleHeader
        title="Fleet Manager Performance Analytics"
        subtitle="Comprehensive insights into fleet manager performance"
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
                    fleetPerformanceData?.data?.fleetPerformanceStat?.mostOrders
                      ?.fleetPhoto
                  }
                  alt={`${fleetPerformanceData?.data?.fleetPerformanceStat?.mostOrders?.fleetName?.firstName} ${fleetPerformanceData?.data?.fleetPerformanceStat?.mostOrders?.fleetName?.lastName}`}
                />
                <AvatarFallback>
                  {fleetPerformanceData?.data?.fleetPerformanceStat?.mostOrders?.fleetName?.firstName?.charAt(
                    0,
                  )}
                  {fleetPerformanceData?.data?.fleetPerformanceStat?.mostOrders?.fleetName?.lastName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-semibold">
                {
                  fleetPerformanceData?.data?.fleetPerformanceStat?.mostOrders
                    ?.fleetName?.firstName
                }{" "}
                {
                  fleetPerformanceData?.data?.fleetPerformanceStat?.mostOrders
                    ?.fleetName?.lastName
                }
                {!fleetPerformanceData?.data?.fleetPerformanceStat?.mostOrders
                  ?.fleetName?.firstName &&
                  !fleetPerformanceData?.data?.fleetPerformanceStat?.mostOrders
                    ?.fleetName?.lastName &&
                  "N/A"}
              </p>
              <p className="text-[#DC3173] text-sm">
                {fleetPerformanceData?.data?.fleetPerformanceStat?.mostOrders?.ordersCount?.toLocaleString() ||
                  0}{" "}
                orders
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
                    fleetPerformanceData?.data?.fleetPerformanceStat
                      ?.highestRating?.fleetPhoto
                  }
                  alt={`${fleetPerformanceData?.data?.fleetPerformanceStat?.highestRating?.fleetName?.firstName} ${fleetPerformanceData?.data?.fleetPerformanceStat?.highestRating?.fleetName?.lastName}`}
                />
                <AvatarFallback>
                  {fleetPerformanceData?.data?.fleetPerformanceStat?.highestRating?.fleetName?.firstName?.charAt(
                    0,
                  )}
                  {fleetPerformanceData?.data?.fleetPerformanceStat?.highestRating?.fleetName?.lastName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-bold">
                {
                  fleetPerformanceData?.data?.fleetPerformanceStat
                    ?.highestRating?.fleetName?.firstName
                }{" "}
                {
                  fleetPerformanceData?.data?.fleetPerformanceStat
                    ?.highestRating?.fleetName?.lastName
                }
                {!fleetPerformanceData?.data?.fleetPerformanceStat
                  ?.highestRating?.fleetName?.firstName &&
                  !fleetPerformanceData?.data?.fleetPerformanceStat
                    ?.highestRating?.fleetName?.lastName &&
                  "N/A"}
              </p>
              <p className="text-[#DC3173] text-sm">
                {fleetPerformanceData?.data?.fleetPerformanceStat?.highestRating
                  ?.rating || 0}{" "}
                stars
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
                    fleetPerformanceData?.data?.fleetPerformanceStat
                      ?.highestEarnings?.fleetPhoto
                  }
                  alt={`${fleetPerformanceData?.data?.fleetPerformanceStat?.highestEarnings?.fleetName?.firstName} ${fleetPerformanceData?.data?.fleetPerformanceStat?.highestEarnings?.fleetName?.lastName}`}
                />
                <AvatarFallback>
                  {fleetPerformanceData?.data?.fleetPerformanceStat?.highestEarnings?.fleetName?.firstName?.charAt(
                    0,
                  )}
                  {fleetPerformanceData?.data?.fleetPerformanceStat?.highestEarnings?.fleetName?.lastName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-bold">
                {
                  fleetPerformanceData?.data?.fleetPerformanceStat
                    ?.highestEarnings?.fleetName?.firstName
                }{" "}
                {
                  fleetPerformanceData?.data?.fleetPerformanceStat
                    ?.highestEarnings?.fleetName?.lastName
                }
                {!fleetPerformanceData?.data?.fleetPerformanceStat
                  ?.highestEarnings?.fleetName?.firstName &&
                  !fleetPerformanceData?.data?.fleetPerformanceStat
                    ?.highestEarnings?.fleetName?.lastName &&
                  "N/A"}
              </p>
              <p className="text-[#DC3173] text-sm">
                €
                {formatPrice(
                  fleetPerformanceData?.data?.fleetPerformanceStat
                    ?.highestEarnings?.earnings || 0,
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <CustomizedCharts
            type="area"
            title="Orders Performance"
            description="Daily performance over the last 7 days"
            data={fleetPerformanceData?.data?.fleetWeeklyPerformance || []}
            xLabel="Days"
            xKey="day"
            yLabel="No of Orders"
            yKey="totalOrders"
            delay={0.2}
            isBGNeed={false}
          />
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <CustomizedCharts
            title="Earnings Performance"
            description="Daily performance over the last 7 days"
            data={fleetPerformanceData?.data?.fleetWeeklyPerformance || []}
            xLabel="Days"
            xKey="day"
            yLabel="Earnings (€)"
            yKey="totalEarnings"
            delay={0.3}
            isBGNeed={false}
            yAxisCustomizedValue={(val) => `€${formatPrice(val as number)}`}
            yLabelCustomizedValue={(val) => `€${formatPrice(val as number)}`}
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
            {fleetPerformanceData?.data?.topFleetPerformers?.map(
              (fleetManager, index) => (
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
                        src={fleetManager.fleetPhoto}
                        alt={`${fleetManager?.fleetName?.firstName} ${fleetManager?.fleetName?.lastName}`}
                      />
                      <AvatarFallback>
                        {fleetManager?.fleetName?.firstName?.charAt(0)}
                        {fleetManager?.fleetName?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {fleetManager?.fleetName?.firstName}{" "}
                      {fleetManager?.fleetName?.lastName}
                      {!fleetManager?.fleetName?.firstName &&
                        !fleetManager?.fleetName?.lastName &&
                        "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      €{formatPrice(fleetManager.totalEarnings || 0)} earnings
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium">{fleetManager.rating}</span>
                  </div>
                </div>
              ),
            )}
          </div>
        </motion.div>
      </div>

      {/* Fleet Manager Performance Table */}
      <FleetManagerPerformanceTable
        fleetManagers={fleetPerformanceData?.data?.fleetPerformance}
      />

      {/* Pagination */}
      {!!fleetPerformanceData?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={fleetPerformanceData?.meta?.totalPage as number}
          />
        </motion.div>
      )}
    </div>
  );
}
