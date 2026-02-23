"use client";

import { AnimatedCounter } from "@/components/Dashboard/Analytics/AnimatedCounter/AnimatedCounter";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TSalesAnalytics } from "@/types/analytics.type";
import { motion, Variants } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Formatter } from "recharts/types/component/DefaultTooltipContent";

interface IProps {
  salesAnalytics: TSalesAnalytics;
}

export default function SalesAnalytics({ salesAnalytics }: IProps) {
  const maxSold = Math.max(
    ...salesAnalytics.topSellingItems.map((i) => i.sold),
  );

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
        title="Sales Analytics"
        subtitle="Weekly performance and top products"
        extraComponent={
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <CalendarIcon className="w-4 h-4 text-[#DC3173]" />
            <span className="text-sm font-medium text-gray-600">
              Last 7 Days
            </span>
          </div>
        }
      />

      {/* Hero Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#DC3173] to-[#e45a92] absolute top-0 left-0" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#DC3173]/10 rounded-lg text-[#DC3173]">
              <TrendingUpIcon className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Total Sales
          </h3>
          <div className="text-3xl font-bold text-[#DC3173]">
            <AnimatedCounter value={salesAnalytics.totalSales} prefix="€" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-green-400 to-green-600 absolute top-0 left-0" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <ArrowUpIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
              Best Day
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Best Performing
          </h3>
          <div className="text-3xl font-bold text-gray-900">
            {salesAnalytics.bestPerformingDay}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-amber-600 absolute top-0 left-0" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <ArrowDownIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
              Slowest Day
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Slowest Day
          </h3>
          <div className="text-3xl font-bold text-gray-900">
            {salesAnalytics.slowestDay}
          </div>
        </div>
      </motion.div>

      {/* Weekly Trend Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 relative overflow-hidden"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#DC3173] to-[#e45a92] absolute top-0 left-0" />
        <div className="flex items-center gap-3 mb-6">
          <TrendingUpIcon className="w-6 h-6 text-[#DC3173]" />
          <h2 className="text-xl font-bold text-gray-900">
            Weekly Sales Trend
          </h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesAnalytics.weeklyTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#6B7280",
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#6B7280",
                }}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip
                cursor={{
                  fill: "#F9FAFB",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
                }}
                formatter={
                  ((value: number) => [
                    `€${value.toFixed(2)}`,
                    "Sales",
                  ]) as Formatter<number, "Sales">
                }
              />
              <Bar
                dataKey="total"
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
              >
                {salesAnalytics.weeklyTrend.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.total > 0 ? "#DC3173" : "#E5E7EB"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Selling Items */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBagIcon className="w-6 h-6 text-[#DC3173]" />
          <h2 className="text-xl font-bold text-gray-900">Top Selling Items</h2>
        </div>
        <div className="space-y-4">
          {salesAnalytics.topSellingItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: index * 0.1,
              }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-[#DC3173]/10 flex items-center justify-center text-[#DC3173] font-bold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-medium text-gray-900 truncate">
                    {item.name}
                  </span>
                  <span className="font-bold text-[#DC3173] ml-2 flex-shrink-0">
                    {item.sold} sold
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#DC3173] to-[#e45a92] rounded-full"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(item.sold / maxSold) * 100}%`,
                    }}
                    transition={{
                      duration: 1,
                      delay: index * 0.1,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
