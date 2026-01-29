"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/VendorPerformance/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  Award,
  Clock,
  EuroIcon,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";

const topVendors = [
  {
    _id: "1",
    businessDetails: {
      businessName: "Fry Express",
    },
    rating: { average: 4.9 },
    profilePhoto: "",
    revenue: 15200,
  },
  {
    _id: "2",
    businessDetails: {
      businessName: "Pizza Palace",
    },
    rating: { average: 4.8 },
    profilePhoto: "",
    revenue: 12500,
  },
  {
    _id: "3",
    businessDetails: {
      businessName: "Burger Barn",
    },
    rating: { average: 4.8 },
    profilePhoto: "",
    revenue: 11300,
  },
];

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

const totalCounts = {
  totalOrders: 1907,
  totalRevenue: 80300,
  avgRating: 4.7,
  totalProducts: 205,
};

export function VendorPerformance() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-50/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <TitleHeader
          title="Vendor Performance Analytics"
          subtitle="Comprehensive insights into restaurant performance and trends"
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Revenue"
            value={`€${totalCounts.totalRevenue.toLocaleString()}`}
            icon={EuroIcon}
            delay={0}
          />
          <StatsCard
            title="Total Orders"
            value={totalCounts.totalOrders}
            icon={ShoppingBag}
            delay={0.1}
          />
          <StatsCard
            title="Avg Rating"
            value={totalCounts.avgRating}
            icon={Star}
            delay={0.2}
          />
          <StatsCard
            title="Total Products"
            value={totalCounts.totalProducts}
            icon={Clock}
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              delay: 0.6,
            }}
            className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#DC3173]/20 text-[#DC3173] rounded-lg">
                <TrendingUp size={20} />
              </div>
              <span className="font-medium">Most Orders</span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=76&q=80"
                    alt="Avatar"
                  />
                  <AvatarFallback>AT</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <p className="text-xl text-gray-800 font-semibold">
                  ABC Town Town
                </p>
                <p className="text-[#DC3173]">1,520 orders this month</p>
              </div>
            </div>
          </motion.div>
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
              delay: 0.5,
            }}
            className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#DC3173]/20 text-[#DC3173] rounded-lg">
                <Star size={20} />
              </div>
              <span className="font-medium">Highest Rated</span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=76&q=80"
                    alt="Avatar"
                  />
                  <AvatarFallback>PH</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <p className="text-xl text-gray-800 font-bold">Pizza Hut</p>
                <p className="text-[#DC3173]">4.9 stars (780 reviews)</p>
              </div>
            </div>
          </motion.div>
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
              delay: 0.4,
            }}
            className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#DC3173]/20 text-[#DC3173] rounded-lg">
                <EuroIcon size={20} />
              </div>
              <span className="font-medium">Highest Revenue</span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=76&q=80"
                    alt="Avatar"
                  />
                  <AvatarFallback>AT</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <p className="text-xl text-gray-800 font-bold">Kawan Dreams</p>
                <p className="text-[#DC3173]">€15,200</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
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
                  <div className="w-3 h-3 rounded-full bg-brand-500" />
                  <span className="text-gray-600">Orders</span>
                </div>
              </div>
            </div>
            <AnalyticsChart
              data={weeklyOrdersData}
              type="area"
              dataKey="orders"
              height={250}
            />
          </motion.div>

          {/* Top Performers */}
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
              delay: 0.3,
            }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-brand-500" size={20} />
              <h3 className="text-lg font-bold text-gray-900">
                Top Performers
              </h3>
            </div>
            <div className="space-y-4">
              {topVendors.map((vendor, index) => (
                <div
                  key={vendor._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-yellow-100 text-yellow-700" : index === 1 ? "bg-gray-200 text-gray-600" : "bg-amber-100 text-amber-700"}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={vendor.profilePhoto}
                        alt={vendor.businessDetails?.businessName}
                      />
                      <AvatarFallback>
                        {vendor.businessDetails?.businessName
                          ?.split(" ")
                          .map((name) => name.charAt(0))
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {vendor.businessDetails?.businessName}
                    </p>
                    <p className="text-xs text-gray-500">
                      €{vendor.revenue.toLocaleString()} revenue
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium">
                      {vendor.rating?.average}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
