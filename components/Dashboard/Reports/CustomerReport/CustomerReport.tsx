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
  const searchParams = useSearchParams();
  const currentTimeframe = searchParams.get("timeframe") || "";
  const [isCustomDate, setIsCustomDate] = useState(
    currentTimeframe === "custom",
  );

  const data = {
    stats: customerReportAnalytics.cards,
    monthlySignups: customerReportAnalytics.customerGrowth,
    statusDistribution: customerReportAnalytics.statusDistribution,
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div>
        {/* Header */}
        <TitleHeader
          title="Customer Report"
          subtitle="Overview of all registered customers and their activity"
          extraComponent={
            <div className="flex items-center gap-3">
              {/* Date Filter */}
              <SelectDateRangeFilter
                placeholder="Select Date Range"
                onCustomRangeSelect={() => setIsCustomDate(true)}
              />

              <ExportPopover
                onPDFClick={() => generateCustomerReportPDF(data)}
                onCSVClick={() => generateCustomerReportCSV(data)}
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
            title="Total Customers"
            value={customerReportAnalytics.cards.totalCustomers || 0}
            icon={User}
            delay={0}
          />
          <StatsCard
            title="Active Customers"
            value={customerReportAnalytics.cards.activeCustomers || 0}
            icon={Heart}
            delay={0.1}
          />
          <StatsCard
            title="Total Orders"
            value={customerReportAnalytics.cards.totalOrders || 0}
            icon={ShoppingBag}
            delay={0.2}
          />
          <StatsCard
            title="Total Revenue"
            value={`€${formatPrice(Number(customerReportAnalytics.cards.totalRevenue?.replace("€", "")) || 0)}`}
            icon={EuroIcon}
            delay={0.3}
          />
        </div>

        {/* Charts */}
        <CustomizedCharts
          type="area"
          title="Customer Growth"
          description="New customer registrations over time"
          data={customerReportAnalytics.customerGrowth || []}
          xLabel="Month"
          yLabel="No of Customers"
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
            Status Distribution
          </h3>
          <div className="space-y-3">
            <StatusDistributionCard
              name="Active"
              value={customerReportAnalytics.statusDistribution.approved || 0}
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
