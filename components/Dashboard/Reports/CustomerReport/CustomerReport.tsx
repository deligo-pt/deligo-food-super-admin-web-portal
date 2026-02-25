"use client";

import StatusDistributionCard from "@/components/common/StatusDistributionCard";
import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import CustomerReportTable from "@/components/Dashboard/Reports/CustomerReport/CustomerReportTable";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { ICustomerReportAnalytics } from "@/types/report.type";
import { TCustomer } from "@/types/user.type";
import { exportCustomerReportCSV } from "@/utils/exportCustomerReportCSV";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { EuroIcon, Heart, ShoppingBag, User } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface IProps {
  customersData: { data: TCustomer[]; meta?: TMeta };
  customerReportAnalytics: ICustomerReportAnalytics;
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
        label: "Approved",
        value: "APPROVED",
      },
      {
        label: "Blocked",
        value: "BLOCKED",
      },
    ],
  },
];

export function CustomerReport({ customersData, customerReportAnalytics }: IProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `customer_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}`,
  });

  const stats = {
    total: customersData.meta?.total || 0,
    active: customersData.data?.filter((c) => c.status === "APPROVED").length,
    totalSpent: customersData.data?.reduce(
      (sum, c) => sum + (c.orders?.totalSpent || 0),
      0,
    ),
    totalOrders: customersData.data?.reduce(
      (sum, c) => sum + (c.orders?.totalOrders || 0),
      0,
    ),
  };

  return (
    <div
      ref={reportRef}
      className="print-container min-h-screen bg-gray-50/50 pb-20"
    >
      <div className="print:pt-4">
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
          title="Customer Report"
          subtitle="Overview of all registered customers and their activity"
          extraComponent={
            <ExportPopover
              onPDFClick={() => handlePrint()}
              onCSVClick={() =>
                exportCustomerReportCSV({
                  stats: stats,
                  monthlySignups: customerReportAnalytics.customerGrowth,
                  statusDistribution: customerReportAnalytics.statusDistribution,
                  customers: customersData.data,
                })
              }
            />
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 print:mb-4">
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
            value={`${customerReportAnalytics.cards.totalRevenue || "€0.00"}`}
            icon={EuroIcon}
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
            Customer Growth
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            New customer registrations over time
          </p>
          <AnalyticsChart
            data={customerReportAnalytics.customerGrowth || []}
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
              name="Active"
              value={customerReportAnalytics.statusDistribution.approved || 0}
              color="#DC3173"
            />
            <StatusDistributionCard
              name="Pending"
              value={customerReportAnalytics.statusDistribution.pending || 0}
              color="#FFA500"
            />
            <StatusDistributionCard
              name="Blocked"
              value={customerReportAnalytics.statusDistribution.blocked || 0}
              color="#FF6B6B"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#DC3173]/10 rounded-lg text-[#DC3173]">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  All Customers
                </h2>
                <p className="text-sm text-gray-500">
                  {customersData.meta?.total || 0} customers
                </p>
              </div>
            </div>
          </div>

          <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

          <CustomerReportTable customers={customersData?.data} />

          {!!customersData?.meta?.totalPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PaginationComponent
                totalPages={customersData?.meta?.totalPage as number}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
