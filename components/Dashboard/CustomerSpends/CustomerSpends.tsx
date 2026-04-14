"use client";

import CustomerSpendTable from "@/components/Dashboard/CustomerSpends/CustomerSpendTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TTransaction } from "@/types/transaction.type";
import { motion } from "framer-motion";

interface IProps {
  customerSpendsResult: { data: TTransaction[]; meta?: TMeta };
}

export default function CustomerSpends({ customerSpendsResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title="Customer Spends"
        subtitle="Payment history of customers"
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Customer Spend Table */}
      <CustomerSpendTable spends={customerSpendsResult?.data || []} />

      {/* Pagination */}
      {!!customerSpendsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={customerSpendsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}
    </div>
  );
}
