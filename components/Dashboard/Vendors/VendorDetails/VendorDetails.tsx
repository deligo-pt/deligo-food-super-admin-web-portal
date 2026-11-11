/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ActionButton from "@/components/AgentOrVendorDetails/AgentOrVendorActionButton";
import AgentOrVendorSection from "@/components/AgentOrVendorDetails/AgentOrVendorSection";
import { DocumentViewer } from "@/components/common/DocumentViewer";
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
import { TMeta } from "@/types";
import { TClockPeriod, TVendor, TWeeklyDaySchedule } from "@/types/user.type";
import { format, parse } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeftCircle,
  BanIcon,
  BriefcaseIcon,
  BuildingIcon,
  Check,
  CheckIcon,
  DownloadIcon,
  EditIcon,
  FileTextIcon,
  MapPinIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getVendorBranchColumns } from "../VendorBranchColumns";
import ReusableTable from "@/components/common/ReusableTable";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import VendorAvailabilityModal from "./VendorAvailabilityModal";
import ClearAvailabilityDialog from "./ClearAvailabilityDialog";
import { useStore } from "@/store/store";
import { useVendorTopbarTitle } from "@/hooks/useVendorTopbarTitle";

interface IProps {
  vendor: TVendor;
  branchesResult: {
    data: TVendor[];
    meta: TMeta;
  };
}

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Convert "HH:mm" or "24:00" → "9:00 AM" / "12:00 AM" (12-hour). */
function to12Hour(time: string): string {
  if (!time) return "";
  if (/\b(AM|PM)\b/i.test(time)) return time;
  // End of day
  if (time === "24:00" || time === "00:00") return "12:00 AM";
  try {
    return format(parse(time, "HH:mm", new Date()), "h:mm a");
  } catch {
    return time;
  }
}

/** Format periods as readable 12h ranges, e.g. "9:00 AM – 8:00 PM". */
function formatPeriodRange(period: TClockPeriod): string {
  return `${to12Hour(period.open)} – ${to12Hour(period.close)}`;
}

function hasWeeklySchedule(
  details?: TVendor["businessDetails"],
): details is NonNullable<TVendor["businessDetails"]> & {
  weeklySchedule: TWeeklyDaySchedule[];
} {
  return (
    Array.isArray(details?.weeklySchedule) &&
    details!.weeklySchedule!.length > 0
  );
}

type ScheduleRow = {
  day: string;
  periods: TClockPeriod[];
  isClosed: boolean;
};

/** Prefer weeklySchedule; fall back to legacy opening/closing hours. */
function getScheduleRows(
  details: TVendor["businessDetails"] | undefined,
): ScheduleRow[] {
  if (hasWeeklySchedule(details)) {
    const byDay = new Map(
      details.weeklySchedule.map((d) => [d.day, d.periods ?? []]),
    );
    return WEEKDAY_ORDER.map((day) => {
      const periods = byDay.get(day) ?? [];
      return { day, periods, isClosed: periods.length === 0 };
    });
  }

  // Legacy fallback → single period per open day
  const closed = new Set(details?.closingDays ?? []);
  const open = details?.openingHours;
  const close = details?.closingHours;
  const hasLegacy = Boolean(open && close);

  return WEEKDAY_ORDER.map((day) => {
    if (closed.has(day) || !hasLegacy) {
      return { day, periods: [], isClosed: true };
    }
    return {
      day,
      periods: [{ open: open!, close: close! }],
      isClosed: false,
    };
  });
}

