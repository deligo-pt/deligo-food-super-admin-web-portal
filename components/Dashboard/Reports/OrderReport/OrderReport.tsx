"use client";

import { BarChart, PieChart, Search } from "lucide-react";

import CustomizedCharts from "@/components/common/CustomizedChart/CustomizedChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import {
  SelectCustomDateFilter,
  SelectDateRangeFilter,
} from "@/components/Filtering/SelectDateRangeFilter";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { IOrderReportAnalytics } from "@/types/report.type";
import { generateOrderReportCSV } from "@/utils/csv/orderReportCSV";
import { formatPrice } from "@/utils/formatPrice";
import { generateOrderReportPDF } from "@/utils/pdf/orderReportPdf";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface IProps {
  orderReportAnalytics: IOrderReportAnalytics;
}

const OrderReport = ({ orderReportAnalytics }: IProps) => {
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
          title={t("order_report")}
          subtitle={t("full_analytics_performance_insights")}
          extraComponent={
            <div className="flex items-center gap-3">
              {/* Date Filter */}
              <SelectDateRangeFilter
                placeholder="Select Date Range"
                onCustomRangeSelect={() => setIsCustomDate(true)}
              />

              <ExportPopover
                onPDFClick={() => generateOrderReportPDF(orderReportAnalytics)}
                onCSVClick={() => generateOrderReportCSV(orderReportAnalytics)}
              />
            </div>
          }
        />

        {/* Custom Date Filter */}
        {isCustomDate && (
          <SelectCustomDateFilter onClear={() => setIsCustomDate(false)} />
        )}

        {/* filtering */}
        {/* <div className="flex flex-row justify-end items-end mb-6">
          <div>
            <SelectFilter
              paramName="timeframe"
              options={daysOption}
              placeholder="Timeframe"
            />
          </div>
        </div> */}

        {/* Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title={t("total_revenue")}
            value={`€${formatPrice(orderReportAnalytics.summary.totalRevenue || 0)}`}
            icon={BarChart}
            delay={0}
          />
          <StatsCard
            title={t("total_orders")}
            value={`${orderReportAnalytics.summary.totalOrders || 0}`}
            icon={PieChart}
            delay={0.1}
          />
          <StatsCard
            title={t("avg_order")}
            value={`€${formatPrice(orderReportAnalytics.summary.avgOrderValue || 0)}`}
            icon={Search}
            delay={0.2}
          />
        </section>

        {/* Charts grid */}
        <section className="grid grid-cols-1 gap-6">
          {/* Bar - Orders Trend */}
          <CustomizedCharts
            title="Orders Trend"
            description="Number of orders by zone"
            data={orderReportAnalytics.ordersByZone || []}
            xLabel="Zones"
            yLabel="No of Orders"
            delay={0.2}
            xKey="zone"
            yKey="orders"
          />

          {/* Area - Revenue trend */}
          <CustomizedCharts
            type="area"
            title={t("revenue_trend")}
            description="Revenue over time"
            data={orderReportAnalytics.revenueTrend || []}
            xLabel="Date"
            yLabel="Revenue (€)"
            delay={0.2}
            xKey="date"
            yKey="revenue"
            yLabelCustomizedValue={(val) => formatPrice(val as number)}
          />
        </section>
      </div>
    </div>
  );
};

export default OrderReport;
