/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BusinessLocationMap from "@/components/BusinessLocationMap/BusinessLocationMap";
import AgreementViewer from "@/components/common/Agreements/AgreementViewer";
import CreateUserAgreement from "@/components/common/Agreements/CreateUserAgreement";
import UploadFleetManagerDocuments from "@/components/Dashboard/FleetManagers/AddFleetManager/UploadFleetManagerDocuments";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { USER_STATUS } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { approveOrRejectReq } from "@/services/auth/approve-or-reject.service";
import {
  submitForApproval,
  updateUserDataReq,
} from "@/services/auth/register-user.service";
import { FLEET_REQUIRED_DOCS, TFleetDocKey } from "@/types/document.type";
import { TAgent, TBusinessLocation } from "@/types/user.type";
import { addFleetManagerValidation } from "@/validations/add-fleet-manager/add-fleet-manager.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  FileText,
  Lock,
  MapPin,
  Save,
  ScrollText,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";
import z from "zod";

const DELIGO = "#DC3173";

interface IProps {
  fleetManager: TAgent;
}

type TFleetManagerForm = z.infer<typeof addFleetManagerValidation>;

/** First section ends at Documents (index 4). Agreements start at 5. */
const DETAILS_LAST_TAB = 4;
const AGREEMENT_START_TAB = 5;

const TABS = [
  { id: 0, key: "account", labelKey: "account_information", icon: User },
  { id: 1, key: "business", labelKey: "business_details", icon: Briefcase },
  { id: 2, key: "bank", labelKey: "bank_nd_payment_information", icon: Banknote },
  { id: 3, key: "location", labelKey: "business_location_information", icon: MapPin },
  { id: 4, key: "documents", labelKey: "documents_nd_verification", icon: FileText },
  { id: 5, key: "create_agreement", labelKey: "create_agreement", icon: ScrollText },
  { id: 6, key: "sign_agreement", labelKey: "agreement_sign", icon: FileSignature },
] as const;

