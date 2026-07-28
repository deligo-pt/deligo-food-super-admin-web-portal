"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TVendor } from "@/types/user.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getVendorColumns } from "./VendorColumns";
import ReusableTable from "@/components/common/ReusableTable";

interface IProps {
  vendors: TVendor[];
  handleStatusInfo: (
    vendorId: string,
    vendorName: string,
    status: string,
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function VendorTable({
  vendors,
  handleStatusInfo,
  handleDeleteId,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getVendorColumns({
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
        data={vendors}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_vendors_found")}
      />
    </motion.div>
  );
}