"use client";
import CustomizedCharts from "@/components/common/CustomizedChart/CustomizedChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import {
  SelectCustomDateFilter,
  SelectDateRangeFilter,
} from "@/components/Filtering/SelectDateRangeFilter";
import SelectFilter from "@/components/Filtering/SelectFilter";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { ISalesReportAnalytics } from "@/types/report.type";
import { generateSalesReportCSV } from "@/utils/csv/salesReportCSV";
import { formatPrice } from "@/utils/formatPrice";
import { generateSalesReportPDF } from "@/utils/pdf/salesReportPdf";
import { motion } from "framer-motion";
import { BarChart2, CheckCircle, FileText, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const daysOption = [
  { label: "Last 7 days", value: "last7days" },
  { label: "Last 14 days", value: "last14days" },
  { label: "Last 30 days", value: "last30days" },
];

interface IProps {
  salesReportAnalytics: ISalesReportAnalytics;
}

const SalesReport = ({ salesReportAnalytics }: IProps) => {
  const { t } = useTranslation();
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
          title={t("sales_report")}
          subtitle={t("overview_revenue_orders_metrics")}
          extraComponent={
            <div className="flex items-center gap-3">
              {/* Date Filter */}
              <SelectDateRangeFilter
                placeholder="Select Date Range"
                onCustomRangeSelect={() => setIsCustomDate(true)}
              />

              <ExportPopover
                onPDFClick={() =>
                  generateSalesReportPDF(salesReportAnalytics || {})
                }
                onCSVClick={() => generateSalesReportCSV(salesReportAnalytics)}
              />
            </div>
          }
        />

        {/* Custom Date Filter */}
        {isCustomDate && (
          <SelectCustomDateFilter onClear={() => setIsCustomDate(false)} />
        )}

        {/* filtering */}
        <div className="flex flex-row justify-end items-end mb-6">
          <div>
            <SelectFilter
              paramName="timeframe"
              options={daysOption}
              placeholder="Timeframe"
            />
          </div>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title={t("total_revenue")}
            value={`€${formatPrice(salesReportAnalytics.summary.totalRevenue || 0)}`}
            icon={BarChart2}
            delay={0}
          />
          <StatsCard
            title={t("completed_orders")}
            value={salesReportAnalytics.summary.completedOrders || 0}
            icon={CheckCircle}
            delay={0.1}
          />
          <StatsCard
            title={t("cancelled")}
            value={salesReportAnalytics.summary.cancelledOrders || 0}
            icon={X}
            delay={0.2}
          />
          <StatsCard
            title={t("avg_order")}
            value={`€${formatPrice(salesReportAnalytics.summary.avgOrderValue || 0)}`}
            icon={FileText}
            delay={0.3}
          />
        </div>

        {/* Chart area */}
        <div className="">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow"
          >
            <CustomizedCharts
              title={t("revenue")}
              description="Sales over time"
              data={salesReportAnalytics?.charts?.revenueTrend || []}
              xLabel="Date"
              delay={0.4}
              xKey="date"
              yKey="revenue"
              isBGNeed={false}
              yAxisCustomizedValue={(val) => `€${formatPrice(val as number)}`}
              yLabelCustomizedValue={(val) => formatPrice(val as number)}
            />

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:text-center">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500">{t("this_week")}</p>
                <p className="font-semibold mt-1">
                  €
                  {formatPrice(salesReportAnalytics.revenueCards.thisWeek || 0)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500">{t("this_month")}</p>
                <p className="font-semibold mt-1">
                  €
                  {formatPrice(
                    salesReportAnalytics.revenueCards.thisMonth || 0,
                  )}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500">{t("top_earning_day")}</p>
                <p className="font-semibold mt-1">
                  {salesReportAnalytics?.revenueCards?.topEarningDay || "N/A"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
