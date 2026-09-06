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
import { USER_ROLE } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { approveOrRejectReq } from "@/services/auth/approve-or-reject.service";
import { resendOtpReq, verifyOtpReq } from "@/services/auth/otp.service";
import {
  registerUserAndSendOtpReq,
  updateUserDataReq,
} from "@/services/auth/register-user.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { useStore } from "@/store/store";
import { TResponse } from "@/types";
import { TBusinessCategoryResponse } from "@/types/category.type";
import { TCuisine } from "@/types/cuisine.type";
import { TVendorDocKey } from "@/types/document.type";
import { TVendor } from "@/types/user.type";
import { formatTime } from "@/utils/formatTime";
import { uploadDefaultDocument } from "@/utils/uploadUserDocument";
import { addVendorValidation } from "@/validations/add-vendor/add-vendor.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  BadgeCheck,
  Banknote,
  Briefcase,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileSignature,
  FileText,
  Lock,
  Mail,
  MapPin,
  Save,
  ScrollText,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";
import z from "zod";

const DELIGO = "#DC3173";

type TVendorForm = z.infer<ReturnType<typeof addVendorValidation>>;

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

const defaultDocuments: Record<TVendorDocKey, string[] | null> = {
  myPhoto: null,
  businessLicenseDoc: null,
  taxDoc: null,
  idProofFront: null,
  idProofBack: null,
  storePhoto: null,
  menuUpload: null,
  agoserisHaccpCertificate: null,
  ibanProof: null,
};
const OPTIONAL_DEFAULTS: TVendorDocKey[] = ["myPhoto", "menuUpload"];

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

