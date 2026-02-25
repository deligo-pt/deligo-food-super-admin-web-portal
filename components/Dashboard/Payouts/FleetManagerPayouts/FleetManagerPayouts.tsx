"use client";

import FleetManagerPayoutTable from "@/components/Dashboard/Payouts/FleetManagerPayouts/FleetManagerPayoutTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TFleetManagerPayout } from "@/types/payout.type";
import { motion } from "framer-motion";
import { useState } from "react";

interface IProps {
  fleetManagerPayoutsResult: { data: TFleetManagerPayout[]; meta?: TMeta };
  showFilters?: boolean;
  title: string;
  subtitle?: string;
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

const filterOptions = [
  {
    label: "Status",
    key: "status",
    placeholder: "Select Status",
    type: "select",
    items: [
      {
        label: "Pending",
        value: "PENDING",
      },
      {
        label: "Approved",
        value: "APPROVED",
      },
      {
        label: "Rejected",
        value: "REJECTED",
      },
    ],
  },
];

export default function FleetManagerPayouts({
  fleetManagerPayoutsResult,
  showFilters = false,
  title,
  subtitle,
}: IProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statusInfo, setStatusInfo] = useState({
    fleetManagerPayoutId: "",
    fleetManagerPayoutName: "",
    status: "",
  });

  const handleStatusInfo = (
    fleetManagerPayoutId: string,
    fleetManagerPayoutName: string,
    status: string,
  ) => setStatusInfo({ fleetManagerPayoutId, fleetManagerPayoutName, status });

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader title={title} subtitle={subtitle} />

      {/* Filters */}
      <AllFilters
        sortOptions={sortOptions}
        {...(showFilters && { filterOptions })}
      />

      {/* VendorPayouts Table */}
      <FleetManagerPayoutTable
        fleetManagerPayouts={fleetManagerPayoutsResult?.data || []}
        handleStatusInfo={handleStatusInfo}
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
