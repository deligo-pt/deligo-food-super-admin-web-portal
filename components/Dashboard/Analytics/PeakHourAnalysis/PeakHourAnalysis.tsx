"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { motion, Variants } from "framer-motion";
import { ActivityIcon, CalendarIcon, ClockIcon } from "lucide-react";

const analyticsData = {
  stats: {
    peakHour: "06:00PM-07:00PM",
    busiestDay: "Friday",
    avgOrdersPerHour: 3,
  },
  weeklyHourlyOrders: [
    {
      day: "Mon",
      hourlyData: [
        { hour: "8AM - 10AM", orders: 2 },
        { hour: "10AM - 12PM", orders: 1 },
        { hour: "12PM - 2PM", orders: 5 },
        { hour: "2PM - 4PM", orders: 10 },
        { hour: "4PM - 6PM", orders: 16 },
        { hour: "6PM - 8PM", orders: 12 },
        { hour: "8PM - 10PM", orders: 1 },
        { hour: "10PM - 12AM", orders: 7 },
        { hour: "12AM - 2AM", orders: 2 },
        { hour: "2AM - 4AM", orders: 0 },
        { hour: "4AM - 6AM", orders: 0 },
        { hour: "6AM - 8AM", orders: 1 },
      ],
    },
    {
      day: "Tue",
      hourlyData: [
        { hour: "8AM - 10AM", orders: 0 },
        { hour: "10AM - 12PM", orders: 0 },
        { hour: "12PM - 2PM", orders: 7 },
        { hour: "2PM - 4PM", orders: 2 },
        { hour: "4PM - 6PM", orders: 10 },
        { hour: "6PM - 8PM", orders: 5 },
        { hour: "8PM - 10PM", orders: 16 },
        { hour: "10PM - 12AM", orders: 1 },
        { hour: "12AM - 2AM", orders: 3 },
        { hour: "2AM - 4AM", orders: 0 },
        { hour: "4AM - 6AM", orders: 1 },
        { hour: "6AM - 8AM", orders: 0 },
      ],
    },
    {
      day: "Wed",
      hourlyData: [
        { hour: "8AM - 10AM", orders: 2 },
        { hour: "10AM - 12PM", orders: 0 },
        { hour: "12PM - 2PM", orders: 4 },
        { hour: "2PM - 4PM", orders: 6 },
        { hour: "4PM - 6PM", orders: 2 },
        { hour: "6PM - 8PM", orders: 10 },
        { hour: "8PM - 10PM", orders: 20 },
        { hour: "10PM - 12AM", orders: 0 },
        { hour: "12AM - 2AM", orders: 6 },
        { hour: "2AM - 4AM", orders: 0 },
        { hour: "4AM - 6AM", orders: 0 },
        { hour: "6AM - 8AM", orders: 3 },
      ],
    },
    {
      day: "Thu",
      hourlyData: [
        { hour: "8AM - 10AM", orders: 2 },
        { hour: "10AM - 12PM", orders: 1 },
        { hour: "12PM - 2PM", orders: 5 },
        { hour: "2PM - 4PM", orders: 10 },
        { hour: "4PM - 6PM", orders: 16 },
        { hour: "6PM - 8PM", orders: 12 },
        { hour: "8PM - 10PM", orders: 1 },
        { hour: "10PM - 12AM", orders: 7 },
        { hour: "12AM - 2AM", orders: 2 },
        { hour: "2AM - 4AM", orders: 0 },
        { hour: "4AM - 6AM", orders: 0 },
        { hour: "6AM - 8AM", orders: 1 },
      ],
    },
    {
      day: "Fri",
      hourlyData: [
        { hour: "8AM - 10AM", orders: 2 },
        { hour: "10AM - 12PM", orders: 1 },
        { hour: "12PM - 2PM", orders: 5 },
        { hour: "2PM - 4PM", orders: 10 },
        { hour: "4PM - 6PM", orders: 16 },
        { hour: "6PM - 8PM", orders: 12 },
        { hour: "8PM - 10PM", orders: 1 },
        { hour: "10PM - 12AM", orders: 7 },
        { hour: "12AM - 2AM", orders: 2 },
        { hour: "2AM - 4AM", orders: 0 },
        { hour: "4AM - 6AM", orders: 0 },
        { hour: "6AM - 8AM", orders: 1 },
      ],
    },
    {
      day: "Sat",
      hourlyData: [
        { hour: "8AM - 10AM", orders: 0 },
        { hour: "10AM - 12PM", orders: 0 },
        { hour: "12PM - 2PM", orders: 7 },
        { hour: "2PM - 4PM", orders: 2 },
        { hour: "4PM - 6PM", orders: 10 },
        { hour: "6PM - 8PM", orders: 5 },
        { hour: "8PM - 10PM", orders: 16 },
        { hour: "10PM - 12AM", orders: 1 },
        { hour: "12AM - 2AM", orders: 3 },
        { hour: "2AM - 4AM", orders: 0 },
        { hour: "4AM - 6AM", orders: 1 },
        { hour: "6AM - 8AM", orders: 0 },
      ],
    },
    {
      day: "Sun",
      hourlyData: [
        { hour: "8AM - 10AM", orders: 2 },
        { hour: "10AM - 12PM", orders: 0 },
        { hour: "12PM - 2PM", orders: 4 },
        { hour: "2PM - 4PM", orders: 6 },
        { hour: "4PM - 6PM", orders: 2 },
        { hour: "6PM - 8PM", orders: 10 },
        { hour: "8PM - 10PM", orders: 20 },
        { hour: "10PM - 12AM", orders: 0 },
        { hour: "12AM - 2AM", orders: 6 },
        { hour: "2AM - 4AM", orders: 0 },
        { hour: "4AM - 6AM", orders: 0 },
        { hour: "6AM - 8AM", orders: 3 },
      ],
    },
  ],
  weeklyHourlyMaxOrdersCount: 20,
  prevDayDistribution: [
    { hour: "0:00", orders: 4 },
    { hour: "1:00", orders: 0 },
    { hour: "2:00", orders: 1 },
    { hour: "3:00", orders: 1 },
    { hour: "4:00", orders: 0 },
    { hour: "5:00", orders: 1 },
    { hour: "6:00", orders: 3 },
    { hour: "7:00", orders: 6 },
    { hour: "8:00", orders: 1 },
    { hour: "9:00", orders: 10 },
    { hour: "10:00", orders: 5 },
    { hour: "11:00", orders: 16 },
    { hour: "12:00", orders: 7 },
    { hour: "13:00", orders: 12 },
    { hour: "14:00", orders: 9 },
    { hour: "15:00", orders: 25 },
    { hour: "16:00", orders: 4 },
    { hour: "17:00", orders: 6 },
    { hour: "18:00", orders: 17 },
    { hour: "19:00", orders: 2 },
    { hour: "20:00", orders: 5 },
    { hour: "21:00", orders: 2 },
    { hour: "22:00", orders: 1 },
    { hour: "23:00", orders: 0 },
  ],
  weekDaysOrders: [
    {
      day: "Mon",
      orders: 320,
    },
    {
      day: "Tue",
      orders: 290,
    },
    {
      day: "Wed",
      orders: 310,
    },
    {
      day: "Thu",
      orders: 380,
    },
    {
      day: "Fri",
      orders: 520,
    },
    {
      day: "Sat",
      orders: 580,
    },
    {
      day: "Sun",
      orders: 490,
    },
  ],
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hours = [
  "8AM - 10AM",
  "10AM - 12PM",
  "12PM - 2PM",
  "2PM - 4PM",
  "4PM - 6PM",
  "6PM - 8PM",
  "8PM - 10PM",
  "10PM - 12AM",
  "12AM - 2AM",
  "2AM - 4AM",
  "4AM - 6AM",
  "6AM - 8AM",
];

export default function PeakHourAnalysis() {
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

  const heatmapOrders = (day: string, hour: string) =>
    analyticsData?.weeklyHourlyOrders
      ?.find((w) => w.day === day)
      ?.hourlyData.find((h) => h.hour === hour)?.orders || 0;

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
          title="Peak Hour Analysis"
          subtitle="Order volume patterns and demand forecasting"
        />

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <StatsCard
            title="Peak Hour"
            value={analyticsData.stats?.peakHour || 0}
            icon={ClockIcon}
            delay={0}
          />
          <StatsCard
            title="Busiest Day"
            value={analyticsData.stats?.busiestDay || 0}
            icon={CalendarIcon}
            delay={0.1}
          />
          <StatsCard
            title="Avg Orders/Hour"
            value={analyticsData.stats?.avgOrdersPerHour || 0}
            icon={ActivityIcon}
            delay={0.2}
          />
        </motion.div>

        {/* Heatmap */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-x-auto"
        >
          <h3 className="font-bold text-gray-900 mb-6">
            Weekly Demand Heatmap
          </h3>
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 mb-2">
              <div className="text-xs font-medium text-gray-400"></div>
              {hours.map((h) => (
                <div
                  key={h}
                  className="text-xs font-medium text-gray-400 text-center"
                >
                  {h}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {days.map((day) => (
                <div
                  key={day}
                  className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 items-center"
                >
                  <div className="text-sm font-medium text-gray-600">{day}</div>
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-10 rounded-md transition-all hover:ring-2 hover:ring-gray-300 cursor-pointer border border-[#DC3173]/20"
                      style={{
                        backgroundColor: `rgba(220, 49, 115, ${heatmapOrders(day, hour) / (analyticsData?.weeklyHourlyMaxOrdersCount || 100)})`,
                      }}
                      title={`${heatmapOrders(day, hour)} orders`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
              <span>Less Busy</span>
              <div className="flex gap-1">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((op) => (
                  <div
                    key={op}
                    className="w-4 h-4 rounded-sm"
                    style={{
                      backgroundColor: `rgba(220, 49, 115, ${op})`,
                    }}
                  />
                ))}
              </div>
              <span>Very Busy</span>
            </div>
          </div>
        </motion.div>

        {/* Chart: Hourly Distribution */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Hourly Distribution
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Previous Day Orders Distribution
          </p>
          <AnalyticsChart
            data={analyticsData.prevDayDistribution || []}
            type="area"
            dataKey="orders"
            xKey="hour"
            height={200}
            xInterval={2}
          />
        </motion.div>

        {/* Chart: Day of Week */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Orders by Day of Week
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Last week orders distribution
          </p>
          <AnalyticsChart
            data={analyticsData.weekDaysOrders || []}
            type="bar"
            dataKey="orders"
            xKey="day"
            height={200}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
