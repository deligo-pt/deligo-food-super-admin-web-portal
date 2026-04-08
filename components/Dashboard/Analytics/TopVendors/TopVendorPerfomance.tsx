"use client";

import { TTopVendors } from "@/types/analytics/top-vendors.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { AlertCircle, Clock, ShoppingBag, Star, ThumbsUp } from "lucide-react";

interface IProps {
  vendorPerformance: TTopVendors["vendorPerformance"];
}

export default function TopVendorPerformance({ vendorPerformance }: IProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Vendor Performance</h3>
        <p className="text-sm text-slate-500">
          Deep dive into operational efficiency and quality
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {vendorPerformance.map((vendor) => (
          <motion.div
            key={vendor.vendorId}
            whileHover={{ y: -2 }}
            className="group p-5 border border-slate-100 rounded-2xl hover:border-blue-100 hover:shadow-md transition-all bg-white"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {vendor.vendorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {vendor.vendorName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ID: {vendor.vendorId.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">
                      {vendor.totalOrders} orders
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-[#DC3173]">
                    €{formatPrice(vendor.totalRevenue)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-[2]">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Rating
                  </p>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="text-sm font-bold text-slate-800">
                      {vendor.averageRating}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Avg Prep
                  </p>
                  <div
                    className={`flex items-center gap-1 font-bold ${vendor.preparationTime > 30 ? "text-rose-500" : "text-slate-700"}`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{vendor.preparationTime}m</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Satisfaction
                  </p>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{vendor.satisfactionScore}%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Cancellation
                  </p>
                  <div
                    className={`flex items-center gap-1 font-bold ${vendor.cancelRate > 5 ? "text-rose-600" : "text-slate-700"}`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{vendor.cancelRate}%</span>
                  </div>
                </div>
              </div>

              {/* <div className="flex items-center justify-end">
                <button className="p-2 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div> */}
            </div>

            <div className="mt-4 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${vendor.satisfactionScore}%` }}
                className={`h-full rounded-full ${vendor.satisfactionScore > 80 ? "bg-[#DC3173]" : "bg-amber-500"}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
