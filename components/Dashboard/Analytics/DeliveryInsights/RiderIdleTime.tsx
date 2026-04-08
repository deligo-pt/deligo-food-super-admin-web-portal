"use client";

import { TDeliveryInsights } from "@/types/analytics/delivery-insights.type";
import { motion } from "framer-motion";
import { Activity, Coffee, Timer, User } from "lucide-react";

interface IProps {
  riderIdleTime: TDeliveryInsights["riderIdleTime"];
}

export default function RiderIdleTime({ riderIdleTime }: IProps) {
  // Sorting riders by highest idle time first for better analytical value
  const sortedRiders = [...riderIdleTime].sort(
    (a, b) => b.idleTimeMinutes - a.idleTimeMinutes,
  );

  return (
    <motion.div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity size={18} /> Rider Idle Time
          </h3>
        </div>
        <div className="bg-orange-50 p-2 rounded-lg">
          <Coffee className="w-5 h-5 text-orange-500" />
        </div>
      </div>

      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedRiders.map((rider, index) => {
          // Calculate color intensity based on time (e.g., > 60 mins is "Warning" zone)
          const isHighIdle = rider.idleTimeMinutes > 60;
          const barColor = isHighIdle ? "bg-orange-500" : "bg-blue-500";

          return (
            <motion.div
              key={rider.riderId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <User className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 leading-none">
                      {rider.riderName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                      ID: {rider.riderId.slice(-6)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-slate-900 font-mono font-bold">
                    <Timer
                      className={`w-3.5 h-3.5 ${isHighIdle ? "text-orange-500" : "text-blue-500"}`}
                    />
                    <span>{rider.idleTimeMinutes}</span>
                    <span className="text-[10px] text-slate-400 font-normal underline decoration-dotted">
                      min
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Background */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((rider.idleTimeMinutes / 120) * 100, 100)}%`,
                  }} // Percent based on 2-hour max scale
                  className={`h-full rounded-full ${barColor} opacity-80 group-hover:opacity-100 transition-opacity`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
