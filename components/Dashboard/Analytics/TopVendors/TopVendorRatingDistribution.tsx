"use client";

import { TTopVendors } from "@/types/analytics/top-vendors.type";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#fb923c", "#facc15", "#a855f7", "#22c55e", "#DC3173"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-xl border border-slate-100 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <p className="text-sm font-bold text-slate-700">
            {payload[0].payload.rating} Stars
          </p>
        </div>
        <p className="text-xs text-slate-500">
          <span className="font-mono font-bold text-blue-600">
            {payload[0].value}
          </span>{" "}
          Vendors
        </p>
      </div>
    );
  }
  return null;
};

export default function TopVendorRatingDistribution({
  ratingDistribution,
}: {
  ratingDistribution: TTopVendors["ratingDistribution"];
}) {
  const distributionData = [1, 2, 3, 4, 5].map((star) => ({
    rating: star,
    count: ratingDistribution.filter((v) => Math.round(v.rating) === star)
      .length,
  }));

  const totalVendors = ratingDistribution.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Rating Distribution
          </h3>
          <p className="text-sm text-gray-500">
            Total volume across {totalVendors} vendors
          </p>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-amber-700">
            Vendor Quality
          </span>
        </div>
      </div>

      <div style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={distributionData}
            margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
            <XAxis dataKey="rating" tickFormatter={(val) => `${val} ★`}>
              <Label
                value="Rating (Stars)"
                offset={-15}
                position="insideBottom"
                className="text-gray-900 font-semibold"
              />
            </XAxis>
            <YAxis dataKey="count">
              <Label
                value="No of Vendors"
                offset={-5}
                style={{ textAnchor: "middle" }}
                position="insideLeft"
                angle={-90}
                className="text-gray-900 font-semibold"
              />
            </YAxis>

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#f8fafc", radius: 8 }}
            />

            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
              {distributionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.8}
                  className="hover:fill-opacity-100 transition-all cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        {distributionData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div>
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: COLORS[idx] }}
              />
            </div>
            <div>
              <p className="text-[12px] text-slate-700 font-bold m-0 w-auto h-auto">
                {item.rating}★
              </p>
              <p className="text-[12px] text-slate-500 m-0 w-auto h-auto">
                {totalVendors > 0
                  ? Math.round((item.count / totalVendors) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