export default function UpdateFleetManager({ fleetManager }: IProps) {
  const [fleetManagerState, setFleetManagerState] = useState(fleetManager);
  const { t } = useTranslation();
  const router = useRouter();

  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: fleetManager?.businessLocation?.latitude || 0,
    longitude: fleetManager?.businessLocation?.longitude || 0,
  });

  const [previews, setPreviews] = useState<
    Record<TFleetDocKey, string[] | null>
  >({
    businessLicense: Array.isArray(fleetManager?.documents?.businessLicense)
      ? fleetManager?.documents?.businessLicense
      : null,
    myPhoto: Array.isArray(fleetManager?.documents?.myPhoto)
      ? fleetManager?.documents?.myPhoto
      : null,
    idProofFront: Array.isArray(fleetManager?.documents?.idProofFront)
      ? fleetManager?.documents?.idProofFront
      : null,
    idProofBack: Array.isArray(fleetManager?.documents?.idProofBack)
      ? fleetManager?.documents?.idProofBack
      : null,
    proofOfAddress: Array.isArray(fleetManager?.documents?.proofOfAddress)
      ? fleetManager?.documents?.proofOfAddress
      : null,
    activityDocument: Array.isArray(fleetManager?.documents?.activityDocument)
      ? fleetManager?.documents?.activityDocument
      : null,
    ibanProof: Array.isArray(fleetManager?.documents?.ibanProof)
      ? fleetManager?.documents?.ibanProof
      : null,
  });

  // ---------- Agreement status helpers ----------
  const agreementStatus =
    (fleetManagerState as any)?.agreement?.status ?? null;
  const needsAgreement =
    !(fleetManagerState as any)?.agreement || agreementStatus === "UNSIGNED";
  const isAgreementFinalized =
    agreementStatus === "PARTY_SIGNED" || agreementStatus === "SIGNED";

  const [agreementCreated, setAgreementCreated] = useState(
    isAgreementFinalized
  );
  const [agreementData, setAgreementData] = useState<any>(
    (fleetManagerState as any)?.agreement ?? null
  );
  const [agreementSigned, setAgreementSigned] = useState(isAgreementFinalized);

  /** After Save & Continue when re-agreement is required */
  const [profileSaved, setProfileSaved] = useState(!needsAgreement);
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState(0);

  const form = useForm<TFleetManagerForm>({
    resolver: zodResolver(addFleetManagerValidation),
    defaultValues: {
      firstName: fleetManager.name?.firstName || "",
      lastName: fleetManager.name?.lastName || "",
      phoneNumber: fleetManager?.contactNumber || "",
      businessName: fleetManager.businessDetails?.businessName || "",
      businessLicenseNumber: fleetManager.businessDetails?.businessLicenseNumber || "",
      NIF: fleetManager.businessDetails?.NIF || "",
      street: fleetManager.businessLocation?.street || "",
      city: fleetManager.businessLocation?.city || "",
      postalCode: fleetManager.businessLocation?.postalCode || "",
      country: fleetManager.businessLocation?.country || "",
      latitude: fleetManager?.businessLocation?.latitude || 0,
      longitude: fleetManager?.businessLocation?.longitude || 0,
      accountHolderName: fleetManager.bankDetails?.accountHolderName || "",
      iban: fleetManager.bankDetails?.iban || "",
    },
    mode: "onChange",
  });

  const {
    formState: { isSubmitting },
  } = form;

  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    form.reset({
      firstName: fleetManagerState.name?.firstName || "",
      lastName: fleetManagerState.name?.lastName || "",
      phoneNumber: fleetManagerState?.contactNumber || "",
      businessName: fleetManagerState.businessDetails?.businessName || "",
      businessLicenseNumber: fleetManagerState.businessDetails?.businessLicenseNumber || "",
      NIF: fleetManagerState.businessDetails?.NIF || "",
      street: fleetManagerState.businessLocation?.street || "",
      city: fleetManagerState.businessLocation?.city || "",
      postalCode: fleetManagerState.businessLocation?.postalCode || "",
      country: fleetManagerState.businessLocation?.country || "",
      latitude: fleetManagerState?.businessLocation?.latitude || 0,
      longitude: fleetManagerState?.businessLocation?.longitude || 0,
      accountHolderName: fleetManagerState.bankDetails?.accountHolderName || "",
      iban: fleetManagerState.bankDetails?.iban || "",
    });
  }, [fleetManagerState, form]);

  useEffect(() => {
    const currentPhone = form.getValues("phoneNumber");
    if (!currentPhone) {
      form.setValue("phoneNumber", "+351", { shouldValidate: true });
    }
  }, [form]);

  // ---------- Step completion ----------
  const isDocumentsValid = FLEET_REQUIRED_DOCS.every(
    (key) => previews[key] !== null && (previews[key]?.length ?? 0) > 0
  );

  const stepCompleted = useMemo(() => {
    const v = watchedValues;

    const accountOk =
      !!v.firstName?.trim() &&
      !!v.lastName?.trim() &&
      !!v.phoneNumber &&
      v.phoneNumber.length > 5;

    const businessOk =
      !!v.businessName?.trim() && !!v.businessLicenseNumber?.trim();

    const bankOk = !!v.accountHolderName?.trim() && !!v.iban?.trim();

    const locationOk =
      !!v.street?.trim() &&
      !!v.city?.trim() &&
      !!v.postalCode?.trim() &&
      !!v.country?.trim() &&
      locationCoordinates.latitude !== 0 &&
      locationCoordinates.longitude !== 0;

    const documentsOk = isDocumentsValid;

    const createOk = needsAgreement ? agreementCreated : true;
    const signOk = needsAgreement ? agreementSigned : true;

    return [
      accountOk,
      businessOk,
      bankOk,
      locationOk,
      documentsOk,
      createOk,
      signOk,
    ];
  }, [
    watchedValues,
    locationCoordinates,
    isDocumentsValid,
    agreementCreated,
    agreementSigned,
    needsAgreement,
  ]);

  const canAccessTab = (tabIndex: number) => {
    if (isAgreementFinalized) return true;

    if (tabIndex >= AGREEMENT_START_TAB) {
      if (!profileSaved) return false;
    }

    for (let i = 0; i < tabIndex; i++) {
      if (!stepCompleted[i]) return false;
    }
    return true;
  };

  const goToTab = (index: number) => {
    if (canAccessTab(index)) {
      setActiveTab(index);
    } else {
      if (index >= AGREEMENT_START_TAB && !profileSaved && needsAgreement) {
        toast.error(
          "Please complete Documents and click Save & Continue before accessing Agreements."
        );
      } else {
        toast.error("Please complete the previous steps first.");
      }
    }
  };

  const goNext = () => {
    if (activeTab < TABS.length - 1) {
      if (!stepCompleted[activeTab]) {
        toast.error("Please complete all required fields in this step.");
        return;
      }
      if (activeTab === DETAILS_LAST_TAB && needsAgreement && !profileSaved) {
        handleSaveAndContinue();
        return;
      }
      setActiveTab((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (activeTab > 0) setActiveTab((prev) => prev - 1);
  };

  // ---------- Build partial payload (only changed fields) ----------
  const buildChangedPayload = (
    data: TFleetManagerForm
  ): Record<string, any> => {
    const hasChanged = (current: any, original: any) => {
      if (Array.isArray(current) || Array.isArray(original)) {
        return JSON.stringify(current || []) !== JSON.stringify(original || []);
      }
      return current !== original;
    };

    const fleetManagerData: Record<string, any> = {};

    // name
    const originalFirstName = fleetManager?.name?.firstName || "";
    const originalLastName = fleetManager?.name?.lastName || "";
    if (
      hasChanged(data.firstName, originalFirstName) ||
      hasChanged(data.lastName, originalLastName)
    ) {
      fleetManagerData.name = {
        firstName: data.firstName,
        lastName: data.lastName,
      };
    }

    // contactNumber
    if (hasChanged(data.phoneNumber, fleetManager?.contactNumber || "")) {
      fleetManagerData.contactNumber = data.phoneNumber;
    }

    // businessDetails
    const originalBusinessName = fleetManager?.businessDetails?.businessName || "";
    const originalLicense = fleetManager?.businessDetails?.businessLicenseNumber || "";
    const originalNIF = fleetManager?.businessDetails?.NIF || "";

    if (
      hasChanged(data.businessName, originalBusinessName) ||
      hasChanged(data.businessLicenseNumber?.toUpperCase(), originalLicense) ||
      hasChanged(data.NIF?.toUpperCase(), originalNIF)
    ) {
      fleetManagerData.businessDetails = {
        businessName: data.businessName,
        businessLicenseNumber: data.businessLicenseNumber?.toUpperCase(),
        NIF: data.NIF?.toUpperCase(),
      };
    }

    // businessLocation
    const currentLat =
      locationCoordinates.latitude ||
      fleetManager?.businessLocation?.latitude ||
      0;
    const currentLng =
      locationCoordinates.longitude ||
      fleetManager?.businessLocation?.longitude ||
      0;

    const originalStreet = fleetManager?.businessLocation?.street || "";
    const originalCity = fleetManager?.businessLocation?.city || "";
    const originalPostalCode =
      fleetManager?.businessLocation?.postalCode || "";
    const originalCountry = fleetManager?.businessLocation?.country || "";
    const originalLat = fleetManager?.businessLocation?.latitude ?? 0;
    const originalLng = fleetManager?.businessLocation?.longitude ?? 0;

    const locationChanged =
      hasChanged(data.street, originalStreet) ||
      hasChanged(data.city, originalCity) ||
      hasChanged(data.postalCode, originalPostalCode) ||
      hasChanged(data.country, originalCountry) ||
      hasChanged(currentLat, originalLat) ||
      hasChanged(currentLng, originalLng);

    if (locationChanged) {
      fleetManagerData.businessLocation = {
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        latitude: currentLat,
        longitude: currentLng,
      };
    }

    // bankDetails
    const originalAccountHolder =
      fleetManager?.bankDetails?.accountHolderName || "";
    const originalIban = fleetManager?.bankDetails?.iban || "";

    if (
      hasChanged(data.accountHolderName, originalAccountHolder) ||
      hasChanged(data.iban, originalIban)
    ) {
      fleetManagerData.bankDetails = {
        accountHolderName: data.accountHolderName,
        iban: data.iban,
      };
    }

    return fleetManagerData;
  };

  // ---------- Save & Continue (after Documents) ----------
  const handleSaveAndContinue = async () => {
    if (!fleetManager?.userId) {
      toast.error("Fleet manager not found.");
      return;
    }

    const allDetailsComplete = stepCompleted
      .slice(0, DETAILS_LAST_TAB + 1)
      .every(Boolean);

    if (!allDetailsComplete || !isDocumentsValid) {
      toast.error(
        "Please complete all required fields and upload required documents before saving."
      );
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving fleet manager information...");

    try {
      const data = form.getValues();
      const payload = buildChangedPayload(data);

      const updatedResult = await updateUserDataReq(
        `/fleet-managers/${fleetManager.userId}`,
        Object.keys(payload).length > 0 ? payload : {}
      );

      if (updatedResult.success) {
        setFleetManagerState((prev) => ({
          ...prev,
          ...payload,
        }));
        setProfileSaved(true);
        if (needsAgreement) {
          setActiveTab(AGREEMENT_START_TAB);
        } else {
          router.back();
        }
        toast.success(
          updatedResult.message ||
          "Fleet manager information saved. Please create / re-sign the agreement.",
          { id: toastId }
        );
        return;
      }

      if (updatedResult?.data?.errorSources) {
        updatedResult.data.errorSources.forEach(
          (err: { path: string; message: string }) =>
            toast.error(err?.message, { id: toastId })
        );
        return;
      }

      toast.error(
        updatedResult.message || "Failed to save fleet manager information",
        { id: toastId }
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to save fleet manager information",
        { id: toastId }
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Final submit ----------
  const onSubmit = async (data: TFleetManagerForm) => {
    if (needsAgreement && !agreementSigned) {
      toast.error("Please sign the agreement first.");
      return;
    }

    if (needsAgreement && !profileSaved) {
      toast.error(
        "Please save fleet manager information first (Save & Continue)."
      );
      return;
    }

    const toastId = toast.loading("Updating fleet manager...");

    try {
      // Optional: persist any late field changes before approval flow
      const payload = buildChangedPayload(data);
      if (Object.keys(payload).length > 0) {
        const updatedResult = await updateUserDataReq(
          `/fleet-managers/${fleetManager.userId}`,
          payload
        );
        if (!updatedResult.success) {
          if (updatedResult?.data?.errorSources) {
            updatedResult.data.errorSources.forEach(
              (err: { path: string; message: string }) =>
                toast.error(err?.message, { id: toastId })
            );
            return;
          }
          toast.error(
            updatedResult.message || "Fleet manager update failed",
            { id: toastId }
          );
          return;
        }
        setFleetManagerState((prev) => ({ ...prev, ...payload }));
      }

      // Submit + approve flow when still pending
      if (fleetManager.status === USER_STATUS.PENDING) {
        const submitRes = await submitForApproval(fleetManager.userId);
        if (submitRes?.success) {
          const approveResult = await approveOrRejectReq(fleetManager.userId, {
            status: USER_STATUS.APPROVED,
          });

          if (approveResult.success) {
            toast.success(
              approveResult.message ||
              "Fleet manager updated & approved successfully!",
              { id: toastId }
            );
            router.refresh();
            router.push(`/admin/agent/${fleetManager.userId}`);
            return;
          }

          if (approveResult?.data?.errorSources) {
            approveResult.data.errorSources.forEach(
              (err: { path: string; message: string }) =>
                toast.error(err?.message, { id: toastId })
            );
            return;
          }
          toast.error(
            approveResult.message || "Fleet manager status update failed",
            { id: toastId }
          );
          return;
        }

        if (submitRes?.data?.errorSources) {
          submitRes.data.errorSources.forEach(
            (err: { path: string; message: string }) =>
              toast.error(err?.message, { id: toastId })
          );
          return;
        }
        toast.error(submitRes?.message || "Fleet manager status update failed", {
          id: toastId,
        });
        return;
      }

      // Already approved – just confirm update
      toast.success("Fleet manager updated successfully!", { id: toastId });
      router.refresh();
      router.push(`/admin/agent/${fleetManager.userId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
        { id: toastId }
      );
    }
  };

  const getTabLabel = (key: string) => {
    const map: Record<string, string> = {
      account_information: t("account_information") || "Account",
      business_details: t("business_details") || "Business",
      bank_nd_payment_information: t("bank_nd_payment_information") || "Bank",
      business_location_information:
        t("business_location_information") || "Location",
      documents_nd_verification: t("documents_nd_verification") || "Documents",
      create_agreement: t("create_agreement") || "Create Agreement",
      agreement_sign: t("agreement_sign") || "Sign Agreement",
    };
    return map[key] || key;
  };

  const renderTabButton = (
    tab: (typeof TABS)[number],
    index: number,
    variant: "horizontal" | "vertical"
  ) => {
    const Icon = tab.icon;
    const isActive = activeTab === index;
    const isDone = stepCompleted[index];
    const accessible = canAccessTab(index);
    const locked = !accessible && needsAgreement;

    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => goToTab(index)}
        disabled={locked}
        className={cn(
          "flex items-center gap-2.5 text-sm font-medium transition-all",
          variant === "horizontal" &&
          "px-3 py-2.5 rounded-lg whitespace-nowrap",
          variant === "vertical" && "w-full px-4 py-3 rounded-xl text-left",
          isActive &&
          "bg-[#DC3173] text-white shadow-md shadow-[#DC3173]/25",
          !isActive &&
          isDone &&
          "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
          !isActive &&
          !isDone &&
          accessible &&
          "bg-white text-slate-600 border border-slate-200 hover:border-[#DC3173]/50 hover:text-[#DC3173]",
          locked &&
          "bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed opacity-60"
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center shrink-0 rounded-full",
            variant === "vertical" ? "w-7 h-7 text-xs" : "w-5 h-5",
            isActive
              ? "bg-white/20"
              : isDone
                ? "bg-green-100"
                : "bg-slate-100"
          )}
        >
          {locked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : isDone && !isActive ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Icon className="w-3.5 h-3.5" />
          )}
        </span>

        <span className={cn(variant === "horizontal" && "hidden sm:inline")}>
          {index + 1}. {getTabLabel(tab.labelKey)}
        </span>
        {variant === "horizontal" && (
          <span className="sm:hidden">{index + 1}</span>
        )}
      </button>
    );
  };

  const detailsProgressCount = stepCompleted
    .slice(0, DETAILS_LAST_TAB + 1)
    .filter(Boolean).length;
  const totalDetailsSteps = DETAILS_LAST_TAB + 1;

  const agreementProgressCount = needsAgreement
    ? [agreementCreated, agreementSigned].filter(Boolean).length
    : 2;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-h-screen bg-slate-50"
      >
        <TitleHeader
          title={t("edit_fleet_manager_details")}
          subtitle={t("update_fleet_manager_update_and_information")}
          onBackClick={() => router.back()}
        />

        {/* Mobile / Tablet: Horizontal tabs */}
        <div className="lg:hidden mb-6 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max pb-2 px-1">
            {TABS.map((tab, index) => (
              <div key={tab.id} className="flex items-center">
                {renderTabButton(tab, index, "horizontal")}
                {index < TABS.length - 1 && (
                  <div
                    className={cn(
                      "w-5 h-0.5 mx-0.5 rounded shrink-0",
                      index === DETAILS_LAST_TAB
                        ? profileSaved || isAgreementFinalized
                          ? "bg-green-400"
                          : "bg-amber-300"
                        : stepCompleted[index]
                          ? "bg-green-400"
                          : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop: Left vertical tabs */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-6 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
                Fleet Manager Details
              </p>
              {TABS.slice(0, AGREEMENT_START_TAB).map((tab, index) =>
                renderTabButton(tab, index, "vertical")
              )}

              <div className="my-4 border-t border-dashed border-slate-200" />

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-2">
                Agreements
                {needsAgreement && !profileSaved && (
                  <span className="text-[10px] font-normal normal-case text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    Locked
                  </span>
                )}
                {isAgreementFinalized && (
                  <span className="text-[10px] font-normal normal-case text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {agreementStatus}
                  </span>
                )}
              </p>
              {TABS.slice(AGREEMENT_START_TAB).map((tab, index) =>
                renderTabButton(tab, index + AGREEMENT_START_TAB, "vertical")
              )}

              {/* Progress summary */}
              <div className="mt-6 px-2 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>Details</span>
                    <span>
                      {detailsProgressCount}/{totalDetailsSteps}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#DC3173] rounded-full transition-all duration-300"
                      style={{
                        width: `${(detailsProgressCount / totalDetailsSteps) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>Agreements</span>
                    <span>
                      {needsAgreement
                        ? profileSaved
                          ? `${agreementProgressCount}/2`
                          : "—"
                        : "Done"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        !needsAgreement || profileSaved
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      )}
                      style={{
                        width: !needsAgreement
                          ? "100%"
                          : profileSaved
                            ? `${(agreementProgressCount / 2) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                {profileSaved && needsAgreement && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Profile saved
                  </div>
                )}
                {isAgreementFinalized && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Agreement {agreementStatus?.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right: Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* TAB 0: Account */}
              {activeTab === 0 && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="p-6 shadow-md border-t-4"
                    style={{ borderColor: DELIGO }}
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      1. {t("account_information")}
                    </h2>

                    <div className="space-y-4 items-start">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("first_name")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder={t("first_name")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("last_name")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder={t("last_name")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <Label>
                          {t("email")}{" "}
                          <span className="text-[#DC3173]">*</span>
                        </Label>
                        <div className="flex items-center gap-3 mt-2">
                          <Input
                            type="email"
                            placeholder={t("fleet_manager_email")}
                            value={fleetManager.email}
                            disabled
                          />
                        </div>
                      </div>

                      <Label className="mb-2">
                        {t("phone_number")}{" "}
                        <span className="text-[#DC3173]">*</span>
                      </Label>
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <PhoneInput
                                defaultCountry="pt"
                                value={field.value || ""}
                                onChange={(phone) => field.onChange(phone)}
                                forceDialCode={true}
                                disableDialCodePrefill={false}
                                className="w-full flex"
                                inputStyle={{
                                  width: "100%",
                                  height: "40px",
                                  fontSize: "14px",
                                  color: "#374151",
                                  borderRadius: "0.5rem",
                                  border: "1px solid #D1D5DB",
                                  outline: "none",
                                  paddingLeft: "52px",
                                }}
                                countrySelectorStyleProps={{
                                  buttonStyle: {
                                    position: "absolute",
                                    left: "1px",
                                    top: "-1px",
                                    bottom: "1px",
                                    border: "none",
                                    backgroundColor: "transparent",
                                    height: "44px",
                                    padding: "0 12px",
                                    borderTopLeftRadius: "0.5rem",
                                    borderBottomLeftRadius: "0.5rem",
                                  },
                                }}
                                inputClassName="focus-visible:ring-2 focus-visible:ring-[#D1D5DB] focus-visible:border-[#D1D5DB]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 1: Business */}
              {activeTab === 1 && (
                <motion.div
                  key="business"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="p-6 shadow-md border-t-4"
                    style={{ borderColor: DELIGO }}
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      2. {t("business_details")}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("business_name")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("business_name")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessLicenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("business_license_number")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("license_number")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="NIF"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("nif")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("tax_identification_number")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 2: Bank */}
              {activeTab === 2 && (
                <motion.div
                  key="bank"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="p-6 shadow-md border-t-4"
                    style={{ borderColor: DELIGO }}
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Banknote className="w-5 h-5" /> 3.{" "}
                      {t("bank_nd_payment_information")}
                    </h2>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="accountHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("account_holder_name")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("account_holder_name")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="iban"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("iban")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder={t("iban")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 3: Location */}
              {activeTab === 3 && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="p-6 shadow-md border-t-4"
                    style={{ borderColor: DELIGO }}
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" /> 4.{" "}
                      {t("business_location_information")}
                    </h2>
                    <BusinessLocationMap
                      form={form}
                      businessLocation={
                        fleetManagerState.businessLocation as TBusinessLocation
                      }
                      setLocationCoordinates={setLocationCoordinates}
                      t={t}
                    />
                  </Card>
                </motion.div>
              )}

              {/* TAB 4: Documents */}
              {activeTab === 4 && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="p-6 shadow-md border-t-4"
                    style={{ borderColor: DELIGO }}
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" /> 5.{" "}
                      {t("documents_nd_verification")}
                    </h2>
                    <UploadFleetManagerDocuments
                      fleetManagerId={fleetManager.userId}
                      previews={previews}
                      setPreviews={setPreviews}
                      isSubmitting={isSubmitting || isSaving}
                    />

                    {profileSaved && needsAgreement && (
                      <div className="mt-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Fleet manager details & documents have been saved. You
                        can proceed to Agreements or go back to edit.
                      </div>
                    )}
                    {isAgreementFinalized && (
                      <div className="mt-6 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        Agreement is already {agreementStatus?.toLowerCase()}.
                        You can update information and submit without
                        re-signing.
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* TAB 5: Create Agreement */}
              {activeTab === 5 && (
                <motion.div
                  key="create_agreement"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="p-6 shadow-md border-t-4"
                    style={{ borderColor: DELIGO }}
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <ScrollText className="w-5 h-5" /> 6.{" "}
                      {t("create_agreement") || "Create Agreement"}
                    </h2>

                    {isAgreementFinalized ? (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p className="text-lg font-medium text-emerald-700">
                          Agreement already exists
                        </p>
                        <p className="text-sm text-slate-500 text-center max-w-md">
                          Status:{" "}
                          <span className="font-semibold">
                            {agreementStatus}
                          </span>
                          {(fleetManagerState as any)?.agreement
                            ?.agreementId && (
                              <>
                                {" "}
                                · ID:{" "}
                                {
                                  (fleetManagerState as any).agreement
                                    .agreementId
                                }
                              </>
                            )}
                        </p>
                        {(fleetManagerState as any)?.agreement?.pdfPath && (
                          <a
                            href={(fleetManagerState as any).agreement.pdfPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#DC3173] underline"
                          >
                            View agreement PDF
                          </a>
                        )}
                        <p className="text-xs text-slate-400 text-center max-w-sm">
                          Agreement cannot be modified when status is{" "}
                          {agreementStatus}. You may only update fleet manager
                          information.
                        </p>
                      </div>
                    ) : agreementCreated ? (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-lg font-medium text-green-700">
                          Agreement created successfully
                        </p>
                        <p className="text-sm text-slate-500 text-center max-w-md">
                          Proceed to the next step to sign the agreement.
                        </p>
                      </div>
                    ) : (
                      <CreateUserAgreement
                        user={fleetManagerState as any}
                        role="FLEET_MANAGER"
                        embedded
                        showBackButton={false}
                        onSuccess={(agreement) => {
                          setAgreementData(agreement);
                          setAgreementCreated(true);
                          setFleetManagerState((prev) => ({
                            ...prev,
                            agreement: agreement,
                          }));
                          setActiveTab(6);
                        }}
                      />
                    )}
                  </Card>
                </motion.div>
              )}

              {/* TAB 6: Sign Agreement */}
              {activeTab === 6 && (
                <motion.div
                  key="sign_agreement"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="p-6 shadow-md border-t-4"
                    style={{ borderColor: DELIGO }}
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileSignature className="w-5 h-5" /> 7.{" "}
                      {t("agreement_sign") || "Sign Agreement"}
                    </h2>

                    {isAgreementFinalized ? (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p className="text-lg font-medium text-emerald-700">
                          Agreement already signed
                        </p>
                        <p className="text-sm text-slate-500">
                          Status:{" "}
                          <span className="font-semibold">
                            {agreementStatus}
                          </span>
                        </p>
                        {(fleetManagerState as any)?.agreement?.pdfPath && (
                          <a
                            href={(fleetManagerState as any).agreement.pdfPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#DC3173] underline"
                          >
                            View signed agreement PDF
                          </a>
                        )}
                        <p className="text-xs text-slate-400 text-center max-w-sm">
                          No re-signing required. Submit to save any
                          information updates.
                        </p>
                      </div>
                    ) : !agreementSigned ? (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <p className="text-slate-600 text-center max-w-md">
                          Review and sign the agreement below. After signing,
                          you can submit the fleet manager update.
                        </p>
                        <AgreementViewer
                          agreement={agreementData}
                          setAgreementSigned={setAgreementSigned}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-lg font-medium text-green-700">
                          Agreement signed successfully
                        </p>
                        <p className="text-sm text-slate-500">
                          Click Submit below to finish.
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Footer */}
            <div className="mt-6 flex items-center justify-between pb-10">
              <Button
                type="button"
                variant="outline"
                onClick={goPrev}
                disabled={activeTab === 0 || isSaving}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="text-sm text-slate-400 hidden sm:block">
                Step {activeTab + 1} of {TABS.length}
                {activeTab <= DETAILS_LAST_TAB && (
                  <span className="ml-2 text-amber-600">· Details</span>
                )}
                {activeTab >= AGREEMENT_START_TAB && (
                  <span className="ml-2 text-emerald-600">· Agreements</span>
                )}
              </div>

              {activeTab < TABS.length - 1 ? (
                activeTab === DETAILS_LAST_TAB &&
                  needsAgreement &&
                  !profileSaved ? (
                  <Button
                    type="button"
                    onClick={handleSaveAndContinue}
                    disabled={
                      !stepCompleted[DETAILS_LAST_TAB] ||
                      isSaving ||
                      isSubmitting
                    }
                    className="bg-[#DC3173] hover:bg-[#c22b65] text-white gap-2 min-w-40"
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save & Continue
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={
                      (!stepCompleted[activeTab] &&
                        !(
                          isAgreementFinalized &&
                          activeTab >= AGREEMENT_START_TAB
                        )) ||
                      isSaving
                    }
                    className="bg-[#DC3173] hover:bg-[#c22b65] text-white gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )
              ) : (
                <>
                  {needsAgreement && (
                    <Button
                      type="submit"
                      disabled={
                        (needsAgreement && !agreementSigned) ||
                        isSubmitting ||
                        isSaving ||
                        !isDocumentsValid
                      }
                      className="bg-[#DC3173] hover:bg-[#c22b65] text-white px-8"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : t("submit_fleetManager") || "Submit Fleet Manager"}
                    </Button>
                  )}
                  {(!needsAgreement) && (
                    <Button
                      type="submit"
                      disabled={isSubmitting || isSaving || !isDocumentsValid}
                      className="bg-[#DC3173] hover:bg-[#c22b65] text-white px-8"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : t("submit_fleetManager") || "Submit Fleet Manager"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
