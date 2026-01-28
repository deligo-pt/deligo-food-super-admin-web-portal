"use client";

import VendorPayoutTable from "@/components/Dashboard/Payouts/VendorPayouts/VendorPayoutTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TVendorPayout } from "@/types/payout.type";
import { motion } from "framer-motion";
import { useState } from "react";

interface IProps {
  vendorPayoutsResult: { data: TVendorPayout[]; meta?: TMeta };
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

export default function VendorPayouts({
  vendorPayoutsResult,
  showFilters = false,
  title,
  subtitle,
}: IProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statusInfo, setStatusInfo] = useState({
    vendorPayoutId: "",
    vendorPayoutName: "",
    status: "",
  });

  const handleStatusInfo = (
    vendorPayoutId: string,
    vendorPayoutName: string,
    status: string,
  ) => setStatusInfo({ vendorPayoutId, vendorPayoutName, status });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader title={title} subtitle={subtitle} />

      {/* Filters */}
      <AllFilters
        sortOptions={sortOptions}
        {...(showFilters && { filterOptions })}
      />

      {/* VendorPayouts Table */}
      <VendorPayoutTable
        vendorPayouts={vendorPayoutsResult?.data || []}
        handleStatusInfo={handleStatusInfo}
      />

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

      {/* Approve or Reject Payout Modal */}
      {/* <ApproveOrRejectModal
        open={statusInfo?.vendorPayoutId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({ vendorPayoutId: "", status: "", vendorName: "" })
        }
        status={
          statusInfo.status as "APPROVED" | "REJECTED"
        }
        payoutId={statusInfo.vendorPayoutId}
        userName={statusInfo.vendorName}
      /> */}
    </div>
  );
}
