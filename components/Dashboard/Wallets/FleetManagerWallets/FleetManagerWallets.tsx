"use client";

import FleetManagerWalletTable from "@/components/Dashboard/Wallets/FleetManagerWallets/FleetManagerWalletTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TFleetManagerWallet } from "@/types/wallet.type";
import { motion } from "framer-motion";

interface IProps {
  walletsResult: { data: TFleetManagerWallet[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function FleetManagerWallets({ walletsResult }: IProps) {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title="Fleet Manager Wallets"
        subtitle="Manage all the fleet manager wallets"
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Wallet Table */}
      <FleetManagerWalletTable wallets={walletsResult?.data || []} />

      {/* Pagination */}
      {!!walletsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={walletsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}
    </div>
  );
}
