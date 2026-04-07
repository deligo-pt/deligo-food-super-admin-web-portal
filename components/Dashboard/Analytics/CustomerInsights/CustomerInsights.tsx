"use client";

import ActiveCustomersInsightsChart from "@/components/Dashboard/Analytics/CustomerInsights/ActiveCustomersInsightsChart";
import CustomersOrderFrequencyChart from "@/components/Dashboard/Analytics/CustomerInsights/CustomersOrderFrequencyChart";
import CustomersPeakOrderTimeChart from "@/components/Dashboard/Analytics/CustomerInsights/CustomersPeakOrderTimeChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TCustomerInsights } from "@/types/analytics/customer-insights.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  Euro,
  TrendingDown,
  UserPlus,
  Users,
} from "lucide-react";

interface IProps {
  customerInsights: TCustomerInsights;
}

export default function CustomerInsightsPage({ customerInsights }: IProps) {
  console.log(customerInsights);
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <TitleHeader
        title="Customer Insights"
        subtitle="Understand user behavior and engagement"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="New Customers"
          value={customerInsights.summary.newCustomers}
          icon={UserPlus}
        />
        <StatsCard
          title="Returning Customers"
          value={customerInsights.summary.returningCustomers}
          icon={Users}
          delay={0.1}
        />
        <StatsCard
          title="Churn Rate"
          value={`${customerInsights.summary.churnRate}%`}
          icon={TrendingDown}
          delay={0.2}
        />
        <StatsCard
          title="Avg CLV"
          value={`€${formatPrice(customerInsights.summary.averageCLV)}`}
          icon={Euro}
          delay={0.3}
        />
      </div>

      {/* Active Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={18} /> Peak Order Time
        </h3>
        <CustomersPeakOrderTimeChart
          hourlyOrders={customerInsights.hourlyOrders}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        {/* Order Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={18} /> Order Frequency
          </h3>

          <CustomersOrderFrequencyChart
            orderFrequency={customerInsights.orderFrequency}
          />
        </motion.div>

        {/* Hourly Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} /> Active Users
          </h3>

          <ActiveCustomersInsightsChart
            activeUsers={customerInsights.activeUsers}
          />
        </motion.div>
      </div>

      {/* Top Customers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Customers</h3>

        <div className="space-y-4">
          {customerInsights.topCustomers.map((customer) => (
            <div
              key={customer.customerId}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100"
            >
              <div>
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">
                  {customer.totalOrders} orders
                </p>
              </div>

              <p className="font-bold text-[#DC3173]">
                €{formatPrice(customer.totalSpent)}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
