"use client";

import CustomerTable from "@/components/Dashboard/Customers/CustomerTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta, TResponse } from "@/types";
import { TCustomer } from "@/types/user.type";
import { getCookie } from "@/utils/cookies";
import { deleteData } from "@/utils/requests";
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
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    customerId: "",
    customerName: "",
    status: "",
  });
  const [deleteId, setDeleteId] = useState("");

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

    try {
      const result = (await deleteData(`/auth/soft-delete/${deleteId}`, {
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<null>;

      if (result?.success) {
        router.refresh();
        setDeleteId("");
        toast.success(result.message || "Customer deleted successfully!", {
          id: toastId,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Customer delete failed", {
        id: toastId,
      });
    }
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
