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
                onPDFClick={() =>
                  generateFleetManagerReportPDF(fleetReportAnalytics)
                }
                onCSVClick={() =>
                  generateFleetManagerReportCSV(fleetReportAnalytics)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Managers"
            value={fleetReportAnalytics?.stats?.totalManagers || 0}
            icon={Users}
          />
          <StatsCard
            title="Approved Managers"
            value={fleetReportAnalytics?.stats?.approvedManagers || 0}
            icon={CheckCircle}
            delay={0.1}
          />
          <StatsCard
            title="Total Drivers"
            value={fleetReportAnalytics?.stats?.totalDrivers || 0}
            icon={Bike}
            delay={0.2}
          />
          <StatsCard
            title="Total Deliveries"
            value={fleetReportAnalytics?.stats?.totalDeliveries || 0}
            icon={PackageCheckIcon}
            delay={0.3}
          />
        </div>

        {/* Charts */}
        <CustomizedCharts
          type="area"
          title="Fleet Manager Growth"
          description="New manager registrations over time"
          data={fleetReportAnalytics.fleetGrowths || []}
          xLabel="Time"
          yLabel="No of Managers"
          xKey="time"
          yKey="managers"
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
              name="Submitted"
              value={fleetReportAnalytics.statusDistribution.submitted || 0}
              color="#3b82f6"
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
