/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ActionButton from "@/components/AgentOrVendorDetails/AgentOrVendorActionButton";
import AgentOrVendorSection from "@/components/AgentOrVendorDetails/AgentOrVendorSection";
import VendorDetailsDoc, {
  IVendorDocs,
} from "@/components/Dashboard/Vendors/VendorDetails/VendorDetailsDoc";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import VerifyOtpModal from "@/components/Modals/VerifyOtpModal";
import { Button } from "@/components/ui/button";
import { USER_ROLE, USER_STATUS } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { userSoftDeleteReq } from "@/services/auth/delete-user.service";
import { resendOtpReq } from "@/services/auth/otp.service";
import { useStore } from "@/store/store";
import { TOffer } from "@/types/offer.type";
import { TVendor } from "@/types/user.type";
import { format, parse } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeftCircle,
  BanIcon,
  BriefcaseIcon,
  BuildingIcon,
  Check,
  CheckIcon,
  EditIcon,
  FileTextIcon,
  MapPinIcon,
  TicketIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  vendor: TVendor;
  offerData: TOffer[];
}

export default function VendorDetails({ vendor, offerData }: IProps) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveStatus, setApproveStatus] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeApproveOrRejectModal = (open: boolean) => {
    if (!open) {
      setApproveStatus("");
    }
  };

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setShowDeleteModal(false);
    }
  };

  const deleteVendor = async () => {
    const toastId = toast.loading("Deleting vendor...");
    setIsDeleting(true);

    const result = await userSoftDeleteReq(vendor.userId as string);

    if (result?.success) {
      setShowDeleteModal(false);
      toast.success("Vendor deleted successfully!", { id: toastId });
      router.push("/admin/all-vendors");
      return;
    }

    toast.error(result?.message || "Vendor delete failed", { id: toastId });
    setIsDeleting(false);
  };

  const getStatusColor = (status: keyof typeof USER_STATUS) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const resendOtp = async () => {
    const toastId = toast.loading("Resending OTP...");
    setIsSubmitting(true);

    try {
      const result = (await resendOtpReq({
        email: vendor?.email,
        role: USER_ROLE.VENDOR,
      }));

      if (result.success) {
        toast.success("OTP resent successfully!", { id: toastId });
        setOpen(true);
        setIsSubmitting(false);
        return;
      }
      toast.error(result.message, { id: toastId });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "OTP resend failed", {
        id: toastId,
      });
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Button
          onClick={() => router.back()}
          variant="link"
          className="inline-flex items-center text-sm gap-2 text-[#DC3173] px-0! py-0 h-4 cursor-pointer"
        >
          <ArrowLeftCircle />{t("go_back")}
        </Button>
      </div>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="w-full mx-auto bg-gray-50 rounded-xl overflow-hidden shadow-lg"
      >
        <div className="relative bg-linear-to-r from-[#DC3173] to-[#e95b92] p-6 text-white">
          <motion.div
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: 0.2,
              duration: 0.5,
            }}
            className="absolute top-4 right-4"
          >
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                vendor?.status,
              )}`}
            >
              {vendor?.status}
            </span>
          </motion.div>
          <div className="flex items-center gap-4">
            {vendor?.profilePhoto ? (
              <Image
                src={vendor?.profilePhoto}
                alt={`${vendor?.name?.firstName || "Fleet Manager"}`}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                width={500}
                height={500}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white">
                <UserIcon size={40} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {vendor?.name?.firstName || "N/"} {vendor?.name?.lastName || "A"}
              </h1>
              <p className="opacity-90">{vendor?.email}</p>
              {vendor?.contactNumber && (
                <p className="opacity-90">{vendor?.contactNumber}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 border-gray-200">
            <div className="flex flex-wrap justify-end gap-4">
              {!vendor?.isEmailVerified ? <ActionButton
                onClick={resendOtp}
                disabled={isSubmitting}
                label={t("verify_email")}
                icon={<Check size={18} />}
                variant="primary"
              /> :
                <ActionButton
                  onClick={() =>
                    router.push("/admin/vendor/edit/" + vendor.userId)
                  }
                  label={t("edit")}
                  icon={<EditIcon size={18} />}
                  variant="primary"
                />}
              {vendor.status === "SUBMITTED" && (
                <ActionButton
                  onClick={() => setApproveStatus("APPROVED")}
                  label={t("approve")}
                  icon={<CheckIcon size={18} />}
                  variant="success"
                />
              )}
              {vendor.status === "SUBMITTED" && (
                <ActionButton
                  onClick={() => setApproveStatus("REJECTED")}
                  label={t("reject")}
                  icon={<XIcon size={18} />}
                  variant="warning"
                />
              )}
              {vendor.status === "APPROVED" && (
                <ActionButton
                  onClick={() => setApproveStatus("BLOCKED")}
                  label={t("block")}
                  icon={<BanIcon size={18} />}
                  variant="warning"
                />
              )}
              {vendor.status === "BLOCKED" && (
                <ActionButton
                  onClick={() => setApproveStatus("UNBLOCKED")}
                  label={t("unblock")}
                  icon={<CheckIcon size={18} />}
                  variant="primary"
                />
              )}
              <ActionButton
                onClick={() => setShowDeleteModal(true)}
                label={t("delete")}
                icon={<TrashIcon size={18} />}
                variant="danger"
              />
            </div>
          </div>
          <AgentOrVendorSection
            title={t("personal_details")}
            icon={<UserIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t("full_name")}</p>
                <p className="font-medium">
                  {vendor?.name?.firstName || "N/A"}{" "}
                  {vendor?.name?.lastName || ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("email")}</p>
                <p className="font-medium">{vendor?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("contact_number")}</p>
                <p className="font-medium">{vendor?.contactNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("email_verified")}</p>
                <p className="font-medium">
                  {vendor?.isEmailVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title={t("business_details")}
            icon={<BuildingIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t("business_name")}</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.businessName || "N/A"}
                </p>
              </div>
              {/* <div>
                <p className="text-sm text-gray-500">{t("license_number")}</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.businessLicenseNumber || "N/A"}
                </p>
              </div> */}
              <div>
                <p className="text-sm text-gray-500">{t("nif")}</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.NIF || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("business_type")}</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.businessType || "N/A"}
                </p>
              </div>
              {vendor?.businessDetails?.businessType === "RESTAURANT" && (
                <div>
                  <p className="text-sm text-gray-500">{t("restaurant_cuisine_type")}</p>
                  <p className="font-medium">
                    {(() => {
                      const cuisineData = vendor?.businessDetails?.restaurantCuisineType;

                      if (!cuisineData || (Array.isArray(cuisineData) && cuisineData.length === 0)) {
                        return "N/A";
                      }

                      return Array.isArray(cuisineData) ? cuisineData.join(", ") : cuisineData;
                    })()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">{t("total_branches")}</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.totalBranches || "N/A"}
                </p>
              </div>
              {vendor?.businessDetails?.openingHours && (
                <div>
                  <p className="text-sm text-gray-500">{t("opening_hours")}</p>
                  <p className="font-medium">
                    {vendor?.businessDetails?.openingHours
                      ? /\b(AM|PM)\b/i.test(
                        vendor?.businessDetails?.openingHours,
                      )
                        ? vendor?.businessDetails?.openingHours
                        : format(
                          parse(
                            vendor?.businessDetails?.openingHours,
                            "HH:mm",
                            new Date(),
                          ),
                          "hh:mm a",
                        )
                      : "N/A"}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">{t("closing_hours")}</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.closingHours
                    ? /\b(AM|PM)\b/i.test(vendor?.businessDetails?.closingHours)
                      ? vendor?.businessDetails?.closingHours
                      : format(
                        parse(
                          vendor?.businessDetails?.closingHours,
                          "HH:mm",
                          new Date(),
                        ),
                        "hh:mm a",
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("closing_days")}</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.closingDays?.length
                    ? vendor.businessDetails.closingDays.join(", ")
                    : "N/A"}
                </p>
              </div>
            </div>
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title={t("business_location")}
            icon={<MapPinIcon size={20} />}
            defaultOpen={true}
          >
            {vendor?.businessLocation ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t("street_address")}</p>
                  <p className="font-medium">
                    {vendor?.businessLocation.street || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("postal_code")}</p>
                  <p className="font-medium">
                    {vendor?.businessLocation.postalCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("city")}</p>
                  <p className="font-medium">
                    {vendor?.businessLocation.city || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("state")}</p>
                  <p className="font-medium">
                    {vendor?.businessLocation.state || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("country")}</p>
                  <p className="font-medium">
                    {vendor?.businessLocation.country || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                {t("no_business_location_provided")}
              </p>
            )}
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title={t("bank_details")}
            icon={<BriefcaseIcon size={20} />}
            defaultOpen={true}
          >
            {vendor?.bankDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t("bank_name")}</p>
                  <p className="font-medium">{vendor.bankDetails?.bankName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("account_holder")}</p>
                  <p className="font-medium">
                    {vendor.bankDetails?.accountHolderName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("iban")}</p>
                  <p className="font-medium">{vendor.bankDetails?.iban || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("swift_code")}</p>
                  <p className="font-medium">{vendor.bankDetails?.swiftCode || "N/A"}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">{t("no_bank_details_provided")}</p>
            )}
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title={t("activity_logs")}
            icon={<BriefcaseIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t("registered_on")}</p>
                <p className="font-medium">
                  {vendor?.createdAt
                    ? format(vendor?.createdAt, "do MMM yyyy")
                    : "N/A"}
                </p>
              </div>
              {vendor?.submittedForApprovalAt && (
                <div>
                  <p className="text-sm text-gray-500">{t("submitted_on")}</p>
                  <p className="font-medium">
                    {vendor?.submittedForApprovalAt
                      ? format(vendor?.submittedForApprovalAt, "do MMM yyyy")
                      : "N/A"}
                  </p>
                </div>
              )}
              {(vendor?.status === "APPROVED" ||
                vendor?.status === "REJECTED" ||
                vendor?.status === "BLOCKED") &&
                vendor?.approvedOrRejectedOrBlockedAt && (
                  <div>
                    <p className="text-sm text-gray-500">
                      {vendor?.status.charAt(0).toUpperCase() +
                        vendor?.status.slice(1)}{" "}
                      On
                    </p>
                    <p className="font-medium">
                      {vendor?.approvedOrRejectedOrBlockedAt
                        ? format(
                          vendor?.approvedOrRejectedOrBlockedAt,
                          "do MMM yyyy",
                        )
                        : "N/A"}
                    </p>
                  </div>
                )}
              {vendor?.lastLoginAt && (
                <div>
                  <p className="text-sm text-gray-500">{t("last_logged_on")}</p>
                  <p className="font-medium">
                    {vendor?.lastLoginAt
                      ? format(vendor?.lastLoginAt, "do MMM yyyy")
                      : "N/A"}
                  </p>
                </div>
              )}
            </div>
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title={t("documents")}
            icon={<FileTextIcon size={20} />}
            defaultOpen={true}
          >
            <VendorDetailsDoc documents={vendor?.documents as IVendorDocs} />
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title={t("created_offers")}
            icon={<TicketIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offerData?.map((offer) => (
                <div
                  key={offer._id}
                  className="flex flex-col gap-2 border rounded-md p-4"
                >
                  <p className="text-gray-500">{offer.title?.[lang]}</p>
                  {offer.offerType === "BOGO" && <p>{t("bogo_offer")}</p>}
                  {offer.offerType === "PERCENT" && (
                    <p>{t("percentage_offer")} ({offer.discountValue}% {t("off")})</p>
                  )}
                  {offer.offerType === "FLAT" && (
                    <p>{t("flat_offer")} (€{offer.discountValue} {t("off")})</p>
                  )}
                  <p className="text-xs">
                    {offer.validFrom
                      ? format(offer.validFrom, "dd/MM/yyyy")
                      : "N/A"}
                    {" - "}
                    {offer.expiresAt
                      ? format(offer.expiresAt, "dd/MM/yyyy")
                      : "N/A"}
                  </p>
                </div>
              ))}

              {offerData?.length === 0 && (
                <p className="text-gray-500 italic">{t("no_offers_created")}</p>
              )}
            </div>
            {offerData?.length > 0 && (
              <div className="text-center mt-2">
                <Link
                  className="text-[#DC3173] text-sm font-medium hover:underline"
                  href={`/admin/vendor/offers/${vendor.userId}`}
                >
                  {t("view_all")}
                </Link>
              </div>
            )}
          </AgentOrVendorSection>
        </div>
      </motion.div>

      {/* Verify unverified rider */}
      <VerifyOtpModal
        email={vendor?.email}
        role={USER_ROLE.VENDOR}
        userId={vendor?.userId}
        open={open}
        onOpenChange={setOpen}
      />

      <ApproveOrRejectModal
        open={!!approveStatus}
        onOpenChange={closeApproveOrRejectModal}
        status={
          approveStatus as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userId={vendor.userId}
        userName={`${vendor?.name?.firstName} ${vendor?.name?.lastName}`}
      />
      <DeleteModal
        open={showDeleteModal}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteVendor}
        isDeleting={isDeleting}
      />
    </div>
  );
}
