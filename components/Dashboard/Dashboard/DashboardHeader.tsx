"use client";

import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";

const DashboardHeader = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      <h1 className="text-3xl font-bold">
        {t("hello")}, <span className="text-[#DC3173]">Administrator</span>
      </h1>
      <p className="text-gray-500 mt-1">
        {t("welcome_food_delivery_dashboard_overview")}
      </p>
    </motion.div>
  );
};
export default DashboardHeader;
