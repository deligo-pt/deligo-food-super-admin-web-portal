"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import { TPartnerPerformanceDetailsData } from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  EuroIcon,
  Star,
  TruckIcon,
  XCircle,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  partnerPerformanceData: TPartnerPerformanceDetailsData;
}

export default function DeliveryPartnerPerformanceDetails({
  partnerPerformanceData,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const partner = partnerPerformanceData?.partnerPerformance;
  const monthlyData = partnerPerformanceData?.partnerMonthlyPerformance || [];

  const operational = partner?.operationalData;

  // Acceptance rate calculation
  const offered = operational?.totalOfferedOrders || 0;
  const accepted = operational?.totalAcceptedOrders || 0;
  const acceptanceRate =
    offered > 0 ? ((accepted / offered) * 100).toFixed(1) : "0";

  const getInitial = (name?: string) =>
    name && name !== "N/A" ? name.charAt(0).toUpperCase() : "?";

  const statusColor =
    partner?.status === "APPROVED"
      ? "bg-green-100 text-green-700"
      : partner?.status === "PENDING"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-600";

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <TitleHeader
        title={`${partner?.name || "Partner"} ${t("performance_capital")}`}
        subtitle={t("rider_performance_details")}
        onBackClick={() => router.back()}
        extraComponent={
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={partner?.profilePhoto || ""}
                alt={partner?.name || "Partner"}
              />
              <AvatarFallback>{getInitial(partner?.name)}</AvatarFallback>
            </Avatar>
            <Badge className={statusColor}>{partner?.status || "N/A"}</Badge>
          </div>
        }
      />

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title={t("total_deliveries")}
          value={partner?.totalDeliveries ?? 0}
          icon={TruckIcon}
          delay={0.1}
        />
        <StatsCard
          title={t("avg_rating")}
          value={partner?.rating ?? 0}
          icon={Star}
          delay={0.15}
        />
        <StatsCard
          title={t("total_earnings")}
          value={`€${formatPrice(partner?.totalEarnings ?? 0)}`}
          icon={EuroIcon}
          delay={0.2}
        />
        <StatsCard
          title={t("disbursed_earnings") || "Disbursed"}
          value={`€${formatPrice(partner?.disbursedEarnings ?? 0)}`}
          icon={EuroIcon}
          delay={0.25}
        />
      </div>

      {/* Operational Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title={t("completed_deliveries") || "Completed"}
          value={operational?.completedDeliveries ?? 0}
          icon={CheckCircle2}
          delay={0.3}
        />
        <StatsCard
          title={t("canceled_deliveries") || "Canceled"}
          value={operational?.canceledDeliveries ?? 0}
          icon={XCircle}
          delay={0.35}
        />
        <StatsCard
          title={t("acceptance_rate") || "Acceptance Rate"}
          value={`${acceptanceRate}%`}
          icon={Activity}
          delay={0.4}
        />
        <StatsCard
          title={t("current_status") || "Current Status"}
          value={operational?.currentStatus || "IDLE"}
          icon={Activity}
          delay={0.45}
        />
      </div>

      {/* Monthly Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {t("orders_performance")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("monthly_performance_over_the_last_6_months")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-[#DC3173]" />
            <span className="text-gray-600">{t("orders_lg")}</span>
          </div>
        </div>

        <AnalyticsChart
          data={monthlyData}
          type="bar"
          dataKey="totalOrders"
          xKey="month"
          height={300}
        />
      </motion.div>
    </div>
  );
}