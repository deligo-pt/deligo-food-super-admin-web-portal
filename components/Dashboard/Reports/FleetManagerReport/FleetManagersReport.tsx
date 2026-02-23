"use client";

import StatusDistributionCard from "@/components/common/StatusDistributionCard";
import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import FleetManagerReportTable from "@/components/Dashboard/Reports/FleetManagerReport/FleetManagerReportTable";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { IFleetManagerReportAnalytics } from "@/types/report.type";
import { TAgent } from "@/types/user.type";
import { exportFleetManagerReportCSV } from "@/utils/exportFleetManagerReportCSV";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Bike, CheckCircle, PackageCheckIcon, Users } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface IProps {
  fleetManagersData: { data: TAgent[]; meta?: TMeta };
  fleetReportAnalytics: IFleetManagerReportAnalytics;
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

const filterOptions = [
  {
    label: "Status",
    key: "status",
    placeholder: "Select Status",
    type: "select",
    items: [
      {
        label: "Pending",
        value: "PENDING",
      },
      {
        label: "Submitted",
        value: "SUBMITTED",
      },
      {
        label: "Approved",
        value: "APPROVED",
      },
      {
        label: "Rejected",
        value: "REJECTED",
      },
      {
        label: "Blocked",
        value: "BLOCKED",
      },
    ],
  },
];

const statusDistribution = [
  {
    name: "Approved",
    value: 3,
    color: "#DC3173",
  },
  {
    name: "Pending",
    value: 1,
    color: "#f59e0b",
  },
  {
    name: "Submitted",
    value: 1,
    color: "#3b82f6",
  },
  {
    name: "Rejected",
    value: 1,
    color: "#ef4444",
  },
];

const monthlySignups = [
  {
    name: "Jan",
    managers: 1,
  },
  {
    name: "Feb",
    managers: 2,
  },
  {
    name: "Mar",
    managers: 5,
  },
  {
    name: "Apr",
    managers: 3,
  },
  {
    name: "May",
    managers: 1,
  },
  {
    name: "Jun",
    managers: 2,
  },
];

export default function FleetManagerReport({ fleetManagersData, fleetReportAnalytics }: IProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `fleet_manager_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}`,
  });

  const stats = {
    total: fleetManagersData.meta?.total || 0,
    approved: fleetManagersData.data?.filter((m) => m.status === "APPROVED")
      .length,
    totalDrivers: fleetManagersData.data?.reduce(
      (sum, m) => sum + (m.operationalData?.totalDrivers || 0),
      0,
    ),
    totalDeliveries: fleetManagersData.data?.reduce(
      (sum, m) => sum + (m.operationalData?.totalDeliveries || 0),
      0,
    ),
  };

  return (
    <div ref={reportRef} className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 print:pt-4">
        {/* Logo for print */}
        <div className="hidden print:flex items-center gap-2 mb-4">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#DC3173] overflow-hidden shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/deligoLogo.png"
              alt="DeliGo Logo"
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
          <h1 className="font-bold text-xl text-[#DC3173]">DeliGo</h1>
        </div>

        {/* Header */}
        <TitleHeader
          title="Fleet Manager Report"
          subtitle="Overview of all fleet managers and their operations"
          extraComponent={
            <ExportPopover
              onPDFClick={() => handlePrint()}
              onCSVClick={() =>
                exportFleetManagerReportCSV({
                  stats: stats,
                  monthlySignups,
                  statusDistribution,
                  fleetManagers: fleetManagersData.data,
                })
              }
            />
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 print:mb-4">
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
            value={fleetReportAnalytics?.cards?.blockedOrRejectedFleetManagers || 0}
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

        {/* Table */}
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
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#DC3173]/10 rounded-lg text-[#DC3173]">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                All Fleet Managers
              </h2>
              <p className="text-sm text-gray-500">
                {fleetManagersData.meta?.total} managers
              </p>
            </div>
          </div>

          <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

          <FleetManagerReportTable fleetManagers={fleetManagersData?.data} />

          {!!fleetManagersData?.meta?.totalPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PaginationComponent
                totalPages={fleetManagersData?.meta?.totalPage as number}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
