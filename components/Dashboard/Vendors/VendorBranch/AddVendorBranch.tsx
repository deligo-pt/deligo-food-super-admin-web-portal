/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BusinessLocationMap from "@/components/BusinessLocationMap/BusinessLocationMap";
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { USER_ROLE } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { approveOrRejectReq } from "@/services/auth/approve-or-reject.service";
import { resendOtpReq, verifyOtpReq } from "@/services/auth/otp.service";
import {
    onboardUserAndSendOtpReq,
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
import { addVendorBranchValidation } from "@/validations/vendor-branch/vendor-branch.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
    BadgeCheck,
    Banknote,
    CheckCircle,
    Eye,
    EyeOff,
    FileText,
    Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";
import z from "zod";

const DELIGO = "#DC3173";

type TVendorBranchForm = z.infer<typeof addVendorBranchValidation>;

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password
    );
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

interface IProps {
    businessCategories: TBusinessCategoryResponse[];
    cuisines: TCuisine[];
    vendorId: string;
}

const AddVendorBranch = ({
    businessCategories,
    cuisines,
    vendorId,
}: IProps) => {
    const { t } = useTranslation();
    const { lang } = useStore();
    const router = useRouter();

    // Branch Account
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [branchUser, setBranchUser] = useState<TVendor | null>(null);
    const [showPass, setShowPass] = useState(false);
    const [timer, setTimer] = useState(300);
    const [buttonDisabled, setButtonDisabled] = useState(0);

    const [locationCoordinates, setLocationCoordinates] = useState({
        latitude: 0,
        longitude: 0,
    });

    const [previews, setPreviews] =
        useState<Record<TVendorDocKey, string[] | null>>(defaultDocuments);

    const form = useForm<TVendorBranchForm>({
        resolver: zodResolver(addVendorBranchValidation),
        defaultValues: {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            branchName: "",
            businessName: "",
            businessType: "",
            restaurantCuisineType: [],
            NIF: "",
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

    // OTP FLOW
    const sendOtp = async () => {
        if (!email || !password || !vendorId) return;
        setButtonDisabled(1);

        const toastId = toast.loading("Sending OTP...");

        if (!isValidEmail(email)) {
            setButtonDisabled(0);
            return toast.error("Invalid email address", { id: toastId });
        }

        if (!isValidPassword(password)) {
            setButtonDisabled(0);
            return toast.error(
                "Password must be at least 8 characters and contain uppercase, lowercase, number and special character.",
                { id: toastId }
            );
        }

        const result = await onboardUserAndSendOtpReq({
            email,
            password,
            role: USER_ROLE.SUB_VENDOR,
            parentVendorId: vendorId
        });

        if (result.success) {
            toast.success(result.message || "OTP sent successfully!", {
                id: toastId,
            });
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
                role: USER_ROLE.SUB_VENDOR,
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
                role: USER_ROLE.SUB_VENDOR,
            });

            if (result?.success) {
                const decoded = jwtDecode(result.data.accessToken) as {
                    userId: string;
                };
                const currentUserId = decoded.userId;

                try {
                    const branchResult = await getSingleVendorReq(currentUserId);
                    if (branchResult) {
                        setBranchUser(branchResult);
                    }
                } catch (err) {
                    console.error("Error fetching branch user:", err);
                }

                setEmailVerified(true);
                toast.success(result.message || "OTP verified successfully!", {
                    id: toastId,
                });
                return;
            }

            toast.error(result?.message || "OTP verification failed", {
                id: toastId,
            });
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong", { id: toastId });
        } finally {
            setButtonDisabled(0);
        }
    };

    // SUBMIT
    const onSubmit = async (data: TVendorBranchForm) => {
        if (!vendorId || !branchUser) return;

        const toastId = toast.loading("Adding branch...");

        // Only send fields that are allowed for a branch
        const branchData = {
            name: {
                firstName: data.firstName,
                lastName: data.lastName,
            },
            contactNumber: data.phoneNumber,
            // role: USER_ROLE.SUB_VENDOR,
            businessDetails: {
                branchName: data.branchName,
                openingHours: data.openingHours,
                closingHours: data.closingHours,
                closingDays: data.closingDays || [],
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
        };

        const updatedResult = await updateUserDataReq(
            `/vendors/${branchUser.userId}`,
            branchData as unknown as Partial<TVendor>
        );

        if (updatedResult.success) {
            try {
                for (const key of OPTIONAL_DEFAULTS) {
                    if (!previews[key] || previews[key]!.length === 0) {
                        await uploadDefaultDocument(key, branchUser.userId);
                    }
                }
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Failed to set default documents",
                    { id: toastId }
                );
                return;
            }

            const approveResult = await approveOrRejectReq(branchUser.userId, {
                status: "APPROVED",
            });

            if (approveResult.success) {
                form.reset();
                setPreviews(defaultDocuments);
                setBranchUser(null);
                setEmailVerified(false);
                setOtpSent(false);
                setEmail("");
                setPassword("");

                toast.success(approveResult.message || "Branch added successfully!", {
                    id: toastId,
                });
                router.push('/admin/vendor-branch/all')
                return;
            }

            if (approveResult?.data?.errorSources) {
                approveResult?.data?.errorSources?.map((err: { path: string, message: string }) => (
                    toast.error(err?.message, { id: toastId })
                ));
                return;
            } else {
                toast.error(approveResult.message || "Branch status update failed", {
                    id: toastId,
                });
            }
            console.log(approveResult);
            return;
        }

        if (updatedResult?.data?.errorSources) {
            updatedResult?.data?.errorSources?.map((err: { path: string, message: string }) => (
                toast.error(err?.message, { id: toastId })
            ));
            return;
        } else {
            toast.error(updatedResult.message || "Branch add failed", {
                id: toastId,
            });
        }
        console.log(updatedResult);
    };

    // FETCH PARENT VENDOR
    useEffect(() => {
        if (!vendorId) return;

        try {
            if (branchUser) {
                // Prefill readonly fields from parent
                form.setValue(
                    "businessName",
                    branchUser?.businessDetails?.businessName || ""
                );
                form.setValue(
                    "businessType",
                    branchUser?.businessDetails?.businessTypeSlug ||
                    branchUser?.businessDetails?.businessType ||
                    ""
                );
                form.setValue("NIF", branchUser?.businessDetails?.NIF || "");
                form.setValue(
                    "restaurantCuisineType",
                    branchUser?.businessDetails?.restaurantCuisineType || []
                );
            }
        } catch (error) {
            console.error(error);
        }

    }, [vendorId, branchUser, form]);

    // Timer
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Default phone
    useEffect(() => {
        const currentPhone = form.getValues("phoneNumber");
        if (!currentPhone) {
            form.setValue("phoneNumber", "+351", { shouldValidate: true });
        }
    }, [form]);

    const isDocumentsValid = REQUIRED_DOCS.every(
        (key) => previews[key] !== null && (previews[key]?.length ?? 0) > 0
    );

    const isSubmitDisabled = !isDocumentsValid || isSubmitting;


    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="min-h-screen bg-slate-50"
            >
                <TitleHeader
                    title={t("add_vendor_branch") || "Add Vendor Branch"}
                    subtitle={
                        t("add_new_branch_here") ||
                        `Adding branch under ${branchUser?.businessDetails?.businessName}`
                    }
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* ================= LEFT SIDE ================= */}
                    <div className="space-y-8">
                        {/* 1. Account Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card
                                className="p-6 shadow-md border-t-4"
                                style={{ borderColor: DELIGO }}
                            >
                                <h2 className="text-xl font-semibold mb-4">
                                    1. {t("account_information")}
                                </h2>

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("first_name")}{" "}
                                                    {branchUser?.userId && (
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
                                                    {branchUser?.userId && (
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

                                    {/* Email + OTP */}
                                    <div>
                                        <Label>
                                            {t("email")} <span className="text-[#DC3173]">*</span>
                                        </Label>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Input
                                                type="email"
                                                placeholder={t("branch_email") || "Branch email"}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={!!branchUser?.userId}
                                            />
                                            {!otpSent && !emailVerified && (
                                                <Button
                                                    disabled={!email || !password || buttonDisabled === 1}
                                                    type="button"
                                                    style={{ background: DELIGO }}
                                                    onClick={sendOtp}
                                                    className="w-32"
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
                                                    className="w-32"
                                                >
                                                    {t("resend")} {timer > 0 && `(${formatTime(timer)})`}
                                                </Button>
                                            )}
                                            {emailVerified && (
                                                <span className="text-green-600 flex items-center gap-2 text-sm">
                                                    <CheckCircle className="w-4 h-4" /> {t("verified")}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {otpSent && !emailVerified && (
                                        <div>
                                            <Label className="mb-2">
                                                {t("otp")} <span className="text-[#DC3173]">*</span>
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
                                                    disabled={buttonDisabled === 3 || otp.length < 4}
                                                    style={{ background: DELIGO }}
                                                    onClick={verifyOtp}
                                                    className="w-32"
                                                >
                                                    <BadgeCheck className="w-4 h-4 mr-2" />{" "}
                                                    {t("verify_otp")}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Password */}
                                    <div>
                                        <Label className="mb-2">
                                            {t("password")} <span className="text-[#DC3173]">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type={showPass ? "text" : "password"}
                                                placeholder={t("password")}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={!!branchUser?.userId}
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

                                    {/* Phone */}
                                    <Label className="mb-2">{t("phone_number")} {branchUser?.userId && <span className="text-[#DC3173]">*</span>}</Label>
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <PhoneInput
                                                        defaultCountry="pt"
                                                        value={field.value || ""}
                                                        onChange={(phone) => {
                                                            field.onChange(phone);
                                                        }}
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

                        {/* 2. Business Details */}
                        <AnimatePresence>
                            {branchUser?.userId && (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card
                                        className="p-6 shadow-md border-t-4"
                                        style={{ borderColor: DELIGO }}
                                    >
                                        <h2 className="text-xl font-semibold mb-4">
                                            2. {t("business_details")}
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Branch Name - editable */}
                                            <FormField
                                                control={form.control}
                                                name="branchName"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
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

                                            {/* Readonly fields from Parent */}
                                            <FormField
                                                control={form.control}
                                                name="businessName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("business_name")}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                readOnly
                                                                className="bg-gray-100 cursor-not-allowed"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="businessType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("business_type")}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                value={
                                                                    businessCategories.find(
                                                                        (c) => c.slug === field.value
                                                                    )?.name?.[lang] || field.value
                                                                }
                                                                readOnly
                                                                className="bg-gray-100 cursor-not-allowed"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="NIF"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("nif")}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                readOnly
                                                                className="bg-gray-100 cursor-not-allowed uppercase"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Cuisine (readonly) */}
                                            {businessType === "restaurant" && (
                                                <FormField
                                                    control={form.control}
                                                    name="restaurantCuisineType"
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-2">
                                                            <FormLabel>
                                                                {t("restaurantCuisineType")}
                                                            </FormLabel>
                                                            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border rounded-lg">
                                                                {(field.value || []).map((slug: string) => (
                                                                    <Badge
                                                                        key={slug}
                                                                        variant="secondary"
                                                                        className="bg-[#DC3173]/10 text-[#DC3173]"
                                                                    >
                                                                        {cuisines.find((c) => c.slug === slug)
                                                                            ?.name?.[lang] || slug}
                                                                    </Badge>
                                                                ))}
                                                                {(!field.value || field.value.length === 0) && (
                                                                    <span className="text-sm text-gray-500">
                                                                        N/A
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            {/* Working Hours */}
                                            <FormField
                                                control={form.control}
                                                name="openingHours"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
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
                                                        <FormLabel>
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

                                            {/* Closing Days */}
                                            <FormField
                                                control={form.control}
                                                name="closingDays"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
                                                        <FormLabel>{t("closing_days")}</FormLabel>
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
                                                                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${isSelected
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
                        </AnimatePresence>

                        {/* 3. Bank Details */}
                        <AnimatePresence>
                            {branchUser?.userId && (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
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
                                                            <Input {...field} />
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
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT SIDE */}
                    <AnimatePresence>
                        {branchUser?.userId && (
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card
                                        className="p-6 shadow-md border-t-4"
                                        style={{ borderColor: DELIGO }}
                                    >
                                        <h2 className="text-xl font-semibold mb-4">
                                            4. {t("business_location_information")}
                                        </h2>
                                        <BusinessLocationMap
                                            form={form}
                                            setLocationCoordinates={setLocationCoordinates}
                                            t={t}
                                        />
                                    </Card>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
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
                                            vendor={branchUser}
                                            businessType={businessType as string}
                                            previews={previews}
                                            setPreviews={setPreviews}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Card>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {branchUser?.userId && (
                    <div className="mt-10 flex justify-end">
                        <Button
                            type="submit"
                            className="px-8 py-2 text-white"
                            style={{ background: DELIGO }}
                            disabled={isSubmitDisabled}
                        >
                            {t("submit_branch") || "Submit Branch"}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
};

export default AddVendorBranch;