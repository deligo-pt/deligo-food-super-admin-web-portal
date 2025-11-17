"use client";

import { motion } from "framer-motion";
import React from "react";

interface StatusCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatusCard = ({ title, value, icon, color }: StatusCardProps) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow p-5 border border-gray-100"
      whileHover={{
        y: -5,
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
      }}
    >
      <div className="flex flex-col">
        <div
          className="p-2 rounded-full self-start mb-3"
          style={{
            backgroundColor: `${color}20`,
          }}
        >
          <div className="text-[#DC3173]">{icon}</div>
        </div>
        <h3 className="text-gray-600 font-medium">{title}</h3>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </motion.div>
  );
};
export default StatusCard;
