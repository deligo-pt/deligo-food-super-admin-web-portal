"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/store/store";
import { TTax } from "@/types/tax.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getTaxColumns } from "./TaxColumns";

interface IProps {
  taxes: TTax[];
  onEditClick: (tax: TTax) => void;
  onStatusChange: (id: string, status: boolean) => void;
  onDeleteClick: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export default function TaxTable({
  taxes,
  onEditClick,
  onStatusChange,
  onDeleteClick,
  onPermanentDelete
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang } = useStore();

  const columns = getTaxColumns({
    t,
    lang,
    router,
    onEditClick,
    onStatusChange,
    onDeleteClick,
    onPermanentDelete,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={taxes}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_tax_found")}
      />
    </motion.div>
  );
}
