"use client";

import VendorTable from "@/components/Dashboard/Vendors/VendorTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { userSoftDeleteReq } from "@/services/auth/delete-user.service";
import { TMeta } from "@/types";
import { TVendor } from "@/types/user.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  vendorsResult: { data: TVendor[]; meta?: TMeta };
  showFilters?: boolean;
  showButton?: boolean;
  title: string;
  subtitle?: string;
}

const sortFields = ["newest", "oldest", "nameAZ", "nameZA"] as SortOptionKey[];

export default function Vendors({
  vendorsResult,
  showFilters = false,
  showButton = true,
  title,
  subtitle,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const sortOptions = getSortOptions(t, sortFields);
  const [statusInfo, setStatusInfo] = useState({
    vendorId: "",
    vendorName: "",
    status: "",
  });
  const [deleteId, setDeleteId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusInfo = (
    vendorId: string,
    vendorName: string,
    status: string,
  ) => setStatusInfo({ vendorId, vendorName, status });

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const handleDeleteId = (id: string) => setDeleteId(id);

  const deleteVendor = async () => {
    const toastId = toast.loading("Deleting Vendor...");
    setIsDeleting(true);

    const result = await userSoftDeleteReq(deleteId);

    if (result?.success) {
      router.refresh();
      setDeleteId("");
      toast.success(result.message || "Vendor deleted successfully!", {
        id: toastId,
      });
      setIsDeleting(false);
      return;
    }

    toast.error(result?.message || "Vendor delete failed", {
      id: toastId,
    });
    console.log(result);
    setIsDeleting(false);
  };

  const extraSelectFilter = {
    key: "businessType",
    placeholder: t("select_type"),
    type: "select",
    isAllNeeded: false,
    // defaultValue: "All",
    options: [
      {
        label: t("all"),
        value: "All",
      },
      {
        label: t("store"),
        value: "STORE",
      },
      {
        label: t("restaurant"),
        value: "RESTAURANT",
      },
    ],
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title={t(`${title}`)}
        subtitle={t(`${subtitle}`)}
        buttonInfo={
          showButton
            ? {
              text: t("add_vendor"),
              onClick: () => router.push("/admin/add-vendor"),
            }
            : undefined
        }
      />

      {/* Filters */}
      <AllFilters
        sortOptions={sortOptions}
        // {...(showFilters && { filterOptions })}
        extraSelectFilter={extraSelectFilter}
      />

      {/* Vendor Table */}
      <VendorTable
        vendors={vendorsResult?.data || []}
        handleStatusInfo={handleStatusInfo}
        handleDeleteId={handleDeleteId}
      />

      {/* Pagination */}
      {!!vendorsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={vendorsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteVendor}
        isDeleting={isDeleting}
      />

      {/* Approve or Reject or Block Modal */}
      <ApproveOrRejectModal
        open={statusInfo?.vendorId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({ vendorId: "", status: "", vendorName: "" })
        }
        status={
          statusInfo.status as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userId={statusInfo.vendorId}
        userName={statusInfo.vendorName}
      />
    </div>
  );
}
