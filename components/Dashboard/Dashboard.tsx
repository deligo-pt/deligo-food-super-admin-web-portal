"use client";

import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import PopularCategories from "@/components/Dashboard/PopularCategories";
import RecentOrders from "@/components/Dashboard/RecentOrders";
import StatCard from "@/components/Dashboard/StatCard";
import StatusCard from "@/components/Dashboard/StatusCard";
import TopProducts from "@/components/Dashboard/TopProducts";
import { TAnalytics } from "@/types/analytics.type";
import { motion } from "framer-motion";
import {
  ChartLine,
  CheckCircleIcon,
  Receipt,
  ShoppingBagIcon,
  StoreIcon,
  TrendingUpIcon,
  TruckIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";

const Dashboard = ({ analyticsData }: { analyticsData: TAnalytics }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <DashboardHeader />
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 0.2,
        }}
      >
        <StatCard
          title="Total Vendors"
          value={analyticsData?.vendors?.toLocaleString() || "0"}
          description="Active food partners"
          icon={<StoreIcon />}
          color="#DC3173"
        />
        <StatCard
          title="Total Fleet Managers"
          value={analyticsData?.fleetManagers?.toLocaleString() || "0"}
          description="Managing deliveries"
          icon={<TruckIcon />}
          color="#DC3173"
        />
        <StatCard
          title="Total Customers"
          value={analyticsData?.customers?.toLocaleString() || "0"}
          description="Registered users"
          icon={<UsersIcon />}
          color="#DC3173"
        />
      </motion.div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 0.4,
        }}
      >
        <StatCard
          title="Total Revenue"
          value={analyticsData?.totalRevenue?.toLocaleString() || "0"}
          description="Gross sales receipts"
          icon={<ChartLine />}
          color="#DC3173"
        />
        <StatCard
          title="Todays Revenue"
          value={analyticsData?.todaysRevenue?.toLocaleString() || "0"}
          description="Dailsy sales total"
          icon={<Receipt />}
          color="#DC3173"
        />
      </motion.div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 0.6,
        }}
      >
        <StatusCard
          title="Total Orders"
          value={analyticsData?.totalOrders?.toLocaleString() || "0"}
          icon={<ShoppingBagIcon />}
          color="#DC3173"
        />
        <StatusCard
          title="Pending"
          value={analyticsData?.pendingOrders?.toLocaleString() || "0"}
          icon={<TrendingUpIcon />}
          color="#DC3173"
        />
        <StatusCard
          title="Completed"
          value={analyticsData?.completedOrders?.toLocaleString() || "0"}
          icon={<CheckCircleIcon />}
          color="#DC3173"
        />
        <StatusCard
          title="Cancelled"
          value={analyticsData?.cancelledOrders?.toLocaleString() || "0"}
          icon={<XCircleIcon />}
          color="#DC3173"
        />
      </motion.div>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 0.8,
        }}
      >
        <div className="lg:col-span-2">
          <PopularCategories />
        </div>
        <div>
          <RecentOrders />
        </div>
      </motion.div>
      <motion.div
        className="mt-6"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 1,
        }}
      >
        <TopProducts />
      </motion.div>
    </div>
  );
};

export default Dashboard;
