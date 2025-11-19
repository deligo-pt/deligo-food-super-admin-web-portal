"use client";

import { motion } from "framer-motion";
import { ElementType, ReactNode } from "react";

interface IProps {
  title: string;
  icon: ElementType;
  children: ReactNode;
  delay?: number;
}

export function ProfileSection({
  title,
  icon: Icon,
  children,
  delay = 0,
}: IProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
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
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#DC3173] to-[#FF6B9D] flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}
