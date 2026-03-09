"use client";

import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TTopVendorData } from "@/types/analytics.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion, Variants } from "framer-motion";
import {
  AwardIcon,
  EuroIcon,
  ShoppingBagIcon,
  StarIcon,
  StoreIcon,
} from "lucide-react";

const topVendorData: TTopVendorData = {
  stats: {
    activeVendors: 47,
    thisMonthTopRevenue: 220.1,
  },
  topVendors: [
    {
      rank: 1,
      name: "Fresh Bites Cafe",
      category: "Food & Beverage",
      revenue: 8420,
      orders: 342,
      rating: 4.9,
    },
    {
      rank: 2,
      name: "Green Grocery",
      category: "Grocery",
      revenue: 7180,
      orders: 289,
      rating: 4.8,
    },
    {
      rank: 3,
      name: "Pizza Palace",
      category: "Food & Beverage",
      revenue: 6950,
      orders: 267,
      rating: 4.7,
    },
    {
      rank: 4,
      name: "Pharma Plus",
      category: "Pharmacy",
      revenue: 5340,
      orders: 198,
      rating: 4.6,
    },
    {
      rank: 5,
      name: "Sushi Express",
      category: "Food & Beverage",
      revenue: 4890,
      orders: 176,
      rating: 4.8,
    },
    {
      rank: 6,
      name: "Tech Mart",
      category: "Electronics",
      revenue: 4210,
      orders: 134,
      rating: 4.5,
    },
    {
      rank: 7,
      name: "Burger Hub",
      category: "Food & Beverage",
      revenue: 3780,
      orders: 156,
      rating: 4.4,
    },
    {
      rank: 8,
      name: "Noodle House",
      category: "Food & Beverage",
      revenue: 3420,
      orders: 128,
      rating: 4.6,
    },
    {
      rank: 9,
      name: "Noodle House",
      category: "Food & Beverage",
      revenue: 3420,
      orders: 128,
      rating: 4.6,
    },
    {
      rank: 10,
      name: "Noodle House",
      category: "Food & Beverage",
      revenue: 3420,
      orders: 128,
      rating: 4.6,
    },
  ],
};

export default function TopVendors() {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (rank === 2) return "bg-gray-200 text-gray-700 border-gray-300";
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-gray-50 text-gray-500 border-gray-100";
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  } as Variants;

  return (
    <div className="min-h-screen p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <TitleHeader
          title="Top Vendors"
          subtitle="Vendors Performance leaderboard"
        />

        {/* Stat Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <StatsCard
            title="Active Vendors"
            value={topVendorData?.stats?.activeVendors || 0}
            icon={StoreIcon}
            delay={0.1}
          />
          <StatsCard
            title="Top Revenue (This Month)"
            value={`€${formatPrice(topVendorData?.stats?.thisMonthTopRevenue || 0)}`}
            icon={EuroIcon}
            delay={0.2}
          />
        </motion.div>

        {/* Vendor Leaderboard */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <AwardIcon className="w-5 h-5 text-[#DC3173]" />
            <h3 className="font-bold text-gray-900">Vendor Leaderboard</h3>
          </div>
          <div className="space-y-3">
            {topVendorData?.topVendors?.map((vendor) => (
              <div
                key={vendor.rank}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${getRankStyle(vendor.rank)}`}
                  >
                    {vendor.rank}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{vendor.name}</p>
                    <p className="text-xs text-gray-500">{vendor.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                      Orders
                    </p>
                    <p className="font-medium text-gray-900 flex items-center gap-1 justify-end">
                      <ShoppingBagIcon className="w-3.5 h-3.5 text-gray-400" />
                      {vendor.orders || 0}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                      Rating
                    </p>
                    <p className="font-medium text-gray-900 flex items-center gap-1 justify-end">
                      <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {vendor.rating || 0}
                    </p>
                  </div>
                  <div className="text-right min-w-20">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                      Revenue
                    </p>
                    <p className="font-bold text-[#DC3173]">
                      €{formatPrice(vendor.revenue || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
