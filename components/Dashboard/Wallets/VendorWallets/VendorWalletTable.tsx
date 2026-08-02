"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TVendorWallet } from "@/types/wallet.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getVendorWalletColumns } from "./VendorWalletColumns";
import ReusableTable from "@/components/common/ReusableTable";

interface IProps {
  wallets: TVendorWallet[];
}

export default function VendorWalletTable({ wallets }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getVendorWalletColumns({
    t,
    router,
  });

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
      />
    </motion.div>
  );
}
