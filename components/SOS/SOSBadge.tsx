"use client";

import { motion } from "framer-motion";
interface IProps {
  count: number;
}

export function SOSBadge({ count }: IProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing Ring */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-full bg-[#DC3173] opacity-50"
      />

      {/* Main Badge */}
      <motion.div
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#DC3173] text-white shadow-lg ring-2 ring-white"
      >
        <span className="font-bold text-sm">{count}</span>
      </motion.div>
    </div>
  );
}
