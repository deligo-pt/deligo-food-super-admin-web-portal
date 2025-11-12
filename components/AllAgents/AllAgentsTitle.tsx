"use client";

import { motion } from "framer-motion";

export default function AllAgentsTitle() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl md:text-3xl font-semibold text-gray-800"
    >
      All Fleet Managers
    </motion.h1>
  );
}
