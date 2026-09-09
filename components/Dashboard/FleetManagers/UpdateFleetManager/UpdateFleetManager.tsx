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
import {
  Banknote,
  Briefcase,
  CheckCircle2,
  FileSignature,
  FileText,
  Lock,
  MapPin,
  Save,
  ScrollText,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";
import z from "zod";

const DELIGO = "#DC3173";

interface IProps {
  fleetManager: TAgent;
  agreement: any | null;
}

type TFleetManagerForm = z.infer<typeof addFleetManagerValidation>;

const TABS = [
  { id: 0, key: "account", labelKey: "account_information", icon: User },
  { id: 1, key: "business", labelKey: "business_details", icon: Briefcase },
  { id: 2, key: "bank", labelKey: "bank_nd_payment_information", icon: Banknote },
  { id: 3, key: "location", labelKey: "business_location_information", icon: MapPin },
  { id: 4, key: "documents", labelKey: "documents_nd_verification", icon: FileText },
  { id: 5, key: "create_agreement", labelKey: "create_agreement", icon: ScrollText },
  { id: 6, key: "sign_agreement", labelKey: "agreement_sign", icon: FileSignature },
] as const;

export default function UpdateFleetManager({ fleetManager, agreement }: IProps) {
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

  const agreementStatus = agreement?.status ?? null;
  const needsAgreement = agreementStatus === "UNSIGNED";
  const isAgreementFinalized = agreementStatus === "PARTY_SIGNED" || agreementStatus === "SIGNED";

  const [agreementCreated, setAgreementCreated] = useState(
    isAgreementFinalized
  );
  const [agreementData, setAgreementData] = useState<any>(
    agreement ?? null
  );
  const [agreementSigned, setAgreementSigned] = useState(isAgreementFinalized);

  const [profileSaved, setProfileSaved] = useState(!needsAgreement);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const form = useForm<TFleetManagerForm>({
    resolver: zodResolver(addFleetManagerValidation),
    defaultValues: {
      firstName: fleetManager.name?.firstName || "",
      lastName: fleetManager.name?.lastName || "",
      phoneNumber: fleetManager?.contactNumber || "",
      businessName: fleetManager.businessDetails?.businessName || "",
      businessLicenseNumber:
        fleetManager.businessDetails?.businessLicenseNumber || "",
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
      businessLicenseNumber:
        fleetManagerState.businessDetails?.businessLicenseNumber || "",
      NIF: fleetManagerState.businessDetails?.NIF || "",
      street: fleetManagerState.businessLocation?.street || "",
      city: fleetManagerState.businessLocation?.city || "",
      postalCode: fleetManagerState.businessLocation?.postalCode || "",
      country: fleetManagerState.businessLocation?.country || "",
      latitude: fleetManagerState?.businessLocation?.latitude || 0,
      longitude: fleetManagerState?.businessLocation?.longitude || 0,
      accountHolderName:
        fleetManagerState.bankDetails?.accountHolderName || "",
      iban: fleetManagerState.bankDetails?.iban || "",
    });
  }, [fleetManagerState, form]);

  useEffect(() => {
    const currentPhone = form.getValues("phoneNumber");
    if (!currentPhone) {
      form.setValue("phoneNumber", "+351", { shouldValidate: true });
    }
  }, [form]);

  // Scroll-spy
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const onScroll = () => {
      const scrollTop = container.scrollTop;
      let current = 0;
      sectionRefs.current.forEach((el, index) => {
        if (!el) return;
        const top = el.offsetTop - container.offsetTop;
        if (scrollTop >= top - 80) current = index;
      });
      setActiveTab(current);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

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
      !!v.businessName?.trim() &&
      !!v.businessLicenseNumber?.trim() &&
      !!v.NIF?.trim();

    const bankOk = !!v.accountHolderName?.trim() && !!v.iban?.trim();

    const locationOk =
      !!v.street?.trim() &&
      !!v.city?.trim() &&
      !!v.postalCode?.trim() &&
      !!v.country?.trim() &&
      locationCoordinates.latitude !== 0 &&
      locationCoordinates.longitude !== 0;

    const createOk = needsAgreement ? agreementCreated : true;
    const signOk = needsAgreement ? agreementSigned : true;

    return [
      accountOk,
      businessOk,
      bankOk,
      locationOk,
      isDocumentsValid,
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

  const scrollToSection = (index: number) => {
    const el = sectionRefs.current[index];
    const container = contentRef.current;
    if (!el || !container) return;
    setActiveTab(index);
    container.scrollTo({
      top: el.offsetTop - container.offsetTop,
      behavior: "smooth",
    });
  };

  const goToTab = (index: number) => {
    if (
      index >= 5 &&
      needsAgreement &&
      !profileSaved &&
      !isAgreementFinalized
    ) {
      toast.error(
        "Please complete required details/documents and click Save Changes before accessing Agreements."
      );
      scrollToSection(4);
      return;
    }
    scrollToSection(index);
  };

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

    if (hasChanged(data.phoneNumber, fleetManager?.contactNumber || "")) {
      fleetManagerData.contactNumber = data.phoneNumber;
    }

    const originalBusinessName =
      fleetManager?.businessDetails?.businessName || "";
    const originalLicense =
      fleetManager?.businessDetails?.businessLicenseNumber || "";
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

  const handleSaveChanges = async () => {
    if (!fleetManager?.userId) {
      toast.error("Fleet manager not found.");
      return;
    }

    const detailsComplete = stepCompleted.slice(0, 5).every(Boolean);
    if (!detailsComplete || !isDocumentsValid) {
      toast.error(
        "Please complete all required fields and upload required documents before saving."
      );
      const firstIncomplete = stepCompleted.findIndex((ok, i) => i < 5 && !ok);
      if (firstIncomplete >= 0) scrollToSection(firstIncomplete);
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
        setFleetManagerState((prev) => ({ ...prev, ...payload }));
        setProfileSaved(true);

        if (needsAgreement) {
          toast.success(
            updatedResult.message ||
            "Fleet manager information saved. You can now create / sign the agreement.",
            { id: toastId }
          );
          scrollToSection(5);
        } else {
          toast.success(
            updatedResult.message ||
            "Fleet manager information saved successfully.",
            { id: toastId }
          );
        }
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

  const onSubmit = async (data: TFleetManagerForm) => {
    if (needsAgreement && !agreementSigned) {
      toast.error("Please sign the agreement first.");
      scrollToSection(6);
      return;
    }

    if (needsAgreement && !profileSaved) {
      toast.error(
        "Please save fleet manager information first (Save Changes)."
      );
      return;
    }

    const toastId = toast.loading("Updating fleet manager...");

    try {
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
        toast.error(
          submitRes?.message || "Fleet manager status update failed",
          { id: toastId }
        );
        return;
      }

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
    const agreementLocked =
      index >= 5 && needsAgreement && !profileSaved && !isAgreementFinalized;

    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => goToTab(index)}
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
          !agreementLocked &&
          "bg-white text-slate-600 border border-slate-200 hover:border-[#DC3173]/50 hover:text-[#DC3173]",
          agreementLocked &&
          !isActive &&
          "bg-slate-100 text-slate-400 border border-slate-100"
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
          {agreementLocked ? (
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

  const detailsProgressCount = stepCompleted.slice(0, 5).filter(Boolean).length;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] overflow-hidden bg-slate-50">
      {/* Fixed header */}
      <div className="shrink-0 z-30 border-b border-slate-200/80 bg-slate-50">
        <TitleHeader
          title={t("edit_fleet_manager_details")}
          subtitle={t("update_fleet_manager_update_and_information")}
          onBackClick={() => router.back()}
          buttonInfo={{
            text: isSaving
              ? t("saving") || "Saving..."
              : t("save_changes") || "Save Changes",
            onClick: handleSaveChanges,
            disabled: isSaving ? true : false,
            icon: Save,
          }}
        />
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Mobile tabs */}
          <div className="lg:hidden shrink-0 border-b bg-white overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max px-3 py-2">
              {TABS.map((tab, index) =>
                renderTabButton(tab, index, "horizontal")
              )}
            </div>
          </div>

          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col border-r border-slate-200 bg-white min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
                 {t("fleet_manager_details")}
                </p>
                {TABS.slice(0, 5).map((tab, index) =>
                  renderTabButton(tab, index, "vertical")
                )}

                <div className="my-4 border-t border-dashed border-slate-200" />

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-2">
                  {t("agreements")}
                  {needsAgreement && !profileSaved && (
                    <span className="text-[10px] font-normal normal-case text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      {t("locked")}
                    </span>
                  )}
                  {isAgreementFinalized && (
                    <span className="text-[10px] font-normal normal-case text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {agreementStatus}
                    </span>
                  )}
                </p>
                {TABS.slice(5).map((tab, index) =>
                  renderTabButton(tab, index + 5, "vertical")
                )}

                <div className="mt-6 px-2 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span>{t("details")}</span>
                      <span>{detailsProgressCount}/5</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#DC3173] rounded-full transition-all duration-300"
                        style={{
                          width: `${(detailsProgressCount / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  {profileSaved && needsAgreement && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("profile_saved")}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Scrollable content */}
            <div
              ref={contentRef}
              className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain scroll-smooth"
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8 pb-16">
                {/* 0 Account */}
                <div
                  ref={(el) => {
                    sectionRefs.current[0] = el;
                  }}
                  id="section-account"
                >
                  <Card
                    className="p-6 shadow-md border-t-4"
                    style={{ borderColor: DELIGO }}
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" /> 1. {t("account_information")}
                    </h2>
                    <div className="space-y-4">
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
                          {t("email")} <span className="text-[#DC3173]">*</span>
                        </Label>
                        <div className="mt-2">
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
                                forceDialCode
                                disableDialCodePrefill={false}
                                className="w-full flex"
                                inputStyle={{
                                  width: "100%",
                                  height: "46px",
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
                                    top: "1px",
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
                </div>

                {/* 1 Business */}
                <div
                  ref={(el) => {
                    sectionRefs.current[1] = el;
                  }}
                  id="section-business"
                >
                  <Card
                    className="p-6 shadow-md border-t-4"
                    style={{ borderColor: DELIGO }}
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" /> 2.{" "}
                      {t("business_details")}
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
                </div>

                {/* 2 Bank */}
                <div
                  ref={(el) => {
                    sectionRefs.current[2] = el;
                  }}
                  id="section-bank"
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
                </div>

                {/* 3 Location */}
                <div
                  ref={(el) => {
                    sectionRefs.current[3] = el;
                  }}
                  id="section-location"
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
                </div>

                {/* 4 Documents */}
                <div
                  ref={(el) => {
                    sectionRefs.current[4] = el;
                  }}
                  id="section-documents"
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
                        {t("fleet_manager_details_documents_saved")}
                      </div>
                    )}
                    {isAgreementFinalized && (
                      <div className="mt-6 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        {t("agreement_is_already")} {agreementStatus?.toLowerCase()}.
                        {t("you_can_update_information")}
                      </div>
                    )}
                  </Card>
                </div>

                {/* 5 Create Agreement */}
                <div
                  ref={(el) => {
                    sectionRefs.current[5] = el;
                  }}
                  id="section-create-agreement"
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
                          {t("agreement_already_exists")}
                        </p>
                        <p className="text-sm text-slate-500 text-center max-w-md">
                          {t("status")}:{" "}
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
                            {t("view_agreement_pdf")}
                          </a>
                        )}
                      </div>
                    ) : !profileSaved && needsAgreement ? (
                      <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <Lock className="w-8 h-8 text-slate-400" />
                        <p className="text-slate-600 max-w-md">
                          {t("complete_the_details_above_click")}{" "}
                          <strong>{t("save_changes")}</strong> {t("to_unlock_agreement_creation")}
                        </p>
                      </div>
                    ) : agreementCreated ? (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-lg font-medium text-green-700">
                          {t("agreement_created_successfully")}
                        </p>
                        <p className="text-sm text-slate-500 text-center max-w-md">
                          {t("scroll_down_to_sign_the_agreement")}
                        </p>
                      </div>
                    ) : (
                      <CreateUserAgreement
                        user={fleetManagerState as any}
                        role="FLEET_MANAGER"
                        title={t("create_fleet_agreement")}
                        embedded
                        showBackButton={false}
                        onSuccess={(agreement) => {
                          setAgreementData(agreement);
                          setAgreementCreated(true);
                          setFleetManagerState((prev) => ({
                            ...prev,
                            agreement: agreement,
                          }));
                          scrollToSection(6);
                        }}
                      />
                    )}
                  </Card>
                </div>

                {/* 6 Sign Agreement */}
                <div
                  ref={(el) => {
                    sectionRefs.current[6] = el;
                  }}
                  id="section-sign-agreement"
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
                          {t("agreement_already_signed")}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t("status")}:{" "}
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
                            {t("view_signed_agreement_pdf")}
                          </a>
                        )}
                        {(isAgreementFinalized && fleetManager?.status === "PENDING") && <Button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            isSaving ||
                            !isDocumentsValid ||
                            (needsAgreement && !agreementSigned)
                          }
                          className="bg-[#DC3173] hover:bg-[#c22b65] text-white px-8 mt-2"
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : t("submit_fleetManager") ||
                            "Submit Fleet Manager"}
                        </Button>}
                      </div>
                    ) : !profileSaved && needsAgreement ? (
                      <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <Lock className="w-8 h-8 text-slate-400" />
                        <p className="text-slate-600 max-w-md">
                          {t("save_changes_first_to_unlock_signing")}
                        </p>
                      </div>
                    ) : !agreementSigned ? (
                      <div className="flex flex-col items-center gap-4 py-6">
                        <p className="text-slate-600 text-center max-w-md">
                          {t("review_and_sign_the_agreement_below")}
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
                          {t("agreement_signed_successfully")}
                        </p>
                        <Button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            isSaving ||
                            !isDocumentsValid ||
                            (needsAgreement && !agreementSigned)
                          }
                          className="bg-[#DC3173] hover:bg-[#c22b65] text-white px-8 mt-2"
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : t("submit_fleetManager") ||
                            "Submit Fleet Manager"}
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
