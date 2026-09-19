"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TDeliveryPartnerWallet } from "@/types/wallet.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getDeliveryPartnerWalletColumns } from "./DeliveryPartnerWalletsColumns";
import { TMeta } from "@/types";

interface IProps {
  wallets: TDeliveryPartnerWallet[];
  meta: TMeta;
}

export default function DeliveryPartnerWalletTable({ wallets, meta }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getDeliveryPartnerWalletColumns({
    t,
    router,
  });

  const currentPage = meta?.page || 1;
  const pageSize = meta?.limit || 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={wallets}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_wallets_found")}
        serialStart={(currentPage - 1) * pageSize + 1}
      />
    </motion.div>
  );
}
