"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface IProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  className = "",
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
        duration: 0.5,
        delay: delay,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{
        y: -4,
        transition: {
          duration: 0.2,
        },
      }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-[#DC3173]/5 transition-shadow duration-300 ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#DC3173]/10 rounded-xl text-[#DC3173]">
            <Icon size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 font-medium">{description}</p>
            )}
          </div>
        </div>

        <div className="space-y-5">{children}</div>
      </div>
    </motion.div>
  );
}
