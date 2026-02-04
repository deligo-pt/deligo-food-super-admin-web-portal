"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/VendorPerformance/StatsCard";
import CustomerReportTable from "@/components/Dashboard/Reports/CustomerReport/CustomerReportTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TCustomer } from "@/types/user.type";
import { motion } from "framer-motion";
import { Download, EuroIcon, Heart, ShoppingBag, User } from "lucide-react";

interface IProps {
  customersData: { data: TCustomer[]; meta?: TMeta };
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

const statusDistribution = [
  {
    name: "Active",
    value: 6,
    color: "#DC3173",
  },
  {
    name: "Pending",
    value: 1,
    color: "#f59e0b",
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
    customers: 45,
  },
  {
    name: "Feb",
    customers: 62,
  },
  {
    name: "Mar",
    customers: 58,
  },
  {
    name: "Apr",
    customers: 71,
  },
  {
    name: "May",
    customers: 89,
  },
  {
    name: "Jun",
    customers: 95,
  },
];

export function CustomerReport({ customersData }: IProps) {
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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-50/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <TitleHeader
          title="Customer Report"
          subtitle="Overview of all registered customers and their activity"
          buttonInfo={{
            text: "Export",
            icon: Download,
            onClick: () => {
              console.log("Export clicked");
            },
          }}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Customers"
            value={stats.total}
            icon={User}
            delay={0}
          />
          <StatsCard
            title="Active Customers"
            value={stats.active}
            icon={Heart}
            delay={0.1}
          />
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingBag}
            delay={0.2}
          />
          <StatsCard
            title="Total Revenue"
            value={`€${stats.totalSpent.toLocaleString()}`}
            icon={EuroIcon}
            delay={0.3}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
              Customer Growth
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              New customer registrations over time
            </p>
            <AnalyticsChart
              data={monthlySignups}
              type="area"
              dataKey="customers"
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
