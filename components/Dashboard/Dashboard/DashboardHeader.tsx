"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
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
      <TitleHeader
        title={`${t("hello")}, Administrator`}
        subtitle={t("welcome_food_delivery_dashboard_overview")}
      />
    </motion.div>
  );
};
export default DashboardHeader;
