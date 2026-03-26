"use client";

import DeliveryPartnerTable from "@/components/Dashboard/DeliveryPartners/DeliveryPartnerTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { userSoftDeleteReq } from "@/services/auth/delete-user.service";
import { TMeta } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  partnersResult: { data: TDeliveryPartner[]; meta?: TMeta };
  showFilters?: boolean;
  title: string;
  subtitle?: string;
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

const filterOptions = [
  {
    label: "Status",
    key: "status",
    placeholder: "Select Status",
    type: "select",
    items: [
      {
        label: "Pending",
        value: "PENDING",
      },
      {
        label: "Submitted",
        value: "SUBMITTED",
      },
      {
        label: "Approved",
        value: "APPROVED",
      },
      {
        label: "Rejected",
        value: "REJECTED",
      },
      {
        label: "Blocked",
        value: "BLOCKED",
      },
    ],
  },
];

export default function DeliveryPartners({
  partnersResult,
  showFilters = false,
  title,
  subtitle,
}: IProps) {
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    partnerId: "",
    partnerName: "",
    status: "",
  });
  const [deleteId, setDeleteId] = useState("");

  const handleStatusInfo = (
    partnerId: string,
    partnerName: string,
    status: string,
  ) => setStatusInfo({ partnerId, partnerName, status });

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const handleDeleteId = (id: string) => setDeleteId(id);

  const handleDeletePartner = async () => {
    const toastId = toast.loading("Deleting partner...");

    const result = await userSoftDeleteReq(deleteId);

    if (result?.success) {
      router.refresh();
      setDeleteId("");
      toast.success(result.message || "Partner deleted successfully!", {
        id: toastId,
      });
      return;
    }

    toast.error(result?.message || "Partner delete failed", {
      id: toastId,
    });
    console.log(result);
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader title={title} subtitle={subtitle} />

      {/* Filters */}
      <AllFilters
        sortOptions={sortOptions}
        {...(showFilters && { filterOptions })}
      />

      {/* Partner Table */}
      <DeliveryPartnerTable
        partners={partnersResult?.data || []}
        handleStatusInfo={handleStatusInfo}
        handleDeleteId={handleDeleteId}
      />

      {/* Pagination */}
      {!!partnersResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={partnersResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={handleDeletePartner}
      />

      {/* Approve or Reject or Block Modal */}
      <ApproveOrRejectModal
        open={statusInfo?.partnerId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({ partnerId: "", status: "", partnerName: "" })
        }
        status={
          statusInfo.status as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userId={statusInfo.partnerId}
        userName={statusInfo.partnerName}
      />
    </div>
  );
}
