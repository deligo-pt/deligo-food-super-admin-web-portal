"use client";

import TopProducts from "@/components/Dashboard/Dashboard/TopProducts";
import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TTopRatedItems } from "@/types/analytics.type";
import { TVendorPerformance } from "@/types/performance.type";
import { motion } from "framer-motion";
import { Clock, EuroIcon, ShoppingBag, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const vendor: TVendorPerformance = {
  _id: "1",
  email: "fry.express@mail.com",
  status: "APPROVED",
  userId: "V-12skdb",
  businessDetails: {
    businessName: "Fry Express",
    businessType: "Fast Food",
    totalBranches: 5,
  },
  businessLocation: {
    street: "Narsingdi, Bangladesh",
    city: "Dhaka",
    state: "Dhaka",
    country: "Bangladesh",
    postalCode: "1216",
  },
  name: {
    firstName: "Fry",
    lastName: "Express",
  },
  rating: { average: 4.3, totalReviews: 120 },
  profilePhoto: "",
  totalItems: 200,
  totalOrders: 245,
  totalRevenue: 15200,
};

const weeklyOrdersData = [
  {
    name: "Mon",
    orders: 245,
    revenue: 8500,
  },
  {
    name: "Tue",
    orders: 312,
    revenue: 10200,
  },
  {
    name: "Wed",
    orders: 287,
    revenue: 9400,
  },
  {
    name: "Thu",
    orders: 356,
    revenue: 11800,
  },
  {
    name: "Fri",
    orders: 428,
    revenue: 14200,
  },
  {
    name: "Sat",
    orders: 512,
    revenue: 17500,
  },
  {
    name: "Sun",
    orders: 389,
    revenue: 12800,
  },
];

const topRatedItems: TTopRatedItems[] = [
  {
    _id: "1",
    name: "Burger",
    images: ["https://admin-food.deligo.pt/deligoLogo.png"],
    rating: {
      average: 4.7,
    },
    totalOrders: 50,
  },
  {
    _id: "2",
    name: "Pizza",
    images: ["https://admin-food.deligo.pt/deligoLogo.png"],
    rating: {
      average: 4.9,
    },
    totalOrders: 36,
  },
  {
    _id: "3",
    name: "Sandwich",
    images: ["https://admin-food.deligo.pt/deligoLogo.png"],
    rating: {
      average: 4.5,
    },
    totalOrders: 12,
  },
];

export function VendorPerformanceDetails() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <TitleHeader
        title="Fry Express Performance"
        subtitle="Vendor Performance Details"
        onBackClick={() => router.push("/admin/vendor-performance")}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Revenue"
          value={`€${vendor.totalRevenue?.toLocaleString()}`}
          icon={EuroIcon}
          delay={0}
        />
        <StatsCard
          title="Total Orders"
          value={vendor.totalOrders || 0}
          icon={ShoppingBag}
          delay={0.1}
        />
        <StatsCard
          title="Avg Rating"
          value={vendor.rating?.average || 0.0}
          icon={Star}
          delay={0.2}
        />
        <StatsCard
          title="Total Products"
          value={vendor.totalItems || 0}
          icon={Clock}
          delay={0.3}
        />
      </div>

      {/* Chart */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.2,
        }}
        className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Orders & Revenue Trend
            </h3>
            <p className="text-sm text-gray-500">
              Daily performance over the past week
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#DC3173]" />
              <span className="text-gray-600">Orders</span>
            </div>
          </div>
        </div>
        <AnalyticsChart
          data={weeklyOrdersData}
          type="bar"
          dataKey="orders"
          height={300}
        />
      </motion.div>

      {/* Top Rated Items */}
      <TopProducts topRatedItems={topRatedItems} />
    </div>
  );
}
