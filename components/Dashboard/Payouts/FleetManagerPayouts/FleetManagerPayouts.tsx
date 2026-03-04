"use client";

import FleetManagerPayoutTable from "@/components/Dashboard/Payouts/FleetManagerPayouts/FleetManagerPayoutTable";
import AddNewPayout from "@/components/Dashboard/Payouts/MakePayout/AddNewPayout";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TFleetManagerPayout } from "@/types/payout.type";
import { motion } from "framer-motion";
import { useState } from "react";

interface IProps {
  fleetManagerPayoutsResult: { data: TFleetManagerPayout[]; meta?: TMeta };
  title: string;
  subtitle?: string;
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function FleetManagerPayouts({
  fleetManagerPayoutsResult,
  title,
  subtitle,
}: IProps) {
  const [openFleetPayout, setOpenFleetPayout] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title={title}
        subtitle={subtitle}
        extraComponent={
          <AddNewPayout
            open={openFleetPayout}
            onOpenChange={(open: boolean) => setOpenFleetPayout(open)}
            type="fleetManager"
          />
        }
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* VendorPayouts Table */}
      <FleetManagerPayoutTable
        fleetManagerPayouts={fleetManagerPayoutsResult?.data || []}
      />

      {/* Pagination */}
      {!!fleetManagerPayoutsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={fleetManagerPayoutsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}
    </div>
  );
}
