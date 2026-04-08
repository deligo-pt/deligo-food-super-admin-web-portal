"use client";

import { TPeakHoursAnalysis } from "@/types/analytics/peak-hour-analysis.type";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const orders = payload[0].value;
    const riders = payload[1].value;
    const shortage = payload[0].payload.shortage;

    return (
      <div className="bg-white p-4 shadow-xl border border-slate-100 rounded-xl">
        <p className="text-xs font-bold text-slate-400 uppercase mb-3">
          Time: {label}:00
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#DC3173]" />
              <span className="text-sm text-slate-600">Orders</span>
            </div>
            <span className="text-sm font-mono font-bold text-slate-800">
              {orders}
            </span>
          </div>
          <div className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2563eb]" />
              <span className="text-sm text-slate-600">Riders</span>
            </div>
            <span className="text-sm font-mono font-bold text-slate-800">
              {riders}
            </span>
          </div>

          {shortage > 0 && (
            <div className="mt-2 pt-2 border-t border-rose-100 flex items-center justify-between text-rose-600">
              <span className="text-xs font-bold uppercase">Shortage</span>
              <span className="text-sm font-black">{shortage}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function RiderDemandGapChart({
  riderDemandGap,
}: {
  riderDemandGap: TPeakHoursAnalysis["riderDemandGap"];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Rider Demand vs Availability
          </h3>
          <p className="text-sm text-gray-500">
            Hourly comparison of required vs available supply
          </p>
        </div>

        {riderDemandGap.some((d) => d.shortage > 0) && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-rose-700 uppercase tracking-tight">
              Shortage Detected
            </span>
          </div>
        )}
      </div>

      <div style={{ height: 350 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={riderDemandGap}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              tickFormatter={(val) => `${val}h`}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#f8fafc", radius: 8 }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: "20px" }}
              formatter={(value) => (
                <span className="text-xs font-bold text-slate-500 uppercase ml-1">
                  {value === "orders" ? "Demand (Orders)" : "Supply (Riders)"}
                </span>
              )}
            />

            <Bar
              dataKey="orders"
              fill="#DC3173"
              radius={[4, 4, 0, 0]}
              name="orders"
              animationDuration={1000}
            />

            <Bar
              dataKey="activeRiders"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              name="activeRiders"
              animationDuration={1200}
            />

            <ReferenceLine y={0} stroke="#cbd5e1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
            Total Demand
          </p>
          <p className="text-2xl font-mono font-bold text-slate-800">
            {riderDemandGap
              .reduce((acc, curr) => acc + curr.orders, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="flex-1 min-w-[200px] p-4 bg-rose-50/50 rounded-xl border border-rose-100">
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1">
            Total Shortage
          </p>
          <p className="text-2xl font-mono font-bold text-rose-600">
            {riderDemandGap
              .reduce((acc, curr) => acc + curr.shortage, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
