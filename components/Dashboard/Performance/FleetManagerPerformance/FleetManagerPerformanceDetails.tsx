"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TFleetManagerPerformance } from "@/types/performance.type";
import { motion } from "framer-motion";
import { Clock, EuroIcon, ShoppingBag, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const fleetManager: TFleetManagerPerformance = {
  _id: "3",
  email: "moin@mail.com",
  status: "APPROVED",
  userId: "FM-33skdb",
  name: {
    firstName: "Moin",
    lastName: "Khan",
  },
  address: {
    street: "Narsingdi, Bangladesh",
    city: "Dhaka",
    state: "Dhaka",
    country: "Bangladesh",
    postalCode: "1216",
  },
  operationalData: {
    totalDrivers: 15,
    activeVehicles: 12,
    rating: {
      average: 4.5,
      totalReviews: 150,
    },
    totalDeliveries: 500,
  },
  totalEarnings: 18000,
};

const weeklyEarnings = [
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

export function FleetManagerPerformanceDetails() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header */}
      <TitleHeader
        title="Fry Express Performance"
        subtitle="Fleet Manager Performance Details"
        onBackClick={() => router.push("/admin/fleet-performance")}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Earnings"
          value={`€${fleetManager.totalEarnings?.toLocaleString()}`}
          icon={EuroIcon}
          delay={0}
        />
        <StatsCard
          title="Total Deliveries"
          value={fleetManager.operationalData?.totalDeliveries || 0}
          icon={ShoppingBag}
          delay={0.1}
        />
        <StatsCard
          title="Avg Rating"
          value={fleetManager.operationalData?.rating?.average || 0.0}
          icon={Star}
          delay={0.2}
        />
        <StatsCard
          title="Total Drivers"
          value={fleetManager.operationalData?.totalDrivers || 0}
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
              Earings Performance
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
          data={weeklyEarnings}
          type="bar"
          dataKey="revenue"
          height={300}
        />
      </motion.div>
    </div>
  );
}
