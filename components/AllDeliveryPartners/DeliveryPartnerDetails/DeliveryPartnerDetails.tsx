"use client";

import ImagePreview from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/ImagePreview";
import InfoRow from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/InfoRow";
import Section from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/Section";
import StatusBadge from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/StatusBadge";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { motion } from "framer-motion";
import {
  Bike,
  Briefcase,
  CalendarClock,
  Car,
  Check,
  CreditCard,
  Edit,
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

interface IProps {
  partner: TDeliveryPartner;
}

const formatDate = (date: Date | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export const DeliveryPartnerDetails = ({ partner }: IProps) => {
  const fullName =
    `${partner.personalInfo?.Name?.firstName || ""} ${
      partner.personalInfo?.Name?.lastName || ""
    }`.trim() || "No Name Provided";

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

  return (
    <div className="max-w-4xl mx-auto">
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
            {partner.personalInfo?.contactNumber && (
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
                <span className="text-sm">
                  {partner.personalInfo.contactNumber}
                </span>
              </motion.div>
            )}
          </div>
          <div>
            <StatusBadge status={partner.status} />
          </div>
        </div>
      </motion.div>
      <div className="bg-gray-50 p-6 rounded-b-lg">
        <Section title="Personal Details" icon={<User />} defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoRow label="Full Name" value={fullName} />
              <InfoRow label="Email" value={partner.email} />
              <InfoRow
                label="Contact Number"
                value={partner.personalInfo?.contactNumber || "N/A"}
              />
              <InfoRow
                label="Gender"
                value={partner.personalInfo?.gender || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label="Date of Birth"
                value={formatDate(partner.personalInfo?.dateOfBirth)}
              />
              <InfoRow
                label="Nationality"
                value={partner.personalInfo?.nationality || "N/A"}
              />
              <InfoRow
                label="Email Verified"
                value={
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      partner.isEmailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {partner.isEmailVerified ? "Yes" : "No"}
                  </span>
                }
              />
              <InfoRow
                label="ID Expiry Date"
                value={formatDate(partner.personalInfo?.idExpiryDate)}
              />
            </div>
          </div>
        </Section>
        <Section title="Address" icon={<MapPin />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoRow
                label="Street"
                value={partner.personalInfo?.address?.street || "N/A"}
              />
              <InfoRow
                label="City"
                value={partner.personalInfo?.address?.city || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label="State"
                value={partner.personalInfo?.address?.state || "N/A"}
              />
              <InfoRow
                label="Country"
                value={partner.personalInfo?.address?.country || "N/A"}
              />
              <InfoRow
                label="Zip Code"
                value={partner.personalInfo?.address?.zipCode || "N/A"}
              />
            </div>
          </div>
        </Section>
        <Section title="Vehicle Information" icon={getVehicleIcon()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoRow
                label="Vehicle Type"
                value={partner.vehicleInfo?.vehicleType || "N/A"}
              />
              <InfoRow
                label="Brand"
                value={partner.vehicleInfo?.brand || "N/A"}
              />
              <InfoRow
                label="Model"
                value={partner.vehicleInfo?.model || "N/A"}
              />
              <InfoRow
                label="License Plate"
                value={partner.vehicleInfo?.licensePlate || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label="Driving License Number"
                value={partner.vehicleInfo?.drivingLicenseNumber || "N/A"}
              />
              <InfoRow
                label="License Expiry"
                value={formatDate(partner.vehicleInfo?.drivingLicenseExpiry)}
              />
              <InfoRow
                label="Insurance Policy Number"
                value={partner.vehicleInfo?.insurancePolicyNumber || "N/A"}
              />
              <InfoRow
                label="Insurance Expiry"
                value={formatDate(partner.vehicleInfo?.insuranceExpiry)}
              />
            </div>
          </div>
        </Section>
        <Section title="Bank Details" icon={<CreditCard />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoRow
                label="Bank Name"
                value={partner.bankDetails?.bankName || "N/A"}
              />
              <InfoRow
                label="Account Holder"
                value={partner.bankDetails?.accountHolderName || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label="IBAN"
                value={partner.bankDetails?.iban || "N/A"}
              />
              <InfoRow
                label="SWIFT Code"
                value={partner.bankDetails?.swiftCode || "N/A"}
              />
            </div>
          </div>
        </Section>
        <Section title="Legal Status" icon={<Gavel />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoRow
                label="Residence Permit Type"
                value={partner.legalStatus?.residencePermitType || "N/A"}
              />
              <InfoRow
                label="Residence Permit Number"
                value={partner.legalStatus?.residencePermitNumber || "N/A"}
              />
            </div>
            <div>
              <InfoRow
                label="Permit Expiry Date"
                value={formatDate(partner.legalStatus?.residencePermitExpiry)}
              />
              <InfoRow
                label="Criminal Record Certificate"
                value={
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      partner.criminalRecord?.certificate
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {partner.criminalRecord?.certificate
                      ? "Provided"
                      : "Not Provided"}
                  </span>
                }
              />
            </div>
          </div>
        </Section>
        <Section title="Documents" icon={<FileText />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partner.personalInfo?.idDocumentFront && (
              <div>
                <div className="mb-2 text-gray-500 text-sm">
                  ID Document Front
                </div>
                <ImagePreview
                  url={partner.personalInfo.idDocumentFront}
                  alt="ID Front"
                />
              </div>
            )}
            {partner.personalInfo?.idDocumentBack && (
              <div>
                <div className="mb-2 text-gray-500 text-sm">
                  ID Document Back
                </div>
                <ImagePreview
                  url={partner.personalInfo.idDocumentBack}
                  alt="ID Back"
                />
              </div>
            )}
            {partner.documents?.drivingLicense && (
              <div>
                <div className="mb-2 text-gray-500 text-sm">
                  Driving License
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
                  Vehicle Registration
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
                  Criminal Record Certificate
                </div>
                <ImagePreview
                  url={partner.documents.criminalRecordCertificate}
                  alt="Criminal Record"
                />
              </div>
            )}
          </div>
        </Section>
        <Section title="Operational Data" icon={<Package />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-xs mb-1">Total Deliveries</div>
              <div className="text-2xl font-bold text-gray-900">
                {partner.operationalData?.totalDeliveries || 0}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-xs mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {partner.operationalData?.completedDeliveries || 0}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-xs mb-1">Canceled</div>
              <div className="text-2xl font-bold text-red-600">
                {partner.operationalData?.canceledDeliveries || 0}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-xs mb-1">Rating</div>
              <div className="text-2xl font-bold text-amber-500 flex items-center justify-center">
                {partner.operationalData?.rating?.average.toFixed(1) || "N/A"}{" "}
                <Star className="w-4 h-4 ml-1" fill="currentColor" />
              </div>
              <div className="text-xs text-gray-500">
                {partner.operationalData?.rating?.totalReviews || 0} reviews
              </div>
            </div>
          </div>
          {partner.earnings && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Earnings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-xs mb-1">
                    Total Earnings
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    €{partner.earnings.totalEarnings?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-xs mb-1">
                    Pending Earnings
                  </div>
                  <div className="text-xl font-bold text-[#DC3173]">
                    €{partner.earnings.pendingEarnings?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Section>
        <Section title="Work Preferences" icon={<Briefcase />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoRow
                label="Preferred Zones"
                value={
                  partner.workPreferences?.preferredZones?.join(", ") ||
                  "None specified"
                }
              />
              <InfoRow
                label="Preferred Hours"
                value={
                  partner.workPreferences?.preferredHours?.join(", ") ||
                  "None specified"
                }
              />
              <InfoRow
                label="Worked with other platforms"
                value={
                  partner.workPreferences?.workedWithOtherPlatform
                    ? "Yes"
                    : "No"
                }
              />
              {partner.workPreferences?.workedWithOtherPlatform && (
                <InfoRow
                  label="Platform Name"
                  value={
                    partner.workPreferences?.otherPlatformName ||
                    "Not specified"
                  }
                />
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Equipment
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      partner.workPreferences?.hasEquipment?.isothermalBag
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-700">Isothermal Bag</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      partner.workPreferences?.hasEquipment?.helmet
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-700">Helmet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      partner.workPreferences?.hasEquipment?.powerBank
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-700">Power Bank</span>
                </div>
              </div>
            </div>
          </div>
        </Section>
        <Section title="Account Information" icon={<CalendarClock />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoRow
                label="Account Created"
                value={formatDate(partner.createdAt)}
              />
              <InfoRow
                label="Last Updated"
                value={formatDate(partner.updatedAt)}
              />
              <InfoRow
                label="Submitted For Approval"
                value={formatDate(partner.submittedForApprovalAt)}
              />
            </div>
            <div>
              <InfoRow
                label="Approved/Rejected/Blocked At"
                value={formatDate(partner.approvedOrRejectedOrBlockedAt)}
              />
              {partner.remarks && (
                <InfoRow label="Remarks" value={partner.remarks} />
              )}
              <InfoRow
                label="Two Factor Authentication"
                value={
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      partner.twoFactorEnabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {partner.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </span>
                }
              />
            </div>
          </div>
        </Section>
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          {partner.status !== "SUBMITTED" && (
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-[#DC3173] bg-opacity-10 text-[#DC3173] rounded-lg transition-all hover:bg-opacity-20"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            className="flex items-center space-x-1 px-4 py-2 bg-red-500 bg-opacity-10 text-red-500 rounded-lg transition-all hover:bg-opacity-20"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600"
          >
            <Check className="w-4 h-4" />
            <span>Approve</span>
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600"
          >
            <X className="w-4 h-4" />
            <span>Reject</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
