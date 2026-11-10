"use client";

import {
  AdminOfferBadge,
  FirstOrderBadge,
  OfferStatusBadge,
  OfferTypeIcon,
} from "../../Vendors/VendorDetails/Products/OfferBadges";
import OfferStatusUpdateModal from "@/components/Dashboard/Offers/ActiveCampaigns/OfferStatusUpdateModal";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import {
  deleteOfferReq,
  toggleOfferStatusReq,
} from "@/services/dashboard/offer/offer.service";
import { useStore } from "@/store/store";
import { TMeta } from "@/types";
import { TOffer } from "@/types/offer.type";
import { TVendor } from "@/types/user.type";
import { getKnownOfferError } from "@/utils/offer.error";
import {
  canAdminEditVendorOffer,
  formatOfferDiscount,
  getOfferStatus,
  isAdminCreatedVendorOffer,
  isFirstOrderOffer,
} from "@/utils/offer.util";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarClock, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import EditVendorOfferModal from "./EditVendorOfferModal";

const SHADOW = "0 6px 20px rgba(0,0,0,0.06)";

interface IProps {
  vendor: TVendor;
  offersResult: {
    data: TOffer[];
    meta?: TMeta;
  };
}
const sortFields = ["newest", "oldest"] as SortOptionKey[];

export default function VendorOffers({ vendor, offersResult }: IProps) {
  const { lang } = useStore();
  const { t } = useTranslation();
  const router = useRouter();
  const sortOptions = getSortOptions(t, sortFields);

  // status modal: `status` is the status we are switching TO
  const [statusInfo, setStatusInfo] = useState({
    offerId: "",
    offerName: "",
    status: false,
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // edit modal
  const [editOffer, setEditOffer] = useState<TOffer | null>(null);

  // delete modal
  const [deleteId, setDeleteId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const resetStatusInfo = () =>
    setStatusInfo({ offerId: "", offerName: "", status: false });

  const handleToggleStatus = async () => {
    const activating = statusInfo.status;
    const toastId = toast.loading(
      activating ? t("activating_offer") : t("deactivating_offer"),
    );
    setButtonDisabled(true);

    const result = await toggleOfferStatusReq(statusInfo.offerId);

    if (result.success) {
      toast.success(
        result.message ||
        (activating ? t("offer_activated") : t("offer_deactivated")),
        { id: toastId },
      );
      router.refresh();
    } else {
      // e.g. 409: another first-order offer is already active
      toast.error(
        getKnownOfferError(result) ||
        result.message ||
        t("could_not_update_offer"),
        { id: toastId },
      );
    }

    setButtonDisabled(false);
    resetStatusInfo();
  };

  const handleDelete = async () => {
    const toastId = toast.loading(t("deleting_offer"));
    setIsDeleting(true);

    const result = await deleteOfferReq(deleteId);

    if (result.success) {
      toast.success(result.message || t("offer_deleted_successfully"), {
        id: toastId,
      });
      router.refresh();
    } else {
      toast.error(result.message || t("offer_delete_failed"), { id: toastId });
    }

    setIsDeleting(false);
    setDeleteId("");
  };

  return (
    <div className="min-h-screen space-y-5">
      <TitleHeader
        title={`${vendor.name?.firstName} ${vendor.name?.lastName}'s ${t("Offers")}`}
        subtitle={`${t("all_offers_from")} (${vendor.email})`}
        onBackClick={() => router.back()}
      />

      <AllFilters sortOptions={sortOptions} />

      <div className="space-y-6 pt-4">
        {offersResult?.data?.map((offer, idx) => {
          // Same rule as Edit: only offers an admin created for this store
          const canManage = canAdminEditVendorOffer(offer);

          return (
            <motion.div
              key={offer?._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card
                className="rounded-3xl bg-white border shadow-md hover:shadow-xl transition-all"
                style={{ boxShadow: SHADOW }}
              >
                <CardContent className="px-6 py-4">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <OfferTypeIcon
                        type={offer.offerType}
                        size={28}
                        className="h-16 w-16"
                      />

                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {offer.title?.[lang]}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <Badge variant="outline">
                            {t("code")}: {offer.code || t("n_a")}
                          </Badge>
                          {isAdminCreatedVendorOffer(offer) && (
                            <AdminOfferBadge />
                          )}
                          {isFirstOrderOffer(offer) && (
                            <FirstOrderBadge scope={offer.eligibility?.scope} />
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                          <CalendarClock size={14} /> {t("valid_till")}:{" "}
                          {format(offer.expiresAt, "dd MMM, yyyy")}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-1 md:items-end md:min-w-50 md:text-right">
                      <p className="text-sm text-gray-500">{t("total_used")}</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {offer.usageCount ?? 0}
                      </p>
                      <OfferStatusBadge status={getOfferStatus(offer)} />
                      <p className="text-sm text-gray-500 mt-1">
                        {formatOfferDiscount(offer)}
                      </p>

                      {canManage && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 md:justify-end">
                          {/* Activate / Deactivate */}
                          <Button
                            size="sm"
                            className={
                              offer.isActive
                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }
                            onClick={() =>
                              setStatusInfo({
                                offerId: offer._id,
                                offerName:
                                  offer.title?.[lang] || offer.title?.en || "",
                                status: !offer.isActive,
                              })
                            }
                          >
                            {offer.isActive ? t("deactivate") : t("activate")}
                          </Button>

                          {/* Edit (opens the modal) */}
                          <Button
                            size="sm"
                            className="gap-1.5 bg-[#DC3173] text-white hover:bg-[#DC3173]/90"
                            onClick={() => setEditOffer(offer)}
                          >
                            <Pencil size={14} />
                            {t("edit")}
                          </Button>

                          {/* Delete: only for inactive offers */}
                          {!offer.isActive && (
                            <Button
                              size="sm"
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={() => setDeleteId(offer._id)}
                            >
                              {t("delete")}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {offersResult?.meta?.total === 0 && (
          <p className="text-center text-gray-500 py-10">{t("no_offers_found")}</p>
        )}
      </div>

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

      {/* Edit modal */}
      {editOffer && (
        <EditVendorOfferModal
          key={editOffer._id}
          open={!!editOffer}
          onOpenChange={(open) => !open && setEditOffer(null)}
          offer={editOffer}
          vendorMongoId={vendor._id as string}
        />
      )}

      {/* Activate / Deactivate confirm */}
      {statusInfo.offerId && (
        <OfferStatusUpdateModal
          open={!!statusInfo.offerId}
          onOpenChange={(open) => !open && resetStatusInfo()}
          onConfirm={handleToggleStatus}
          statusInfo={statusInfo}
          buttonDisabled={buttonDisabled}
        />
      )}

      {/* Delete confirm */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId("")}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}