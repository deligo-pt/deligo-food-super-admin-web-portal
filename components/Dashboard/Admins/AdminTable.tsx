"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { getAdminColumns } from "./adminColumns";
import { useTranslation } from "@/hooks/use-translation";
import { TAdmin } from "@/types/admin.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface IProps {
  admins: TAdmin[];
  handleStatusInfo: (
    adminId: string,
    adminName: string,
    status: string,
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function AdminTable({
  admins,
  handleStatusInfo,
  handleDeleteId,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const columns = getAdminColumns({
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
        data={admins}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_admins_found")}
      />
    </motion.div>
  );
}