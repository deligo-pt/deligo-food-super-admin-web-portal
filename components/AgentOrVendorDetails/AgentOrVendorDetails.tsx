import ActionButton from "@/components/AgentOrVendorDetails/AgentOrVendorActionButton";
import AgentOrVendorSection from "@/components/AgentOrVendorDetails/AgentOrVendorSection";
import { USER_STATUS } from "@/consts/user.const";
import { TAgent } from "@/types/user.type";
import { motion } from "framer-motion";
import {
  BanIcon,
  BriefcaseIcon,
  BuildingIcon,
  CarIcon,
  CheckIcon,
  FileTextIcon,
  MapPinIcon,
  StarIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import React from "react";

type IProps = {
  fleetManager: TAgent;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onBlock?: (id: string) => void;
};

export const FleetManagerDetails: React.FC<IProps> = ({
  fleetManager,
  onApprove,
  onReject,
  onDelete,
  onBlock,
}) => {
  const handleApprove = () => {
    if (onApprove && fleetManager._id) {
      onApprove(fleetManager._id);
    }
  };

  const handleReject = () => {
    if (onReject && fleetManager._id) {
      onReject(fleetManager._id);
    }
  };

  const handleDelete = () => {
    if (onDelete && fleetManager._id) {
      onDelete(fleetManager._id);
    }
  };

  const handleBlock = () => {
    if (onBlock && fleetManager._id) {
      onBlock(fleetManager._id);
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
      className="max-w-4xl w-full mx-auto bg-gray-50 rounded-xl overflow-hidden shadow-lg"
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
              fleetManager.status
            )}`}
          >
            {fleetManager.status}
          </span>
        </motion.div>
        <div className="flex items-center gap-4">
          {fleetManager.profilePhoto ? (
            <Image
              src={fleetManager.profilePhoto}
              alt={`${fleetManager.name?.firstName || "Fleet Manager"}`}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white">
              <UserIcon size={40} />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {fleetManager.name?.firstName} {fleetManager.name?.lastName}
            </h1>
            <p className="opacity-90">{fleetManager.email}</p>
            {fleetManager.contactNumber && (
              <p className="opacity-90">{fleetManager.contactNumber}</p>
            )}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-6">
        <AgentOrVendorSection
          title="Personal Details"
          icon={<UserIcon size={20} />}
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">
                {fleetManager.name?.firstName || "N/A"}{" "}
                {fleetManager.name?.lastName || ""}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{fleetManager.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Number</p>
              <p className="font-medium">
                {fleetManager.contactNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Verified</p>
              <p className="font-medium">
                {fleetManager.isEmailVerified ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </AgentOrVendorSection>
        <AgentOrVendorSection
          title="Company Details"
          icon={<BuildingIcon size={20} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p className="font-medium">
                {fleetManager.companyDetails?.companyName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">License Number</p>
              <p className="font-medium">
                {fleetManager.companyDetails?.companyLicenseNumber || "N/A"}
              </p>
            </div>
          </div>
        </AgentOrVendorSection>
        <AgentOrVendorSection
          title="Company Location"
          icon={<MapPinIcon size={20} />}
        >
          {fleetManager.companyLocation ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Street Address</p>
                <p className="font-medium">
                  {fleetManager.companyLocation.streetAddress},{" "}
                  {fleetManager.companyLocation.streetNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City & Postal Code</p>
                <p className="font-medium">
                  {fleetManager.companyLocation.city},{" "}
                  {fleetManager.companyLocation.postalCode}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No company location provided</p>
          )}
        </AgentOrVendorSection>
        <AgentOrVendorSection
          title="Bank Details"
          icon={<BriefcaseIcon size={20} />}
        >
          {fleetManager.bankDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Bank Name</p>
                <p className="font-medium">
                  {fleetManager.bankDetails.bankName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Holder</p>
                <p className="font-medium">
                  {fleetManager.bankDetails.accountHolderName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IBAN</p>
                <p className="font-medium">{fleetManager.bankDetails.iban}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SWIFT Code</p>
                <p className="font-medium">
                  {fleetManager.bankDetails.swiftCode}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No bank details provided</p>
          )}
        </AgentOrVendorSection>
        <AgentOrVendorSection
          title="Documents"
          icon={<FileTextIcon size={20} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fleetManager.documents?.idProof && (
              <div>
                <p className="text-sm text-gray-500 mb-2">ID Proof</p>
                <Image
                  src={fleetManager.documents.idProof}
                  alt="ID Proof"
                  className="w-full h-40 object-cover rounded-lg border border-gray-200"
                />
                <a
                  href={fleetManager.documents.idProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-[#DC3173] hover:underline inline-block"
                >
                  View Full Image
                </a>
              </div>
            )}
            {fleetManager.documents?.companyLicense && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Company License</p>
                <Image
                  src={fleetManager.documents.companyLicense}
                  alt="Company License"
                  className="w-full h-40 object-cover rounded-lg border border-gray-200"
                />
                <a
                  href={fleetManager.documents.companyLicense}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-[#DC3173] hover:underline inline-block"
                >
                  View Full Image
                </a>
              </div>
            )}
            {!fleetManager.documents?.idProof &&
              !fleetManager.documents?.companyLicense && (
                <p className="text-gray-500 italic col-span-2">
                  No documents uploaded
                </p>
              )}
          </div>
        </AgentOrVendorSection>
        <AgentOrVendorSection
          title="Operational Data"
          icon={<CarIcon size={20} />}
        >
          {fleetManager.operationalData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Drivers</p>
                <p className="text-2xl font-bold">
                  {fleetManager.operationalData.noOfDrivers}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Active Vehicles</p>
                <p className="text-2xl font-bold">
                  {fleetManager.operationalData.activeVehicles || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Total Deliveries</p>
                <p className="text-2xl font-bold">
                  {fleetManager.operationalData.totalDeliveries || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-500">Rating</p>
                  <StarIcon
                    size={16}
                    className="text-amber-400 fill-amber-400"
                  />
                </div>
                <p className="text-2xl font-bold">
                  {fleetManager.operationalData.rating?.average.toFixed(1) ||
                    "N/A"}
                </p>
                {fleetManager.operationalData.rating && (
                  <p className="text-xs text-gray-500">
                    ({fleetManager.operationalData.rating.totalReviews} reviews)
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No operational data available
            </p>
          )}
        </AgentOrVendorSection>
        {/* Action buttons */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex flex-wrap justify-end gap-4">
            {fleetManager.status === "SUBMITTED" ? (
              <>
                <ActionButton
                  onClick={handleApprove}
                  label="Approve"
                  icon={<CheckIcon size={18} />}
                  variant="success"
                />
                <ActionButton
                  onClick={handleReject}
                  label="Reject"
                  icon={<XIcon size={18} />}
                  variant="danger"
                />
              </>
            ) : (
              <>
                <ActionButton
                  onClick={handleDelete}
                  label="Delete"
                  icon={<TrashIcon size={18} />}
                  variant="danger"
                />
                <ActionButton
                  onClick={handleBlock}
                  label="Block"
                  icon={<BanIcon size={18} />}
                  variant="warning"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
