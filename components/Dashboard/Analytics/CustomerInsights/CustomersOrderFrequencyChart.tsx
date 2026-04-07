"use client";

import { TCustomerInsights } from "@/types/analytics/customer-insights.type";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
export default function CustomersOrderFrequencyChart({
  orderFrequency,
}: {
  orderFrequency: TCustomerInsights["orderFrequency"];
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
        height: 200,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={orderFrequency}
          margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
          <XAxis dataKey="range">
            <Label
              value="No of Orders"
              offset={-15}
              position="insideBottom"
              className="text-gray-900 font-semibold"
            />
          </XAxis>
          <YAxis dataKey="userCount">
            <Label
              value="Customers"
              offset={-5}
              style={{ textAnchor: "middle" }}
              position="insideLeft"
              angle={-90}
              className="text-gray-900 font-semibold"
            />
          </YAxis>
          <Tooltip formatter={(val: number) => [val, "Customers"]} />
          <Bar dataKey="userCount" fill="#DC3173" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
