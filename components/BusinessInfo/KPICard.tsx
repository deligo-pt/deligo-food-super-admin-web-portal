"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ElementType } from "react";

interface IProps {
  title: string;
  value: string | number;
  icon: ElementType;
  trend?: number;
  trendLabel?: string;
  delay?: number;
  prefix?: string;
  suffix?: string;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = "vs last month",
  delay = 0,
  prefix = "",
  suffix = "",
}: IProps) {
  const isPositive = trend && trend > 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay,
      }}
      whileHover={{
        y: -4,
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden group"
    >
      {/* Decorative background circle */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2 bg-primary-50 rounded-lg text-primary-500">
          <Icon size={24} strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
              isPositive
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={14} className="mr-1" />
            ) : (
              <ArrowDownRight size={14} className="mr-1" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            {prefix}
            {value}
            {suffix}
          </span>
        </div>
        {trendLabel && (
          <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>
        )}
      </div>
    </motion.div>
  );
}
