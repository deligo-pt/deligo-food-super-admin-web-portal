/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BusinessLocationMap from "@/components/BusinessLocationMap/BusinessLocationMap";
import AgreementViewer from "@/components/common/Agreements/AgreementViewer";
import CreateUserAgreement from "@/components/common/Agreements/CreateUserAgreement";
import UploadVendorDocuments, {
  REQUIRED_DOCS,
} from "@/components/Dashboard/Vendors/AddVendor/UploadVendorDocuments";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_STATUS } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { approveOrRejectReq } from "@/services/auth/approve-or-reject.service";
import { submitForApproval, updateUserDataReq } from "@/services/auth/register-user.service";
import { useStore } from "@/store/store";
import { TBusinessCategoryResponse } from "@/types/category.type";
import { TCuisine } from "@/types/cuisine.type";
import { TVendorDocKey } from "@/types/document.type";
import { TBusinessLocation, TVendor } from "@/types/user.type";
import { uploadDefaultDocument } from "@/utils/uploadUserDocument";
import { addVendorValidation } from "@/validations/add-vendor/add-vendor.validation";
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
  X,
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
  businessCategories: TBusinessCategoryResponse[];
  vendor: TVendor;
  cuisines: TCuisine[];
}

type TVendorForm = z.infer<ReturnType<typeof addVendorValidation>>;

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

