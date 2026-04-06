"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TPeakHoursAnalysis } from "@/types/analytics/peak-hour-analysis.type";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, Clock, Flame } from "lucide-react";

interface IProps {
  peakHourAnalysis: TPeakHoursAnalysis;
}

export default function PeakHoursPage({ peakHourAnalysis }: IProps) {
  const peakHour = peakHourAnalysis.hourlyOrders.reduce((a, b) =>
    a.orderCount > b.orderCount ? a : b,
  );

  const peakDay = peakHourAnalysis.dayWiseOrders.reduce((a, b) =>
    a.orderCount > b.orderCount ? a : b,
  );

  const dinner = peakHourAnalysis.mealTimeComparison.find(
    (m) => m.type === "DINNER",
  );

  const maxShortage = peakHourAnalysis.riderDemandGap.reduce((a, b) =>
    a.shortage > b.shortage ? a : b,
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <TitleHeader
        title="Peak Hours Analysis"
        subtitle="Understand demand patterns and optimize operations"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Peak Hour"
          value={`${peakHour.hour}:00`}
          icon={Clock}
        />
        <StatsCard
          title="Peak Day"
          value={peakDay.day}
          icon={CalendarDays}
          delay={0.1}
        />
        <StatsCard
          title="Dinner Dominance"
          value={`${dinner?.percentage || 0}%`}
          icon={Flame}
          delay={0.2}
        />
        <StatsCard
          title="Max Rider Shortage"
          value={`${maxShortage.shortage}`}
          icon={AlertTriangle}
          delay={0.3}
        />
      </div>

      {/* Hourly Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Orders per Hour
        </h3>
        <p className="text-sm text-gray-500 mb-6">Identify peak demand times</p>

        <AnalyticsChart
          data={peakHourAnalysis.hourlyOrders}
          type="area"
          dataKey="orderCount"
          xKey="hour"
          height={220}
        />
      </motion.div>

      {/* Meal Comparison and Day-wise Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        {/* Meal Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Lunch vs Dinner
          </h3>

          <AnalyticsChart
            data={peakHourAnalysis.mealTimeComparison}
            type="bar"
            dataKey="orderCount"
            xKey="type"
            height={200}
          />
        </motion.div>

        {/* Day-wise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Day-wise Orders
          </h3>

          <AnalyticsChart
            data={peakHourAnalysis.dayWiseOrders}
            type="bar"
            dataKey="orderCount"
            xKey="day"
            height={200}
          />
        </motion.div>
      </div>

      {/* Rider Demand vs Availability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Rider Demand vs Availability
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Detect shortage during peak hours
        </p>

        <AnalyticsChart
          data={peakHourAnalysis.riderDemandGap}
          type="bar"
          dataKey="orders"
          xKey="hour"
          height={220}
        />
      </motion.div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Peak Heatmap (Top Slots)
        </h3>

        <div className="space-y-3">
          {peakHourAnalysis.heatmap.map((item, i) => (
            <div
              key={i}
              className="flex justify-between p-3 rounded-lg border border-gray-100"
            >
              <p className="text-gray-700">
                {item.day} - {item.hour}:00
              </p>
              <p className="font-bold text-[#DC3173]">
                {item.orderCount} orders
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
