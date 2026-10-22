"use client";

import CustomizedCharts from "@/components/common/CustomizedChart/CustomizedChart";
import DeliveryPartnerPerformanceTable from "@/components/Dashboard/Performance/DeliveryPartnerPerformance/DeliveryPartnerPerformanceTable";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TPartnerPerformanceData } from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { Award, EuroIcon, Star, TrendingUp } from "lucide-react";

interface IProps {
  partnerPerformanceData: { data: TPartnerPerformanceData; meta?: TMeta };
}

export default function DeliveryPartnerPerformance({
  partnerPerformanceData,
}: IProps) {
  const { t } = useTranslation();

  const {
    earningsPerformance = [],
    partnerPerformance = [],
    topCards,
    topPerformers = [],
  } = partnerPerformanceData?.data || {};

  // Safe helpers
  const getInitial = (name?: string) =>
    name && name !== "N/A" ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <TitleHeader
        title={t("rider_performance_analytics")}
        subtitle={t("comprehensive_insights_into_rider")}
      />

      {/* ===== TOP CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Most Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#DC3173]/20 text-[#DC3173] rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="font-medium">{t("most_orders")}</span>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={topCards?.mostOrders?.partnerPhoto || ""}
                alt={topCards?.mostOrders?.partnerName || "N/A"}
              />
              <AvatarFallback>
                {getInitial(topCards?.mostOrders?.partnerName)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-gray-800 font-semibold">
                {topCards?.mostOrders?.partnerName || "N/A"}
              </p>
              <p className="text-[#DC3173] text-sm">
                {(topCards?.mostOrders?.ordersCount ?? 0).toLocaleString()}{" "}
                {t("orders_this_month")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Highest Rated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#DC3173]/20 text-[#DC3173] rounded-lg">
              <Star size={20} />
            </div>
            <span className="font-medium">{t("highest_rated")}</span>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={topCards?.highestRated?.partnerPhoto || ""}
                alt={topCards?.highestRated?.partnerName || "N/A"}
              />
              <AvatarFallback>
                {getInitial(topCards?.highestRated?.partnerName)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-gray-800 font-bold">
                {topCards?.highestRated?.partnerName || "N/A"}
              </p>
              <p className="text-[#DC3173] text-sm">
                {topCards?.highestRated?.rating?.average ?? 0} {t("stars")} (
                {topCards?.highestRated?.rating?.totalRatings ?? 0}{" "}
                {t("reviews")})
              </p>
            </div>
          </div>
        </motion.div>

        {/* Highest Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#DC3173]/20 text-[#DC3173] rounded-lg">
              <EuroIcon size={20} />
            </div>
            <span className="font-medium">{t("highest_earnings")}</span>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={topCards?.highestEarnings?.partnerPhoto || ""}
                alt={topCards?.highestEarnings?.partnerName || "N/A"}
              />
              <AvatarFallback>
                {getInitial(topCards?.highestEarnings?.partnerName)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-gray-800 font-bold">
                {topCards?.highestEarnings?.partnerName || "N/A"}
              </p>
              <p className="text-[#DC3173] text-sm">
                €{formatPrice(topCards?.highestEarnings?.earnings ?? 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== CHART + TOP PERFORMERS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <CustomizedCharts
            title={t("orders_performance")}
            description={t("monthly_performance_over_the_last_6_months")}
            data={earningsPerformance}
            xLabel={t("month")}
            xKey="month"
            yLabel={t("no_of_orders")}
            yKey="totalOrders"
            delay={0.2}
            isBGNeed={false}
          />
        </div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-[#DC3173]" size={20} />
            <h3 className="text-lg font-bold text-gray-900">
              {t("top_performers")}
            </h3>
          </div>

          <div className="space-y-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((dp, index) => (
                <div
                  key={dp._id || index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                          ? "bg-gray-200 text-gray-600"
                          : "bg-amber-100 text-amber-700"
                      }`}
                  >
                    {index + 1}
                  </div>

                  <Avatar className="w-9 h-9">
                    <AvatarImage
                      src={dp.profilePhoto || ""}
                      alt={dp.name || "Partner"}
                    />
                    <AvatarFallback>
                      {dp.initials || getInitial(dp.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {dp.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      €{formatPrice(dp.totalEarnings ?? 0)} {t("earnings")}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm">
                    <Star
                      size={12}
                      className="text-amber-400 fill-amber-400"
                    />
                    <span className="font-medium">{dp.rating ?? 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">
                {t("no_top_performers") || "No top performers yet"}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ===== TABLE ===== */}
      <DeliveryPartnerPerformanceTable
        partners={partnerPerformance}
        meta={partnerPerformanceData?.meta as TMeta}
      />

      {/* Pagination */}
      {!!partnerPerformanceData?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={partnerPerformanceData.meta.totalPage as number}
          />
        </motion.div>
      )}
    </div>
  );
}