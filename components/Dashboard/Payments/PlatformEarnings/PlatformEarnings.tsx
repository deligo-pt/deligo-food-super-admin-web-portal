"use client";

import PlatformEarningsTable from "@/components/Dashboard/Payments/PlatformEarnings/PlatformEarningTable";
import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TPlaformEarningsData } from "@/types/payment.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion, Variants } from "framer-motion";
import {
  CalendarIcon,
  EuroIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

const platformsEarningsData: { data: TPlaformEarningsData; meta?: TMeta } = {
  data: {
    stats: {
      totalRevenue: 8420.23,
      totalPlatformCommission: 876.62,
      thisWeekCommission: 19.74,
      thisMonthCommission: 229.3,
    },
    monthlyCommissions: [
      {
        month: "Jul",
        commission: 1815,
      },
      {
        month: "Aug",
        commission: 2010,
      },
      {
        month: "Sep",
        commission: 1920,
      },
      {
        month: "Oct",
        commission: 2130,
      },
      {
        month: "Nov",
        commission: 2040,
      },
      {
        month: "Dec",
        commission: 1867,
      },
    ],
    commissions: [
      {
        _id: "SET-001",
        customer: {
          name: {
            firstName: "John",
            lastName: "Doe",
          },
        },
        transactionId: "SET-001",
        orderId: "ORD-001",
        amount: 10.5,
        platformFee: 2.5,
        createdAt: "2026-02-09T16:39:50.282Z",
      },
      {
        _id: "SET-002",
        customer: {
          name: {
            firstName: "John",
            lastName: "Doe",
          },
        },
        transactionId: "SET-002",
        orderId: "ORD-002",
        amount: 10.5,
        platformFee: 2.5,
        createdAt: "2026-02-09T16:39:50.282Z",
      },
      {
        _id: "SET-003",
        customer: {
          name: {
            firstName: "John",
            lastName: "Doe",
          },
        },
        transactionId: "SET-003",
        orderId: "ORD-003",
        amount: 10.5,
        platformFee: 2.5,
        createdAt: "2026-02-09T16:39:50.282Z",
      },
    ],
  },
  meta: {
    limit: 10,
    page: 1,
    total: 3,
    totalPage: 1,
  },
};

export default function PlatformEarnings() {
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
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <TitleHeader
          title="Platform Earnings"
          subtitle="Revenue, commissions & platform fee analytics"
        />

        {/* Stat Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Total Revenue"
            value={`€${formatPrice(platformsEarningsData?.data?.stats?.totalRevenue || 0)}`}
            icon={EuroIcon}
            delay={0.2}
          />
          <StatsCard
            title="Platform Commission"
            value={`€${formatPrice(platformsEarningsData?.data?.stats?.totalPlatformCommission || 0)}`}
            icon={TrendingUpIcon}
            delay={0.4}
          />
          <StatsCard
            title="This Week's Commission"
            value={`€${formatPrice(platformsEarningsData?.data?.stats?.thisWeekCommission || 0)}`}
            icon={WalletIcon}
            delay={0.6}
          />
          <StatsCard
            title="This Month's Commission"
            value={`€${formatPrice(platformsEarningsData?.data?.stats?.thisMonthCommission || 0)}`}
            icon={CalendarIcon}
            delay={0.8}
          />
        </motion.div>

        {/* Monthly Commssions Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Monthly Commssions
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Last 6 months commssion chart
          </p>
          <AnalyticsChart
            data={platformsEarningsData?.data?.monthlyCommissions || []}
            type="bar"
            dataKey="commission"
            xKey="month"
            height={200}
          />
        </motion.div>

        {/* Filters & Table */}
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
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#DC3173]/10 rounded-lg text-[#DC3173]">
              <EuroIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Commissions</h2>
              <p className="text-sm text-gray-500">10 Commissions in total</p>
            </div>
          </div>

          <AllFilters sortOptions={sortOptions} />

          <PlatformEarningsTable
            commissions={platformsEarningsData?.data?.commissions}
          />

          {!!platformsEarningsData?.meta?.totalPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PaginationComponent
                totalPages={platformsEarningsData?.meta?.totalPage as number}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
