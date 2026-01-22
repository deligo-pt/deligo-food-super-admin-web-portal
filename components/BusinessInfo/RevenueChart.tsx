"use client";

import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";
import { Calendar, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    name: "Mon",
    revenue: 4200,
    orders: 120,
  },
  {
    name: "Tue",
    revenue: 3800,
    orders: 98,
  },
  {
    name: "Wed",
    revenue: 5100,
    orders: 145,
  },
  {
    name: "Thu",
    revenue: 4800,
    orders: 132,
  },
  {
    name: "Fri",
    revenue: 6500,
    orders: 185,
  },
  {
    name: "Sat",
    revenue: 8200,
    orders: 240,
  },
  {
    name: "Sun",
    revenue: 7800,
    orders: 210,
  },
];

export default function RevenueChart() {
  const { t } = useTranslation();

  return (
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
        duration: 0.5,
        delay: 0.6,
      }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-primary-500" size={20} />
            {t("revenue_overview")}
          </h3>
          <p className="text-sm text-gray-500">
            {t("daily_revenue_performance")}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{t("last_7_days")}</span>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC3173" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#DC3173" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F3F4F6"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 12,
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 12,
              }}
              tickFormatter={(value) => `€${value}`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number) => [
                `€${value.toLocaleString()}`,
                "Revenue",
              ]}
              cursor={{
                stroke: "#DC3173",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#DC3173"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{
                r: 6,
                strokeWidth: 0,
                fill: "#DC3173",
              }}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
