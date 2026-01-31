"use client";

import CampaignTable from "@/components/Dashboard/Offers/ActiveCampaigns/ActiveCampaignTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TOffer } from "@/types/offer.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IProps {
  offersResult: { data: TOffer[]; meta?: TMeta };
  showFilters?: boolean;
  title: string;
  subtitle?: string;
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function ActiveCampaigns({
  offersResult,
  title,
  subtitle,
}: IProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState("");

  const handleStatusInfo = (
    offerId: string,
    offerName: string,
    status: boolean,
  ) => {
    console.log(offerId, offerName, status);
  };

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const handleDeleteId = (id: string) => setDeleteId(id);

  const handleDeleteCampaign = async () => {};

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader title={title} subtitle={subtitle} />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Campaign Table */}
      <CampaignTable
        offers={offersResult?.data || []}
        handleStatusInfo={handleStatusInfo}
        handleDeleteId={handleDeleteId}
      />

      {/* Pagination */}
      {!!offersResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={offersResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={handleDeleteCampaign}
      />
    </div>
  );
}
