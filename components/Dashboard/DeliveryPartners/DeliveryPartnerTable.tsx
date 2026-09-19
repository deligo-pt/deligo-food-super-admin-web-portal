"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getDeliveryPartnerColumns } from "./deliveryPartnerColumns";
import { TMeta } from "@/types";

interface IProps {
  partners: TDeliveryPartner[];
  meta: TMeta;
  handleStatusInfo: (
    partnerId: string,
    partnerName: string,
    status: string,
  ) => void;
  handleApproveInfo: (
    partnerId: string,
    partnerName: string,
    city: string,
    status: string,
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function DeliveryPartnerTable({
  partners,
  meta,
  handleStatusInfo,
  handleApproveInfo,
  handleDeleteId,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getDeliveryPartnerColumns({
    t,
    router,
    handleStatusInfo,
    handleApproveInfo,
    handleDeleteId,
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
        data={partners || []}
        columns={columns}
        getRowKey={(row) => row._id as string}
        emptyMessage={t("no_partners_found")}
        serialStart={(currentPage - 1) * pageSize + 1}
      />
    </motion.div>
  );
}