"use client";

import StatusDistributionCard from "@/components/common/StatusDistributionCard";
import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TDeliveryInsights } from "@/types/analytics/delivery-insights.type";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Clock, MapPin, XCircle } from "lucide-react";

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Rider Performance
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Deliveries handled by each rider
        </p>

        <AnalyticsChart
          data={deliveryInsights.riderPerformance}
          type="bar"
          dataKey="totalDeliveries"
          xKey="riderName"
          height={220}
        />
      </motion.div>

      {/* Distance vs Delivery Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Distance vs Delivery Time
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Relationship between distance and time
        </p>

        <AnalyticsChart
          data={deliveryInsights.distanceTimeAnalysis}
          type="line"
          dataKey="averageTime"
          xKey="distanceKm"
          height={220}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        {/* Area Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} /> Area Performance
          </h3>

          <AnalyticsChart
            data={deliveryInsights.areaPerformance}
            type="bar"
            dataKey="averageTime"
            xKey="area"
            height={200}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={18} /> Rider Idle Time
          </h3>

          <AnalyticsChart
            data={deliveryInsights.riderIdleTime}
            type="bar"
            dataKey="idleTimeMinutes"
            xKey="riderName"
            height={200}
          />
        </motion.div>
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