export default function UpdateVendor({
  businessCategories,
  vendor,
  cuisines,
}: IProps) {
  const [vendorState, setVendorState] = useState(vendor);
  const { t } = useTranslation();
  const { lang } = useStore();
  const router = useRouter();

  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: vendor.businessLocation?.latitude || 0,
    longitude: vendor.businessLocation?.longitude || 0,
  });

  const [previews, setPreviews] = useState<
    Record<TVendorDocKey, string[] | null>
  >({
    myPhoto: Array.isArray(vendorState?.documents?.myPhoto)
      ? vendorState?.documents?.myPhoto
      : null,
    businessLicenseDoc: Array.isArray(vendorState?.documents?.businessLicenseDoc)
      ? vendorState?.documents?.businessLicenseDoc
      : null,
    taxDoc: Array.isArray(vendorState?.documents?.taxDoc)
      ? vendorState?.documents?.taxDoc
      : null,
    idProofFront: Array.isArray(vendorState?.documents?.idProofFront)
      ? vendorState?.documents?.idProofFront
      : null,
    idProofBack: Array.isArray(vendorState?.documents?.idProofBack)
      ? vendorState?.documents?.idProofBack
      : null,
    storePhoto: Array.isArray(vendorState?.documents?.storePhoto)
      ? vendorState?.documents?.storePhoto
      : null,
    menuUpload: Array.isArray(vendorState?.documents?.menuUpload)
      ? vendorState?.documents?.menuUpload
      : null,
    agoserisHaccpCertificate: Array.isArray(
      vendorState?.documents?.agoserisHaccpCertificate
    )
      ? vendorState?.documents?.agoserisHaccpCertificate
      : null,
    ibanProof: Array.isArray(vendorState?.documents?.ibanProof)
      ? vendorState?.documents?.ibanProof
      : null,
  });

  const OPTIONAL_DEFAULTS: TVendorDocKey[] = ["myPhoto", "menuUpload"];
  const isSubVendor = vendor?.role === "SUB_VENDOR";

  // Agreement status helpers
  const agreementStatus = vendorState?.agreement?.status ?? null;
  const needsAgreement = !vendorState?.agreement || agreementStatus === "UNSIGNED";
  const isAgreementFinalized = agreementStatus === "PARTY_SIGNED" || agreementStatus === "SIGNED";

  const [agreementCreated, setAgreementCreated] = useState(isAgreementFinalized);
  const [agreementData, setAgreementData] = useState<any>(vendorState?.agreement ?? null);
  const [agreementSigned, setAgreementSigned] = useState(isAgreementFinalized);

  /** After Save & Continue when re-agreement is required */
  const [profileSaved, setProfileSaved] = useState(!needsAgreement);
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState(0);

  const daysOfWeek = [
    t("sunday") || "Sunday",
    t("monday") || "Monday",
    t("tuesday") || "Tuesday",
    t("wednesday") || "Wednesday",
    t("thursday") || "Thursday",
    t("friday") || "Friday",
    t("saturday") || "Saturday",
  ];

  // Fallback to English labels if translations missing (matches original data shape)
  const daysOfWeekEn = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const form = useForm<TVendorForm>({
    resolver: zodResolver(addVendorValidation(isSubVendor)),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      businessName: "",
      companyLegalName: "",
      branchName: "",
      businessType: "",
      restaurantCuisineType: [],
      NIF: "",
      branches: "1",
      openingHours: "",
      closingHours: "",
      closingDays: [],
      street: "",
      city: "",
      postalCode: "",
      country: "",
      latitude: 0,
      longitude: 0,
      accountHolderName: "",
      iban: "",
    },
    mode: "onChange",
  });

  const {
    formState: { isSubmitting },
  } = form;

  const businessType = useWatch({
    control: form.control,
    name: "businessType",
  });

  const watchedValues = useWatch({ control: form.control });

  // Prefill form from vendor
  useEffect(() => {
    const rawCuisineData = vendor?.businessDetails?.restaurantCuisineType;
    let normalizedCuisines: string[] = [];

    if (rawCuisineData) {
      normalizedCuisines = Array.isArray(rawCuisineData)
        ? rawCuisineData
        : [rawCuisineData];
    }

    const cuisineSlugs = normalizedCuisines
      .map((storedName) => {
        const cuisine = cuisines?.find((c) => c.name?.[lang] === storedName);
        return cuisine?.slug;
      })
      .filter(Boolean) as string[];

    form.reset({
      firstName: vendor.name?.firstName || "",
      lastName: vendor.name?.lastName || "",
      phoneNumber: vendor?.contactNumber || "",
      businessName: vendor.businessDetails?.businessName || "",
      companyLegalName: vendor.businessDetails?.companyLegalName || "",
      branchName: vendor.businessDetails?.branchName || "",
      businessType: vendor?.businessDetails?.businessTypeSlug || "",
      restaurantCuisineType: cuisineSlugs,
      NIF: vendor?.businessDetails?.NIF || "",
      branches: vendor?.businessDetails?.totalBranches?.toString() || "1",
      openingHours: vendor?.businessDetails?.openingHours || "",
      closingHours: vendor?.businessDetails?.closingHours || "",
      closingDays: vendor?.businessDetails?.closingDays || [],
      street: vendor?.businessLocation?.street || "",
      city: vendor?.businessLocation?.city || "",
      postalCode: vendor?.businessLocation?.postalCode || "",
      country: vendor?.businessLocation?.country || "",
      latitude: vendor?.businessLocation?.latitude ?? 0,
      longitude: vendor?.businessLocation?.longitude ?? 0,
      accountHolderName: vendor?.bankDetails?.accountHolderName || "",
      iban: vendor?.bankDetails?.iban || "",
    });
  }, [vendor, form, cuisines, lang]);

  useEffect(() => {
    const currentPhone = form.getValues("phoneNumber");
    if (!currentPhone) {
      form.setValue("phoneNumber", "+351", { shouldValidate: true });
    }
  }, [form]);

  // Step completion
  const isDocumentsValid = REQUIRED_DOCS.every(
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
      !!v.businessType &&
      !!v.NIF?.trim() &&
      !!v.branches &&
      !!v.openingHours &&
      !!v.closingHours &&
      (v.businessType !== "restaurant" ||
        (Array.isArray(v.restaurantCuisineType) &&
          v.restaurantCuisineType.length > 0)) &&
      (!isSubVendor || !!v.branchName?.trim());

    const bankOk = !!v.accountHolderName?.trim() && !!v.iban?.trim();

    const locationOk =
      !!v.street?.trim() &&
      !!v.city?.trim() &&
      !!v.postalCode?.trim() &&
      !!v.country?.trim() &&
      locationCoordinates.latitude !== 0 &&
      locationCoordinates.longitude !== 0;

    const documentsOk = isDocumentsValid;

    // Agreement steps
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
    isSubVendor,
  ]);

  const canAccessTab = (tabIndex: number) => {
    // When agreement is already finalized, all tabs (including agreements) are viewable
    if (isAgreementFinalized) return true;

    // When re-agreement is required, gate agreements behind profileSaved
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

  // Build partial payload (only changed fields)
  const buildChangedPayload = (data: TVendorForm): Record<string, any> => {
    const hasChanged = (current: any, original: any) => {
      if (Array.isArray(current) || Array.isArray(original)) {
        return JSON.stringify(current || []) !== JSON.stringify(original || []);
      }
      return current !== original;
    };

    const vendorData: Record<string, any> = {};

    // name
    const originalFirstName = vendor?.name?.firstName || "";
    const originalLastName = vendor?.name?.lastName || "";
    if (
      hasChanged(data.firstName, originalFirstName) ||
      hasChanged(data.lastName, originalLastName)
    ) {
      vendorData.name = {};
      if (hasChanged(data.firstName, originalFirstName)) {
        vendorData.name.firstName = data.firstName;
      }
      if (hasChanged(data.lastName, originalLastName)) {
        vendorData.name.lastName = data.lastName;
      }
    }

    // contactNumber
    if (hasChanged(data.phoneNumber, vendor?.contactNumber || "")) {
      vendorData.contactNumber = data.phoneNumber;
    }

    // businessDetails
    const originalBusinessName = vendor?.businessDetails?.businessName || "";
    const originalLegalName = vendor?.businessDetails?.companyLegalName || "";
    const originalBranchName = vendor?.businessDetails?.branchName || "";
    const originalBusinessType =
      vendor?.businessDetails?.businessTypeSlug || "";
    const originalNIF = vendor?.businessDetails?.NIF || "";
    const originalBranches = vendor?.businessDetails?.totalBranches ?? 0;
    const originalOpeningHours = vendor?.businessDetails?.openingHours || "";
    const originalClosingHours = vendor?.businessDetails?.closingHours || "";
    const originalClosingDays = vendor?.businessDetails?.closingDays || [];

    const rawCuisineData = vendor?.businessDetails?.restaurantCuisineType;
    let originalCuisineSlugs: string[] = [];
    if (rawCuisineData) {
      const normalized = Array.isArray(rawCuisineData)
        ? rawCuisineData
        : [rawCuisineData];
      originalCuisineSlugs = normalized
        .map((storedName) => {
          const cuisine = cuisines?.find((c) => c.name?.[lang] === storedName);
          return cuisine?.slug;
        })
        .filter(Boolean) as string[];
    }

    const businessDetailsChanged =
      hasChanged(data.businessName, originalBusinessName) ||
      hasChanged(data.companyLegalName, originalLegalName) ||
      hasChanged(data.branchName, originalBranchName) ||
      hasChanged(data.businessType, originalBusinessType) ||
      hasChanged(data.restaurantCuisineType, originalCuisineSlugs) ||
      hasChanged(data.NIF?.toUpperCase(), originalNIF) ||
      hasChanged(Number(data.branches), originalBranches) ||
      hasChanged(data.openingHours, originalOpeningHours) ||
      hasChanged(data.closingHours, originalClosingHours) ||
      hasChanged(data.closingDays, originalClosingDays);

    if (businessDetailsChanged) {
      vendorData.businessDetails = {};
      if (hasChanged(data.businessName, originalBusinessName)) {
        vendorData.businessDetails.businessName = data.businessName;
      }
      if (hasChanged(data.companyLegalName, originalLegalName)) {
        vendorData.businessDetails.companyLegalName = data.companyLegalName;
      }
      if (hasChanged(data.branchName, originalBranchName)) {
        vendorData.businessDetails.branchName = data.branchName;
      }
      if (hasChanged(data.businessType, originalBusinessType)) {
        vendorData.businessDetails.businessType = data.businessType;
      }
      if (
        data.businessType === "restaurant" &&
        hasChanged(data.restaurantCuisineType, originalCuisineSlugs)
      ) {
        vendorData.businessDetails.restaurantCuisineType =
          data.restaurantCuisineType;
      }
      if (hasChanged(data.NIF?.toUpperCase(), originalNIF)) {
        vendorData.businessDetails.NIF = data.NIF?.toUpperCase();
      }
      if (hasChanged(Number(data.branches), originalBranches)) {
        vendorData.businessDetails.totalBranches = Number(data.branches);
      }
      if (
        hasChanged(data.openingHours, originalOpeningHours) ||
        hasChanged(data.closingHours, originalClosingHours)
      ) {
        vendorData.businessDetails.openingHours = data.openingHours;
        vendorData.businessDetails.closingHours = data.closingHours;
      }
      if (hasChanged(data.closingDays, originalClosingDays)) {
        vendorData.businessDetails.closingDays = data.closingDays;
      }
    }

    // businessLocation
    const originalStreet = vendor?.businessLocation?.street || "";
    const originalCity = vendor?.businessLocation?.city || "";
    const originalPostalCode = vendor?.businessLocation?.postalCode || "";
    const originalCountry = vendor?.businessLocation?.country || "";
    const originalLat = vendor?.businessLocation?.latitude;
    const originalLng = vendor?.businessLocation?.longitude;

    const locationChanged =
      hasChanged(data.street, originalStreet) ||
      hasChanged(data.city, originalCity) ||
      hasChanged(data.postalCode, originalPostalCode) ||
      hasChanged(data.country, originalCountry) ||
      hasChanged(locationCoordinates.latitude, originalLat) ||
      hasChanged(locationCoordinates.longitude, originalLng);

    if (locationChanged) {
      vendorData.businessLocation = {};
      if (hasChanged(data.street, originalStreet)) {
        vendorData.businessLocation.street = data.street;
      }
      if (hasChanged(data.city, originalCity)) {
        vendorData.businessLocation.city = data.city;
      }
      if (hasChanged(data.postalCode, originalPostalCode)) {
        vendorData.businessLocation.postalCode = data.postalCode;
      }
      if (hasChanged(data.country, originalCountry)) {
        vendorData.businessLocation.country = data.country;
      }
      if (hasChanged(locationCoordinates.latitude, originalLat)) {
        vendorData.businessLocation.latitude = locationCoordinates.latitude;
      }
      if (hasChanged(locationCoordinates.longitude, originalLng)) {
        vendorData.businessLocation.longitude = locationCoordinates.longitude;
      }
    }

    // bankDetails
    const originalAccountHolder =
      vendor?.bankDetails?.accountHolderName || "";
    const originalIban = vendor?.bankDetails?.iban || "";

    if (
      hasChanged(data.accountHolderName, originalAccountHolder) ||
      hasChanged(data.iban, originalIban)
    ) {
      vendorData.bankDetails = {};
      if (hasChanged(data.accountHolderName, originalAccountHolder)) {
        vendorData.bankDetails.accountHolderName = data.accountHolderName;
      }
      if (hasChanged(data.iban, originalIban)) {
        vendorData.bankDetails.iban = data.iban;
      }
    }

    return vendorData;
  };

  // Save & Continue (after Documents) – only when needsAgreement
  const handleSaveAndContinue = async () => {
    if (!vendor?.userId) {
      toast.error("Vendor not found.");
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
    const toastId = toast.loading("Saving vendor information...");

    try {
      for (const key of OPTIONAL_DEFAULTS) {
        if (!previews[key] || previews[key]!.length === 0) {
          await uploadDefaultDocument(key, vendor.userId);
        }
      }

      const data = form.getValues();
      const vendorData = buildChangedPayload(data);

      // Always allow save even if no field changes (docs may have changed)
      const updatedResult = await updateUserDataReq(
        `/vendors/${vendor.userId}`,
        Object.keys(vendorData).length > 0 ? vendorData : {}
      );

      if (updatedResult.success) {
        setVendorState((prev) => ({
          ...prev,
          ...vendorData,
        }));
        setProfileSaved(true);
        if (needsAgreement) {
          setActiveTab(AGREEMENT_START_TAB);
        } else {
          router.back();
        }
        toast.success(
          updatedResult.message ||
          "Vendor information saved. Please create / re-sign the agreement.",
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

      toast.error(updatedResult.message || "Failed to save vendor information", {
        id: toastId,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save vendor information",
        { id: toastId }
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Final submit
  const onSubmit = async (data: TVendorForm) => {
    if (needsAgreement && !agreementSigned) {
      toast.error("Please sign the agreement first.");
      return;
    }

    if (needsAgreement && !profileSaved) {
      toast.error("Please save vendor information first (Save & Continue).");
      return;
    }

    const toastId = toast.loading("Updating vendor data...");

    try {
      // submit user request
      if (vendor.status === USER_STATUS.PENDING) {
        const submitRes = await submitForApproval(vendor?.userId);
        if (submitRes?.success) {
          // Auto-approve if not already approved
          const approveResult = await approveOrRejectReq(vendor.userId, {
            status: USER_STATUS.APPROVED,
          });

          if (approveResult.success) {
            toast.success(
              approveResult.message || "Vendor updated & approved successfully!",
              { id: toastId }
            );
            router.refresh();
            router.back();
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
            approveResult.message || "Vendor status update failed",
            { id: toastId }
          );
          return;
        };

        if (submitRes?.data?.errorSources) {
          submitRes.data.errorSources.forEach(
            (err: { path: string; message: string }) =>
              toast.error(err?.message, { id: toastId })
          );
          return;
        }
        toast.error(
          submitRes.message || "Vendor status update failed",
          { id: toastId }
        );
        return;
      };

      toast.success("Vendor updated successfully!", { id: toastId });
      router.refresh();
      router.back();
      return;
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

  // Shared tab button renderer
  const renderTabButton = (
    tab: (typeof TABS)[number],
    index: number,
    variant: "horizontal" | "vertical"
  ) => {
    const Icon = tab.icon;
    const isActive = activeTab === index;
    const isDone = stepCompleted[index];
    const accessible = canAccessTab(index);
    // Only lock when re-agreement is required and profile not saved
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
  console.log("need agr", needsAgreement);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-h-screen bg-slate-50"
      >
        <TitleHeader
          title={t("edit_vendor_details")}
          subtitle={t("update_vendor_details_information")}
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
                Vendor Details
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
                        width:
                          !needsAgreement
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
                            placeholder={t("vendor_email")}
                            value={vendorState.email}
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
                      {isSubVendor && (
                        <FormField
                          control={form.control}
                          name="branchName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("branch_name")}{" "}
                                <span className="text-[#DC3173]">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("branch_name")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

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
                                disabled={isSubVendor}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyLegalName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("company_legal_name")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("company_legal_name")}
                                {...field}
                                disabled={isSubVendor}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("company_legal_name_description")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessType"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>
                              {t("business_type")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(value) => field.onChange(value)}
                                value={
                                  field.value ||
                                  vendorState.businessDetails?.businessTypeSlug ||
                                  undefined
                                }
                              >
                                <SelectTrigger
                                  className={cn(
                                    "w-full",
                                    fieldState.invalid ? "border-red-500" : ""
                                  )}
                                  disabled={isSubVendor}
                                >
                                  <SelectValue
                                    placeholder={t("select_business_type")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {businessCategories?.map((category) => (
                                    <SelectItem
                                      key={category._id}
                                      value={category.slug}
                                    >
                                      {category?.name?.[lang]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                                disabled={isSubVendor}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {businessType === "restaurant" && (
                        <FormField
                          control={form.control}
                          name="restaurantCuisineType"
                          render={({ field, fieldState }) => {
                            const selectedCuisines = Array.isArray(field.value)
                              ? field.value
                              : [];
                            const getCuisineName = (slug: string) =>
                              cuisines?.find((c) => c.slug === slug)?.name?.[
                              lang
                              ] ?? slug;

                            return (
                              <FormItem className="col-span-2">
                                <FormLabel className="mb-2 block text-sm font-medium text-gray-700">
                                  {t("restaurantCuisineType")}{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>

                                {selectedCuisines.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3 p-2 border border-dashed rounded-lg bg-gray-50/50">
                                    {selectedCuisines.map((slug) => (
                                      <Badge
                                        key={slug}
                                        variant="secondary"
                                        className="flex items-center gap-1 bg-[#DC3173]/10 text-[#DC3173] hover:bg-[#DC3173]/20 transition-all capitalize px-3 py-1 text-sm font-medium"
                                      >
                                        {getCuisineName(slug)}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            field.onChange(
                                              selectedCuisines.filter(
                                                (item) => item !== slug
                                              )
                                            )
                                          }
                                          className="rounded-full outline-none hover:bg-[#DC3173]/20 p-0.5"
                                          disabled={isSubVendor}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                <div className="relative">
                                  <Briefcase className="absolute left-3 top-3.5 text-[#DC3173]/80" />
                                  <FormControl>
                                    <Select
                                      value=""
                                      onValueChange={(val) => {
                                        if (!selectedCuisines.includes(val)) {
                                          field.onChange([
                                            ...selectedCuisines,
                                            val,
                                          ]);
                                        }
                                      }}
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          "pl-11 pr-4 h-12 w-full bg-white/90 text-gray-700 shadow-sm focus-visible:ring-2 focus-visible:ring-[#DC3173]/70 hover:shadow-md transition-all cursor-pointer",
                                          fieldState.invalid
                                            ? "border-destructive"
                                            : "border-gray-300"
                                        )}
                                        style={{ height: "3rem" }}
                                        disabled={isSubVendor}
                                      >
                                        <SelectValue
                                          placeholder={
                                            t("select_multiple_cuisine") ||
                                            "Select Multiple Cuisine"
                                          }
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {cuisines?.length < 1 ? (
                                          <div className="p-2 text-sm text-gray-500">
                                            {t("no_items_found")}
                                          </div>
                                        ) : (
                                          cuisines?.map((type, idx) => {
                                            const isAlreadySelected =
                                              selectedCuisines.includes(
                                                type?.slug
                                              );
                                            return (
                                              <SelectItem
                                                key={idx}
                                                value={type?.slug}
                                                className="capitalize"
                                                disabled={isAlreadySelected}
                                              >
                                                {type?.name?.[lang]}{" "}
                                                {isAlreadySelected && "✓"}
                                              </SelectItem>
                                            );
                                          })
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="branches"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>
                              {t("total_branches")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t("total_branches")}
                                {...field}
                                min={0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="openingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="mb-2">
                              {t("opening_hours")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="closingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="mb-2">
                              {t("closing_hours")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="closingDays"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-sm font-medium text-gray-700 mb-2">
                              {t("closing_days")}
                            </FormLabel>
                            <div className="flex flex-wrap gap-2">
                              {daysOfWeekEn.map((day, idx) => {
                                const isSelected =
                                  field.value?.includes(day) ?? false;
                                return (
                                  <motion.button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                      const current = field.value ?? [];
                                      field.onChange(
                                        isSelected
                                          ? current.filter((d) => d !== day)
                                          : [...current, day]
                                      );
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${isSelected
                                      ? "bg-[#DC3173] text-white border-[#DC3173]"
                                      : "bg-white text-gray-700 border-gray-300 hover:border-[#DC3173]/70"
                                      }`}
                                  >
                                    {daysOfWeek[idx] || day}
                                  </motion.button>
                                );
                              })}
                            </div>
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
                        vendorState.businessLocation as TBusinessLocation
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
                    <UploadVendorDocuments
                      vendor={vendor}
                      businessType={businessType}
                      previews={previews}
                      setPreviews={setPreviews}
                      isSubmitting={isSubmitting || isSaving}
                    />

                    {profileSaved && needsAgreement && (
                      <div className="mt-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Vendor details & documents have been saved. You can
                        proceed to Agreements or go back to edit.
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

                    {/* View-only when already finalized */}
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
                          {vendorState?.agreement?.agreementId && (
                            <>
                              {" "}
                              · ID: {vendorState.agreement.agreementId}
                            </>
                          )}
                        </p>
                        {vendorState?.agreement?.pdfPath && (
                          <a
                            href={vendorState.agreement.pdfPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#DC3173] underline"
                          >
                            View agreement PDF
                          </a>
                        )}
                        <p className="text-xs text-slate-400 text-center max-w-sm">
                          Agreement cannot be modified when status is{" "}
                          {agreementStatus}. You may only update vendor
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
                        user={vendorState}
                        role="VENDOR"
                        embedded
                        showBackButton={false}
                        onSuccess={(agreement) => {
                          setAgreementData(agreement);
                          setAgreementCreated(true);
                          setVendorState((prev) => ({
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
                        {vendorState?.agreement?.pdfPath && (
                          <a
                            href={vendorState.agreement.pdfPath}
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
                          you can submit the vendor update.
                        </p>
                        <AgreementViewer agreement={agreementData} setAgreementSigned={setAgreementSigned} />
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
                          Click Submit Vendor below to finish.
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
                activeTab === DETAILS_LAST_TAB && needsAgreement && !profileSaved ? (
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
                        !(isAgreementFinalized && activeTab >= AGREEMENT_START_TAB)) ||
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
                  {needsAgreement && <Button
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
                      : t("submit_vendor") || "Submit Vendor"}
                  </Button>}
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
