"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TPayout } from "@/types/payout.type";
import { motion } from "framer-motion";
import { getWalletPayoutColumns } from "./WalletPayoutColumns";
import ReusableTable from "@/components/common/ReusableTable";

interface IProps {
  payouts: TPayout[];
}

export default function WalletPayoutTable({ payouts }: IProps) {
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
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_payouts_found")}
      />
    </motion.div>
  );
}
