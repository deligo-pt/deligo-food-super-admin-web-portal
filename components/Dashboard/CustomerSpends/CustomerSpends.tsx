"use client";

import CustomerSpendTable from "@/components/Dashboard/CustomerSpends/CustomerSpendTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TTransaction } from "@/types/transaction.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";

interface IProps {
  customerSpendsResult: { data: TTransaction[]; meta?: TMeta };
}
const sortFields = ["newest", "oldest"] as SortOptionKey[];

export default function CustomerSpends({ customerSpendsResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t, sortFields);

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title={t("customer_spends")}
        subtitle={t("payment_history_of_customers")}
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
