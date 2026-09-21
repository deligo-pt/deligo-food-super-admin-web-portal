"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TPlaformEarningsData } from "@/types/payment.type";
import { motion } from "framer-motion";
import { getPlatformEarningsColumns } from "./PlatformEarningsColumns";
import { TMeta } from "@/types";

interface IProps {
  commissions: TPlaformEarningsData["commissions"];
  meta: TMeta;
}

export default function PlatformEarningsTable({ commissions, meta }: IProps) {
  const { t } = useTranslation();

  const columns = getPlatformEarningsColumns({
    t,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={commissions}
        meta={meta}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_commissions_found")}
      />
    </motion.div>
  );
}
