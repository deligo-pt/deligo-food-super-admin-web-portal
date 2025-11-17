"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({
  title,
  value,
  description,
  icon,
  color,
}: StatCardProps) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow p-6 border border-gray-100"
      whileHover={{
        y: -5,
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-600 font-medium">{title}</h3>
          <p className="text-4xl font-bold mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div
          className="p-3 rounded-full"
          style={{
            backgroundColor: `${color}20`,
          }}
        >
          <div className="text-[#DC3173]">{icon}</div>
        </div>
      </div>
    </motion.div>
  );
};
export default StatCard;
