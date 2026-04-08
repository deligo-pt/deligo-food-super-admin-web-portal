"use client";

import RevenueByTopVendorChart from "@/components/Dashboard/Analytics/TopVendors/RevenueByTopVendorChart";
import TopSellingVendors from "@/components/Dashboard/Analytics/TopVendors/TopSellingVendors";
import TopVendorPerformance from "@/components/Dashboard/Analytics/TopVendors/TopVendorPerfomance";
import TopVendorRatingDistribution from "@/components/Dashboard/Analytics/TopVendors/TopVendorRatingDistribution";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TTopVendors } from "@/types/analytics/top-vendors.type";
import { Star, Store, TrendingUp, XCircle } from "lucide-react";

interface IProps {
  topVendors: TTopVendors;
}

export default function TopVendorsPage({ topVendors }: IProps) {
  console.log("Top Vendors Data:", topVendors);
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
      <TopSellingVendors topSellingVendors={topVendors.topSellingVendors} />

      {/* Revenue by Vendor */}
      <RevenueByTopVendorChart
        topSellingVendors={topVendors.topSellingVendors}
      />

      {/* Vendor Performance Table */}
      <TopVendorPerformance vendorPerformance={topVendors.vendorPerformance} />

      {/* Rating Distribution */}
      <TopVendorRatingDistribution
        ratingDistribution={topVendors.ratingDistribution}
      />
      {/* <motion.div
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
      </motion.div> */}
    </div>
  );
}
