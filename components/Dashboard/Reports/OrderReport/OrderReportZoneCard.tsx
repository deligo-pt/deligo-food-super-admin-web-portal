"use client";

import { motion } from "framer-motion";
import { MapPin, PackageIcon } from "lucide-react";

interface IProps {
  zone: string;
  orders: number;
  delay?: number;
}

export default function OrderReportZoneCard({
  zone,
  orders,
  delay = 0,
}: IProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.3,
        delay,
      }}
      whileHover={{
        y: -4,
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `#DC317320`,
              }}
            >
              <MapPin
                size={20}
                style={{
                  color: "#DC3173",
                }}
              />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{zone}</h3>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Orders</p>
          <div className="flex items-center gap-1.5">
            <PackageIcon size={16} className="text-[#DC3173]" />
            <p className="font-semibold text-gray-800">{orders}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
