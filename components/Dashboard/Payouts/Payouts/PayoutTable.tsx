"use client";

// or correct path
import { useTranslation } from "@/hooks/use-translation";
import { TPayout } from "@/types/payout.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/common/ReusableTable";
import { getPayoutColumns } from "./PayoutColumns";


interface IProps {
  payouts: TPayout[];
  userRole: "VENDOR" | "FLEET_MANAGER" | "DELIVERY_PARTNER";
}

export default function PayoutTable({ payouts, userRole }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const columns = getPayoutColumns({ t, router, userRole });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={payouts}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_payouts_found")}
      />
    </motion.div>
  );
}