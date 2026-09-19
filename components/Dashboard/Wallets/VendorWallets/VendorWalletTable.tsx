"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TVendorWallet } from "@/types/wallet.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getVendorWalletColumns } from "./VendorWalletColumns";
import ReusableTable from "@/components/common/ReusableTable";
import { TMeta } from "@/types";

interface IProps {
  wallets: TVendorWallet[];
  meta: TMeta;
}

export default function VendorWalletTable({ wallets, meta }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getVendorWalletColumns({
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
