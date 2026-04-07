"use client";

import { TCustomerInsights } from "@/types/analytics/customer-insights.type";
import { motion } from "framer-motion";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#16a34a", "#2563eb", "#DC3173"];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg border border-slate-100 rounded-lg">
        <p className="text-sm font-bold text-slate-700">{payload[0].name}</p>
        <p className="text-lg font-mono text-[#DC3173]">
          {payload[0].value.toLocaleString()}
          <span className="text-xs text-slate-400 ml-1">users</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ActiveCustomersInsightsChart({
  activeUsers,
}: {
  activeUsers: TCustomerInsights["activeUsers"];
}) {
  const data = [
    { name: "Daily (DAU)", value: activeUsers.dau },
    { name: "Weekly (WAU)", value: activeUsers.wau },
    { name: "Monthly (MAU)", value: activeUsers.mau },
  ];

  return (
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
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
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
  );
}
