"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TLoyaltyPoint } from "@/types/loyalty-point.type";
import { motion } from "framer-motion";
import { getLoyaltyPointColumns } from "./LoyaltyPointColumns";

interface IProps {
  points: TLoyaltyPoint[];
}

export default function LoyaltyPointTable({ points }: IProps) {
  const { t } = useTranslation();

  const columns = getLoyaltyPointColumns({
    t,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={points}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_point_found")}
      />
    </motion.div>
  );
}
