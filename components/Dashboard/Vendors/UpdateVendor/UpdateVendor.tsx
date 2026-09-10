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
import {
  submitForApproval,
  updateUserDataReq,
} from "@/services/auth/register-user.service";
import { useStore } from "@/store/store";
import { TBusinessCategoryResponse } from "@/types/category.type";
import { TCuisine } from "@/types/cuisine.type";
import { TVendorDocKey } from "@/types/document.type";
import { TBusinessLocation, TVendor } from "@/types/user.type";
import { uploadDefaultDocument } from "@/utils/uploadUserDocument";
import { addVendorValidation } from "@/validations/add-vendor/add-vendor.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    businessLicenseDoc: Array.isArray(
      vendorState?.documents?.businessLicenseDoc
    )
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

  const OPTIONAL_DEFAULTS: TVendorDocKey[] = ["myPhoto"];
  const isSubVendor = vendor?.role === "SUB_VENDOR";

  const agreementStatus = vendorState?.agreement?.status ?? null;
  const needsAgreement =
    !vendorState?.agreement || agreementStatus === "UNSIGNED";
  const isAgreementFinalized =
    agreementStatus === "PARTY_SIGNED" || agreementStatus === "SIGNED";

  const [agreementCreated, setAgreementCreated] = useState(
    isAgreementFinalized
  );
  const [agreementData, setAgreementData] = useState<any>(
    vendorState?.agreement ?? null
  );
  const [agreementSigned, setAgreementSigned] = useState(isAgreementFinalized);

  const [profileSaved, setProfileSaved] = useState(!needsAgreement);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const daysOfWeek = [
    t("sunday") || "Sunday",
    t("monday") || "Monday",
    t("tuesday") || "Tuesday",
    t("wednesday") || "Wednesday",
    t("thursday") || "Thursday",
    t("friday") || "Friday",
    t("saturday") || "Saturday",
  ];

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

  const buildChangedPayload = (data: TVendorForm): Record<string, any> => {
    const hasChanged = (current: any, original: any) => {
      if (Array.isArray(current) || Array.isArray(original)) {
        return JSON.stringify(current || []) !== JSON.stringify(original || []);
      }
      return current !== original;
    };

    const vendorData: Record<string, any> = {};

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

    if (hasChanged(data.phoneNumber, vendor?.contactNumber || "")) {
      vendorData.contactNumber = data.phoneNumber;
    }

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

  const handleSaveChanges = async () => {
    if (!vendor?.userId) {
      toast.error("Vendor not found.");
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
    const toastId = toast.loading("Saving vendor information...");

    try {
      for (const key of OPTIONAL_DEFAULTS) {
        if (!previews[key] || previews[key]!.length === 0) {
          await uploadDefaultDocument(key, vendor.userId);
        }
      }

      const data = form.getValues();
      const vendorData = buildChangedPayload(data);

      const updatedResult = await updateUserDataReq(
        `/vendors/${vendor.userId}`,
        Object.keys(vendorData).length > 0 ? vendorData : {}
      );

      if (updatedResult.success) {
        setVendorState((prev) => ({ ...prev, ...vendorData }));
        setProfileSaved(true);

        if (needsAgreement) {
          toast.success(
            updatedResult.message ||
            "Vendor information saved. You can now create / sign the agreement.",
            { id: toastId }
          );
          scrollToSection(5);
        } else {
          toast.success(
            updatedResult.message || "Vendor information saved successfully.",
            { id: toastId }
          );
          router.refresh();
          router.back();
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

  const onSubmit = useCallback(async () => {
    if (needsAgreement && !agreementSigned) {
      toast.error("Please sign the agreement first.");
      scrollToSection(6);
      return;
    }

    if (needsAgreement && !profileSaved) {
      toast.error("Please save vendor information first (Save Changes).");
      return;
    }

    const toastId = toast.loading("Updating vendor data...");

    try {
      if (vendor.status === USER_STATUS.PENDING) {
        const submitRes = await submitForApproval(vendor?.userId);
        if (submitRes?.success) {
          const approveResult = await approveOrRejectReq(vendor.userId, {
            status: USER_STATUS.APPROVED,
          });

          if (approveResult.success) {
            toast.success(
              approveResult.message ||
              "Vendor updated & approved successfully!",
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
        }

        if (submitRes?.data?.errorSources) {
          submitRes.data.errorSources.forEach(
            (err: { path: string; message: string }) =>
              toast.error(err?.message, { id: toastId })
          );
          return;
        }
        toast.error(submitRes.message || "Vendor status update failed", {
          id: toastId,
        });
        return;
      }

      toast.success("Vendor updated successfully!", { id: toastId });
      router.refresh();
      router.back();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
        { id: toastId }
      );
    }
  },
    [
      needsAgreement,
      agreementSigned,
      profileSaved,
      vendor.status,
      vendor.userId,
      router,
    ]
  );

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
      {/* Fixed header – does not scroll */}
      <div className="shrink-0 z-30 border-b border-slate-200/80 bg-slate-50">
        <TitleHeader
          title={t("edit_vendor_details") || "Edit Vendor Details"}
          subtitle={
            t("update_vendor_details_information") ||
            "Update vendor information"
          }
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
            {/* Desktop sidebar – independent scroll only if tabs overflow */}
            <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col border-r border-slate-200 bg-white min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
                  {t("vendor_details")}
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

            {/* ONLY this panel scrolls the form sections */}
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
                          <Input type="email" value={vendorState.email} disabled />
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
                      <Briefcase className="w-5 h-5" /> 2. {t("business_details")}
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
                                <Input placeholder={t("branch_name")} {...field} />
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
                                onValueChange={field.onChange}
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
                        vendorState.businessLocation as TBusinessLocation
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
                        {t("vendor_details_documents_saved")}
                      </div>
                    )}
                    {isAgreementFinalized && (
                      <div className="mt-6 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        {t("agreement_is_already")} {agreementStatus?.toLowerCase()}. {t("you_can_update_information")}
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
                          <span className="font-semibold">{agreementStatus}</span>
                          {vendorState?.agreement?.agreementId && (
                            <> · ID: {vendorState.agreement.agreementId}</>
                          )}
                        </p>
                        {vendorState?.agreement?.pdfPath && (
                          <a
                            href={vendorState.agreement.pdfPath}
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
                          <span className="font-semibold">{agreementStatus}</span>
                        </p>
                        {vendorState?.agreement?.pdfPath && (
                          <a
                            href={vendorState.agreement.pdfPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#DC3173] underline"
                          >
                            {t("view_signed_agreement_pdf")}
                          </a>
                        )}
                        {(vendor?.status === USER_STATUS.PENDING) && (
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
                              : t("submit_vendor") || "Submit Vendor"}
                          </Button>)}
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
                        {(needsAgreement ||
                          vendor?.status === USER_STATUS.PENDING) && (
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
                                : t("submit_vendor") || "Submit Vendor"}
                            </Button>
                          )}
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
