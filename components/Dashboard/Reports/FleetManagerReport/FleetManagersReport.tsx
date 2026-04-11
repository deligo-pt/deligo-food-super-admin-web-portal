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
import { IFleetManagerReportAnalytics } from "@/types/report.type";
import { generateFleetManagerReportCSV } from "@/utils/csv/fleetManagerReportCSV";
import { generateFleetManagerReportPDF } from "@/utils/pdf/fleetManagerReportPdf";
import { motion } from "framer-motion";
import { Bike, CheckCircle, PackageCheckIcon, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface IProps {
  fleetReportAnalytics: IFleetManagerReportAnalytics;
}

export default function FleetManagerReport({ fleetReportAnalytics }: IProps) {
  const searchParams = useSearchParams();
  const currentTimeframe = searchParams.get("timeframe") || "";
  const [isCustomDate, setIsCustomDate] = useState(
    currentTimeframe === "custom",
  );

  const data = {
    stats: fleetReportAnalytics?.cards,
    monthlySignups: fleetReportAnalytics?.monthlySignups || [],
    statusDistribution: fleetReportAnalytics?.statusDistribution || {},
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div>
        {/* Header */}
        <TitleHeader
          title="Fleet Manager Report"
          subtitle="Overview of all fleet managers and their operations"
          extraComponent={
            <div className="flex items-center gap-3">
              {/* Date Filter */}
              <SelectDateRangeFilter
                placeholder="Select Date Range"
                onCustomRangeSelect={() => setIsCustomDate(true)}
              />

              <ExportPopover
                onPDFClick={() => generateFleetManagerReportPDF(data)}
                onCSVClick={() => generateFleetManagerReportCSV(data)}
              />
            </div>
          }
        />

        {/* Custom Date Filter */}
        {isCustomDate && (
          <SelectCustomDateFilter onClear={() => setIsCustomDate(false)} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Managers"
            value={fleetReportAnalytics?.cards?.totalFleetManagers || 0}
            icon={Users}
            delay={0}
          />
          <StatsCard
            title="Approved Managers"
            value={fleetReportAnalytics?.cards?.approvedFleetManagers || 0}
            icon={CheckCircle}
            delay={0.1}
          />
          <StatsCard
            title="Submitted Managers"
            value={fleetReportAnalytics?.cards?.submittedFleetManagers || 0}
            icon={Bike}
            delay={0.2}
          />
          <StatsCard
            title="Blocked/Rejected Managers"
            value={
              fleetReportAnalytics?.cards?.blockedOrRejectedFleetManagers || 0
            }
            icon={PackageCheckIcon}
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
            Monthly Registrations
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            New fleet manager signups over time
          </p>

          <AnalyticsChart
            data={fleetReportAnalytics?.monthlySignups || []}
            type="area"
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
              value={fleetReportAnalytics.statusDistribution.approved || 0}
              color="#DC3173"
            />
            <StatusDistributionCard
              name="Pending"
              value={fleetReportAnalytics.statusDistribution.pending || 0}
              color="#f59e0b"
            />
            <StatusDistributionCard
              name="Rejected"
              value={fleetReportAnalytics.statusDistribution.rejected || 0}
              color="#6b7280"
            />
            <StatusDistributionCard
              name="Blocked"
              value={fleetReportAnalytics.statusDistribution.blocked || 0}
              color="#ef4444"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
