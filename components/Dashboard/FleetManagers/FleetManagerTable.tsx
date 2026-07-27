"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TAgent } from "@/types/user.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getFleetManagerColumns } from "./fleetColumns";

interface IProps {
  agents: TAgent[];
  handleStatusInfo: (
    agentId: string,
    agentName: string,
    status: string
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function FleetManagerTable({
  agents,
  handleStatusInfo,
  handleDeleteId,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getFleetManagerColumns({
    t,
    router,
    handleStatusInfo,
    handleDeleteId,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={agents || []}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_fleet_managers_found")}
      />
    </motion.div>
  );
}