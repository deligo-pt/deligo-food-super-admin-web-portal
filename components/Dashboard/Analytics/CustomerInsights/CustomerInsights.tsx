"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TCustomerInsights } from "@/types/analytics.type";
import { motion, Variants } from "framer-motion";
import {
  CrownIcon,
  MapPinIcon,
  RepeatIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Formatter } from "recharts/types/component/DefaultTooltipContent";

interface IProps {
  insights: TCustomerInsights;
}

const COLORS = ["#DC3173", "#e45a92", "#f9a8d4", "#fbcfe8"];

export default function CustomerInsights({ insights }: IProps) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hourLabel = (h: number) => {
    const suffix = h >= 12 ? "PM" : "AM";
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${display} ${suffix}`;
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <motion.div
      className="min-h-screen p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <TitleHeader
        title="Customer Insights"
        subtitle="Understand your audience and retention"
        extraComponent={
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <UsersIcon className="w-4 h-4 text-[#DC3173]" />
            <span className="text-sm font-medium text-gray-600">All Time</span>
          </div>
        }
      />

      {/* Summary Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-blue-600 absolute top-0 left-0" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <UsersIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Total Customers
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {insights.summaryCards?.totalCustomers?.value}
          </div>
          <div className="text-sm text-green-600 mt-1 font-medium">
            {insights.summaryCards?.totalCustomers?.subValue}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-400 to-purple-600 absolute top-0 left-0" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <RepeatIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Returning</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {insights.summaryCards?.returningCustomers?.value}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {insights.summaryCards?.returningCustomers?.subValue}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-amber-600 absolute top-0 left-0" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <MapPinIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Top City</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 truncate">
            {insights.summaryCards?.topCity?.value}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {insights.summaryCards?.topCity?.subValue}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#DC3173] to-[#e45a92] absolute top-0 left-0" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#DC3173]/10 rounded-lg text-[#DC3173]">
              <UserPlusIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Retention</span>
          </div>
          <div className="text-3xl font-bold text-[#DC3173]">
            {insights.summaryCards?.retentionRate?.value}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {insights.summaryCards?.retentionRate?.subValue}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demographics Pie Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <MapPinIcon className="w-6 h-6 text-[#DC3173]" />
            <h2 className="text-xl font-bold text-gray-900">
              Demographics by City
            </h2>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={insights.demographics}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1200}
                >
                  {insights.demographics?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
                  }}
                  formatter={
                    ((value: number) => [`${value}%`, "Share"]) as Formatter<
                      number,
                      "Share"
                    >
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {insights.demographics?.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
                {entry.value && (
                  <span className="text-sm text-gray-600 font-medium">
                    {entry.name} ({entry.value}%)
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Customer Value Segments */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <CrownIcon className="w-6 h-6 text-[#DC3173]" />
            <h2 className="text-xl font-bold text-gray-900">Customer Value</h2>
          </div>
          <div className="space-y-4">
            {insights.customerValue?.map((segment, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#DC3173]/10 flex items-center justify-center text-[#DC3173] font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">
                    {segment.segment}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-0.5">Avg Order</div>
                  <div className="font-bold text-[#DC3173]">
                    {segment.avgOrder}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Peak Order Times */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <MapPinIcon className="w-6 h-6 text-[#DC3173]" />
          <h2 className="text-xl font-bold text-gray-900">Peak Order Times</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {insights.heatmap?.map((slot, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: index * 0.1,
              }}
              className="flex items-center gap-4 p-5 bg-[#DC3173]/5 rounded-2xl border border-[#DC3173]/15"
            >
              <div className="w-12 h-12 rounded-xl bg-[#DC3173]/10 flex items-center justify-center text-[#DC3173] flex-shrink-0">
                <MapPinIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {dayNames[slot.day]} · {hourLabel(slot.hour)}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  <span className="font-semibold text-[#DC3173]">
                    {slot.orderCount}
                  </span>{" "}
                  order{slot.orderCount !== 1 ? "s" : ""}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
