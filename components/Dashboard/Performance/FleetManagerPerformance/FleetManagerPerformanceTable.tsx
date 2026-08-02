"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TFleetManagerPerformance } from "@/types/performance.type";
import { motion } from "framer-motion";
import { getFleetManagerPerformanceColumns } from "./FleetManagerPerformanceColumns";
import ReusableTable from "@/components/common/ReusableTable";
import { useRouter } from "next/navigation";

interface IProps {
  fleetManagers: TFleetManagerPerformance[];
}

export default function FleetManagerPerformanceTable({
  fleetManagers,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getFleetManagerPerformanceColumns({
    t,
    router,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2"
    >
      <h3 className="text-xl font-semibold">{t("fleet_managers")}</h3>
      <p className="text-gray-700 mb-2">
        {t("view_fleet_managers_performance_analytics")}
      </p>

      <div className="overflow-x-auto">
        <ReusableTable
          data={fleetManagers}
          columns={columns}
          getRowKey={(row) => row._id}
          emptyMessage={t("no_fleet_manager_found")}
        />
      </div>
    </motion.div>
  );
}
