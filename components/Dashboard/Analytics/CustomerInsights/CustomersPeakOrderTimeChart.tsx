"use client";

import { TCustomerInsights } from "@/types/analytics/customer-insights.type";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function CustomersPeakOrderTimeChart({
  hourlyOrders,
}: {
  hourlyOrders: TCustomerInsights["hourlyOrders"];
}) {
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
        height: 300,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={hourlyOrders}
          margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
          <XAxis dataKey="hour">
            <Label
              value="Hours"
              offset={-15}
              position="insideBottom"
              className="text-gray-900 font-semibold"
            />
          </XAxis>
          <YAxis dataKey="orderCount">
            <Label
              value="Orders"
              offset={-5}
              style={{ textAnchor: "middle" }}
              position="insideLeft"
              angle={-90}
              className="text-gray-900 font-semibold"
            />
          </YAxis>
          <Tooltip
            labelFormatter={(hour) => `Hour: ${hour}`}
            formatter={(val: number) => [val, "Orders:"]}
          />
          <defs>
            <linearGradient
              id={`gradient-orderCount`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#DC3173" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#DC3173" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="orderCount"
            stroke="#DC3173"
            strokeWidth={2.5}
            fill={`url(#gradient-orderCount)`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
