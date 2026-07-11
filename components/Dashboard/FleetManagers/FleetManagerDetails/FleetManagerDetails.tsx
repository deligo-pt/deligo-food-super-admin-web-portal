"use client";

import ActionButton from "@/components/AgentOrVendorDetails/AgentOrVendorActionButton";
import Section from "@/components/AgentOrVendorDetails/AgentOrVendorSection";
import FleetManagerDetailsDoc, { IFleetDocs } from "@/components/Dashboard/FleetManagers/FleetManagerDetails/FleetManagerDetailsDoc";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Button } from "@/components/ui/button";
import { USER_STATUS } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { userSoftDeleteReq } from "@/services/auth/delete-user.service";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TAgent } from "@/types/user.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeftCircle,
  BanIcon,
  BriefcaseIcon,
  BuildingIcon,
  CheckIcon,
  EditIcon,
  FileTextIcon,
  MapPinIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import FleetRidersTable from "./FleetRiders";
import { TMeta } from "@/types";
import PaginationComponent from "@/components/Filtering/PaginationComponent";

interface IProps {
  agentData: {
    meta: TMeta;
    data: {
      existingFleetManager: TAgent;
      deliveryPartners: Partial<TDeliveryPartner>[];
    };
  }
}

export default function FleetManagerDetails({ agentData }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { meta, data } = agentData;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveStatus, setApproveStatus] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const deleteAgent = async () => {
    const toastId = toast.loading("Deleting Fleet Manager...");
    setIsDeleting(true);

    const result = await userSoftDeleteReq(data?.existingFleetManager?.userId as string);

    if (result?.success) {
      setShowDeleteModal(false);
      toast.success("Fleet Manager deleted successfully!", { id: toastId });
      router.push("/admin/all-fleet-managers");
      return;
    }

    toast.error("Fleet Manager delete failed", { id: toastId });
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

  return (
    <div className="p-4 md;px-6">
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
                data?.existingFleetManager?.status,
              )}`}
            >
              {data?.existingFleetManager?.status}
            </span>
          </motion.div>
          <div className="flex items-center gap-4">
            {data?.existingFleetManager?.profilePhoto ? (
              <Image
                src={data?.existingFleetManager?.profilePhoto}
                alt={`${data?.existingFleetManager?.name?.firstName || "Fleet Manager"}`}
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
                {data?.existingFleetManager?.name?.firstName} {data?.existingFleetManager?.name?.lastName}
              </h1>
              <p className="opacity-90">{data?.existingFleetManager?.email}</p>
              {data?.existingFleetManager?.contactNumber && (
                <p className="opacity-90">{data?.existingFleetManager?.contactNumber}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 border-gray-200">
            <div className="flex flex-wrap justify-end gap-4">
              <ActionButton
                onClick={() => router.push("/admin/agent/edit/" + data?.existingFleetManager.userId)}
                label={t("edit")}
                icon={<EditIcon size={18} />}
                variant="primary"
              />
              {data?.existingFleetManager?.status === "SUBMITTED" && (
                <>
                  <ActionButton
                    onClick={() => setApproveStatus("APPROVED")}
                    label={t("approve")}
                    icon={<CheckIcon size={18} />}
                    variant="success"
                  />
                  <ActionButton
                    onClick={() => setApproveStatus("REJECTED")}
                    label={t("reject")}
                    icon={<XIcon size={18} />}
                    variant="danger"
                  />
                </>
              )}
              {data?.existingFleetManager?.status === "APPROVED" && (
                <ActionButton
                  onClick={() => setApproveStatus("BLOCKED")}
                  label={t("block")}
                  icon={<BanIcon size={18} />}
                  variant="warning"
                />
              )}
              {data?.existingFleetManager?.status === "BLOCKED" && (
                <ActionButton
                  onClick={() => setApproveStatus("UNBLOCKED")}
                  label={t("unblock")}
                  icon={<CheckIcon size={18} />}
                  variant="primary"
                />
              )}
              {!data?.existingFleetManager?.isDeleted && (
                <ActionButton
                  onClick={() => setShowDeleteModal(true)}
                  label={t("delete")}
                  icon={<TrashIcon size={18} />}
                  variant="danger"
                />
              )}
            </div>
          </div>
          <Section
            title={t("personal_details")}
            icon={<UserIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t("full_name")}</p>
                <p className="font-medium">
                  {data?.existingFleetManager?.name?.firstName || "N/A"}{" "}
                  {data?.existingFleetManager?.name?.lastName || ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("email")}</p>
                <p className="font-medium">{data?.existingFleetManager?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("contact_number")}</p>
                <p className="font-medium">{data?.existingFleetManager?.contactNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("email_verified")}</p>
                <p className="font-medium">
                  {data?.existingFleetManager?.isEmailVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </Section>
          <Section
            title={t("business_details")}
            icon={<BuildingIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t("business_name")}</p>
                <p className="font-medium">
                  {data?.existingFleetManager?.businessDetails?.businessName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("license_number")}</p>
                <p className="font-medium">
                  {data?.existingFleetManager?.businessDetails?.businessLicenseNumber || "N/A"}
                </p>
              </div>
            </div>
          </Section>
          <Section
            title={t("business_location")}
            icon={<MapPinIcon size={20} />}
            defaultOpen={true}
          >
            {data?.existingFleetManager?.businessLocation ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t("street_address")}</p>
                  <p className="font-medium">
                    {data?.existingFleetManager?.businessLocation.street || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("postal_code")}</p>
                  <p className="font-medium">
                    {data?.existingFleetManager?.businessLocation.postalCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("city")}</p>
                  <p className="font-medium">
                    {data?.existingFleetManager?.businessLocation.city || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("state")}</p>
                  <p className="font-medium">
                    {data?.existingFleetManager?.businessLocation.state || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("country")}</p>
                  <p className="font-medium">
                    {data?.existingFleetManager?.businessLocation.country || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                {t("no_business_location_provided")}
              </p>
            )}
          </Section>
          <Section
            title={t("bank_details")}
            icon={<BriefcaseIcon size={20} />}
            defaultOpen={true}
          >
            {data?.existingFleetManager?.bankDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t("bank_name")}</p>
                  <p className="font-medium">{data?.existingFleetManager?.bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("account_holder")}</p>
                  <p className="font-medium">
                    {data?.existingFleetManager?.bankDetails.accountHolderName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("iban")}</p>
                  <p className="font-medium">{data?.existingFleetManager?.bankDetails.iban}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("swift_code")}</p>
                  <p className="font-medium">{data?.existingFleetManager?.bankDetails.swiftCode}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">{t("no_bank_details_provided")}</p>
            )}
          </Section>
          <Section
            title={t("activity_logs")}
            icon={<BriefcaseIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t("registered_on")}</p>
                <p className="font-medium">
                  {format(data?.existingFleetManager?.createdAt, "do MMM yyyy")}
                </p>
              </div>
              {data?.existingFleetManager?.submittedForApprovalAt && (
                <div>
                  <p className="text-sm text-gray-500">{t("submitted_on")}</p>
                  <p className="font-medium">
                    {format(data?.existingFleetManager?.submittedForApprovalAt, "do MMM yyyy")}
                  </p>
                </div>
              )}
              {(data?.existingFleetManager?.status === "APPROVED" ||
                data?.existingFleetManager?.status === "REJECTED" ||
                data?.existingFleetManager?.status === "BLOCKED") &&
                data?.existingFleetManager?.approvedOrRejectedOrBlockedAt && (
                  <div>
                    <p className="text-sm text-gray-500">
                      {data?.existingFleetManager?.status.charAt(0).toUpperCase() +
                        data?.existingFleetManager?.status.slice(1)}{" "}
                      On
                    </p>
                    <p className="font-medium">
                      {format(
                        data?.existingFleetManager?.approvedOrRejectedOrBlockedAt,
                        "do MMM yyyy",
                      )}
                    </p>
                  </div>
                )}
              {data?.existingFleetManager?.lastLoginAt && (
                <div>
                  <p className="text-sm text-gray-500">{t("last_logged_on")}</p>
                  <p className="font-medium">
                    {format(data?.existingFleetManager?.lastLoginAt, "do MMM yyyy")}
                  </p>
                </div>
              )}
            </div>
          </Section>
          <Section
            title={t("documents")}
            icon={<FileTextIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
              <FleetManagerDetailsDoc documents={data?.existingFleetManager?.documents as IFleetDocs} />
            </div>
          </Section>
          {/* riders table */}
          <Section
            title={t("all_registered_riders")}
            icon={<BriefcaseIcon size={20} />}
            defaultOpen={true}
          >
            <FleetRidersTable riders={data?.deliveryPartners || []} />
            {!!meta?.total && meta?.total > 0 && (
              <div className="px-6 mt-4">
                <PaginationComponent
                  totalPages={meta?.totalPage || 0}
                />
              </div>
            )}
          </Section>
          <div className="mt-8 border-t pt-6 border-gray-200">
            <ActionButton
              onClick={() => router.push("/admin/all-fleet-managers")}
              label={t("go_back")}
              icon={<ArrowLeftCircle />}
              variant="primary"
            />
          </div>
        </div>
      </motion.div>
      <ApproveOrRejectModal
        open={!!approveStatus}
        onOpenChange={closeApproveOrRejectModal}
        status={approveStatus as "APPROVED" | "REJECTED"}
        userId={data?.existingFleetManager?.userId}
        userName={`${data?.existingFleetManager?.name?.firstName} ${data?.existingFleetManager?.name?.lastName}`}
      />
      <DeleteModal
        open={showDeleteModal}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteAgent}
        isDeleting={isDeleting}
      />
    </div>
  );
}