export default function VendorDetails({ vendor, branchesResult }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveStatus, setApproveStatus] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showClearOverrideDialog, setShowClearOverrideDialog] = useState(false);

  useVendorTopbarTitle(
    vendor?.businessDetails?.businessName ||
    vendor?.businessDetails?.branchName,
  );

  const hasActiveOverride = Boolean(
    vendor?.businessDetails?.availability?.override,
  );
  const override = vendor?.businessDetails?.availability?.override;

  const scheduleRows = getScheduleRows(vendor?.businessDetails);
  const usingWeeklySchedule = hasWeeklySchedule(vendor?.businessDetails);
  const timezone = vendor?.businessDetails?.timezone;
  const isStoreOpen = vendor?.businessDetails?.isStoreOpen;
  const availabilityState = vendor?.businessDetails?.availability?.state;
  const closedLabel = t("closed") || "Closed";

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
      const result = await resendOtpReq({
        email: vendor?.email,
        role: USER_ROLE.VENDOR,
      });

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

  const columns = getVendorBranchColumns({
    t,
    router,
  });

  const dayLabel = (day: string) => {
    const key = day.toLowerCase();
    return t(key) || day;
  };

  return (
    <div>
      <div className="mb-4">
        <Button
          onClick={() => router.back()}
          variant="link"
          className="inline-flex items-center text-sm gap-2 text-[#DC3173] px-0! py-0 h-4 cursor-pointer"
        >
          <ArrowLeftCircle />
          {t("go_back")}
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
                alt={`${vendor?.name?.firstName || "Vendor"}`}
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
                {vendor?.name?.firstName || "N/"}{" "}
                {vendor?.name?.lastName || "A"}
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
            <div className="flex justify-end gap-4">
              {!vendor?.isEmailVerified ? (
                <ActionButton
                  onClick={resendOtp}
                  disabled={isSubmitting}
                  label={t("verify_email")}
                  icon={<Check size={18} />}
                  variant="primary"
                />
              ) : (
                <ActionButton
                  onClick={() =>
                    router.push("/admin/vendor/edit/" + vendor.userId)
                  }
                  label={t("edit")}
                  icon={<EditIcon size={18} />}
                  variant="primary"
                />
              )}
              {vendor.status === "APPROVED" && (
                <>
                  {hasActiveOverride ? (
                    <ActionButton
                      onClick={() => setShowClearOverrideDialog(true)}
                      label={t("clear_override") || "Clear Override / Resume"}
                      icon={<PlayCircleIcon size={18} />}
                      variant="success"
                    />
                  ) : (
                    <ActionButton
                      onClick={() => setShowAvailabilityModal(true)}
                      label={t("pause_or_suspend") || "Pause / Suspend"}
                      icon={<PauseCircleIcon size={18} />}
                      variant="warning"
                    />
                  )}
                </>
              )}
            </div>
            {hasActiveOverride && (
              <div className="my-2 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {t("currently")} {override?.status}
                    {override?.isCustomerHidden &&
                      ` ${t("hidden_from_customers")}`}
                  </p>
                  <p className="text-xs mt-0.5">
                    {t("until")}:{" "}
                    {override?.until
                      ? format(new Date(override.until), "dd MMM yyyy, hh:mm a")
                      : "N/A"}
                    {override?.reason &&
                      ` • ${t("reason")}: ${override.reason}`}
                  </p>
                </div>
              </div>
            )}
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
                <p className="font-medium">
                  {vendor?.contactNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("email_verified")}</p>
                <p
                  className={`px-2 py-0.5 w-9 rounded text-sm font-medium ${vendor?.isEmailVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
                >
                  {vendor?.isEmailVerified ? t("yes") : t("no")}
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
              {vendor?.businessDetails?.companyLegalName && (
                <div>
                  <p className="text-sm text-gray-500">
                    {t("company_legal_name")}
                  </p>
                  <p className="font-medium">
                    {vendor?.businessDetails?.companyLegalName || "N/A"}
                  </p>
                </div>
              )}
              {vendor?.role === "SUB_VENDOR" && (
                <div>
                  <p className="text-sm text-gray-500">{t("branch_name")}</p>
                  <p className="font-medium">
                    {vendor?.businessDetails?.branchName || "N/A"}
                  </p>
                </div>
              )}
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
              {vendor?.businessDetails?.businessTypeSlug === "restaurant" && (
                <div>
                  <p className="text-sm text-gray-500">
                    {t("restaurant_cuisine_type")}
                  </p>
                  <p className="font-medium">
                    {(() => {
                      const cuisineData =
                        vendor?.businessDetails?.restaurantCuisineType;
                      if (
                        !cuisineData ||
                        (Array.isArray(cuisineData) && cuisineData.length === 0)
                      ) {
                        return "N/A";
                      }
                      return Array.isArray(cuisineData)
                        ? cuisineData.join(", ")
                        : cuisineData;
                    })()}
                  </p>
                </div>
              )}
              {vendor?.role === "VENDOR" && (
                <div>
                  <p className="text-sm text-gray-500">{t("total_branches")}</p>
                  <p className="font-medium">
                    {vendor?.businessDetails?.totalBranches ?? "N/A"}
                  </p>
                </div>
              )}

              {/* Store status + timezone — same label/value pattern as other fields */}
              {typeof isStoreOpen === "boolean" && (
                <div>
                  <p className="text-sm text-gray-500">
                    {t("store_status") || "Store Status"}
                  </p>
                  <p className="font-medium flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isStoreOpen
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isStoreOpen ? "bg-green-500" : "bg-gray-400"
                          }`}
                      />
                      {isStoreOpen
                        ? t("open") || "Open"
                        : t("closed") || "Closed"}
                    </span>
                    {availabilityState &&
                      availabilityState !== "OPEN" &&
                      availabilityState !== "CLOSED" && (
                        <span className="text-xs text-gray-500">
                          ({availabilityState})
                        </span>
                      )}
                  </p>
                </div>
              )}
              {timezone && (
                <div>
                  <p className="text-sm text-gray-500">
                    {t("timezone") || "Timezone"}
                  </p>
                  <p className="font-medium">{timezone}</p>
                </div>
              )}

              {/* Operating hours — weeklySchedule preferred, 12h AM/PM, multi-period chips */}
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-3">
                  {t("operating_hours") || "Operating Hours"}
                  {!usingWeeklySchedule && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      {t("legacy") || "Legacy"}
                    </span>
                  )}
                </p>
                <div className="space-y-0 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/60 overflow-hidden">
                  {scheduleRows.map(({ day, periods, isClosed }) => (
                    <div
                      key={day}
                      className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 px-4 py-2.5 bg-white"
                    >
                      <p className="text-sm font-medium text-gray-700 w-28 shrink-0">
                        {dayLabel(day)}
                      </p>
                      {isClosed ? (
                        <p className="text-sm text-gray-400 italic">
                          {closedLabel}
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {periods.map((period, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#DC3173]/8 text-[#DC3173] border border-[#DC3173]/15"
                            >
                              {formatPeriodRange(period)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                  <p className="font-medium">
                    {vendor.bankDetails?.bankName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("account_holder")}</p>
                  <p className="font-medium">
                    {vendor.bankDetails?.accountHolderName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("iban")}</p>
                  <p className="font-medium">
                    {vendor.bankDetails?.iban || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("swift_code")}</p>
                  <p className="font-medium">
                    {vendor.bankDetails?.swiftCode || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                {t("no_bank_details_provided")}
              </p>
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
            title={t("agreement_document") || "Agreement Document"}
            icon={<FileTextIcon size={20} />}
            defaultOpen={true}
          >
            {vendor?.agreement?.pdfPath ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm font-mono">
                        ID: {vendor?.agreement?.agreementId}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${vendor?.agreement?.status === "SIGNED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : vendor?.agreement?.status === "PARTY_SIGNED"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                      >
                        {vendor?.agreement?.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t("signed_agreement_description") ||
                        "Official signed partnership agreement PDF."}
                    </p>
                  </div>
                  <a
                    href={vendor?.agreement?.pdfPath}
                    download
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-white bg-[#DC3173] hover:bg-[#c22762] transition-colors shadow-xs"
                  >
                    <DownloadIcon size={14} />
                    {t("download") || "Download"}
                  </a>
                </div>
                <DocumentViewer
                  sections={[
                    {
                      key: "agreement",
                      label: t("agreement_preview") || "Agreement Preview",
                      files: vendor.agreement.pdfPath,
                    },
                  ]}
                />
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">
                {t("no_agreement_found") || "No agreement document available."}
              </p>
            )}
          </AgentOrVendorSection>

          {vendor?.role === "VENDOR" && (
            <AgentOrVendorSection
              title={t("all_branches")}
              icon={<FileTextIcon size={20} />}
              defaultOpen={true}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
              >
                <ReusableTable
                  data={branchesResult?.data}
                  meta={branchesResult?.meta}
                  columns={columns}
                  getRowKey={(row) => row._id}
                  emptyMessage={t("no_vendors_no_branches_foundfound")}
                />
              </motion.div>

              {!!branchesResult?.meta?.totalPage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 md:px-6 mt-5"
                >
                  <PaginationComponent
                    totalPages={branchesResult?.meta?.totalPage as number}
                  />
                </motion.div>
              )}
            </AgentOrVendorSection>
          )}
        </div>

        <div className="mb-6 mx-6">
          <div className="flex flex-wrap justify-end gap-4">
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
            {vendor.status === "APPROVED" && vendor?.role === "VENDOR" && (
              <ActionButton
                onClick={() =>
                  router.push(`/admin/vendor-branch/add/${vendor?.userId}`)
                }
                label={t("add_branch")}
                icon={<EditIcon size={18} />}
                variant="primary"
              />
            )}
            {vendor.status === "APPROVED" && (
              <>
                <ActionButton
                  onClick={() =>
                    router.push(
                      `/admin/vendor/${vendor?.userId}/manage-products`,
                    )
                  }
                  label={t("manage_products")}
                  icon={<EditIcon size={18} />}
                  variant="primary"
                />
                <ActionButton
                  onClick={() => setApproveStatus("BLOCKED")}
                  label={t("block")}
                  icon={<BanIcon size={18} />}
                  variant="warning"
                />
              </>
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
      </motion.div>

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

      <VendorAvailabilityModal
        open={showAvailabilityModal}
        onOpenChange={setShowAvailabilityModal}
        vendorId={vendor.userId}
        vendorName={
          `${vendor?.name?.firstName || ""} ${vendor?.name?.lastName || ""}`.trim() ||
          vendor.businessDetails?.businessName ||
          "Vendor"
        }
      />

      <ClearAvailabilityDialog
        open={showClearOverrideDialog}
        onOpenChange={setShowClearOverrideDialog}
        vendorId={vendor.userId}
        vendorName={
          `${vendor?.name?.firstName || ""} ${vendor?.name?.lastName || ""}`.trim() ||
          vendor.businessDetails?.businessName ||
          "Vendor"
        }
        currentStatus={override?.status}
        until={override?.until}
      />
    </div>
  );
}