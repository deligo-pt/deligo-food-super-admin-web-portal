"use client";

import { TTopVendors } from "@/types/analytics/top-vendors.type";
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
export default function RevenueByTopVendorChart({
  topSellingVendors,
}: {
  topSellingVendors: TTopVendors["topSellingVendors"];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Revenue by Top Vendors
      </h3>

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
          <BarChart
            data={topSellingVendors}
            margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
            <XAxis dataKey="vendorName">
              <Label
                value="Vendors"
                offset={-15}
                position="insideBottom"
                className="text-gray-900 font-semibold"
              />
            </XAxis>
            <YAxis dataKey="totalRevenue">
              <Label
                value="Revenue (€)"
                offset={0}
                style={{ textAnchor: "middle" }}
                position="insideLeft"
                angle={-90}
                className="text-gray-900 font-semibold"
              />
            </YAxis>
            <Tooltip formatter={(val: number) => [`€${val}`, "Revenue"]} />
            <Bar dataKey="totalRevenue" fill="#DC3173" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
