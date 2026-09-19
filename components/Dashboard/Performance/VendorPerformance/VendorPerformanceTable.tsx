"use client";


import { useTranslation } from "@/hooks/use-translation";
import { TVendorPerformance } from "@/types/performance.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/common/ReusableTable";
import { getVendorPerformanceColumns } from "./VendorPerformanceColumns";
import { TMeta } from "@/types";

interface IProps {
  vendors: TVendorPerformance[];
  meta: TMeta;
}

export default function VendorPerformanceTable({ vendors, meta }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getVendorPerformanceColumns({ t, router });

  const currentPage = meta?.page || 1;
  const pageSize = meta?.limit || 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2"
    >
      <h3 className="text-xl font-semibold">{t("vendors")}</h3>
      <p className="text-gray-700 mb-2">
        {t("view_vendor_performance_analytics")}
      </p>

      <div className="overflow-x-auto">
        <ReusableTable
          data={vendors}
          columns={columns}
          getRowKey={(row) => row._id}
          emptyMessage={t("no_vendors_found")}
          serialStart={(currentPage - 1) * pageSize + 1}
        />
      </div>
    </motion.div>
  );
}