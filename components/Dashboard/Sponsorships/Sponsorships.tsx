"use client";

import SponsorshipTable from "@/components/Dashboard/Sponsorships/SponsorshipTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TSponsorship } from "@/types/sponsorship.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IProps {
  sponsorshipsResult: { data: TSponsorship[]; meta?: TMeta };
  showFilters?: boolean;
  title: string;
  subtitle?: string;
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

const filterOptions = [
  {
    label: "Active Status",
    key: "status",
    placeholder: "Select Status",
    type: "select",
    items: [
      {
        label: "Active",
        value: "ACTIVE",
      },
      {
        label: "Inactive",
        value: "INACTIVE",
      },
    ],
  },
];

export default function Sponsorships({
  sponsorshipsResult,
  showFilters = false,
  title,
  subtitle,
}: IProps) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statusInfo, setStatusInfo] = useState({
    sponsorshipId: "",
    sponsorshipName: "",
    isActive: true,
  });
  const [deleteId, setDeleteId] = useState("");

  const handleStatusInfo = (
    sponsorshipId: string,
    sponsorshipName: string,
    isActive: boolean,
  ) => setStatusInfo({ sponsorshipId, sponsorshipName, isActive });

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const handleDeleteId = (id: string) => setDeleteId(id);

  const deleteSponsorship = async () => {
    console.log("delete sponsorship", deleteId);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title={title}
        subtitle={subtitle}
        buttonInfo={{
          text: "Add Sponsorship",
          onClick: () => router.push("/admin/add-sponsorship"),
        }}
      />

      {/* Filters */}
      <AllFilters
        sortOptions={sortOptions}
        {...(showFilters && { filterOptions })}
      />

      {/* Vendor Table */}
      <SponsorshipTable
        sponsorships={sponsorshipsResult?.data || []}
        handleStatusInfo={handleStatusInfo}
        handleDeleteId={handleDeleteId}
      />

      {/* Pagination */}
      {!!sponsorshipsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={sponsorshipsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteSponsorship}
      />
    </div>
  );
}
