"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TDeliveryInsightsData } from "@/types/analytics.type";
import { motion, Variants } from "framer-motion";
import {
  CheckCircle2Icon,
  ClockIcon,
  PackageIcon,
  StarIcon,
  TruckIcon,
  UsersIcon,
} from "lucide-react";

interface IProps {
  analyticsData: TDeliveryInsightsData;
}

export default function DeliveryInsights({ analyticsData }: IProps) {
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  } as Variants;

  return (
    <div className="min-h-screen p-6">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <TitleHeader
          title="Delivery Insights"
          subtitle="Delivery performance, rider analytics & logistics overview"
        />

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
        >
          <StatsCard
            title="Total Deliveries"
            value={analyticsData.stats?.totalDeliveries || 0}
            icon={TruckIcon}
            delay={0}
          />
          <StatsCard
            title="Deliveries Today"
            value={analyticsData.stats?.deliveriesToday || 0}
            icon={PackageIcon}
            delay={0.3}
          />
          <StatsCard
            title="Avg Delivery Time"
            value={`${analyticsData.stats?.avgDeliveryTime || 0} min`}
            icon={ClockIcon}
            delay={0.1}
          />
          <StatsCard
            title="On-Time Rate"
            value={`${analyticsData.stats?.onTimeRate || 0}%`}
            icon={CheckCircle2Icon}
            delay={0.2}
          />
        </motion.div>

        {/* Chart: Hourly Distribution */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Average Delivery Time
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Last 7 days&lsquo; average delivery time in minutes
          </p>
          <AnalyticsChart
            data={analyticsData.avgDeliveryTime || []}
            type="bar"
            dataKey="time"
            xKey="day"
            height={200}
          />
        </motion.div>

        {/* Top Riders */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="font-bold text-gray-900 mb-6">
            Top Performing Riders
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Delivery Partner
                  </th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Deliveries
                  </th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Avg Time
                  </th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    On-Time Rate
                  </th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topRiders?.map((rider, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 text-sm font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <UsersIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      {rider.name}
                    </td>
                    <td className="py-4 text-sm text-gray-700 font-medium">
                      {rider.deliveries}
                    </td>
                    <td className="py-4 text-sm text-gray-700 flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                      {rider.avgTime}
                    </td>
                    <td className="py-4 text-sm text-green-600 font-medium">
                      {rider.onTime}
                    </td>
                    <td className="py-4 text-sm font-medium flex items-center gap-1">
                      {rider.rating}
                      <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
