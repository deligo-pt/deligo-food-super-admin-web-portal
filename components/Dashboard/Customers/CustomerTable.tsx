"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TCustomer } from "@/types/user.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCustomerColumns } from "./customerColumns";

interface IProps {
  customers: TCustomer[];
  handleStatusInfo: (
    customerId: string,
    customerName: string,
    status: string
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function CustomerTable({
  customers,
  handleStatusInfo,
  handleDeleteId,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getCustomerColumns({
    t,
    router,
    handleStatusInfo,
    handleDeleteId,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={customers || []}
        columns={columns}
        getRowKey={(row) => row._id as string}
        emptyMessage={t("no_customers_found")}
      />
    </motion.div>
  );
}