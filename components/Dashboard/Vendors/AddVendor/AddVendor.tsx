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
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  Banknote,
  Briefcase,
  CheckCircle2,
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
import { useEffect, useMemo, useRef, useState } from "react";
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

  const [profileSaved, setProfileSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    return [
      accountOk,
      businessOk,
      bankOk,
      locationOk,
      isDocumentsValid,
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
    if (index >= 1 && !vendorDetails?.userId) {
      toast.error("Please verify email first.");
      scrollToSection(0);
      return;
    }
    if (index >= 5 && !profileSaved) {
      toast.error(
        "Please complete required details/documents and click Save Changes before accessing Agreements."
      );
      scrollToSection(4);
      return;
    }
    scrollToSection(index);
  };

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
        const decoded = jwtDecode(result.data.accessToken) as {
          userId: string;
        };
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
      toast.error(
        error?.message || "Something went wrong during verification",
        { id: toastId }
      );
    } finally {
      setButtonDisabled(0);
    }
  };

  const buildVendorPayload = (data: TVendorForm): Partial<TVendor> => ({
    name: { firstName: data.firstName, lastName: data.lastName },
    contactNumber: data.phoneNumber,
    businessDetails: {
      businessName: data.businessName,
      companyLegalName: data.companyLegalName,
      businessType: data.businessType,
      ...(data?.businessType === "restaurant" && {
        restaurantCuisineType: data.restaurantCuisineType,
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
      accountHolderName: data.accountHolderName,
      iban: data.iban,
    },
  });

  const handleSaveChanges = async () => {
    if (!vendorDetails?.userId) {
      toast.error("Vendor account not found. Please verify email first.");
      scrollToSection(0);
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
        toast.success(
          updatedResult.message ||
          "Vendor information saved successfully. You can now create the agreement.",
          { id: toastId }
        );
        scrollToSection(5);
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

  const onSubmit = async (data: TVendorForm) => {
    if (!profileSaved) {
      toast.error("Please save vendor information first (Save Changes).");
      return;
    }
    if (!agreementSigned) {
      toast.error("Please sign the agreement first.");
      scrollToSection(6);
      return;
    }
    const toastId = toast.loading("Submitting vendor...");
    if (!vendorDetails?.userId) return;
    try {
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
    const locked =
      (index >= 1 && !vendorDetails?.userId) || (index >= 5 && !profileSaved);

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
          !locked &&
          "bg-white text-slate-600 border border-slate-200 hover:border-[#DC3173]/50 hover:text-[#DC3173]",
          locked &&
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

  const detailsProgressCount = stepCompleted.slice(0, 5).filter(Boolean).length;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] overflow-hidden bg-slate-50">
      <div className="shrink-0 z-30 border-b border-slate-200/80 bg-slate-50">
        <TitleHeader
          title={t("add_vendor")}
          subtitle={t("add_new_vendor_here")}
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
          <div className="lg:hidden shrink-0 border-b bg-white overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max px-3 py-2">
              {TABS.map((tab, index) =>
                renderTabButton(tab, index, "horizontal")
              )}
            </div>
          </div>

          <div className="flex flex-1 min-h-0 overflow-hidden">
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
                  {!profileSaved && (
                    <span className="text-[10px] font-normal normal-case text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      {t("locked")}
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
                  {profileSaved && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("profile_saved")}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            <div
              ref={contentRef}
              className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain scroll-smooth"
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8 pb-16">
                {/* Account */}
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
                      {!emailVerified && (
                        <>
                          <div>
                            <Label>
                              {t("email")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </Label>
                            <div className="mt-2 relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                type="email"
                                className="pl-10"
                                placeholder={t("vendor_email") || "Email"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={otpSent}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>
                              {t("password")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </Label>
                            <div className="mt-2 relative">
                              <Input
                                type={showPass ? "text" : "password"}
                                placeholder={t("password")}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={otpSent}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-2.5 text-slate-400"
                                onClick={() => setShowPass((s) => !s)}
                              >
                                {showPass ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          {!otpSent ? (
                            <Button
                              type="button"
                              onClick={sendOtp}
                              disabled={
                                buttonDisabled === 1 || !email || !password
                              }
                              className="bg-[#DC3173] hover:bg-[#c22b65] text-white"
                            >
                              {buttonDisabled === 1
                                ? "Sending..."
                                : t("send_otp") || "Send OTP"}
                            </Button>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <Label>
                                  {t("otp")}{" "}
                                  <span className="text-[#DC3173]">*</span>
                                </Label>
                                <Input
                                  className="mt-2"
                                  placeholder="Enter OTP"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value)}
                                />
                              </div>
                              <div className="flex flex-wrap gap-2 items-center">
                                <Button
                                  type="button"
                                  onClick={verifyOtp}
                                  disabled={buttonDisabled === 3 || !otp}
                                  className="bg-[#DC3173] hover:bg-[#c22b65] text-white"
                                >
                                  {buttonDisabled === 3
                                    ? "Verifying..."
                                    : t("verify_otp") || "Verify OTP"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={resendOtp}
                                  disabled={timer > 0 || buttonDisabled === 2}
                                >
                                  {timer > 0
                                    ? `${t("resendOtp") || "Resend"} (${formatTime(timer)})`
                                    : t("resendOtp") || "Resend OTP"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {emailVerified && (
                        <>
                          <div>
                            <Label>
                              {t("email")}{" "}
                              <span className="text-[#DC3173]">*</span>
                            </Label>
                            <Input
                              className="mt-2"
                              type="email"
                              value={email}
                              disabled
                            />
                          </div>
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
                                  <Input
                                    placeholder={t("first_name")}
                                    {...field}
                                  />
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
                                  <Input
                                    placeholder={t("last_name")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                        </>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Business */}
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
                    {!vendorDetails?.userId ? (
                      <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <Lock className="w-8 h-8 text-slate-400" />
                        <p className="text-slate-600 max-w-md">
                          {t("verify_email_in_account_information")}
                        </p>
                      </div>
                    ) : (
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
                              const selectedCuisines = Array.isArray(
                                field.value
                              )
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
                                          if (
                                            !selectedCuisines.includes(val)
                                          ) {
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
                    )}
                  </Card>
                </div>

                {/* Bank */}
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
                    {!vendorDetails?.userId ? (
                      <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <Lock className="w-8 h-8 text-slate-400" />
                        <p className="text-slate-600 max-w-md">
                          {t("verify_email_first")}
                        </p>
                      </div>
                    ) : (
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
                    )}
                  </Card>
                </div>

                {/* Location */}
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
                    {!vendorDetails?.userId ? (
                      <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <Lock className="w-8 h-8 text-slate-400" />
                        <p className="text-slate-600 max-w-md">
                          {t("verify_email_first")}
                        </p>
                      </div>
                    ) : (
                      <BusinessLocationMap
                        form={form}
                        setLocationCoordinates={setLocationCoordinates}
                        t={t}
                      />
                    )}
                  </Card>
                </div>

                {/* Documents */}
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
                    {!vendorDetails?.userId ? (
                      <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <Lock className="w-8 h-8 text-slate-400" />
                        <p className="text-slate-600 max-w-md">
                          {t("verify_email_first")}
                        </p>
                      </div>
                    ) : (
                      <>
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
                            {t("vendor_details_documents_saved")}
                          </div>
                        )}
                      </>
                    )}
                  </Card>
                </div>

                {/* Create Agreement */}
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
                    {!profileSaved ? (
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
                          {t("agreement_created_successfully") ||
                            "Agreement created successfully"}
                        </p>
                        <p className="text-sm text-slate-500 text-center max-w-md">
                          {t("you_can_proceed_to_the_next_step_to_sign") ||
                            "Scroll down to sign the agreement."}
                        </p>
                      </div>
                    ) : (
                      vendorDetails && (
                        <CreateUserAgreement
                          user={vendorDetails}
                          role="VENDOR"
                          embedded
                          showBackButton={false}
                          onSuccess={(agreement) => {
                            setAgreementData(agreement);
                            setAgreementCreated(true);
                            scrollToSection(6);
                          }}
                        />
                      )
                    )}
                  </Card>
                </div>

                {/* Sign Agreement */}
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
                    {!profileSaved ? (
                      <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <Lock className="w-8 h-8 text-slate-400" />
                        <p className="text-slate-600 max-w-md">
                          {t("save_changes_first_to_unlock_signing")}
                        </p>
                      </div>
                    ) : !agreementSigned ? (
                      <div className="flex flex-col items-center gap-4 py-6">
                        <AgreementViewer
                          agreement={agreementData}
                          setAgreementSigned={() => setAgreementSigned(true)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-lg font-medium text-green-700">
                          {t("agreement_signed_successfully") ||
                            "Agreement signed successfully"}
                        </p>
                        <Button
                          type="submit"
                          disabled={
                            !profileSaved ||
                            !agreementSigned ||
                            isSubmitting ||
                            isSaving
                          }
                          className="bg-[#DC3173] hover:bg-[#c22b65] text-white px-8 mt-2"
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : t("submit_vendor") || "Submit Vendor"}
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
