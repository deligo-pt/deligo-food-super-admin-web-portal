"use client";

import ImagePreview from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/ImagePreview";
import InfoRow from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/InfoRow";
import Section from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/Section";
import StatusBadge from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/StatusBadge";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { deleteDeliveryPartner } from "@/services/dashboard/deliveryPartner/deliveryPartner";
import { TResponse } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
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
  FileText,
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

interface IProps {
  partner: TDeliveryPartner;
}

const formatDate = (date: Date | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export const DeliveryPartnerDetails = ({ partner }: IProps) => {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveStatus, setApproveStatus] = useState("");
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

    try {
      const result = (await deleteDeliveryPartner(
        partner.userId
      )) as TResponse<null>;

      if (result.success) {
        toast.success("Delivery Partner deleted successfully", { id: toastId });
        setShowDeleteModal(false);
        router.refresh();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Delivery Partner deletion failed",
        { id: toastId }
      );
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
          <ArrowLeftCircle /> {t("go_back")}
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
        className="bg-[#DC3173] text-white p-6 rounded-t-lg"
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
      <div className="bg-gray-50 p-6 rounded-b-lg">
        <Section title="Personal Details" icon={<User />} defaultOpen={true}>
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
                value={formatDate(partner.personalInfo?.dateOfBirth)}
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
                value={formatDate(partner.personalInfo?.idExpiryDate)}
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
              <InfoRow label={t("city")} value={partner.address?.city || "N/A"} />
            </div>
            <div>
              <InfoRow label={t("state")} value={partner.address?.state || "N/A"} />
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
                value={formatDate(partner.vehicleInfo?.drivingLicenseExpiry)}
              />
              <InfoRow
                label={t("insurance_policy_number")}
                value={partner.vehicleInfo?.insurancePolicyNumber || "N/A"}
              />
              <InfoRow
                label={t("insurance_expiry")}
                value={formatDate(partner.vehicleInfo?.insuranceExpiry)}
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
                value={formatDate(partner.legalStatus?.residencePermitExpiry)}
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
        <Section title={t("documents")} icon={<FileText />}>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 xl:grid-cols-4 lg:gap-6">
            {partner.documents?.idDocumentFront && (
              <div>
                <div className="mb-2 text-gray-500 text-sm">{t("id_proof_front")}</div>
                <ImagePreview
                  url={partner.documents.idDocumentFront}
                  alt="ID Proof Front"
                />
              </div>
            )}
            {partner.documents?.idDocumentBack && (
              <div>
                <div className="mb-2 text-gray-500 text-sm">{t("id_proof_back")}</div>
                <ImagePreview
                  url={partner.documents.idDocumentBack}
                  alt="ID Proof Back"
                />
              </div>
            )}
            {partner.documents?.drivingLicense && (
              <div>
                <div className="mb-2 text-gray-500 text-sm">
                  {t("driving_license")}
                </div>
                <ImagePreview
                  url={partner.documents.drivingLicense}
                  alt="Driving License"
                />
              </div>
            )}
            {partner.documents?.vehicleRegistration && (
              <div>
                <div className="mb-2 text-gray-500 text-sm">
                  {t("vehicle_registration")}
                </div>
                <ImagePreview
                  url={partner.documents.vehicleRegistration}
                  alt="Vehicle Registration"
                />
              </div>
            )}
            {partner.documents?.criminalRecordCertificate && (
              <div>
                <div className="mb-2 text-gray-500 text-sm">
                  {t("criminal_record_certificate")}
                </div>
                <ImagePreview
                  url={partner.documents.criminalRecordCertificate}
                  alt="Criminal Record"
                />
              </div>
            )}
          </div>
        </Section>
        <Section title={t("operational_date")} icon={<Package />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-xs mb-1">{t("total_deliveries")}</div>
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
                {partner.operationalData?.rating?.totalReviews || 0} {t("reviews")}
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
                  <span className="text-sm text-gray-700">{t("isothermal_bag")}</span>
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
                  <span className="text-sm text-gray-700">{t("power_bank")}</span>
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
                value={formatDate(partner.createdAt)}
              />
              <InfoRow
                label={t("last_updated")}
                value={formatDate(partner.updatedAt)}
              />
              <InfoRow
                label={t("submitted_for_approval")}
                value={formatDate(partner.submittedForApprovalAt)}
              />
            </div>
            <div>
              <InfoRow
                label={t("approved_rejected_blocked_at")}
                value={formatDate(partner.approvedOrRejectedOrBlockedAt)}
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
                onClick={() => setApproveStatus("APPROVED")}
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

      <DeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeletePartner}
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
