"use client";

import { TPeakHoursAnalysis } from "@/types/analytics/peak-hour-analysis.type";
import { motion } from "framer-motion";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#2563eb", "#DC3173"];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: {
    payload: { type: string; orderCount: number; percentage: number };
  }[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-xl border border-slate-100 rounded-xl">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          {data.type}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-mono font-bold text-slate-800">
            {data.orderCount.toLocaleString()}
          </p>
          <p className="text-xs font-medium text-slate-500">orders</p>
        </div>
        <div className="mt-1 pt-1 border-t border-slate-50">
          <p className="text-sm font-semibold text-blue-600">
            {data.percentage}%{" "}
            <span className="text-slate-400 font-normal">of total</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function LunchVsDinnerChart({
  mealTimeComparison,
}: {
  mealTimeComparison: TPeakHoursAnalysis["mealTimeComparison"];
}) {
  const chartData = mealTimeComparison.map((item) => ({
    ...item,
    name: item.type === "LUNCH" ? "Lunch" : "Dinner",
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Lunch vs Dinner</h3>

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        style={{
          height: 200,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="orderCount"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingTop: "20px",
              }}
              formatter={(value) => (
                <span className="text-sm text-slate-600 font-medium">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
