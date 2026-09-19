"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/store/store";
import { TTransaction } from "@/types/transaction.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCustomerSpendColumns } from "./customerSpendsColumns";
import { TMeta } from "@/types";

interface IProps {
  spends: TTransaction[];
  meta: TMeta;
}

export default function CustomerSpendTable({ spends, meta }: IProps) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const router = useRouter();

  const columns = getCustomerSpendColumns({
    t,
    lang,
    router,
  });

  const currentPage = meta?.page || 1;
  const pageSize = meta?.limit || 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={spends || []}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_spends_found")}
        serialStart={(currentPage - 1) * pageSize + 1}
      />
    </motion.div>
  );
}