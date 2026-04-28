"use client";

import { IOrderReportAnalytics } from "@/types/report.type";
import { motion } from "framer-motion";
import { useMemo } from "react";

const hours = Array.from({ length: 24 }, (_, i) => i);

interface IProps {
  zoneHeatmap: IOrderReportAnalytics["zoneHeatmap"];
}

export default function ZoneHeatmap({ zoneHeatmap }: IProps) {
  const processedData = useMemo(() => {
    const map: Record<string, Record<number, number>> = {};
    let maxOrders = 1;

    zoneHeatmap?.forEach(({ zone, hour, orderCount }) => {
      if (!map[zone]) map[zone] = {};
      map[zone][hour] = orderCount;
      if (orderCount > maxOrders) maxOrders = orderCount;
    });

    return { dataMap: map, maxOrders, zones: Object.keys(map) };
  }, [zoneHeatmap]);

  const { dataMap, maxOrders, zones } = processedData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-x-auto"
    >
      <h3 className="font-bold text-gray-900 mb-6">Zone Heatmap</h3>

      <div className="min-w-[1000px]">
        {/* Header: Hours */}
        <div className="grid grid-cols-[120px_repeat(24,1fr)] gap-1 mb-2">
          <div className="text-xs font-medium text-gray-400">Zones</div>
          {hours.map((h) => (
            <div
              key={h}
              className="text-[10px] font-medium text-gray-400 text-center"
            >
              {h}h
            </div>
          ))}
        </div>

        {/* Body: Rows per Zone */}
        <div className="space-y-1">
          {zones.map((zone) => (
            <div
              key={zone}
              className="grid grid-cols-[120px_repeat(24,1fr)] gap-1 items-center"
            >
              <div
                className="text-xs font-medium text-gray-600 truncate pr-2"
                title={zone}
              >
                {zone}
              </div>

              {hours.map((h) => {
                const count = dataMap[zone][h] || 0;
                // Calculate opacity based on max orders in the set
                const opacity =
                  count > 0 ? 0.1 + (count / maxOrders) * 0.9 : 0.05;

                return (
                  <div
                    key={h}
                    className="h-8 rounded-sm transition-all hover:ring-2 hover:ring-pink-300 cursor-pointer relative group"
                    style={{
                      backgroundColor:
                        count > 0
                          ? `rgba(220, 49, 115, ${opacity})`
                          : `#f9fafb`,
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-gray-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                      {zone} @ {h}:00 — {count} orders
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-6 text-xs text-gray-500">
          <span>Less Busy</span>
          <div className="flex gap-1">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((op) => (
              <div
                key={op}
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: `rgba(220, 49, 115, ${op})` }}
              />
            ))}
          </div>
          <span>Very Busy</span>
        </div>
      </div>
    </motion.div>
  );
}
