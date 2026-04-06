"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TTopVendors } from "@/types/analytics/top-vendors.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { Star, Store, TrendingUp, XCircle } from "lucide-react";

interface IProps {
  topVendors: TTopVendors;
}

export default function TopVendorsPage({ topVendors }: IProps) {
  const totalVendors = topVendors.vendorPerformance.length;

  const topVendor = topVendors.topSellingVendors[0];

  const avgRating =
    topVendors.vendorPerformance.reduce((acc, v) => acc + v.averageRating, 0) /
    totalVendors;

  const avgCancelRate =
    topVendors.vendorPerformance.reduce((acc, v) => acc + v.cancelRate, 0) /
    totalVendors;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <TitleHeader
        title="Top Vendors"
        subtitle="Vendor ranking and performance insights"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Vendors" value={totalVendors} icon={Store} />
        <StatsCard
          title="Top Vendor"
          value={topVendor?.vendorName || "-"}
          icon={TrendingUp}
          delay={0.1}
        />
        <StatsCard
          title="Avg Rating"
          value={avgRating.toFixed(1)}
          icon={Star}
          delay={0.2}
        />
        <StatsCard
          title="Avg Cancel Rate"
          value={`${avgCancelRate.toFixed(1)}%`}
          icon={XCircle}
          delay={0.3}
        />
      </div>

      {/* Top Selling Vendors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Top Selling Vendors
        </h3>

        <div className="space-y-4">
          {topVendors.topSellingVendors.map((vendor, i) => (
            <div
              key={vendor.vendorId}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {i + 1}. {vendor.vendorName}
                </p>
                <p className="text-sm text-gray-500">
                  {vendor.totalOrders} orders
                </p>
              </div>

              <p className="font-bold text-[#DC3173]">
                €{formatPrice(vendor.totalRevenue)}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Revenue by Vendor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Revenue by Vendor
        </h3>

        <AnalyticsChart
          data={topVendors.topSellingVendors}
          type="bar"
          dataKey="totalRevenue"
          xKey="vendorName"
          height={220}
        />
      </motion.div>

      {/* Vendor Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Vendor Performance
        </h3>

        <div className="space-y-4">
          {topVendors.vendorPerformance.map((vendor) => (
            <div
              key={vendor.vendorId}
              className="p-4 rounded-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900 text-lg">
                  {vendor.vendorName}
                </p>
                <p className="text-[#DC3173] font-bold">
                  €{formatPrice(vendor.totalRevenue)}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600 space-y-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Orders
                  </h3>
                  <p className="text-gray-500">{vendor.totalOrders}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Rating
                  </h3>
                  <p className="text-gray-500">
                    €{formatPrice(vendor.averageRating)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Prep Time
                  </h3>
                  <p className="text-gray-500">{vendor.preparationTime} min</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Cancel Rate
                  </h3>
                  <p className="text-gray-500">{vendor.cancelRate}%</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Satisfaction
                  </h3>
                  <p className="text-gray-500">{vendor.satisfactionScore}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rating Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Rating Distribution
        </h3>

        <AnalyticsChart
          data={topVendors.ratingDistribution}
          type="bar"
          dataKey="rating"
          xKey="vendorName"
          height={200}
        />
      </motion.div>
    </div>
  );
}
