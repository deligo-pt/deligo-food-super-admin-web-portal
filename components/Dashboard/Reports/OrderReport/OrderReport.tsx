"use client";

import CustomizedCharts from "@/components/common/CustomizedChart/CustomizedChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import OrderReportZoneCard from "@/components/Dashboard/Reports/OrderReport/OrderReportZoneCard";
import ZoneHeatmap from "@/components/Dashboard/Reports/OrderReport/ZoneHeatmap";
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
import { motion } from "framer-motion";
import { BarChart, PieChart, Search } from "lucide-react";
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
    <div className="min-h-screen">
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

      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title={t("total_revenue")}
          value={`€${formatPrice(orderReportAnalytics.stats?.totalRevenue || 0)}`}
          icon={BarChart}
          delay={0}
        />
        <StatsCard
          title={t("total_orders")}
          value={`${orderReportAnalytics.stats?.totalOrders || 0}`}
          icon={PieChart}
          delay={0.1}
        />
        <StatsCard
          title={t("avg_order")}
          value={`€${formatPrice(orderReportAnalytics.stats?.avgOrderValue || 0)}`}
          icon={Search}
          delay={0.2}
        />
      </section>

      {/* Bar Chart - Orders Trend */}
      <CustomizedCharts
        title="Orders Trend"
        description=""
        data={orderReportAnalytics.ordersTrend || []}
        xLabel="Time"
        yLabel="No of Orders"
        delay={0.3}
        xKey="time"
        yKey="orders"
      />

      {/* Orders By Zone */}
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
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Orders By Zone</h3>

        <div className="grid md:grid-cols-3 gap-6">
          {orderReportAnalytics.ordersByZone.map((zone, i) => (
            <OrderReportZoneCard
              key={zone.label}
              zone={zone.label}
              orders={zone.value}
              delay={0.6 + i * 0.1}
            />
          ))}
        </div>
      </motion.div>

      {/* Zone Heatmap */}
      <ZoneHeatmap zoneHeatmap={orderReportAnalytics.zoneHeatmap} />
    </div>
  );
};

export default OrderReport;
