"use client";

import ActionButton from "@/components/AgentOrVendorDetails/AgentOrVendorActionButton";
import AgentOrVendorSection from "@/components/AgentOrVendorDetails/AgentOrVendorSection";
import VendorDetailsDoc from "@/components/AllVendors/VendorDetailsDoc";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Button } from "@/components/ui/button";
import { USER_STATUS } from "@/consts/user.const";
import { TResponse } from "@/types";
import { TOffer } from "@/types/offer.type";
import { TVendor } from "@/types/user.type";
import { getCookie } from "@/utils/cookies";
import { deleteData } from "@/utils/requests";
import { format, parse } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeftCircle,
  BanIcon,
  BriefcaseIcon,
  BuildingIcon,
  CheckIcon,
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

export const VendorDetails = ({ vendor, offerData }: IProps) => {
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

  const deleteVendor = async () => {
    const toastId = toast.loading("Deleting vendor...");
    try {
      const result = (await deleteData(
        `/auth/soft-delete/${vendor.userId}`,

        {
          headers: { authorization: getCookie("accessToken") },
        },
      )) as unknown as TResponse<null>;
      if (result?.success) {
        setShowDeleteModal(false);
        toast.success("Vendor deleted successfully!", { id: toastId });
        router.push("/admin/all-vendors");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Vendor delete failed", {
        id: toastId,
      });
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
          onClick={() => router.back()}
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
                {vendor?.name?.firstName} {vendor?.name?.lastName}
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
              {vendor.status === "SUBMITTED" && (
                <ActionButton
                  onClick={() => setApproveStatus("APPROVED")}
                  label="Approve"
                  icon={<CheckIcon size={18} />}
                  variant="success"
                />
              )}
              {vendor.status === "SUBMITTED" && (
                <ActionButton
                  onClick={() => setApproveStatus("REJECTED")}
                  label="Reject"
                  icon={<XIcon size={18} />}
                  variant="warning"
                />
              )}
              {vendor.status === "APPROVED" && (
                <ActionButton
                  onClick={() => setApproveStatus("BLOCKED")}
                  label="Block"
                  icon={<BanIcon size={18} />}
                  variant="warning"
                />
              )}
              {vendor.status === "BLOCKED" && (
                <ActionButton
                  onClick={() => setApproveStatus("UNBLOCKED")}
                  label="Unblock"
                  icon={<CheckIcon size={18} />}
                  variant="primary"
                />
              )}
              <ActionButton
                onClick={() => setShowDeleteModal(true)}
                label="Delete"
                icon={<TrashIcon size={18} />}
                variant="danger"
              />
            </div>
          </div>
          <AgentOrVendorSection
            title="Personal Details"
            icon={<UserIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">
                  {vendor?.name?.firstName || "N/A"}{" "}
                  {vendor?.name?.lastName || ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{vendor?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="font-medium">{vendor?.contactNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Verified</p>
                <p className="font-medium">
                  {vendor?.isEmailVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title="Business Details"
            icon={<BuildingIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.businessName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License Number</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.businessLicenseNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">NIF Number</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.NIF || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.businessType || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Branches</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.totalBranches || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Opening Hours</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.openingHours
                    ? format(
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
              <div>
                <p className="text-sm text-gray-500">Closing Hours</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.closingHours
                    ? format(
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
                <p className="text-sm text-gray-500">Closing Days</p>
                <p className="font-medium">
                  {vendor?.businessDetails?.closingDays || "N/A"}
                </p>
              </div>
            </div>
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title="Business Location"
            icon={<MapPinIcon size={20} />}
            defaultOpen={true}
          >
            {vendor?.businessLocation ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Street Address</p>
                  <p className="font-medium">
                    {vendor?.businessLocation.street || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Postal Code</p>
                  <p className="font-medium">
                    {vendor?.businessLocation.postalCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">
                    {vendor?.businessLocation.city || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="font-medium">
                    {vendor?.businessLocation.state || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">
                    {vendor?.businessLocation.country || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No business location provided
              </p>
            )}
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title="Bank Details"
            icon={<BriefcaseIcon size={20} />}
            defaultOpen={true}
          >
            {vendor?.bankDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="font-medium">{vendor?.bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Holder</p>
                  <p className="font-medium">
                    {vendor?.bankDetails.accountHolderName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IBAN</p>
                  <p className="font-medium">{vendor?.bankDetails.iban}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">SWIFT Code</p>
                  <p className="font-medium">{vendor?.bankDetails.swiftCode}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No bank details provided</p>
            )}
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title="Activity Logs"
            icon={<BriefcaseIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Registered On</p>
                <p className="font-medium">
                  {format(vendor?.createdAt, "do MMM yyyy")}
                </p>
              </div>
              {vendor?.submittedForApprovalAt && (
                <div>
                  <p className="text-sm text-gray-500">Submitted On</p>
                  <p className="font-medium">
                    {format(vendor?.submittedForApprovalAt, "do MMM yyyy")}
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
                      {format(
                        vendor?.approvedOrRejectedOrBlockedAt,
                        "do MMM yyyy",
                      )}
                    </p>
                  </div>
                )}
              {vendor?.lastLoginAt && (
                <div>
                  <p className="text-sm text-gray-500">Last logged On</p>
                  <p className="font-medium">
                    {format(vendor?.lastLoginAt, "do MMM yyyy")}
                  </p>
                </div>
              )}
            </div>
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title="Documents"
            icon={<FileTextIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
              <VendorDetailsDoc documents={vendor?.documents} />
            </div>
          </AgentOrVendorSection>
          <AgentOrVendorSection
            title="Created Offers"
            icon={<TicketIcon size={20} />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offerData?.map((offer) => (
                <div
                  key={offer._id}
                  className="flex flex-col gap-2 border rounded-md p-4"
                >
                  <p className="text-gray-500">{offer.title}</p>
                  {offer.offerType === "BOGO" && <p>BOGO Offer</p>}
                  {offer.offerType === "PERCENT" && (
                    <p>Percentage Offer ({offer.discountValue}% Off)</p>
                  )}
                  {offer.offerType === "FLAT" && (
                    <p>Flat Offer (€{offer.discountValue} Off)</p>
                  )}
                  <p className="text-xs">
                    {format(offer.validFrom, "dd/MM/yyyy")} -{" "}
                    {format(offer.expiresAt, "dd/MM/yyyy")}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center mt-2">
              <Link
                className="text-[#DC3173] text-sm font-medium hover:underline"
                href={`/admin/vendor/offers/${vendor.userId}`}
              >
                View all
              </Link>
            </div>
          </AgentOrVendorSection>
        </div>
      </motion.div>
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
      />
    </div>
  );
};
