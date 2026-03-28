"use client";

import { BarChart, PieChart, Search } from "lucide-react";

import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import SelectFilter from "@/components/Filtering/SelectFilter";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { IOrderReportAnalytics } from "@/types/report.type";
import { generateOrderReportCSV } from "@/utils/csv/orderReportCSV";
import { formatPrice } from "@/utils/formatPrice";
import { generateOrderReportPDF } from "@/utils/pdf/orderReportPdf";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  BarChart as ReBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DELIGO = "#DC3173";

const daysOption = [
  { label: "Last 7 days", value: "last7days" },
  { label: "Last 14 days", value: "last14days" },
  { label: "Last 30 days", value: "last30days" },
];

interface IProps {
  orderReportAnalytics: IOrderReportAnalytics;
}

const OrderReport = ({ orderReportAnalytics }: IProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div>
        {/* Header */}
        <TitleHeader
          title={t("order_report")}
          subtitle={t("full_analytics_performance_insights")}
          extraComponent={
            <ExportPopover
              onPDFClick={() => generateOrderReportPDF(orderReportAnalytics)}
              onCSVClick={() => generateOrderReportCSV(orderReportAnalytics)}
            />
          }
        />

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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4" /> Orders Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={orderReportAnalytics.ordersTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill={DELIGO} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area - Revenue trend */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4" /> {t("revenue_trend")}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderReportAnalytics.revenueTrend || []}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DELIGO} stopOpacity={0.6} />
                      <stop
                        offset="95%"
                        stopColor={DELIGO}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={DELIGO}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderReport;
