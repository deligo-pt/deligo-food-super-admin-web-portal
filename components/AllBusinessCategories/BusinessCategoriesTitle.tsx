"use client";

import { motion } from "framer-motion";

export default function CategoriesTitle() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl md:text-3xl font-semibold"
    >
      <div className="bg-linear-to-r from-[#DC3173] to-[#FF6CAB] p-6 rounded-lg mb-6 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Business Categories
        </h1>
        <p className="text-pink-100 mt-1">
          Manage your all business categories
        </p>
      </div>
    </motion.h1>
  );
}
