"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import TopRatedDeliveryPartners from "@/components/Dashboard/Performance/FleetManagerPerformance/TopDrivers";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TFleetPerformanceDetailsData } from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { Clock, EuroIcon, ShoppingBag, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  performanceData: TFleetPerformanceDetailsData;
}

export default function FleetManagerPerformanceDetails({
  performanceData,
}: IProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header */}
      <TitleHeader
        title={`${performanceData?.fleetPerformance?.name?.firstName} ${performanceData?.fleetPerformance?.name?.lastName} Performance`}
        subtitle="Fleet Manager Performance Details"
        onBackClick={() => router.push("/admin/fleet-performance")}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Earnings"
          value={`€${formatPrice(performanceData?.fleetPerformance?.totalEarnings || 0)}`}
          icon={EuroIcon}
          delay={0}
        />
        <StatsCard
          title="Total Deliveries"
          value={
            performanceData?.fleetPerformance?.operationalData
              ?.totalDeliveries || 0
          }
          icon={ShoppingBag}
          delay={0.1}
        />
        <StatsCard
          title="Avg Rating"
          value={
            performanceData?.fleetPerformance?.operationalData?.rating
              ?.average || 0.0
          }
          icon={Star}
          delay={0.2}
        />
        <StatsCard
          title="Total Drivers"
          value={
            performanceData?.fleetPerformance?.operationalData?.totalDrivers ||
            0
          }
          icon={Clock}
          delay={0.3}
        />
      </div>

      {/* Chart */}
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
        className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Earings Performance
            </h3>
            <p className="text-sm text-gray-500">
              Monthly performance over the last 6 months
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#DC3173]" />
              <span className="text-gray-600">Earnings</span>
            </div>
          </div>
        </div>
        <AnalyticsChart
          data={performanceData?.fleetMonthlyPerformance}
          type="bar"
          dataKey="totalEarnings"
          xKey="month"
          height={300}
        />
      </motion.div>

      <TopRatedDeliveryPartners partners={performanceData?.topRatedDrivers} />
    </div>
  );
}
