"use client";

import { TDeliveryInsights } from "@/types/analytics/delivery-insights.type";
import { motion } from "framer-motion";
import { Bike, CheckCircle2, Clock, XCircle } from "lucide-react";

interface IProps {
  riderPerformance: TDeliveryInsights["riderPerformance"];
}

export default function RiderPerformance({ riderPerformance }: IProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Rider Performance
          </h3>
          <p className="text-sm text-gray-500">
            Deliveries handled by each rider
          </p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg">
          <Bike className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-h-[400px] overflow-y-auto space-y-4 pr-2 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {riderPerformance.map((rider) => {
          const successRate = Math.round(
            (rider.successfulDeliveries / rider.totalDeliveries) * 100,
          );

          return (
            <motion.div
              key={rider.riderId}
              variants={item}
              className="group relative p-4 border-2 border-slate-200 rounded-xl hover:border-[#DC3173]/70 hover:bg-blue-50/30 transition-all duration-200 h-full"
            >
              <div className="flex flex-col justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">
                    {rider.riderName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {rider.totalDeliveries} Total Deliveries
                  </p>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Success Rate
                    </span>
                    <span className="text-[10px] font-bold text-[#DC3173]">
                      {successRate}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${successRate}%` }}
                      className="h-full bg-[#DC3173] rounded-full"
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex justify-center items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-sm">
                        {rider.successfulDeliveries}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center">
                      Successfull Deliveries
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="flex justify-center items-center gap-1 text-rose-500 font-medium">
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="text-sm">
                        {rider.totalDeliveries - rider.successfulDeliveries}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center">
                      Failed Deliveries
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex justify-center items-center gap-1 text-indigo-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-sm">{rider.averageTime}m</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase text-center">
                      Avg Time
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
