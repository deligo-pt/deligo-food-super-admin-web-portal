"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TPartnerPerformanceDetailsData } from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { BikeIcon, EuroIcon, Star, TruckIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  partnerPerformanceData: TPartnerPerformanceDetailsData;
}

export default function DeliveryPartnerPerformanceDetails({
  partnerPerformanceData,
}: IProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header */}
      <TitleHeader
        title={`${partnerPerformanceData?.partnerPerformance?.name?.firstName}${partnerPerformanceData?.partnerPerformance?.name?.firstName && " "}${partnerPerformanceData?.partnerPerformance?.name?.lastName}${partnerPerformanceData?.partnerPerformance?.name?.lastName && " "}Performance`}
        subtitle="Delivery Partner Performance Details"
        onBackClick={() => router.push("/admin/delivery-partner-performance")}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Deliveries"
          value={
            partnerPerformanceData?.partnerPerformance?.totalDeliveries || 0
          }
          icon={TruckIcon}
          delay={0.1}
        />
        <StatsCard
          title="Completed Deliveries"
          value={
            partnerPerformanceData?.partnerPerformance?.completedDeliveries || 0
          }
          icon={BikeIcon}
          delay={0.3}
        />
        <StatsCard
          title="Avg Rating"
          value={partnerPerformanceData?.partnerPerformance?.rating || 0.0}
          icon={Star}
          delay={0.2}
        />
        <StatsCard
          title="Total Earnings"
          value={`€${formatPrice(partnerPerformanceData?.partnerPerformance?.totalEarnings || 0)}`}
          icon={EuroIcon}
          delay={0}
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
              Orders Performance
            </h3>
            <p className="text-sm text-gray-500">
              Monthly performance over the last 6 months
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
          data={partnerPerformanceData?.partnerMonthlyPerformance}
          type="bar"
          dataKey="totalOrders"
          xKey="month"
          height={300}
        />
      </motion.div>
    </div>
  );
}
