"use client";

import DeliveryPartnerWalletTable from "@/components/Dashboard/Wallets/DeliveryPartnerWallets/DeliveryPartnerWalletTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TDeliveryPartnerWallet } from "@/types/wallet.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";

interface IProps {
  walletsResult: { data: TDeliveryPartnerWallet[]; meta?: TMeta };
}

const sortFields = ["newest", "oldest"] as SortOptionKey[];

export default function DeliveryPartnerWallets({ walletsResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t, sortFields);

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title={t("rider_wallets")}
        subtitle={t("manage_all_the_rider_wallets")}
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Wallet Table */}
      <DeliveryPartnerWalletTable wallets={walletsResult?.data || []} />

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
