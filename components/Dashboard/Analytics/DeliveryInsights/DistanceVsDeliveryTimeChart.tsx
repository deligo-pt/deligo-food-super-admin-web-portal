"use client";

import { TDeliveryInsights } from "@/types/analytics/delivery-insights.type";
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

interface IProps {
  distanceTimeAnalysis: TDeliveryInsights["distanceTimeAnalysis"];
}

export default function DistanceVsDeliveryTimeChart({
  distanceTimeAnalysis,
}: IProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Distance vs Delivery Time
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Relationship between distance and time
      </p>

      {/* <AnalyticsChart
        data={distanceTimeAnalysis}
        type="line"
        dataKey="averageTime"
        xKey="distanceKm"
        height={220}
      /> */}
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
            data={distanceTimeAnalysis}
            margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
            <XAxis dataKey="distanceKm">
              <Label
                value="Distance (km)"
                offset={-15}
                position="insideBottom"
                className="text-gray-900 font-semibold"
              />
            </XAxis>
            <YAxis dataKey="averageTime">
              <Label
                value="Average Time (minutes)"
                offset={-5}
                style={{ textAnchor: "middle" }}
                position="insideLeft"
                angle={-90}
                className="text-gray-900 font-semibold"
              />
            </YAxis>
            <Tooltip
              labelFormatter={(distance) => `Distance: ${distance} km`}
              formatter={(val: number) => [val, "Average Time:"]}
            />
            <defs>
              <linearGradient
                id={`gradient-averageTime`}
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
              dataKey="averageTime"
              stroke="#DC3173"
              strokeWidth={2.5}
              fill={`url(#gradient-averageTime)`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
