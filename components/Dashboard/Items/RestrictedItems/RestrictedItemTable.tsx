"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TRestrictedItem } from "@/types/product.type";
import { motion } from "framer-motion";

import { getRestrictedItemColumns } from "./RestrictedItemsColumns";
import { TMeta } from "@/types";

interface IProps {
  restrictedItems: TRestrictedItem[];
  meta: TMeta;
  onEdit: (item: TRestrictedItem) => void;
  onDelete: (id: string) => void;
}

export default function RestrictedItemTable({
  restrictedItems,
  meta,
  onEdit,
  onDelete,
}: IProps) {
  const { t } = useTranslation();

  const columns = getRestrictedItemColumns({
    t,
    onEdit,
    onDelete,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={restrictedItems}
        meta={meta}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_restricted_items_found")}
      />
    </motion.div>
  );
}
