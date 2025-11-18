"use client";

import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import PopularCategories from "@/components/Dashboard/PopularCategories";
import RecentOrders from "@/components/Dashboard/RecentOrders";
import StatCard from "@/components/Dashboard/StatCard";
import StatusCard from "@/components/Dashboard/StatusCard";
import TopProducts from "@/components/Dashboard/TopProducts";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ShoppingBagIcon,
  StoreIcon,
  TrendingUpIcon,
  TruckIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";

const Dashboard = () => {
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
          value="124"
          description="Active food partners"
          icon={<StoreIcon />}
          color="#DC3173"
        />
        <StatCard
          title="Total Fleet Managers"
          value="18"
          description="Managing deliveries"
          icon={<TruckIcon />}
          color="#DC3173"
        />
        <StatCard
          title="Total Customers"
          value="2,456"
          description="Registered users"
          icon={<UsersIcon />}
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
          delay: 0.4,
        }}
      >
        <StatusCard
          title="New Orders"
          value="28"
          icon={<ShoppingBagIcon />}
          color="#DC3173"
        />
        <StatusCard
          title="Processing"
          value="16"
          icon={<TrendingUpIcon />}
          color="#DC3173"
        />
        <StatusCard
          title="Completed"
          value="345"
          icon={<CheckCircleIcon />}
          color="#DC3173"
        />
        <StatusCard
          title="Cancelled"
          value="12"
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
          delay: 0.6,
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
          delay: 0.8,
        }}
      >
        <TopProducts />
      </motion.div>
    </div>
  );
};

export default Dashboard;
