"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TDeliveryPartnerPerformance } from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { BikeIcon, EuroIcon, Star, TruckIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const deliveryPartner: TDeliveryPartnerPerformance = {
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

export default function DeliveryPartnerPerformanceDetails() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header */}
      <TitleHeader
        title="Moin Hasan Performance"
        subtitle="Delivery Partner Performance Details"
        onBackClick={() => router.push("/admin/delivery-partner-performance")}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Deliveries"
          value={deliveryPartner.operationalData?.totalDeliveries || 0}
          icon={TruckIcon}
          delay={0.1}
        />
        <StatsCard
          title="Completed Deliveries"
          value={deliveryPartner.operationalData?.completedDeliveries || 0}
          icon={BikeIcon}
          delay={0.3}
        />
        <StatsCard
          title="Avg Rating"
          value={deliveryPartner.operationalData?.rating?.average || 0.0}
          icon={Star}
          delay={0.2}
        />
        <StatsCard
          title="Total Earnings"
          value={`€${formatPrice(deliveryPartner.totalEarnings || 0)}`}
          icon={EuroIcon}
          delay={0}
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
              Orders Performance
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
          dataKey="orders"
          height={300}
        />
      </motion.div>
    </div>
  );
}
