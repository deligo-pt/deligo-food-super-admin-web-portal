"use client";

import { TDeliveryInsights } from "@/types/analytics/delivery-insights.type";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface IProps {
  areaPerformance: TDeliveryInsights["areaPerformance"];
}

export default function AreaPerformance({ areaPerformance }: IProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin size={18} /> Area Performance
      </h3>

      <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2">
        {areaPerformance.map((area) => (
          <div
            key={area.area}
            className="p-3 rounded-xl border border-gray-100 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-gray-900">{area.area}</p>
              <p className="text-xs text-gray-500">
                Late: {area.latePercentage}%
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-[#DC3173]">{area.averageTime} min</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
