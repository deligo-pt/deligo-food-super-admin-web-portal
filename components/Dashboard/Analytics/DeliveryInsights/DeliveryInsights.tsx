"use client";

import StatusDistributionCard from "@/components/common/StatusDistributionCard";
import AreaPerformance from "@/components/Dashboard/Analytics/DeliveryInsights/AreaPerformance";
import DistanceVsDeliveryTimeChart from "@/components/Dashboard/Analytics/DeliveryInsights/DistanceVsDeliveryTimeChart";
import RiderIdleTime from "@/components/Dashboard/Analytics/DeliveryInsights/RiderIdleTime";
import RiderPerformance from "@/components/Dashboard/Analytics/DeliveryInsights/RiderPerformance";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TDeliveryInsights } from "@/types/analytics/delivery-insights.type";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, XCircle } from "lucide-react";

interface IProps {
  deliveryInsights: TDeliveryInsights;
}

export default function DeliveryInsightsPage({ deliveryInsights }: IProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <TitleHeader
        title="Delivery Insights"
        subtitle="Optimize delivery performance and rider efficiency"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Avg Delivery Time"
          value={`${deliveryInsights.summary.averageDeliveryTime} min`}
          icon={Clock}
        />
        <StatsCard
          title="Late Deliveries"
          value={`${deliveryInsights.summary.lateDeliveryPercentage}%`}
          icon={AlertTriangle}
          delay={0.1}
        />
        <StatsCard
          title="Failed Deliveries"
          value={`${deliveryInsights.summary.rejectedDeliveryPercentage}%`}
          icon={XCircle}
          delay={0.2}
        />
      </div>

      {/* Rider Performance */}
      <RiderPerformance riderPerformance={deliveryInsights.riderPerformance} />

      {/* Distance vs Delivery Time */}
      <DistanceVsDeliveryTimeChart
        distanceTimeAnalysis={deliveryInsights.distanceTimeAnalysis}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        {/* Area Performance */}
        <AreaPerformance areaPerformance={deliveryInsights.areaPerformance} />

        {/* Rider Idle Time */}
        <RiderIdleTime riderIdleTime={deliveryInsights.riderIdleTime} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Failed Delivery Reasons
        </h3>

        <div className="space-y-3">
          {deliveryInsights.rejectedReasons.map((item, i) => (
            <StatusDistributionCard
              key={i}
              name={item.reason.replaceAll("_", " ")}
              value={item.count}
              color="#DC3173"
            />
          ))}
          {deliveryInsights.rejectedReasons.length === 0 && (
            <div className="text-center text-gray-500">
              No rejected deliveries
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
