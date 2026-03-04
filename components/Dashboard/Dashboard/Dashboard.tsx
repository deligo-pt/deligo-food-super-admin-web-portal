"use client";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
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
import PopularCategories from "./PopularCategories";
import RecentOrders from "./RecentOrders";
import StatCard from "./StatCard";
import StatusCard from "./StatusCard";
import TopProducts from "./TopProducts";

const Dashboard = ({ analyticsData }: { analyticsData: TAnalytics }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Header */}
      <TitleHeader
        title={`${t("hello")}, Administrator`}
        subtitle={t("welcome_food_delivery_dashboard_overview")}
      />

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6"
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
          title={t("total_vendors")}
          value={analyticsData?.counts?.vendors?.toLocaleString() || "0"}
          description={t("active_food_partners")}
          icon={<StoreIcon />}
          color="#DC3173"
        />
        <StatCard
          title={t("total_fleet_managers")}
          value={analyticsData?.counts?.fleetManagers?.toLocaleString() || "0"}
          description={t("managing_deliveries")}
          icon={<TruckIcon />}
          color="#DC3173"
        />
        <StatCard
          title={t("total_customers")}
          value={analyticsData?.counts?.customers?.toLocaleString() || "0"}
          description={t("registered_customers")}
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
          title={t("total_items")}
          value={analyticsData?.counts?.totalProducts?.toLocaleString() || "0"}
          description={t("tatal_listed_items")}
          icon={<Pizza />}
          color="#DC3173"
        />
        <StatCard
          title={t("total_delivery_partners")}
          value={
            analyticsData?.counts?.deliveryPartners?.toLocaleString() || "0"
          }
          description={t("registered_delivery_partners")}
          icon={<Bike />}
          color="#DC3173"
        />
      </motion.div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
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
          title={t("total_orders")}
          value={analyticsData?.orders?.total?.toLocaleString() || "0"}
          icon={<ShoppingBagIcon />}
          color="#DC3173"
        />
        <StatusCard
          title={t("pending_orders")}
          value={analyticsData?.orders?.pending?.toLocaleString() || "0"}
          icon={<TrendingUpIcon />}
          color="#DC3173"
        />
        <StatusCard
          title={t("completed_orders")}
          value={analyticsData?.orders?.completed?.toLocaleString() || "0"}
          icon={<CheckCircleIcon />}
          color="#DC3173"
        />
        <StatusCard
          title={t("cancelled_orders")}
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