export default function AddVendor({
  businessCategories,
  cuisines,
}: {
  businessCategories: TBusinessCategoryResponse[];
  cuisines: TCuisine[];
}) {
  const { t } = useTranslation();
  const { lang } = useStore();

  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vendorDetails, setVendorDetails] = useState<TVendor | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [timer, setTimer] = useState(300);
  const [buttonDisabled, setButtonDisabled] = useState(0);

  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [previews, setPreviews] =
    useState<Record<TVendorDocKey, string[] | null>>(defaultDocuments);

  const [agreementCreated, setAgreementCreated] = useState(false);
  const [agreementData, setAgreementData] = useState<any>(null);
  const [agreementSigned, setAgreementSigned] = useState(false);

  /** True after successful Save & Continue (profile + docs persisted). */
  const [profileSaved, setProfileSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState(0);

  const isSubVendor = vendorDetails?.role === "SUB_VENDOR";

  const form = useForm<TVendorForm>({
    resolver: zodResolver(addVendorValidation(isSubVendor)),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      businessName: "",
      companyLegalName: "",
      businessType: "",
      restaurantCuisineType: [],
      NIF: "",
      branches: "",
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

  const daysOfWeek = [
    t("sunday"),
    t("monday"),
    t("tuesday"),
    t("wednesday"),
    t("thursday"),
    t("friday"),
    t("saturday"),
  ];

  const businessType = useWatch({
    control: form.control,
    name: "businessType",
  });

  const watchedValues = useWatch({ control: form.control });

  const isDocumentsValid = REQUIRED_DOCS.every(
    (key) => previews[key] !== null && (previews[key]?.length ?? 0) > 0
  );

  const stepCompleted = useMemo(() => {
    const v = watchedValues;

    const accountOk =
      emailVerified &&
      !!vendorDetails?.userId &&
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
          v.restaurantCuisineType.length > 0));

    const bankOk = !!v.accountHolderName?.trim() && !!v.iban?.trim();

    const locationOk =
      !!v.street?.trim() &&
      !!v.city?.trim() &&
      !!v.postalCode?.trim() &&
      !!v.country?.trim() &&
      locationCoordinates.latitude !== 0 &&
      locationCoordinates.longitude !== 0;

    // Documents step is complete only when required docs are present
    // AND (for progression into agreements) profile has been saved.
    // We keep documents "done" for the progress bar once valid,
    // but gate agreements via profileSaved in canAccessTab.
    const documentsOk = isDocumentsValid;

    return [
      accountOk,
      businessOk,
      bankOk,
      locationOk,
      documentsOk,
      agreementCreated,
      agreementSigned,
    ];
  }, [
    watchedValues,
    emailVerified,
    vendorDetails?.userId,
    locationCoordinates,
    isDocumentsValid,
    agreementCreated,
    agreementSigned,
  ]);

  const canAccessTab = (tabIndex: number) => {
    if (tabIndex === 0) return true;
    if (tabIndex >= 1 && !vendorDetails?.userId) return false;

    // Agreement section requires a successful Save & Continue
    if (tabIndex >= AGREEMENT_START_TAB && !profileSaved) return false;

    for (let i = 0; i < tabIndex; i++) {
      if (!stepCompleted[i]) return false;
    }
    return true;
  };

  const goToTab = (index: number) => {
    if (canAccessTab(index)) {
      setActiveTab(index);
    } else {
      if (index >= AGREEMENT_START_TAB && !profileSaved) {
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
      // On documents tab we force Save & Continue instead of plain next
      if (activeTab === DETAILS_LAST_TAB) {
        handleSaveAndContinue();
        return;
      }
      setActiveTab((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (activeTab > 0) setActiveTab((prev) => prev - 1);
  };

  // OTP handlers
  const sendOtp = async () => {
    if (!email || !password) return;
    setButtonDisabled(1);
    const toastId = toast.loading("Sending OTP...");

    if (!isValidEmail(email)) {
      setButtonDisabled(0);
      return toast.error("Invalid email address", { id: toastId });
    }
    if (!isValidPassword(password)) {
      setButtonDisabled(0);
      return toast.error(
        "Invalid password. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        { id: toastId }
      );
    }

    const result = await registerUserAndSendOtpReq({
      email,
      password,
      role: USER_ROLE.VENDOR,
    });

    if (result.success) {
      toast.success(result.message || "OTP sent successfully!", { id: toastId });
      setOtpSent(true);
      setButtonDisabled(0);
      return;
    }
    toast.error(result.message || "OTP send failed", { id: toastId });
    setButtonDisabled(0);
  };

  const resendOtp = async () => {
    const toastId = toast.loading("Resending OTP...");
    setButtonDisabled(2);
    try {
      const result = (await resendOtpReq({
        email,
        role: USER_ROLE.VENDOR,
      })) as unknown as TResponse<null>;

      if (result.success) {
        setTimer(300);
        toast.success("OTP resent successfully!", { id: toastId });
        return;
      }
      toast.error(result.message, { id: toastId });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "OTP resend failed", {
        id: toastId,
      });
    } finally {
      setButtonDisabled(0);
    }
  };

  const verifyOtp = async () => {
    const toastId = toast.loading("Verifying OTP...");
    setButtonDisabled(3);
    try {
      const result = await verifyOtpReq({
        email,
        otp,
        role: USER_ROLE.VENDOR,
      });

      if (result && result.success) {
        const decoded = jwtDecode(result.data.accessToken) as { userId: string };
        setEmailVerified(true);

        try {
          const vendorResult = await getSingleVendorReq(decoded.userId);
          if (vendorResult) setVendorDetails(vendorResult);
        } catch (vendorError) {
          console.error("Error fetching vendor details:", vendorError);
        }

        toast.success(result.message || "OTP verified successfully!", {
          id: toastId,
        });
        return;
      }
      toast.error(result?.message || "OTP verification failed", { id: toastId });
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong during verification", {
        id: toastId,
      });
    } finally {
      setButtonDisabled(0);
    }
  };

  // Build vendor payload from form
  const buildVendorPayload = (data: TVendorForm): Partial<TVendor> => {
    return {
      name: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      contactNumber: data.phoneNumber,
      businessDetails: {
        businessName: data.businessName,
        businessType: data.businessType,
        ...(data?.businessType === "restaurant" && {
          restaurantCuisineType: data.restaurantCuisineType
        }),
        NIF: data.NIF?.toUpperCase(),
        totalBranches: Number(data.branches),
        openingHours: data.openingHours,
        closingHours: data.closingHours,
        closingDays: data.closingDays,
      },
      businessLocation: {
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        latitude: locationCoordinates.latitude,
        longitude: locationCoordinates.longitude,
      },
      bankDetails: {
        // bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        iban: data.iban,
        // swiftCode : data.swiftCode,
      },
    };
  };

  // Save & Continue (after Documents)
  const handleSaveAndContinue = async () => {
    if (!vendorDetails?.userId) {
      toast.error("Vendor account not found. Please verify email first.");
      return;
    }

    // Ensure all previous steps (including documents) are complete
    const allDetailsComplete = stepCompleted
      .slice(0, DETAILS_LAST_TAB + 1)
      .every(Boolean);

    if (!allDetailsComplete || !isDocumentsValid) {
      toast.error(
        "Please complete all required fields and upload required documents before saving."
      );
      return;
    }

    // Trigger form validation
    const isValid = await form.trigger();

    if (!isValid) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving vendor information...");

    try {
      // Upload default documents for optional keys that are empty
      for (const key of OPTIONAL_DEFAULTS) {
        if (!previews[key] || previews[key]!.length === 0) {
          await uploadDefaultDocument(key, vendorDetails.userId);
        }
      }

      const data = form.getValues();
      const vendorData = buildVendorPayload(data);

      const updatedResult = await updateUserDataReq(
        `/vendors/${vendorDetails.userId}`,
        vendorData
      );

      if (updatedResult.success) {
        setProfileSaved(true);
        setActiveTab(AGREEMENT_START_TAB);
        toast.success(
          updatedResult.message ||
          "Vendor information saved successfully. You can now create the agreement.",
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

  // Final submit (Approve after agreement signed)
  const onSubmit = async (data: TVendorForm) => {
    if (!profileSaved) {
      toast.error("Please save vendor information first (Save & Continue).");
      return;
    }
    if (!agreementSigned) {
      toast.error("Please sign the agreement first.");
      return;
    }

    const toastId = toast.loading("Submitting vendor...");
    if (!vendorDetails?.userId) return;

    try {
      // Optional: re-sync latest form data before approve (in case of late edits)
      const vendorData = buildVendorPayload(data);
      const updatedResult = await updateUserDataReq(
        `/vendors/${vendorDetails.userId}`,
        vendorData
      );

      if (!updatedResult.success) {
        if (updatedResult?.data?.errorSources) {
          updatedResult.data.errorSources.forEach(
            (err: { path: string; message: string }) =>
              toast.error(err?.message, { id: toastId })
          );
          return;
        }
        toast.error(updatedResult.message || "Vendor update failed", {
          id: toastId,
        });
        return;
      }

      const approveResult = await approveOrRejectReq(vendorDetails.userId, {
        status: "APPROVED",
      });

      if (approveResult.success) {
        form.reset();
        setPreviews(defaultDocuments);
        setOtpSent(false);
        setEmailVerified(false);
        setEmail("");
        setPassword("");
        setVendorDetails(null);
        setAgreementCreated(false);
        setAgreementSigned(false);
        setAgreementData(null);
        setProfileSaved(false);
        setActiveTab(0);
        toast.success(approveResult.message || "Vendor added successfully!", {
          id: toastId,
        });
        return;
      }

      if (approveResult?.data?.errorSources) {
        approveResult.data.errorSources.forEach(
          (err: { path: string; message: string }) =>
            toast.error(err?.message, { id: toastId })
        );
        return;
      }
      toast.error(approveResult.message || "Vendor status update failed", {
        id: toastId,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
        { id: toastId }
      );
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    const currentPhone = form.getValues("phoneNumber");
    if (!currentPhone) {
      form.setValue("phoneNumber", "+351", { shouldValidate: true });
    }
  }, [form]);

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
    const locked = !accessible;

    // Visual grouping: highlight that agreements are a separate section
    const isAgreementTab = index >= AGREEMENT_START_TAB;

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-h-screen bg-slate-50"
      >
        <TitleHeader
          title={t("add_vendor")}
          subtitle={t("add_new_vendor_here")}
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
                        ? profileSaved
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
                {!profileSaved && (
                  <span className="text-[10px] font-normal normal-case text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    Locked
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
                      {profileSaved
                        ? `${[agreementCreated, agreementSigned].filter(Boolean).length}/2`
                        : "—"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        profileSaved ? "bg-emerald-500" : "bg-slate-300"
                      )}
                      style={{
                        width: profileSaved
                          ? `${([agreementCreated, agreementSigned].filter(Boolean)
                            .length /
                            2) *
                          100
                          }%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>

                {profileSaved && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Profile saved
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
                              {vendorDetails?.userId && (
                                <span className="text-[#DC3173]">*</span>
                              )}
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
                              {vendorDetails?.userId && (
                                <span className="text-[#DC3173]">*</span>
                              )}
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!!vendorDetails?.userId}
                          />
                          {!otpSent && !emailVerified && (
                            <Button
                              disabled={
                                !email || !password || buttonDisabled === 1
                              }
                              type="button"
                              style={{ background: DELIGO }}
                              onClick={sendOtp}
                              className="w-32 shrink-0"
                            >
                              <Mail className="w-4 h-4 mr-2" /> {t("send_otp")}
                            </Button>
                          )}
                          {otpSent && !emailVerified && (
                            <Button
                              disabled={timer > 0 || buttonDisabled === 2}
                              type="button"
                              style={{ background: DELIGO }}
                              onClick={resendOtp}
                              className="w-32 shrink-0"
                            >
                              {t("resend")}{" "}
                              {timer > 0 && `(${formatTime(timer)})`}
                            </Button>
                          )}
                          {emailVerified && (
                            <span className="text-green-600 flex items-center gap-2 text-sm shrink-0">
                              <CheckCircle className="w-4 h-4" /> {t("verified")}
                            </span>
                          )}
                        </div>
                      </div>

                      {otpSent && !emailVerified && (
                        <div>
                          <Label className="mb-2">
                            {t("otp")}{" "}
                            <span className="text-[#DC3173]">*</span>
                          </Label>
                          <div className="flex items-center gap-3">
                            <Input
                              placeholder={t("enter_otp")}
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              maxLength={4}
                            />
                            <Button
                              type="button"
                              disabled={
                                buttonDisabled === 3 || otp.length < 4
                              }
                              style={{ background: DELIGO }}
                              onClick={verifyOtp}
                              className="w-32 shrink-0"
                            >
                              <BadgeCheck className="w-4 h-4 mr-2" />{" "}
                              {t("verify_otp")}
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="mb-2">
                          {t("password")}{" "}
                          <span className="text-[#DC3173]">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            type={showPass ? "text" : "password"}
                            placeholder={t("password")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={!!vendorDetails?.userId}
                          />
                          {showPass ? (
                            <EyeOff
                              size={18}
                              className="absolute right-3 top-2.5 cursor-pointer"
                              onClick={() => setShowPass(false)}
                            />
                          ) : (
                            <Eye
                              size={18}
                              className="absolute right-3 top-2.5 cursor-pointer"
                              onClick={() => setShowPass(true)}
                            />
                          )}
                        </div>
                      </div>

                      <Label className="mb-2">
                        {t("phone_number")}{" "}
                        {vendorDetails?.userId && (
                          <span className="text-[#DC3173]">*</span>
                        )}
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
              {activeTab === 1 && vendorDetails?.userId && (
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
                                value={field.value}
                              >
                                <SelectTrigger
                                  className={cn(
                                    "w-full",
                                    fieldState.invalid ? "border-red-500" : ""
                                  )}
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
                                      >
                                        <SelectValue
                                          placeholder={t(
                                            "select_multiple_cuisine"
                                          )}
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
                              {daysOfWeek.map((day) => {
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
                                    {day}
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
              {activeTab === 2 && vendorDetails?.userId && (
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
              {activeTab === 3 && vendorDetails?.userId && (
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
                      setLocationCoordinates={setLocationCoordinates}
                      t={t}
                    />
                  </Card>
                </motion.div>
              )}

              {/* TAB 4: Documents */}
              {activeTab === 4 && vendorDetails?.userId && (
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
                      vendor={vendorDetails}
                      businessType={businessType}
                      previews={previews}
                      setPreviews={setPreviews}
                      isSubmitting={isSubmitting || isSaving}
                    />

                    {profileSaved && (
                      <div className="mt-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Vendor details & documents have been saved. You can
                        proceed to Agreements or go back to edit.
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* TAB 5: Create Agreement */}
              {activeTab === 5 && vendorDetails?.userId && profileSaved && (
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

                    {agreementCreated ? (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-lg font-medium text-green-700">
                          {t("agreement_created_successfully")}
                        </p>
                        <p className="text-sm text-slate-500 text-center max-w-md">
                          {t("you_can_proceed_to_the_next_step_to_sign")}
                        </p>
                      </div>
                    ) : (
                      <CreateUserAgreement
                        user={vendorDetails}
                        role="VENDOR"
                        embedded
                        showBackButton={false}
                        onSuccess={(agreement) => {
                          setAgreementData(agreement);
                          setAgreementCreated(true);
                          setActiveTab(6);
                        }}
                      />
                    )}
                  </Card>
                </motion.div>
              )}

              {/* TAB 6: Sign Agreement */}
              {activeTab === 6 && vendorDetails?.userId && profileSaved && (
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

                    {!agreementSigned ? (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <AgreementViewer agreement={agreementData} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-lg font-medium text-green-700">
                          {t("agreement_signed_successfully")}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t("click_submit_vendor_below")}
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
                {t("previous")}
              </Button>

              <div className="text-sm text-slate-400 hidden sm:block">
                {t("step_lg")} {activeTab + 1} of {TABS.length}
                {activeTab <= DETAILS_LAST_TAB && !profileSaved && (
                  <span className="ml-2 text-amber-600">· {t("details")}</span>
                )}
                {activeTab >= AGREEMENT_START_TAB && (
                  <span className="ml-2 text-emerald-600">· {t("agreements")}</span>
                )}
              </div>

              {activeTab < TABS.length - 1 ? (
                activeTab === DETAILS_LAST_TAB ? (
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
                    ) : profileSaved ? (
                      <>
                        {t("continue_to_agreements")}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {t("save_nd_continue")}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={!stepCompleted[activeTab] || isSaving}
                    className="bg-[#DC3173] hover:bg-[#c22b65] text-white gap-2"
                  >
                    {t("next")}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )
              ) : (
                <Button
                  type="submit"
                  disabled={
                    !profileSaved ||
                    !agreementSigned ||
                    isSubmitting ||
                    isSaving
                  }
                  className="bg-[#DC3173] hover:bg-[#c22b65] text-white px-8"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : t("submit_vendor") || "Submit Vendor"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
