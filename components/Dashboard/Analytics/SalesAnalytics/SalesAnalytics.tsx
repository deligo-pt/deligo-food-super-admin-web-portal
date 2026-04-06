"use client";

import StatusDistributionCard from "@/components/common/StatusDistributionCard";
import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TSalesAnalytics } from "@/types/analytics/sales-analytics.type";
import { formatPrice } from "@/utils/formatPrice";
import { removeUnderscore } from "@/utils/formatter";
import { motion } from "framer-motion";
import {
  BarChart3,
  EuroIcon,
  MapPin,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";

interface IProps {
  salesAnalytics: TSalesAnalytics;
}

export default function SalesAnalyticsPage({ salesAnalytics }: IProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <TitleHeader
        title="Sales Analytics"
        subtitle="Overview of revenue, orders, and business performance"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Orders"
          value={salesAnalytics.summary.totalOrders}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Total Revenue"
          value={`€${formatPrice(salesAnalytics.summary.totalRevenue)}`}
          icon={EuroIcon}
          delay={0.1}
        />
        <StatsCard
          title="Avg Order Value"
          value={`€${formatPrice(salesAnalytics.summary.averageOrderValue)}`}
          icon={TrendingUp}
          delay={0.2}
        />
        <StatsCard
          title="Growth Rate"
          value={`${salesAnalytics.summary.growthRate}%`}
          icon={BarChart3}
          delay={0.3}
        />
      </div>

      {/* Monthly Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Monthly Revenue
        </h3>
        <p className="text-sm text-gray-500 mb-6">Revenue trend over months</p>

        <AnalyticsChart
          data={salesAnalytics.monthly}
          type="area"
          dataKey="revenue"
          xKey="label"
          height={220}
        />
      </motion.div>

      {/* Daily Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">Daily Orders</h3>
        <p className="text-sm text-gray-500 mb-6">
          Orders distribution over last 7 days
        </p>

        <AnalyticsChart
          data={salesAnalytics.daily}
          type="bar"
          dataKey="orders"
          xKey="label"
          height={200}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status</h3>

          <div className="space-y-3">
            <StatusDistributionCard
              name="Completed"
              value={salesAnalytics.statusDistribution.completed}
              color="#22C55E"
            />
            <StatusDistributionCard
              name="Cancelled"
              value={salesAnalytics.statusDistribution.cancelled}
              color="#EF4444"
            />
          </div>
        </motion.div>

        {/* Payment Split */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Payment Methods
          </h3>

          <div className="space-y-3">
            {salesAnalytics.paymentSplit.map((item, i) => (
              <StatusDistributionCard
                key={i}
                name={removeUnderscore(item.method)}
                value={item.count}
                color="#DC3173"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        {/* Revenue by Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} /> Revenue by Location
          </h3>

          <AnalyticsChart
            data={salesAnalytics.revenueByLocation}
            type="bar"
            dataKey="revenue"
            xKey="location"
            height={200}
          />
        </motion.div>

        {/* Revenue by Vendor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Store size={18} /> Revenue by Vendor
          </h3>

          <AnalyticsChart
            data={salesAnalytics.revenueByVendor}
            type="bar"
            dataKey="revenue"
            xKey="vendorName"
            height={200}
          />
        </motion.div>
      </div>
    </div>
  );
}
