"use client";

import FleetManagerTable from "@/components/Dashboard/FleetManagers/FleetManagerTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta, TResponse } from "@/types";
import { TAgent } from "@/types/user.type";
import { getCookie } from "@/utils/cookies";
import { deleteData } from "@/utils/requests";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  agentsResult: { data: TAgent[]; meta?: TMeta };
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

export default function FleetManagers({
  agentsResult,
  showFilters = false,
  title,
  subtitle,
}: IProps) {
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    agentId: "",
    agentName: "",
    status: "",
  });
  const [deleteId, setDeleteId] = useState("");

  const handleStatusInfo = (
    agentId: string,
    agentName: string,
    status: string,
  ) => setStatusInfo({ agentId, agentName, status });

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const handleDeleteId = (id: string) => setDeleteId(id);

  const handleDeleteFleetManager = async () => {
    const toastId = toast.loading("Deleting fleet manager...");

    try {
      const result = (await deleteData(`/auth/soft-delete/${deleteId}`, {
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<null>;

      if (result?.success) {
        router.refresh();
        setDeleteId("");
        toast.success(result.message || "Fleet manager deleted successfully!", {
          id: toastId,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Fleet manager delete failed",
        {
          id: toastId,
        },
      );
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title={title}
        subtitle={subtitle}
        buttonInfo={{
          text: "Add Fleet Manager",
          onClick: () => router.push("/admin/add-fleet-manager"),
        }}
      />

      {/* Filters */}
      <AllFilters
        sortOptions={sortOptions}
        {...(showFilters && { filterOptions })}
      />

      {/* Fleet Manager Table */}
      <FleetManagerTable
        agents={agentsResult?.data || []}
        handleStatusInfo={handleStatusInfo}
        handleDeleteId={handleDeleteId}
      />

      {/* Pagination */}
      {!!agentsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={agentsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={handleDeleteFleetManager}
      />

      {/* Approve or Reject or Block Modal */}
      <ApproveOrRejectModal
        open={statusInfo?.agentId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({ agentId: "", status: "", agentName: "" })
        }
        status={
          statusInfo.status as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userId={statusInfo.agentId}
        userName={statusInfo.agentName}
      />
    </div>
  );
}
