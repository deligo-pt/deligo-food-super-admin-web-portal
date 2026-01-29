"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface IProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  delay = 0,
}: IProps) {
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
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-[#DC3173]/10 rounded-xl text-[#DC3173]">
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
}
