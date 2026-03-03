"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import FleetManagerReportTable from "@/components/Dashboard/Reports/FleetManagerReport/FleetManagerReportTable";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TFleetManagerReport } from "@/types/report.type";
import { exportFleetManagerReportCSV } from "@/utils/exportFleetManagerReportCSV";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Bike, CheckCircle, PackageCheckIcon, Users } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface IProps {
  reportData: { data: TFleetManagerReport; meta?: TMeta };
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

export default function FleetManagerReport({ reportData }: IProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `fleet_manager_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}`,
  });

  console.log(reportData);

  const {
    stats: fStats,
    fleetManagers,
    monthlySignups,
    statusDistribution: fStatusDistribution,
  } = reportData.data || {};

  const stats = {
    total: fStats?.totalManagers || 0,
    approved: fStats?.approvedManagers || 0,
    totalDrivers: fStats?.totalDrivers || 0,
    totalDeliveries: fStats?.totalDeliveries || 0,
  };

  const statusDistribution = [
    {
      name: "Approved",
      value: fStatusDistribution?.approved || 0,
      color: "#DC3173",
    },
    {
      name: "Pending",
      value: fStatusDistribution?.pending || 0,
      color: "#f59e0b",
    },
    {
      name: "Submitted",
      value: fStatusDistribution?.submitted || 0,
      color: "#3b82f6",
    },
    {
      name: "Rejected",
      value: fStatusDistribution?.rejected || 0,
      color: "#ef4444",
    },
    {
      name: "Blocked",
      value: fStatusDistribution?.blocked || 0,
      color: "#6b7280",
    },
  ];

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
                  fleetManagers,
                })
              }
            />
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 print:mb-4">
          <StatsCard
            title="Total Managers"
            value={stats.total}
            icon={Users}
            delay={0}
          />
          <StatsCard
            title="Approved Managers"
            value={stats.approved}
            icon={CheckCircle}
            delay={0.1}
          />
          <StatsCard
            title="Total Drivers"
            value={stats.totalDrivers}
            icon={Bike}
            delay={0.2}
          />
          <StatsCard
            title="Total Deliveries"
            value={stats.totalDeliveries.toLocaleString()}
            icon={PackageCheckIcon}
            delay={0.3}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 print:mb-4">
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
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Monthly Registrations
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              New fleet manager signups over time
            </p>

            <AnalyticsChart
              data={monthlySignups}
              type="area"
              dataKey="managers"
              height={200}
            />
          </motion.div>

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
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Status Distribution
            </h3>
            <div className="space-y-3">
              {statusDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

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
                {reportData.meta?.total} managers
              </p>
            </div>
          </div>

          <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

          <FleetManagerReportTable fleetManagers={fleetManagers} />

          {!!reportData?.meta?.totalPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PaginationComponent
                totalPages={reportData?.meta?.totalPage as number}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
