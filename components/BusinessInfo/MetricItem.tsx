"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";

interface IProps {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
  delay: number;
  status?: "online" | "active";
}

export default function MetricItem({
  label,
  count,
  icon: Icon,
  color,
  delay,
  status,
}: IProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.5,
        delay,
      }}
      className="flex items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`p-3 rounded-full mr-4 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <h4 className="text-2xl font-bold text-gray-900">
          {count.toLocaleString()}
        </h4>
      </div>
      {status && (
        <div className="flex flex-col items-end justify-center h-full">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-100">
            <motion.div
              animate={{
                opacity: [1, 0.4, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Circle size={8} className="fill-green-500 text-green-500" />
            </motion.div>
            <span className="text-xs font-semibold text-green-700 capitalize">
              {status}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
