"use client";

import CustomizedCharts from "@/components/common/CustomizedChart/CustomizedChart";
import StatusDistributionCard from "@/components/common/StatusDistributionCard";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import {
  SelectCustomDateFilter,
  SelectDateRangeFilter,
} from "@/components/Filtering/SelectDateRangeFilter";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { ICustomerReportAnalytics } from "@/types/report.type";
import { generateCustomerReportCSV } from "@/utils/csv/customerReportCSV";
import { formatPrice } from "@/utils/formatPrice";
import { generateCustomerReportPDF } from "@/utils/pdf/customerReportPdf";
import { motion } from "framer-motion";
import { EuroIcon, Heart, ShoppingBag, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface IProps {
  customerReportAnalytics: ICustomerReportAnalytics;
}

export function CustomerReport({ customerReportAnalytics }: IProps) {
  const {t} = useTranslation();
  const searchParams = useSearchParams();
  const currentTimeframe = searchParams.get("timeframe") || "";
  const [isCustomDate, setIsCustomDate] = useState(
    currentTimeframe === "custom",
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div>
        {/* Header */}
        <TitleHeader
          title={t("customer_report")}
          subtitle={t("overview_of_all_registered_customers_activity")}
          extraComponent={
            <div className="flex items-center gap-3">
              {/* Date Filter */}
              <SelectDateRangeFilter
                placeholder={t("select_date_range")}
                onCustomRangeSelect={() => setIsCustomDate(true)}
              />

              <ExportPopover
                onPDFClick={() =>
                  generateCustomerReportPDF(customerReportAnalytics)
                }
                onCSVClick={() =>
                  generateCustomerReportCSV(customerReportAnalytics)
                }
              />
            </div>
          }
        />

        {/* Custom Date Filter */}
        {isCustomDate && (
          <SelectCustomDateFilter onClear={() => setIsCustomDate(false)} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title={t("total_customers")}
            value={customerReportAnalytics.stats?.totalCustomers || 0}
            icon={User}
            delay={0}
          />
          <StatsCard
            title={t("active_customers")}
            value={customerReportAnalytics.stats?.activeCustomers || 0}
            icon={Heart}
            delay={0.1}
          />
          <StatsCard
            title={t("total_orders")}
            value={customerReportAnalytics.stats?.totalOrders || 0}
            icon={ShoppingBag}
            delay={0.2}
          />
          <StatsCard
            title={t("total_spent")}
            value={`€${formatPrice(customerReportAnalytics.stats?.totalSpent || 0)}`}
            icon={EuroIcon}
            delay={0.3}
          />
        </div>

        {/* Charts */}
        <CustomizedCharts
          type="area"
          title={t("customer_growth")}
          description={t("new_customer_registration_over_time")}
          data={customerReportAnalytics.customerGrowth || []}
          xLabel={t("time")}
          yLabel={t("no_of_customers")}
          delay={0.2}
        />

        {/* status distribution */}
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
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {t("status_distribution")}
          </h3>
          <div className="space-y-3">
            <StatusDistributionCard
              name="Active"
              value={customerReportAnalytics.statusDistribution.active || 0}
              color="#DC3173"
            />
            <StatusDistributionCard
              name="Blocked"
              value={customerReportAnalytics.statusDistribution.blocked || 0}
              color="#FF6B6B"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
