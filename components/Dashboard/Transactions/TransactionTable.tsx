"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TTransaction } from "@/types/transaction.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getTransactionColumns } from "./TransactionColumns";
import ReusableTable from "@/components/common/ReusableTable";
import { TMeta } from "@/types";

interface IProps {
  transactions: TTransaction[];
  meta: TMeta;
}

export default function TransactionTable({ transactions, meta }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getTransactionColumns({
    t,
    router,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={transactions}
        meta={meta}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_transactions_found")}
      />
    </motion.div>
  );
}
