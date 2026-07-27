"use client";


import { getDeliveryPartnerColumns } from "./deliveryPartnerColumns"; // adjust path
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { useTranslation } from "@/hooks/use-translation";
import { userSoftDeleteReq } from "@/services/auth/delete-user.service";
import { TMeta } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ReusableTable from "../common/ReusableTable";

interface IProps {
  deliveryPartnersResult: { data: TDeliveryPartner[]; meta?: TMeta };
}

const sortFields = ["newest", "oldest", "nameAZ", "nameZA"] as SortOptionKey[];

export default function DeliveryPartnerTable({
  deliveryPartnersResult,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    deliveryPartnerId: "",
    deliveryPartnerName: "",
    status: "",
  });
  const [deleteId, setDeleteId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const sortOptions = getSortOptions(t, sortFields);

  const filterOptions = [
    {
      label: t("status"),
      key: "status",
      placeholder: t("select_status"),
      type: "select",
      items: [
        { label: t("pending"), value: "PENDING" },
        { label: t("submitted"), value: "SUBMITTED" },
        { label: t("approved"), value: "APPROVED" },
        { label: t("rejected"), value: "REJECTED" },
        { label: t("blocked"), value: "BLOCKED" },
      ],
    },
  ];

  const closeDeleteModal = (open: boolean) => {
    if (!open) setDeleteId("");
  };

  const deleteDeliveryPartner = async () => {
    const toastId = toast.loading("Deleting Delivery Partner...");
    setIsDeleting(true);

    const result = await userSoftDeleteReq(deleteId);

    if (result?.success) {
      router.refresh();
      setDeleteId("");
      toast.success(
        result.message || "Delivery Partner deleted successfully!",
        { id: toastId },
      );
      return;
    }

    toast.error(result?.message || "Delivery Partner delete failed", {
      id: toastId,
    });
    setIsDeleting(false);
  };

  const columns = getDeliveryPartnerColumns({
    t,
    router,
    setStatusInfo,
    setDeleteId,
  });

  return (
    <>
      <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
      >
        <ReusableTable
          data={deliveryPartnersResult?.data || []}
          columns={columns}
          getRowKey={(row) => row._id as string}
          emptyMessage={t("no_delivery_partners_found")}
        />
      </motion.div>

      {!!deliveryPartnersResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={deliveryPartnersResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteDeliveryPartner}
        isDeleting={isDeleting}
      />

      <ApproveOrRejectModal
        open={statusInfo?.deliveryPartnerId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({
            deliveryPartnerId: "",
            status: "",
            deliveryPartnerName: "",
          })
        }
        status={
          statusInfo.status as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userId={statusInfo.deliveryPartnerId}
        userName={statusInfo.deliveryPartnerName}
      />
    </>
  );
}