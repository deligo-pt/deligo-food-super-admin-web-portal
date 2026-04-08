"use client";

import { TTopVendors } from "@/types/analytics/top-vendors.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { Medal, Package, Store, TrendingUp } from "lucide-react";

interface IProps {
  topSellingVendors: TTopVendors["topSellingVendors"];
}

export default function TopSellingVendors({ topSellingVendors }: IProps) {
  const sortedVendors = [...topSellingVendors].sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  );

  const maxRevenue =
    sortedVendors.length > 0 ? sortedVendors[0].totalRevenue : 0;

  return (
    <motion.div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Top Selling Vendors
          </h3>
          <p className="text-sm text-gray-500">Revenue and volume leaders</p>
        </div>
        <div className="bg-emerald-50 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-slate-50">
              <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Vendor
              </th>
              <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Orders
              </th>
              <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedVendors.map((vendor, index) => (
              <tr
                key={vendor.vendorId}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                {/* Vendor Info */}
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Store className="w-5 h-5 text-slate-500" />
                      </div>
                      {index < 3 && (
                        <div
                          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm
                          ${index === 0 ? "bg-amber-400" : index === 1 ? "bg-slate-300" : "bg-orange-400"}`}
                        >
                          <Medal className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {vendor.vendorName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">
                        ID: {vendor.vendorId.slice(-6)}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Orders Volume */}
                <td className="py-4 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Package className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-sm font-bold font-mono">
                        {vendor.totalOrders}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Revenue & Progress Bar */}
                <td className="py-4 text-right">
                  <div className="flex flex-col items-end">
                    <div className="text-[#DC3173] font-black text-sm">
                      €{formatPrice(vendor.totalRevenue)}
                    </div>
                    <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(vendor.totalRevenue / maxRevenue) * 100}%`,
                        }}
                        className="h-full bg-emerald-400 rounded-full"
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
