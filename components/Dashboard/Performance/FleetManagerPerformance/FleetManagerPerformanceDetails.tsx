"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import TopRatedDeliveryPartners from "@/components/Dashboard/Performance/FleetManagerPerformance/TopDrivers";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TFleetPerformanceDetailsData } from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { Clock, EuroIcon, ShoppingBag, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  performanceData: TFleetPerformanceDetailsData;
}

export default function FleetManagerPerformanceDetails({
  performanceData,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <TitleHeader
        title={`${performanceData?.fleetPerformance?.name} ${t("performance_capital")}`}
        subtitle={t("fleet_manager_performance_details")}
        onBackClick={() => router.push("/admin/fleet-performance")}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title={t("total_earnings")}
          value={`€${formatPrice(performanceData?.fleetPerformance?.totalEarnings || 0)}`}
          icon={EuroIcon}
          delay={0}
        />
        <StatsCard
          title={t("total_deliveries")}
          value={performanceData?.fleetPerformance?.totalDeliveries || 0}
          icon={ShoppingBag}
          delay={0.1}
        />
        <StatsCard
          title={t("avg_rating")}
          value={performanceData?.fleetPerformance?.rating?.average || 0.0}
          icon={Star}
          delay={0.2}
        />
        <StatsCard
          title={t("total_drivers")}
          value={performanceData?.fleetPerformance?.totalDrivers || 0}
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
              {t("earnings_performance")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("daily_performance_over_7_days")}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#DC3173]" />
              <span className="text-gray-600">{t("earnings")}</span>
            </div>
          </div>
        </div>
        <AnalyticsChart
          data={performanceData?.fleetWeeklyPerformance}
          type="bar"
          dataKey="totalEarnings"
          xKey="day"
          height={300}
        />
      </motion.div>

      <TopRatedDeliveryPartners partners={performanceData?.topRatedDrivers} />
    </div>
  );
}
