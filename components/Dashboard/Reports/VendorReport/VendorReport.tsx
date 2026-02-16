"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import VendorReportTable from "@/components/Dashboard/Reports/VendorReport/VendorReportTable";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TVendor } from "@/types/user.type";
import { exportVendorReportCSV } from "@/utils/exportVendorReportCSV";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Store, XCircle } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface IProps {
  vendorsData: { data: TVendor[]; meta?: TMeta };
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
    value: 4,
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
  {
    name: "Blocked",
    value: 1,
    color: "#6b7280",
  },
];

const monthlySignups = [
  {
    name: "Jan",
    vendors: 2,
  },
  {
    name: "Feb",
    vendors: 3,
  },
  {
    name: "Mar",
    vendors: 1,
  },
  {
    name: "Apr",
    vendors: 2,
  },
  {
    name: "May",
    vendors: 2,
  },
  {
    name: "Jun",
    vendors: 1,
  },
];

export default function VendorReport({ vendorsData }: IProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `vendor_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}`,
  });

  const stats = {
    total: vendorsData.meta?.total || 0,
    approved: vendorsData.data?.filter((v) => v.status === "APPROVED").length,
    pending: vendorsData.data?.filter((v) => v.status === "SUBMITTED").length,
    blocked: vendorsData.data?.filter(
      (v) => v.status === "BLOCKED" || v.status === "REJECTED",
    ).length,
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
          title="Vendor Report"
          subtitle="Overview of all registered vendors and their status"
          extraComponent={
            <ExportPopover
              onPDFClick={() => handlePrint()}
              onCSVClick={() =>
                exportVendorReportCSV({
                  stats: stats,
                  monthlySignups,
                  statusDistribution,
                  vendors: vendorsData.data,
                })
              }
            />
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 print:mb-4">
          <StatsCard
            title="Total Vendors"
            value={stats.total}
            icon={Store}
            delay={0}
          />
          <StatsCard
            title="Approved Vendors"
            value={stats.approved}
            icon={CheckCircle}
            delay={0.1}
          />
          <StatsCard
            title="Submitted Vendors"
            value={stats.pending}
            icon={Clock}
            delay={0.2}
          />
          <StatsCard
            title="Blocked/Rejected Vendors"
            value={stats.blocked}
            icon={XCircle}
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
              Monthly Signups
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              New vendor registrations over time
            </p>
            <AnalyticsChart
              data={monthlySignups}
              type="bar"
              dataKey="vendors"
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

        {/* Filters & Table */}
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
              <Store size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">All Vendors</h2>
              <p className="text-sm text-gray-500">
                {vendorsData.meta?.total || 0} vendors
              </p>
            </div>
          </div>

          <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

          <VendorReportTable vendors={vendorsData.data} />

          {!!vendorsData?.meta?.totalPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PaginationComponent
                totalPages={vendorsData?.meta?.totalPage as number}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
