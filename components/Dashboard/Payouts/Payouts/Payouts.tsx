"use client";

import PayoutTable from "@/components/Dashboard/Payouts/Payouts/PayoutTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TPayout } from "@/types/payout.type";
import { motion } from "framer-motion";

interface IProps {
  payoutsResult: { data: TPayout[]; meta?: TMeta };
  title: string;
  subtitle?: string;
  userRole: "VENDOR" | "FLEET_MANAGER" | "DELIVERY_PARTNER";
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

const extraSelectFilter = {
  key: "status",
  placeholder: "Select Payment Status",
  type: "select",
  isAllNeeded: false,
  defaultValue: "PAID",
  options: [
    {
      label: "Pending",
      value: "PENDING",
    },
    {
      label: "Paid",
      value: "PAID",
    },
  ],
};

export default function Payouts({
  payoutsResult,
  title,
  subtitle,
  userRole,
}: IProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader title={t(title)} subtitle={t(`${subtitle}`)} />

      {/* Filters */}
      <AllFilters
        sortOptions={sortOptions}
        extraSelectFilter={extraSelectFilter}
      />

      {/* Payouts Table */}
      <PayoutTable payouts={payoutsResult?.data || []} userRole={userRole} />

      {/* Pagination */}
      {!!payoutsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={payoutsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}
    </div>
  );
}
