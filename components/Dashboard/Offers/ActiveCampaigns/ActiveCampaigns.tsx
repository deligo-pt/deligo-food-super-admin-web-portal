"use client";

import CampaignTable from "@/components/Dashboard/Offers/ActiveCampaigns/ActiveCampaignTable";
import EditOfferModal from "@/components/Dashboard/Offers/ActiveCampaigns/EditOfferModal";
import OfferStatusUpdateModal from "@/components/Dashboard/Offers/ActiveCampaigns/OfferStatusUpdateModal";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
  deleteOfferReq,
  updateOfferReq,
} from "@/services/dashboard/offers/offers";
import { TMeta } from "@/types";
import { TOffer } from "@/types/offer.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  offersResult: { data: TOffer[]; meta?: TMeta };
  title: string;
  subtitle?: string;
  showFilters?: boolean;
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

const filterOptions = [
  {
    label: "Active Status",
    key: "activeStatus",
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
  {
    label: "Validity Status",
    key: "validStatus",
    placeholder: "Select Status",
    type: "select",
    items: [
      {
        label: "Valid",
        value: "VALID",
      },
      {
        label: "Expired",
        value: "EXPIRED",
      },
    ],
  },
];

export default function ActiveCampaigns({
  offersResult,
  showFilters,
  title,
  subtitle,
}: IProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<TOffer | null>(null);
  const [statusInfo, setStatusInfo] = useState({
    offerId: "",
    offerName: "",
    status: false,
  });

  const handleStatusInfo = (
    offerId: string,
    offerName: string,
    status: boolean,
  ) => setStatusInfo({ offerId, offerName, status });

  const handleOpenEditModal = (offer: TOffer) => setSelectedOffer(offer);

  const closeStatusUpdateModal = (open: boolean) => {
    if (!open) {
      setStatusInfo({
        offerId: "",
        offerName: "",
        status: false,
      });
    }
  };

  const handleUpdateStatus = async () => {
    const toastId = toast.loading("Updating offer...");

    const result = await updateOfferReq(statusInfo.offerId, {
      isActive: statusInfo.status,
    });

    if (result.success) {
      toast.success(result.message || "Offer updated successfully!", {
        id: toastId,
      });
      closeStatusUpdateModal(false);
      router.refresh();
      return;
    }

    toast.error(result.message || "Offer update failed", { id: toastId });
    console.log(result);
  };

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const handleDeleteId = (id: string) => setDeleteId(id);

  const handleDeleteCampaign = async () => {
    const toastId = toast.loading("Deleting Offer...");

    const result = await deleteOfferReq(deleteId);

    if (result.success) {
      toast.success(result.message || "Offer deleted successfully!", {
        id: toastId,
      });
      router.refresh();
      closeDeleteModal(false);
      return;
    }

    toast.error(result.message || "Offer delete failed", { id: toastId });
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

      {/* Campaign Table */}
      <CampaignTable
        offers={offersResult?.data || []}
        handleStatusInfo={handleStatusInfo}
        handleOpenEditModal={handleOpenEditModal}
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

      {/* Edit Modal */}
      {selectedOffer && (
        <EditOfferModal
          open={!!selectedOffer}
          onOpenChange={(open) => !open && setSelectedOffer(null)}
          prevValues={selectedOffer}
        />
      )}

      {/* Status Update Modal */}
      {statusInfo.offerId && (
        <OfferStatusUpdateModal
          open={!!statusInfo.offerId}
          onOpenChange={closeStatusUpdateModal}
          onConfirm={handleUpdateStatus}
          statusInfo={statusInfo}
        />
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
