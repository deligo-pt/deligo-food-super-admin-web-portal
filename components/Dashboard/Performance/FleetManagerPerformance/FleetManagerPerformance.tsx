"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import FleetManagerPerformanceTable from "@/components/Dashboard/Performance/FleetManagerPerformance/FleetManagerPerformanceTable";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TFleetManagerPerformance } from "@/types/performance.type";
import { motion } from "framer-motion";
import { Award, EuroIcon, Star, TrendingUp } from "lucide-react";

const fleetManagerPerformance: TFleetManagerPerformance[] = [
  {
    _id: "1",
    email: "sk@gmail.com",
    status: "APPROVED",
    userId: "FM-12skdb",
    name: {
      firstName: "Sumon",
      lastName: "Kaysar",
    },
    profilePhoto: "",
    address: {
      street: "Narsingdi, Bangladesh",
      city: "Dhaka",
      state: "Dhaka",
      country: "Bangladesh",
      postalCode: "1216",
    },
    operationalData: {
      totalDrivers: 20,
      activeVehicles: 10,
      rating: {
        average: 4.3,
        totalReviews: 120,
      },
      totalDeliveries: 300,
    },
    totalEarnings: 20000,
  },
  {
    _id: "2",
    email: "hridoy@mail.com",
    status: "APPROVED",
    userId: "FM-21skdb",
    name: {
      firstName: "Hridoy",
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
      totalDrivers: 35,
      activeVehicles: 30,
      rating: {
        average: 4.9,
        totalReviews: 26,
      },
      totalDeliveries: 105,
    },
    totalEarnings: 12000,
  },
  {
    _id: "3",
    email: "moin@mail.com",
    status: "APPROVED",
    userId: "FM-33skdb",
    name: {
      firstName: "Abc",
      lastName: "Moin",
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

export function FleetManagerPerformance() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <TitleHeader
        title="Fleet Manager Performance Analytics"
        subtitle="Comprehensive insights into fleet manager performance"
      />

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
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=76&q=80"
                  alt="Avatar"
                />
                <AvatarFallback>NU</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-semibold">Nasir Uddin</p>
              <p className="text-[#DC3173] text-sm">1,520 orders this month</p>
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
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=76&q=80"
                  alt="Avatar"
                />
                <AvatarFallback>PH</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-bold">Polash Hossain</p>
              <p className="text-[#DC3173] text-sm">4.9 stars (780 reviews)</p>
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
            <span className="font-medium">Highest Earnings</span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=76&q=80"
                  alt="Avatar"
                />
                <AvatarFallback>AT</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-bold">Ahsan Tariq</p>
              <p className="text-[#DC3173] text-sm">€15,200</p>
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
                Earnings Performance
              </h3>
              <p className="text-sm text-gray-500">
                Daily performance over the past week
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#DC3173]" />
                <span className="text-gray-600">Earnings</span>
              </div>
            </div>
          </div>
          <AnalyticsChart
            data={weeklyOrdersData}
            type="bar"
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
            <Award className="text-[#DC3173]" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
          </div>
          <div className="space-y-4">
            {fleetManagerPerformance
              .sort(
                (a, b) =>
                  (b.operationalData?.rating?.average || 0) -
                  (a.operationalData?.rating?.average || 0),
              )
              .map((fleetManager, index) => (
                <div
                  key={fleetManager._id}
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
                        src={fleetManager.profilePhoto}
                        alt={`${fleetManager.name?.firstName} ${fleetManager.name?.lastName}`}
                      />
                      <AvatarFallback>
                        {fleetManager.name?.firstName?.charAt(0)}
                        {fleetManager.name?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {fleetManager.name?.firstName}{" "}
                      {fleetManager.name?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      €{fleetManager.totalEarnings?.toLocaleString()} earnings
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium">
                      {fleetManager.operationalData?.rating?.average}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Fleet Manager Performance Table */}
      <FleetManagerPerformanceTable fleetManagers={fleetManagerPerformance} />

      {/* Pagination */}
      {/* {!!fleetManagersResult?.meta?.totalPage && ( */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 md:px-6"
      >
        <PaginationComponent
          totalPages={3}
          // totalPages={fleetManagersResult?.meta?.totalPage as number}
        />
      </motion.div>
      {/* )} */}
    </div>
  );
}
