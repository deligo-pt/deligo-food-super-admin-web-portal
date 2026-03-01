"use client";

import VendorPayoutTable from "@/components/Dashboard/Payouts/VendorPayouts/VendorPayoutTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TVendorPayout } from "@/types/payout.type";
import { motion } from "framer-motion";

interface IProps {
  vendorPayoutsResult: { data: TVendorPayout[]; meta?: TMeta };
  title: string;
  subtitle?: string;
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function VendorPayouts({
  vendorPayoutsResult,
  title,
  subtitle,
}: IProps) {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader title={title} subtitle={subtitle} />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* VendorPayouts Table */}
      <VendorPayoutTable vendorPayouts={vendorPayoutsResult?.data || []} />

      {/* Pagination */}
      {!!vendorPayoutsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={vendorPayoutsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}
    </div>
  );
}
