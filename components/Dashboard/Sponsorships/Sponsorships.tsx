"use client";

import EditSponsorshipModal from "@/components/Dashboard/Sponsorships/EditSponsorshipModal";
import SponsorshipTable from "@/components/Dashboard/Sponsorships/SponsorshipTable";
import ViewSponsorshipModal from "@/components/Dashboard/Sponsorships/ViewSponsorshipModal";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { deleteSponsorshipReq } from "@/services/dashboard/sponsorships/sponsorships";
import { TMeta } from "@/types";
import { TSponsorship } from "@/types/sponsorship.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
  title,
  subtitle,
}: IProps) {
  const router = useRouter();

  const [deleteId, setDeleteId] = useState("");
  const [selectedSponsorship, setSelectedSponsorship] = useState<{
    sponsorship: TSponsorship;
    action: "view" | "edit";
  } | null>(null);

  const handleOpenViewModal = (sponsorship: TSponsorship) =>
    setSelectedSponsorship({ sponsorship, action: "view" });

  const handleOpenEditModal = (sponsorship: TSponsorship) =>
    setSelectedSponsorship({ sponsorship, action: "edit" });

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const handleDeleteId = (id: string) => setDeleteId(id);

  const deleteSponsorship = async () => {
    const toastId = toast.loading("Deleting Sponsorship...");

    const result = await deleteSponsorshipReq(deleteId);

    if (result.success) {
      toast.success(result.message || "Sponsorship deleted successfully!", {
        id: toastId,
      });
      router.refresh();
      closeDeleteModal(false);
      return;
    }

    toast.error(result.message || "Sponsorship delete failed", { id: toastId });
    console.log(result);
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
      <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

      {/* Vendor Table */}
      <SponsorshipTable
        sponsorships={sponsorshipsResult?.data || []}
        handleDeleteId={handleDeleteId}
        handleOpenViewModal={handleOpenViewModal}
        handleOpenEditModal={handleOpenEditModal}
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

      {/* View Modal */}
      {selectedSponsorship && selectedSponsorship.action === "view" && (
        <ViewSponsorshipModal
          open={!!selectedSponsorship}
          onOpenChange={(open) => !open && setSelectedSponsorship(null)}
          sponsorship={selectedSponsorship.sponsorship as TSponsorship}
        />
      )}

      {/* Edit Modal */}
      {selectedSponsorship && selectedSponsorship.action === "edit" && (
        <EditSponsorshipModal
          open={!!selectedSponsorship}
          onOpenChange={(open) => !open && setSelectedSponsorship(null)}
          prevValues={selectedSponsorship.sponsorship as TSponsorship}
        />
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
