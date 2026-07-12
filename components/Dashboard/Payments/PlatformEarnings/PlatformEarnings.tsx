"use client";

import PlatformEarningsTable from "@/components/Dashboard/Payments/PlatformEarnings/PlatformEarningTable";
import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TPlaformEarningsData } from "@/types/payment.type";
import { formatPrice } from "@/utils/formatPrice";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion, Variants } from "framer-motion";
import {
  CalendarIcon,
  EuroIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";

interface IProps {
  platformsEarningsData: { data: TPlaformEarningsData; meta?: TMeta };
}

const sortFields = ["newest", "oldest"] as SortOptionKey[];

export default function PlatformEarnings({ platformsEarningsData }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t, sortFields);
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
    <div className="min-h-screen">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <TitleHeader
          title={t("platform_earnings")}
          subtitle={t("revenue_commissions_platform_fee_analytics")}
        />

        {/* Stat Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title={t("total_revenue")}
            value={`€${formatPrice(platformsEarningsData?.data?.stats?.totalRevenue || 0)}`}
            icon={EuroIcon}
            delay={0.2}
          />
          <StatsCard
            title={t("platform_commission")}
            value={`€${formatPrice(platformsEarningsData?.data?.stats?.totalPlatformCommission || 0)}`}
            icon={TrendingUpIcon}
            delay={0.4}
          />
          <StatsCard
            title={t("this_week_commission")}
            value={`€${formatPrice(platformsEarningsData?.data?.stats?.thisWeekCommission || 0)}`}
            icon={WalletIcon}
            delay={0.6}
          />
          <StatsCard
            title={t("this_month_commission")}
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
            {t("monthly_commissions")}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {t("last_6_months_commission_chart")}
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
              <h2 className="text-lg font-bold text-gray-900">{t("commissions")}</h2>
              <p className="text-sm text-gray-500">{platformsEarningsData?.meta?.total} {t("commissions_in_total")}</p>
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
