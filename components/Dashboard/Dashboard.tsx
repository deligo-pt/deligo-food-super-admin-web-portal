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
  Bike,
  CheckCircleIcon,
  Pizza,
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
          value={analyticsData?.counts?.vendors?.toLocaleString() || "0"}
          description="Active food partners"
          icon={<StoreIcon />}
          color="#DC3173"
        />
        <StatCard
          title="Total Fleet Managers"
          value={analyticsData?.counts?.fleetManagers?.toLocaleString() || "0"}
          description="Managing deliveries"
          icon={<TruckIcon />}
          color="#DC3173"
        />
        <StatCard
          title="Total Customers"
          value={analyticsData?.counts?.customers?.toLocaleString() || "0"}
          description="Registered customers"
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
          title="Total Items"
          value={analyticsData?.counts?.totalProducts?.toLocaleString() || "0"}
          description="Total listed items"
          icon={<Pizza />}
          color="#DC3173"
        />
        <StatCard
          title="Total Delivery Partners"
          value={
            analyticsData?.counts?.deliveryPartners?.toLocaleString() || "0"
          }
          description="Registered delivery partners"
          icon={<Bike />}
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
          value={analyticsData?.orders?.total?.toLocaleString() || "0"}
          icon={<ShoppingBagIcon />}
          color="#DC3173"
        />
        <StatusCard
          title="Pending"
          value={analyticsData?.orders?.pending?.toLocaleString() || "0"}
          icon={<TrendingUpIcon />}
          color="#DC3173"
        />
        <StatusCard
          title="Completed"
          value={analyticsData?.orders?.completed?.toLocaleString() || "0"}
          icon={<CheckCircleIcon />}
          color="#DC3173"
        />
        <StatusCard
          title="Cancelled"
          value={analyticsData?.orders?.cancelled?.toLocaleString() || "0"}
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
          <PopularCategories
            popularCategories={analyticsData?.popularCategories}
          />
        </div>
        <div>
          <RecentOrders recentOrders={analyticsData?.recentOrders} />
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
        <TopProducts topRatedItems={analyticsData?.topRatedItems} />
      </motion.div>
    </div>
  );
};

export default Dashboard;
