"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TPayout } from "@/types/payout.type";
import { motion } from "framer-motion";
import { getWalletPayoutColumns } from "./WalletPayoutColumns";
import ReusableTable from "@/components/common/ReusableTable";
import { TMeta } from "@/types";

interface IProps {
  payouts: TPayout[];
  meta: TMeta;
}

export default function WalletPayoutTable({ payouts, meta }: IProps) {
  const { t } = useTranslation();

  const columns = getWalletPayoutColumns({
    t,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={payouts}
        meta={meta}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_payouts_found")}
      />
    </motion.div>
  );
}
