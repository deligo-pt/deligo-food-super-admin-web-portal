/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BusinessLocationMap from "@/components/BusinessLocationMap/BusinessLocationMap";
import UploadVendorDocuments from "@/components/Dashboard/Vendors/AddVendor/UploadVendorDocuments";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLE } from "@/consts/user.const";
import { restaurantCuisineOptions } from "@/consts/vendor.const";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { approveOrRejectReq } from "@/services/auth/approve-or-reject.service";
import { resendOtpReq, verifyOtpReq } from "@/services/auth/otp.service";
import {
  registerUserAndSendOtpReq,
  updateUserDataReq,
} from "@/services/auth/register-user.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TResponse } from "@/types";
import { TBusinessCategory } from "@/types/category.type";
import { TVendorDocKey } from "@/types/document.type";
import { TVendor } from "@/types/user.type";
import { formatTime } from "@/utils/formatTime";
import { addVendorValidation } from "@/validations/add-vendor/add-vendor.validation";
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
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";
import z from "zod";

const DELIGO = "#DC3173";

type TVendorForm = z.infer<typeof addVendorValidation>;

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
};

export default function AddVendor({
  businessCategories,
}: {
  businessCategories: TBusinessCategory[];
}) {
  const { t } = useTranslation();
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vendorDetails, setVendorDetails] = useState<TVendor | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [timer, setTimer] = useState(300);
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [previews, setPreviews] =
    useState<Record<TVendorDocKey, string[] | null>>(defaultDocuments);
  const [buttonDisabled, setButtonDisabled] = useState(0);

  const form = useForm<TVendorForm>({
    resolver: zodResolver(addVendorValidation),
    defaultValues: {
      firstName: "",
      lastName: "",
      // prefixPhoneNumber: "",
      phoneNumber: "",
      businessName: "",
      businessType: "",
      restaurantCuisineType: "",
      businessLicenseNumber: "",
      NIF: "",
      branches: "",
      openingHours: "",
      closingHours: "",
      closingDays: [],
      street: "",
      city: "",
      postalCode: "",
      country: "",
      bankName: "",
      accountHolderName: "",
      iban: "",
      swiftCode: "",
    },
  });

  const { formState: { isSubmitting } } = form;

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

  const sendOtp = async () => {
    if (!email || !password) return;
    setButtonDisabled(1);

    const toastId = toast.loading("Sending OTP...");

    if (!isValidEmail(email))
      return toast.error("Invalid email address", { id: toastId });

    if (!isValidPassword(password))
      return toast.error(
        "Invalid password. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        {
          id: toastId,
        },
      );

    const result = await registerUserAndSendOtpReq(
      {
        email,
        password,
        role: USER_ROLE.VENDOR,
      },
    );

    if (result.success) {
      toast.success(result.message || "OTP sent successfully!", {
        id: toastId,
      });
      setOtpSent(true);
      return;
    }

    toast.error(result.message || "OTP send failed", { id: toastId });
    console.log(result);
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
        console.log("OTP resent!");
        toast.success("OTP resent successfully!", { id: toastId });
        return;
      }
      toast.error(result.message, { id: toastId });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "OTP resend failed", {
        id: toastId,
      });
      console.log(error);
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
        // 1. Decode the JWT to get the userId
        const decoded = jwtDecode(result.data.accessToken) as { userId: string };
        const currentUserId = decoded.userId;

        setEmailVerified(true);

        // 2. Fetch the single vendor details using the userId
        try {
          const vendorResult = await getSingleVendorReq(currentUserId);
          if (vendorResult && vendorResult.success) {
            setVendorDetails(vendorResult.data); // Store vendor details in state
          } else {
            console.error("Failed to fetch vendor details:", vendorResult?.message);
          }
        } catch (vendorError) {
          // Log background error but don't break the successful OTP verification flow
          console.error("Error fetching vendor details:", vendorError);
        }

        toast.success(result.message || "OTP verified successfully!", {
          id: toastId,
        });
        return;
      }

      // Handle unsuccessful response from backend
      toast.error(result?.message || "OTP verification failed", { id: toastId });
      console.log(result);

    } catch (error: any) {
      // Catch unexpected network/server/runtime crashes
      console.error("OTP Verification Runtime Error:", error);
      toast.error(error?.message || "Something went wrong during verification", {
        id: toastId,
      });
    } finally {
      setButtonDisabled(0);
    }
  };

  const onSubmit = async (data: TVendorForm) => {
    const toastId = toast.loading("Adding vendor...");

    const vendorData = {
      name: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      contactNumber: data.phoneNumber,
      businessDetails: {
        businessName: data.businessName,
        businessType: data.businessType,
        ...(data?.businessType === "RESTAURANT" && {
          restaurantCuisineType: data.restaurantCuisineType
        }),
        NIF: data.NIF?.toUpperCase(),
        businessLicenseNumber: data.businessLicenseNumber?.toUpperCase(),
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
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        iban: data.iban,
        swiftCode: data.swiftCode,
      },
    } as Partial<TVendor>;

    const updatedResult = await updateUserDataReq(
      `/vendors/${vendorDetails?.userId}`,
      vendorData,
    );

    if (updatedResult.success) {
      const approveResult = await approveOrRejectReq(vendorDetails?.userId as string, {
        status: "APPROVED",
      });

      if (approveResult.success) {
        form.reset();
        setPreviews(defaultDocuments);
        toast.success(approveResult.message || "Vendor added successfully!", {
          id: toastId,
        });
        return;
      }

      toast.error(approveResult.message || "Vendor add failed", {
        id: toastId,
      });
      console.log(approveResult);
      return;
    }

    toast.error(updatedResult.message || "Vendor add failed", { id: toastId });
    console.log(updatedResult);
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-h-screen bg-slate-50"
      >
        <TitleHeader
          title={t("add_new_vendor")}
          subtitle="Add a new vendor here"
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Section - Registration Data */}
          <div className="space-y-8">
            {/* Account Information */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
              }}
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
                        <FormLabel>{t("first_name")}</FormLabel>
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
                        <FormLabel>{t("last_name")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("last_name")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label>{t("email")}</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="email"
                        placeholder={t("vendor_email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                      <Label className="mb-2">{t("otp")}</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          placeholder={t("enter_otp")}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button
                          type="button"
                          disabled={buttonDisabled === 3}
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

                  <div>
                    <Label className="mb-2">{t("password")}</Label>
                    <div className="relative">
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder={t("password")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  <Label className="mb-2">{t("phone_number")}</Label>
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
            <AnimatePresence>
              {vendorDetails?.userId && (
                <>
                  {/* Business Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                    }}
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
                              <FormLabel>{t("business_name")}</FormLabel>
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
                          name="businessType"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>{t("business_type")}</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger
                                    className={cn(
                                      "w-full",
                                      fieldState.invalid
                                        ? "border-red-500"
                                        : "",
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
                                        value={category.name}
                                      >
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* if business type is restaurant */}
                        {businessType === "RESTAURANT" && (
                          <FormField
                            control={form.control}
                            name="restaurantCuisineType"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel>Restaurant Cuisine Type</FormLabel>
                                <FormControl>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger
                                      className={cn(
                                        "px-3 h-8 w-full bg-white/90 text-gray-700 shadow-sm focus-visible:ring-2 focus-visible:ring-[#DC3173]/70 hover:shadow-md transition-all cursor-pointer  ",
                                        fieldState.invalid
                                          ? "border-destructive focus-visible:ring-destructive/20"
                                          : "border-gray-300",
                                      )}
                                      style={{
                                        height: "2.4rem",
                                      }}
                                    >
                                      <SelectValue placeholder="Select Restaurant Cuisine" />
                                    </SelectTrigger>

                                    <SelectContent>
                                      {restaurantCuisineOptions.map((type, idx) => (
                                        <SelectItem
                                          key={idx}
                                          value={type.label}
                                          className="capitalize"
                                        >
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="businessLicenseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("business_license_number")}
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
                              <FormLabel>{t("nif")}</FormLabel>
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

                        <FormField
                          control={form.control}
                          name="branches"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>{t("total_branches")}</FormLabel>
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
                              <div className="relative">
                                <FormLabel className="mb-2">
                                  {t("opening_hours")}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    placeholder="e.g. 09:00 AM"
                                    {...field}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="closingHours"
                          render={({ field }) => (
                            <FormItem>
                              <div className="relative">
                                <FormLabel className="mb-2">
                                  {t("closing_hours")}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    placeholder="e.g. 09:00 AM"
                                    {...field}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="closingDays"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <div>
                                <FormLabel className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                  {t("closing_days")}
                                </FormLabel>
                                <div className="flex flex-wrap gap-2">
                                  {daysOfWeek.map((day) => (
                                    <motion.button
                                      key={day}
                                      type="button"
                                      onClick={() => {
                                        field.onChange(
                                          field.value?.includes(day)
                                            ? field.value?.filter(
                                              (d) => d !== day,
                                            )
                                            : [...field.value, day],
                                        );
                                      }}
                                      whileTap={{ scale: 0.95 }}
                                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${field.value.includes(day)
                                        ? "bg-[#DC3173] text-white border-[#DC3173]"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-[#DC3173]/70"
                                        }`}
                                    >
                                      {day}
                                    </motion.button>
                                  ))}
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  </motion.div>

                  {/* Bank Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.3,
                    }}
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
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("bank_name")}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("bank_name")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accountHolderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("account_holder_name")}</FormLabel>
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
                              <FormLabel>{t("iban")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("iban")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="swiftCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("swift_code")}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("swift_code")}
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
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section - Business Location + Documents */}
          <AnimatePresence>
            {vendorDetails?.userId && (
              <div className="space-y-8">
                {/* Business Location */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.6,
                  }}
                >
                  <Card
                    className="p-6 shadow-md border-t-4"
                    style={{ borderColor: DELIGO }}
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Banknote className="w-5 h-5" /> 4.{" "}
                      {t("business_location_information")}
                    </h2>

                    <BusinessLocationMap
                      form={form}
                      setLocationCoordinates={setLocationCoordinates}
                    />
                  </Card>
                </motion.div>

                {/* Documents */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.9,
                  }}
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
                      previews={previews}
                      setPreviews={setPreviews}
                    />
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* SUBMIT BUTTON */}
        {vendorDetails?.userId && (
          <div className="mt-10 flex justify-end">
            <Button
              className="px-8 py-2 text-white"
              style={{ background: DELIGO }}
              disabled={isSubmitting}
            >
              {t("submit_vendor")}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
