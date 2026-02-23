"use client";

import TransactionTable from "@/components/Dashboard/Transactions/TransactionTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TTransaction } from "@/types/transaction.type";
import { motion } from "framer-motion";

interface IProps {
  transactionsResult: { data: TTransaction[]; meta?: TMeta };
}

export default function Transactions({ transactionsResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title={t("transaction_history")}
        subtitle={t("full_breakdown_of_earnings_payouts_fees")}
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Transaction Table */}
      <TransactionTable transactions={transactionsResult?.data || []} />

      {/* Pagination */}
      {!!transactionsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={transactionsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}
    </div>
  );
}
