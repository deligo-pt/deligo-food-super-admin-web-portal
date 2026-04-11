"use client";

import StatusDistributionCard from "@/components/common/StatusDistributionCard";
import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import {
  SelectCustomDateFilter,
  SelectDateRangeFilter,
} from "@/components/Filtering/SelectDateRangeFilter";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { IVendorReportAnalytics } from "@/types/report.type";
import { generateVendorReportCSV } from "@/utils/csv/vendorReportCSV";
import { generateVendorReportPDF } from "@/utils/pdf/vendorReportPdf";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Store, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface IProps {
  vendorReportAnalytics: IVendorReportAnalytics;
}

export default function VendorReport({ vendorReportAnalytics }: IProps) {
  const searchParams = useSearchParams();
  const currentTimeframe = searchParams.get("timeframe") || "";
  const [isCustomDate, setIsCustomDate] = useState(
    currentTimeframe === "custom",
  );

  const data = {
    stats: vendorReportAnalytics.cards,
    monthlySignups: vendorReportAnalytics.monthlySignups || [],
    statusDistribution: vendorReportAnalytics.statusDistribution || {},
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div>
        {/* Header */}
        <TitleHeader
          title="Vendor Report"
          subtitle="Overview of all registered vendors and their status"
          extraComponent={
            <div className="flex items-center gap-3">
              {/* Date Filter */}
              <SelectDateRangeFilter
                placeholder="Select Date Range"
                onCustomRangeSelect={() => setIsCustomDate(true)}
              />

              <ExportPopover
                onPDFClick={() => generateVendorReportPDF(data)}
                onCSVClick={() => generateVendorReportCSV(data)}
              />
            </div>
          }
        />

        {/* Custom Date Filter */}
        {isCustomDate && (
          <SelectCustomDateFilter onClear={() => setIsCustomDate(false)} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 print:mb-4">
          <StatsCard
            title="Total Vendors"
            value={vendorReportAnalytics.cards.totalVendors || 0}
            icon={Store}
            delay={0}
          />
          <StatsCard
            title="Approved Vendors"
            value={vendorReportAnalytics.cards.approvedVendors || 0}
            icon={CheckCircle}
            delay={0.1}
          />
          <StatsCard
            title="Submitted Vendors"
            value={vendorReportAnalytics.cards.submittedVendors || 0}
            icon={Clock}
            delay={0.2}
          />
          <StatsCard
            title="Blocked/Rejected Vendors"
            value={vendorReportAnalytics.cards.blockedOrRejectedVendors || 0}
            icon={XCircle}
            delay={0.3}
          />
        </div>

        {/* Charts */}
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
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Monthly Signups
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            New vendor registrations over time
          </p>
          <AnalyticsChart
            data={vendorReportAnalytics.monthlySignups || []}
            type="bar"
            dataKey="value"
            xKey="label"
            height={200}
          />
        </motion.div>

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
              name="Approved"
              value={vendorReportAnalytics.statusDistribution.approved || 0}
              color="#DC3173"
            />
            <StatusDistributionCard
              name="Pending"
              value={vendorReportAnalytics.statusDistribution.pending || 0}
              color="#f59e0b"
            />
            <StatusDistributionCard
              name="Submitted"
              value={vendorReportAnalytics.statusDistribution.submitted || 0}
              color="#3b82f6"
            />
            <StatusDistributionCard
              name="Rejected"
              value={vendorReportAnalytics.statusDistribution.rejected || 0}
              color="#6b7280"
            />
            <StatusDistributionCard
              name="Blocked"
              value={vendorReportAnalytics.statusDistribution.blocked || 0}
              color="#ef4444"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
