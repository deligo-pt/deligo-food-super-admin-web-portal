"use client";

import KPICard from "@/components/BusinessInfo/KPICard";
import OperationalMetrics from "@/components/BusinessInfo/OperationalMetrics";
import RevenueChart from "@/components/BusinessInfo/RevenueChart";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";
import { Clock, EuroIcon, ShoppingBag, TrendingUp } from "lucide-react";

export function BusinessInfo() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <TitleHeader
          title={t("business_info")}
          subtitle={t("real_time_overview_deligo_performance")}
        />

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title={t("total_revenue")}
            value="147,031"
            prefix="€ "
            icon={EuroIcon}
            trend={12.5}
            delay={0.1}
          />
          <KPICard
            title={t("total_orders")}
            value="3,842"
            icon={ShoppingBag}
            trend={8.2}
            delay={0.2}
          />
          <KPICard
            title={t("avg_delivery_time")}
            value="25.13"
            suffix=" min"
            icon={Clock}
            trend={-2.4}
            trendLabel="vs last month (faster)"
            delay={0.3}
          />
          <KPICard
            title={t("avg_order_value")}
            value="38.40"
            prefix="€ "
            icon={TrendingUp}
            trend={5.1}
            delay={0.4}
          />
        </div>

        {/* Operational Metrics Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">
            {t("operational_status")}
          </h2>
          <OperationalMetrics />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>

          {/* Recent Activity / Mini List */}
          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.7,
            }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
          >
            <h3 className="font-bold text-gray-900 mb-4">
              {t("top_performing_zones")}
            </h3>
            <div className="space-y-4 flex-1">
              {[
                {
                  name: "Downtown",
                  orders: 1240,
                  revenue: "€45,200",
                  growth: "+12%",
                },
                {
                  name: "Westside",
                  orders: 980,
                  revenue: "€32,150",
                  growth: "+8%",
                },
                {
                  name: "North Hills",
                  orders: 850,
                  revenue: "€28,400",
                  growth: "+15%",
                },
                {
                  name: "Harbor District",
                  orders: 620,
                  revenue: "€21,900",
                  growth: "+4%",
                },
                {
                  name: "University Area",
                  orders: 590,
                  revenue: "€18,200",
                  growth: "-2%",
                },
              ].map((zone, i) => (
                <div
                  key={zone.name}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-xs group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {zone.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {zone.orders} {t("orders")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {zone.revenue}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        zone.growth.startsWith("+")
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {zone.growth}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
              {t("view_all_zones")}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
