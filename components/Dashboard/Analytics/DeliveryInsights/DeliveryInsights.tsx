"use client";

import StatusDistributionCard from "@/components/common/StatusDistributionCard";
import AreaPerformance from "@/components/Dashboard/Analytics/DeliveryInsights/AreaPerformance";
import DistanceVsDeliveryTimeChart from "@/components/Dashboard/Analytics/DeliveryInsights/DistanceVsDeliveryTimeChart";
import RiderIdleTime from "@/components/Dashboard/Analytics/DeliveryInsights/RiderIdleTime";
import RiderPerformance from "@/components/Dashboard/Analytics/DeliveryInsights/RiderPerformance";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TDeliveryInsights } from "@/types/analytics/delivery-insights.type";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, XCircle } from "lucide-react";

interface IProps {
  deliveryInsights: TDeliveryInsights;
}

export default function DeliveryInsightsPage({ deliveryInsights }: IProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <TitleHeader
        title={t("delivery_insights")}
        subtitle={t("optimize_delivery_performance_rider_efficiency")}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title={t("avg_delivery_time")}
          value={`${deliveryInsights.summary.averageDeliveryTime} min`}
          icon={Clock}
        />
        <StatsCard
          title={t("late_deliveries")}
          value={`${deliveryInsights.summary.lateDeliveryPercentage}%`}
          icon={AlertTriangle}
          delay={0.1}
        />
        <StatsCard
          title={t("failed_deliveries")}
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
          {t("failed_delivery_reasons")}
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
              {t("no_rejected_deliveries")}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
