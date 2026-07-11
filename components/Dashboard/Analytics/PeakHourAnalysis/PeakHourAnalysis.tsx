"use client";

import CustomersPeakOrderTimeChart from "@/components/Dashboard/Analytics/CustomerInsights/CustomersPeakOrderTimeChart";
import DayWiseOrdersChart from "@/components/Dashboard/Analytics/PeakHourAnalysis/DayWiseOrdersChart";
import LunchVsDinnerChart from "@/components/Dashboard/Analytics/PeakHourAnalysis/LunchVsDinnerChart";
import RiderDemandGapChart from "@/components/Dashboard/Analytics/PeakHourAnalysis/RiderDemandGap";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TPeakHoursAnalysis } from "@/types/analytics/peak-hour-analysis.type";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, Clock, Flame } from "lucide-react";

interface IProps {
  peakHourAnalysis: TPeakHoursAnalysis;
}

export default function PeakHoursPage({ peakHourAnalysis }: IProps) {
  const { t } = useTranslation();

  const peakHour = peakHourAnalysis.hourlyOrders?.length
    ? peakHourAnalysis.hourlyOrders.reduce((a, b) =>
      a.orderCount > b.orderCount ? a : b
    )
    : null;

  const peakDay = peakHourAnalysis.dayWiseOrders?.length
    ? peakHourAnalysis.dayWiseOrders.reduce((a, b) =>
      a.orderCount > b.orderCount ? a : b,
    )
    : null;

  const dinner = peakHourAnalysis.mealTimeComparison.find(
    (m) => m.type === "DINNER",
  );

  const maxShortage = peakHourAnalysis.riderDemandGap?.length
    ? peakHourAnalysis.riderDemandGap.reduce((a, b) =>
      a.shortage > b.shortage ? a : b,
    )
    : null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <TitleHeader
        title={t("peak_hours_analysis")}
        subtitle={t("understand_demand_patterns_optimize_operations")}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title={t("peak_hour")}
          value={`${peakHour?.hour}:00`}
          icon={Clock}
        />
        <StatsCard
          title={t("peak_day")}
          value={peakDay?.day as string}
          icon={CalendarDays}
          delay={0.1}
        />
        <StatsCard
          title={t("dinner_dominance")}
          value={`${dinner?.percentage || 0}%`}
          icon={Flame}
          delay={0.2}
        />
        <StatsCard
          title={t("max_rider_shortage")}
          value={`${maxShortage?.shortage || 0}`}
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
          {t("orders_per_hour")}
        </h3>
        <p className="text-sm text-gray-500 mb-6">{t("identify_peak_demand_times")}</p>

        <CustomersPeakOrderTimeChart
          hourlyOrders={peakHourAnalysis.hourlyOrders}
        />
      </motion.div>

      {/* Meal Comparison and Day-wise Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        {/* Meal Comparison */}
        <LunchVsDinnerChart
          mealTimeComparison={peakHourAnalysis.mealTimeComparison}
          title={t("lunch_vs_dinner")}
        />

        {/* Day-wise */}
        <DayWiseOrdersChart dayWiseOrders={peakHourAnalysis.dayWiseOrders} title={t("day_wise_orders")} />
      </div>

      {/* Rider Demand vs Availability */}
      <RiderDemandGapChart riderDemandGap={peakHourAnalysis.riderDemandGap} />

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t("peak_heatmap")}
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
                {item.orderCount} {t("orders")}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
