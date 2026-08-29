/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import InfoRow from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/InfoRow";
import Section from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/Section";
import StatusBadge from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/StatusBadge";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import ApproveRiderModal from "@/components/Modals/ApproveRiderModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import VerifyOtpModal from "@/components/Modals/VerifyOtpModal";
import { Button } from "@/components/ui/button";
import { USER_ROLE } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { userSoftDeleteReq } from "@/services/auth/delete-user.service";
import { resendOtpReq } from "@/services/auth/otp.service";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeftCircle,
  Ban,
  Bike,
  Briefcase,
  CalendarClock,
  Car,
  Check,
  CreditCard,
  Edit,
  Gavel,
  Mail,
  MapPin,
  Motorbike,
  Package,
  Phone,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PartnerDetailsDoc } from "./PartnerDetailsDoc";

interface IProps {
  partner: TDeliveryPartner;
}

export const DeliveryPartnerDetails = ({ partner }: IProps) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveStatus, setApproveStatus] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const fullName =
    `${partner.name?.firstName || ""} ${partner.name?.lastName || ""}`.trim() ||
    t("no_name_provided");

  const getVehicleIcon = () => {
    switch (partner.vehicleInfo?.vehicleType) {
      case "BICYCLE":
      case "SCOOTER":
      case "E-BIKE":
        return <Bike className="w-5 h-5" />;
      case "MOTORBIKE":
        return <Motorbike className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  const closeApproveOrRejectModal = (open: boolean) => {
    if (!open) {
      setApproveStatus("");
    }
  };

  const handleDeletePartner = async () => {
    const toastId = toast.loading("Deleting Delivery Partner...");
    setIsDeleting(true);

    const result = await userSoftDeleteReq(partner.userId as string);

    if (result.success) {
      toast.success("Delivery Partner deleted successfully", { id: toastId });
      setShowDeleteModal(false);
      router.refresh();
      return;
    }

    toast.error(result.message || "Delivery Partner delete failed", {
      id: toastId,
    });
    setIsDeleting(false);
  };

  const resendOtp = async () => {
    const toastId = toast.loading("Resending OTP...");
    setIsSubmitting(true);

    try {
      const result = (await resendOtpReq({
        email: partner?.email,
        role: USER_ROLE.DELIVERY_PARTNER,
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
      <div className="mb-4 flex flex-row justify-between items-center">
        <Button
          onClick={() => router.back()}
          variant="link"
          className="inline-flex items-center text-sm gap-2 text-[#DC3173] px-0! py-0 h-4 cursor-pointer"
        >
          <ArrowLeftCircle /> {t("go_back")}
        </Button>
        {
          !partner?.isEmailVerified ? (
            <motion.button
              onClick={resendOtp}
              disabled={isSubmitting}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-[#DC3173] text-white rounded-lg shadow-sm hover:bg-[#DC3173]/90"
            >
              <Check className="w-4 h-4" />
              <span>{t("verify_email")}</span>
            </motion.button>
          ) :
            <motion.button
              onClick={() =>
                router.push(`/admin/all-delivery-partners/edit/${partner.userId}`)
              }
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-[#DC3173] text-white rounded-lg shadow-sm hover:bg-[#DC3173]/90"
            >
              <Edit className="w-4 h-4" />
              <span>{t("edit")}</span>
            </motion.button>
        }
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
        className="bg-[#DC3173] text-white p-3 md:p-6 rounded-t-lg"
      >
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{
              scale: 1.05,
            }}
            className="w-20 h-20 rounded-full bg-white/20 overflow-hidden flex items-center justify-center"
          >
            {partner.profilePhoto ? (
              <Image
                src={partner.profilePhoto}
                alt={fullName}
                className="w-full h-full object-cover"
                width={500}
                height={500}
              />
            ) : (
              <User className="w-10 h-10 text-white/70" />
            )}
          </motion.div>
          <div className="flex-1">
            <motion.h2
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="text-2xl font-bold"
            >
              {fullName}
            </motion.h2>
            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="flex items-center space-x-1 text-white/80"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">{partner.email}</span>
            </motion.div>
            {partner?.contactNumber && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.3,
                }}
                className="flex items-center space-x-1 text-white/80"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">{partner.contactNumber}</span>
              </motion.div>
            )}
          </div>
          <div>
            <StatusBadge
              status={partner?.isDeleted ? "DELETED" : partner.status}
            />
          </div>
        </div>
      </motion.div>
      <div className="bg-gray-50 rounded-b-lg">
        <Section title={t("personal_details")} icon={<User />} defaultOpen={true}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow label={t("full_name")} value={fullName} />
              <InfoRow label={t("email")} value={partner.email} />
              <InfoRow
                label={t("contact_number")}
                value={partner?.contactNumber || "N/A"}
              />
              <InfoRow
                label={t("gender")}
                value={partner.personalInfo?.gender || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label={t("date_of_birth")}
                value={
                  partner.personalInfo?.dateOfBirth
                    ? format(partner.personalInfo?.dateOfBirth, "do MMM yyyy")
                    : "N/A"
                }
              />
              <InfoRow
                label={t("nationality")}
                value={partner.personalInfo?.nationality || "N/A"}
              />
              <InfoRow
                label={t("email_verified")}
                value={
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${partner.isEmailVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {partner.isEmailVerified ? t("yes") : t("no")}
                  </span>
                }
              />
              <InfoRow
                label={t("id_expiry_date")}
                value={
                  partner.personalInfo?.idExpiryDate
                    ? format(partner.personalInfo?.idExpiryDate, "do MMM yyyy")
                    : "N/A"
                }
              />
            </div>
          </div>
        </Section>
        <Section title={t("address")} icon={<MapPin />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow
                label={t("street")}
                value={partner.address?.street || "N/A"}
              />
              <InfoRow
                label={t("city")}
                value={partner.address?.city || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label={t("state")}
                value={partner.address?.state || "N/A"}
              />
              <InfoRow
                label={t("country")}
                value={partner.address?.country || "N/A"}
              />
              <InfoRow
                label={t("zip_code")}
                value={partner.address?.postalCode || "N/A"}
              />
            </div>
          </div>
        </Section>
        <Section title={t("vehicle_information")} icon={getVehicleIcon()}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow
                label={t("vehicle_type")}
                value={partner.vehicleInfo?.vehicleType || "N/A"}
              />
              <InfoRow
                label={t("brand")}
                value={partner.vehicleInfo?.brand || "N/A"}
              />
              <InfoRow
                label={t("model")}
                value={partner.vehicleInfo?.model || "N/A"}
              />
              <InfoRow
                label={t("license_plate")}
                value={partner.vehicleInfo?.licensePlate || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label={t("driving_license_number")}
                value={partner.vehicleInfo?.drivingLicenseNumber || "N/A"}
              />
              <InfoRow
                label={t("license_expiry")}
                value={
                  partner.vehicleInfo?.drivingLicenseExpiry
                    ? format(
                      partner.vehicleInfo?.drivingLicenseExpiry,
                      "do MMM yyyy",
                    )
                    : "N/A"
                }
              />
              <InfoRow
                label={t("insurance_policy_number")}
                value={partner.vehicleInfo?.insurancePolicyNumber || "N/A"}
              />
              <InfoRow
                label={t("insurance_expiry")}
                value={
                  partner.vehicleInfo?.insuranceExpiry
                    ? format(
                      partner.vehicleInfo?.insuranceExpiry,
                      "do MMM yyyy",
                    )
                    : "N/A"
                }
              />
            </div>
          </div>
        </Section>
        <Section title={t("bank_details")} icon={<CreditCard />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow
                label={t("bank_name")}
                value={partner.bankDetails?.bankName || "N/A"}
              />
              <InfoRow
                label={t("account_holder")}
                value={partner.bankDetails?.accountHolderName || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label={t("iban")}
                value={partner.bankDetails?.iban || "N/A"}
              />
              <InfoRow
                label={t("swift_code")}
                value={partner.bankDetails?.swiftCode || "N/A"}
              />
            </div>
          </div>
        </Section>
        <Section title={t("legal_status")} icon={<Gavel />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow
                label={t("residence_permit_type")}
                value={partner.legalStatus?.residencePermitType || "N/A"}
              />
              <InfoRow
                label={t("residence_permit_number")}
                value={partner.legalStatus?.residencePermitNumber || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label={t("permit_expiry_date")}
                value={
                  partner.legalStatus?.residencePermitExpiry
                    ? format(
                      partner.legalStatus?.residencePermitExpiry,
                      "do MMM yyyy",
                    )
                    : "N/A"
                }
              />
              <InfoRow
                label={t("criminal_record_certification")}
                value={
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${partner.criminalRecord?.certificate
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {partner.criminalRecord?.certificate
                      ? t("provided")
                      : t("not_provided")}
                  </span>
                }
              />
            </div>
          </div>
        </Section>
        {/* documents */}
        <PartnerDetailsDoc partner={partner} />

        <Section title={t("operational_date")} icon={<Package />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-xs mb-1">
                {t("total_deliveries")}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {partner.operationalData?.totalDeliveries || 0}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-xs mb-1">{t("completed")}</div>
              <div className="text-2xl font-bold text-green-600">
                {partner.operationalData?.completedDeliveries || 0}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-xs mb-1">{t("cancelled")}</div>
              <div className="text-2xl font-bold text-red-600">
                {partner.operationalData?.canceledDeliveries || 0}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-xs mb-1">{t("rating")}</div>
              <div className="text-2xl font-bold text-amber-500 flex items-center justify-center">
                {partner.operationalData?.rating?.average.toFixed(1) || "N/A"}{" "}
                <Star className="w-4 h-4 ml-1" fill="currentColor" />
              </div>
              <div className="text-xs text-gray-500">
                {partner.operationalData?.rating?.totalReviews || 0}{" "}
                {t("reviews")}
              </div>
            </div>
          </div>
          {partner.earnings && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t("earnings")}
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-xs mb-1">
                    {t("total_earnings")}
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    €{partner.earnings.totalEarnings?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-xs mb-1">
                    {t("pending_earnings")}
                  </div>
                  <div className="text-xl font-bold text-[#DC3173]">
                    €{partner.earnings.pendingEarnings?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Section>
        <Section title={t("work_preferences")} icon={<Briefcase />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow
                label={t("preferred_zones")}
                value={
                  partner.workPreferences?.preferredZones?.join(", ") ||
                  t("none_specified")
                }
              />
              <InfoRow
                label={t("preferred_hours")}
                value={
                  partner.workPreferences?.preferredHours?.join(", ") ||
                  t("none_specified")
                }
              />
              <InfoRow
                label={t("worked_with_other_platform")}
                value={
                  partner.workPreferences?.workedWithOtherPlatform
                    ? t("yes")
                    : t("no")
                }
              />
              {partner.workPreferences?.workedWithOtherPlatform && (
                <InfoRow
                  label={t("platform_name")}
                  value={
                    partner.workPreferences?.otherPlatformName ||
                    t("not_specified")
                  }
                />
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t("equipment")}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded-full ${partner.workPreferences?.hasEquipment?.isothermalBag
                      ? "bg-[#DC3173]"
                      : "bg-gray-300"
                      }`}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {t("isothermal_bag")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded-full ${partner.workPreferences?.hasEquipment?.helmet
                      ? "bg-[#DC3173]"
                      : "bg-gray-300"
                      }`}
                  ></div>
                  <span className="text-sm text-gray-700">{t("helmet")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded-full ${partner.workPreferences?.hasEquipment?.powerBank
                      ? "bg-[#DC3173]"
                      : "bg-gray-300"
                      }`}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {t("power_bank")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Section>
        <Section title={t("account_information")} icon={<CalendarClock />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
            <div>
              <InfoRow
                label={t("account_created")}
                value={format(partner.createdAt, "do MMM yyyy")}
              />
              <InfoRow
                label={t("last_updated")}
                value={format(partner.updatedAt, "do MMM yyyy")}
              />
              <InfoRow
                label={t("submitted_for_approval")}
                value={
                  partner.submittedForApprovalAt
                    ? format(partner.submittedForApprovalAt, "do MMM yyyy")
                    : "N/A"
                }
              />
            </div>
            <div>
              <InfoRow
                label={t("approved_rejected_blocked_at")}
                value={
                  partner.approvedOrRejectedOrBlockedAt
                    ? format(
                      partner.approvedOrRejectedOrBlockedAt,
                      "do MMM yyyy",
                    )
                    : "N/A"
                }
              />
              {partner.remarks && (
                <InfoRow label={t("remarks")} value={partner.remarks} />
              )}
            </div>
          </div>
        </Section>
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          {partner.status === "SUBMITTED" && (
            <>
              <motion.button
                onClick={() => {
                  if (partner?.registeredBy?.id) {
                    setApproveStatus("APPROVED")
                  } else {
                    setApproveModal(true);
                  }
                }}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="flex items-center space-x-1 px-4 py-2 bg-[#DC3173] text-white rounded-lg shadow-sm hover:bg-[#DC3173]/90"
              >
                <Check className="w-4 h-4" />
                <span>{t("approve")}</span>
              </motion.button>
              <motion.button
                onClick={() => setApproveStatus("REJECTED")}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="flex items-center space-x-1 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-sm hover:bg-yellow-600"
              >
                <X className="w-4 h-4" />
                <span>{t("reject")}</span>
              </motion.button>
            </>
          )}
          {partner.status === "APPROVED" && (
            <motion.button
              onClick={() => setApproveStatus("BLOCKED")}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-sm hover:bg-yellow-600"
            >
              <Ban className="w-4 h-4" />
              <span>{t("block")}</span>
            </motion.button>
          )}
          {partner.status === "BLOCKED" && (
            <motion.button
              onClick={() => setApproveStatus("UNBLOCKED")}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-[#DC3173] text-white rounded-lg shadow-sm hover:bg-[#DC3173]/90"
            >
              <Check className="w-4 h-4" />
              <span>{t("unblock")}</span>
            </motion.button>
          )}
          {!partner.isDeleted && (
            <motion.button
              onClick={() => setShowDeleteModal(true)}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-red-500 bg-opacity-10 text-white rounded-lg transition-all hover:bg-opacity-20"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t("delete")}</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Verify unverified rider */}
      <VerifyOtpModal
        email={partner?.email}
        role={USER_ROLE.DELIVERY_PARTNER}
        userId={partner?.userId}
        open={open}
        onOpenChange={setOpen}
      />

      {/* delete rider */}
      <DeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeletePartner}
        isDeleting={isDeleting}
      />

      {/* Approve rider*/}
      <ApproveRiderModal
        open={approveModal}
        onOpenChange={() => setApproveModal(false)}
        partnerId={partner.userId}
        partnerName={`${partner?.name?.firstName} ${partner?.name?.lastName}`}
        city={partner?.address?.city as string}
        status={
          partner.status as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
      />

      <ApproveOrRejectModal
        open={!!approveStatus}
        onOpenChange={closeApproveOrRejectModal}
        status={
          approveStatus as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userId={partner.userId}
        userName={`${partner?.name?.firstName} ${partner?.name?.lastName}`}
      />
    </div>
  );
};
