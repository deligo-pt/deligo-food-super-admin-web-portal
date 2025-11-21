"use client";

import { motion } from "framer-motion";

export default function AllVendorsTitle() {
  return (
    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-linear-to-r from-[#DC3173] to-[#FF6CAB] p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Vendors
            </h1>
            <p className="text-pink-100 mt-1">Manage your all vendors</p>
          </div>
        </div>
      </div>
    </motion.h1>
  );
}
