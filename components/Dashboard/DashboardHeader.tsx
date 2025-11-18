"use client";

import { motion } from "framer-motion";

const DashboardHeader = () => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      <h1 className="text-3xl font-bold">
        Hello, <span className="text-[#DC3173]">Administrator</span>
      </h1>
      <p className="text-gray-500 mt-1">
        Welcome to your food delivery dashboard overview
      </p>
    </motion.div>
  );
};
export default DashboardHeader;
