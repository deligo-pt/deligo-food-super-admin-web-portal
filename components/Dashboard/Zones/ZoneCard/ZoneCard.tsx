"use client";

import { USER_ROLE } from "@/consts/user.const";
import { motion } from "framer-motion";
import { MapIcon, MapPin } from "lucide-react";

interface IProps {
  name: string;
  total: number;
  userType: typeof USER_ROLE.VENDOR | typeof USER_ROLE.FLEET_MANAGER;
  isOperational: boolean;
  delay?: number;
}

export default function ZoneCard({
  name,
  total,
  userType,
  isOperational,
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
      <div
        className="h-2"
        style={{
          backgroundColor: "#DC3173",
        }}
      />
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
            <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${isOperational ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            {isOperational ? "Operational" : "Not Operational"}
          </span>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">
            {userType === USER_ROLE.FLEET_MANAGER && "Fleet Managers"}
            {userType === USER_ROLE.VENDOR && "Vendors"}
          </p>
          <div className="flex items-center gap-1.5">
            <MapIcon size={16} className="text-[#DC3173]" />
            <p className="font-semibold text-gray-800">{total}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
