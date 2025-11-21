"use client";

import ActionButton from "@/components/AgentOrVendorDetails/AgentOrVendorActionButton";
import Section from "@/components/AgentOrVendorDetails/AgentOrVendorSection";
import AgentDetailsDoc from "@/components/AllAgents/AgentDetailsDoc";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Button } from "@/components/ui/button";
import { USER_STATUS } from "@/consts/user.const";
import { TResponse } from "@/types";
import { TAgent } from "@/types/user.type";
import { getCookie } from "@/utils/cookies";
import { deleteData } from "@/utils/requests";
import { motion } from "framer-motion";
import {
  ArrowLeftCircle,
  BriefcaseIcon,
  BuildingIcon,
  CheckIcon,
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

interface IProps {
  agent: TAgent;
}

export const AgentDetails = ({ agent }: IProps) => {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveStatus, setApproveStatus] = useState("");

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
    try {
      const result = (await deleteData(
        `/auth/soft-delete/${agent.userId}`,

        {
          headers: { authorization: getCookie("accessToken") },
        }
      )) as unknown as TResponse<null>;
      if (result?.success) {
        setShowDeleteModal(false);
        toast.success("Fleet Manager deleted successfully!", { id: toastId });
        router.push("/admin/all-fleet-managers");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Fleet Manager delete failed",
        {
          id: toastId,
        }
      );
    }
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
          onClick={() => router.push("/admin/all-fleet-managers")}
          variant="link"
          className="inline-flex items-center text-sm gap-2 text-[#DC3173] px-0! py-0 h-4 cursor-pointer"
        >
          <ArrowLeftCircle /> Go Back
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
                agent?.status
              )}`}
            >
              {agent?.status}
            </span>
          </motion.div>
          <div className="flex items-center gap-4">
            {agent?.profilePhoto ? (
              <Image
                src={agent?.profilePhoto}
                alt={`${agent?.name?.firstName || "Fleet Manager"}`}
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
                {agent?.name?.firstName} {agent?.name?.lastName}
              </h1>
              <p className="opacity-90">{agent?.email}</p>
              {agent?.contactNumber && (
                <p className="opacity-90">{agent?.contactNumber}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 border-gray-200">
            <div className="flex flex-wrap justify-end gap-4">
              {agent?.status === "SUBMITTED" && (
                <>
                  <ActionButton
                    onClick={() => setApproveStatus("APPROVED")}
                    label="Approve"
                    icon={<CheckIcon size={18} />}
                    variant="success"
                  />
                  <ActionButton
                    onClick={() => setApproveStatus("REJECTED")}
                    label="Reject"
                    icon={<XIcon size={18} />}
                    variant="danger"
                  />
                </>
              )}
              {!agent?.isDeleted && (
                <ActionButton
                  onClick={() => setShowDeleteModal(true)}
                  label="Delete"
                  icon={<TrashIcon size={18} />}
                  variant="danger"
                />
              )}
            </div>
          </div>
          <Section
            title="Personal Details"
            icon={<UserIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">
                  {agent?.name?.firstName || "N/A"}{" "}
                  {agent?.name?.lastName || ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{agent?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="font-medium">{agent?.contactNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Verified</p>
                <p className="font-medium">
                  {agent?.isEmailVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </Section>
          <Section
            title="Business Details"
            icon={<BuildingIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="font-medium">
                  {agent?.businessDetails?.businessName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License Number</p>
                <p className="font-medium">
                  {agent?.businessDetails?.businessLicenseNumber || "N/A"}
                </p>
              </div>
            </div>
          </Section>
          <Section
            title="Business Location"
            icon={<MapPinIcon size={20} />}
            defaultOpen={true}
          >
            {agent?.businessLocation ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Street Address</p>
                  <p className="font-medium">
                    {agent?.businessLocation.streetAddress},{" "}
                    {agent?.businessLocation.streetNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City & Postal Code</p>
                  <p className="font-medium">
                    {agent?.businessLocation.city},{" "}
                    {agent?.businessLocation.postalCode}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No business location provided
              </p>
            )}
          </Section>
          <Section
            title="Bank Details"
            icon={<BriefcaseIcon size={20} />}
            defaultOpen={true}
          >
            {agent?.bankDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="font-medium">{agent?.bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Holder</p>
                  <p className="font-medium">
                    {agent?.bankDetails.accountHolderName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IBAN</p>
                  <p className="font-medium">{agent?.bankDetails.iban}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">SWIFT Code</p>
                  <p className="font-medium">{agent?.bankDetails.swiftCode}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No bank details provided</p>
            )}
          </Section>
          <Section
            title="Documents"
            icon={<FileTextIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
              <AgentDetailsDoc documents={agent?.documents} />
            </div>
          </Section>
          <div className="mt-8 border-t pt-6 border-gray-200">
            <ActionButton
              onClick={() => router.push("/admin/all-agents")}
              label="Go Back"
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
        userId={agent?.userId}
        userName={`${agent?.name?.firstName} ${agent?.name?.lastName}`}
      />
      <DeleteModal
        open={showDeleteModal}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteAgent}
      />
    </div>
  );
};
