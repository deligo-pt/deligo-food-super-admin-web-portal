"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import DeliveryPartnerPerformanceTable from "@/components/Dashboard/Performance/DeliveryPartnerPerformance/DeliveryPartnerPerformanceTable";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TDeliveryPartnerPerformance,
  TPartnerPerformanceData,
} from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { Award, EuroIcon, Star, TrendingUp } from "lucide-react";

const partnerPerformance: TDeliveryPartnerPerformance[] = [
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
      rating: {
        average: 4.5,
        totalReviews: 150,
      },
      totalDeliveries: 500,
    },
    totalEarnings: 18000,
  },
];

interface IProps {
  partnerPerformanceData: TPartnerPerformanceData;
}

export default function DeliveryPartnerPerformance({
  partnerPerformanceData,
}: IProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <TitleHeader
        title="Delivery Partner Performance Analytics"
        subtitle="Comprehensive insights into delivery partner performance"
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
                  src={
                    partnerPerformanceData?.topCards?.mostOrders?.partnerPhoto
                  }
                  alt={
                    partnerPerformanceData?.topCards?.mostOrders?.partnerName
                  }
                />
                <AvatarFallback>
                  {partnerPerformanceData?.topCards?.mostOrders?.partnerName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-semibold">
                {partnerPerformanceData?.topCards?.mostOrders?.partnerName ||
                  "N/A"}
              </p>
              <p className="text-[#DC3173] text-sm">
                {partnerPerformanceData?.topCards?.mostOrders?.ordersCount?.toLocaleString()}{" "}
                orders this month
              </p>
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
                  src={
                    partnerPerformanceData?.topCards?.highestRated?.partnerPhoto
                  }
                  alt={
                    partnerPerformanceData?.topCards?.highestRated?.partnerName
                  }
                />
                <AvatarFallback>
                  {partnerPerformanceData?.topCards?.highestRated?.partnerName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-bold">
                {partnerPerformanceData?.topCards?.highestRated?.partnerName ||
                  "N/A"}
              </p>
              <p className="text-[#DC3173] text-sm">
                {partnerPerformanceData?.topCards?.highestRated?.rating
                  ?.average || 0}{" "}
                stars (
                {partnerPerformanceData?.topCards?.highestRated?.rating
                  ?.totalRatings || 0}{" "}
                reviews)
              </p>
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
                  src={
                    partnerPerformanceData?.topCards?.highestEarnings
                      ?.partnerPhoto
                  }
                  alt={
                    partnerPerformanceData?.topCards?.highestEarnings
                      ?.partnerName
                  }
                />
                <AvatarFallback>
                  {partnerPerformanceData?.topCards?.highestEarnings?.partnerName?.charAt(
                    0,
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-gray-800 font-bold">
                {partnerPerformanceData?.topCards?.highestEarnings
                  ?.partnerName || "N/A"}
              </p>
              <p className="text-[#DC3173] text-sm">
                €
                {formatPrice(
                  partnerPerformanceData?.topCards?.highestEarnings?.earnings ||
                    0,
                )}
              </p>
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
                Daily performance over the last week
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
            data={partnerPerformanceData?.earningsPerformance}
            type="bar"
            dataKey="earnings"
            xKey="name"
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
            {partnerPerformanceData?.topPerformers?.map((dp, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-yellow-100 text-yellow-700" : index === 1 ? "bg-gray-200 text-gray-600" : "bg-amber-100 text-amber-700"}`}
                >
                  {index + 1}
                </div>
                <div>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={dp.profilePhoto} alt={dp?.name} />
                    <AvatarFallback>{dp?.initials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {dp?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    €{dp.earnings?.toLocaleString()} earnings
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="font-medium">{dp.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* partner Performance Table */}
      <DeliveryPartnerPerformanceTable partners={partnerPerformance} />

      {/* Pagination */}
      {/* {!!partnersResult?.meta?.totalPage && ( */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 md:px-6"
      >
        <PaginationComponent
          totalPages={3}
          // totalPages={partnersResult?.meta?.totalPage as number}
        />
      </motion.div>
      {/* )} */}
    </div>
  );
}
