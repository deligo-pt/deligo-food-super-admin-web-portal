"use client";

import CustomerTable from "@/components/Dashboard/Customers/CustomerTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { userSoftDeleteReq } from "@/services/auth/delete-user.service";
import { TMeta } from "@/types";
import { TCustomer } from "@/types/user.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  customersResult: { data: TCustomer[]; meta?: TMeta };
  showFilters?: boolean;
  title: string;
  subtitle?: string;
}

const sortFields = ["newest", "oldest", "nameAZ", "nameZA"] as SortOptionKey[];

const filterOptions = [
  {
    label: "Status",
    key: "status",
    placeholder: "Select Status",
    type: "select",
    items: [
      {
        label: "Approved",
        value: "APPROVED",
      },
      {
        label: "Blocked",
        value: "BLOCKED",
      },
    ],
  },
];

export default function Customers({
  customersResult,
  showFilters = false,
  title,
  subtitle,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const sortOptions = getSortOptions(t, sortFields);
  const [statusInfo, setStatusInfo] = useState({
    customerId: "",
    customerName: "",
    status: "",
  });
  const [deleteId, setDeleteId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusInfo = (
    customerId: string,
    customerName: string,
    status: string,
  ) => setStatusInfo({ customerId, customerName, status });

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const handleDeleteId = (id: string) => setDeleteId(id);

  const deleteCustomer = async () => {
    const toastId = toast.loading("Deleting Customer...");
    setIsDeleting(true);

    const result = await userSoftDeleteReq(deleteId);

    if (result?.success) {
      router.refresh();
      setDeleteId("");
      toast.success(result.message || "Customer deleted successfully!", {
        id: toastId,
      });
      return;
    }

    toast.error(result?.message || "Customer delete failed", {
      id: toastId,
    });
    console.log(result);
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader title={t(`${title}`)} subtitle={t(`${subtitle}`)} />

      {/* Filters */}
      <AllFilters
        sortOptions={sortOptions}
        {...(showFilters && { filterOptions })}
      />

      {/* Customer Table */}
      <CustomerTable
        customers={customersResult?.data || []}
        handleStatusInfo={handleStatusInfo}
        handleDeleteId={handleDeleteId}
      />

      {/* Pagination */}
      {!!customersResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={customersResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteCustomer}
        isDeleting={isDeleting}
      />

      {/* Approve or Reject or Block Modal */}
      <ApproveOrRejectModal
        open={statusInfo?.customerId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({ customerId: "", status: "", customerName: "" })
        }
        status={
          statusInfo.status as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userId={statusInfo.customerId}
        userName={statusInfo.customerName}
      />
    </div>
  );
}
