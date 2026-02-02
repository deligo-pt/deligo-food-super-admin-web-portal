"use client";

import BusinessLocationMap from "@/components/BusinessLocationMap/BusinessLocationMap";
import UploadPartnerDocuments from "@/components/Dashboard/DeliveryPartners/AddDeliveryPartner/UploadPartnerDocuments";
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
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { approveOrRejectReq } from "@/services/auth/approveOrReject";
import { resendOtpReq, verifyOtpReq } from "@/services/auth/OTP";
import {
  registerPartnerAndSendOtpReq,
  updatePartnerDataReq,
} from "@/services/dashboard/deliveryPartner/add-delivery-partner";
import { TResponse } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { formatTime } from "@/utils/formatTime";
import { deliveryPartnerValidation } from "@/validations/delivery-partner/delivery-partner.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  BadgeCheck,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";
import z from "zod";

const DELIGO = "#DC3173";

type TDeliveryPartnerForm = z.infer<typeof deliveryPartnerValidation>;

const permitTypes = [
  "D2 Visa",
  "D4 Student Visa",
  "Temporary Residence",
  "Permanent Residence",
  "EU Citizen",
  "Other",
];

const equipment = [
  {
    id: "isothermalBag",
    label: "Isothermal Bag",
  },
  {
    id: "helmet",
    label: "Helmet",
  },
  {
    id: "powerBank",
    label: "Power Bank",
  },
];

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export default function AddDeliveryPartner() {
  const { t } = useTranslation();
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [zone, setZone] = useState("");
  const [timer, setTimer] = useState(300);
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });

  const form = useForm<TDeliveryPartnerForm>({
    resolver: zodResolver(deliveryPartnerValidation),
    defaultValues: {
      firstName: "",
      lastName: "",
      prefixPhoneNumber: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "MALE",
      nationality: "",
      nifNumber: "",
      citizenCardNumber: "",
      passportNumber: "",
      idExpiryDate: "",
      street: "",
      city: "",
      postalCode: "",
      country: "",
      vehicleType: "SCOOTER",
      brand: "",
      model: "",
      licensePlate: "",
      drivingLicenseNumber: "",
      drivingLicenseExpiry: "",
      insurancePolicyNumber: "",
      insuranceExpiry: "",
      bankName: "",
      accountHolderName: "",
      iban: "",
      swiftCode: "",
      preferredZones: [],
      preferredHours: [],
      isothermalBag: false,
      helmet: false,
      powerBank: false,
      workedWithOtherPlatform: false,
      otherPlatformName: "",
      residencePermitType: "",
      residencePermitNumber: "",
      residencePermitExpiry: "",
      haveCriminalRecordCertificate: true,
      issueDate: "",
    },
  });

  const [watchZones] = useWatch({
    control: form.control,
    name: ["preferredZones"],
  });

  const addZone = () => {
    if (zone && !form?.getValues("preferredZones")?.includes(zone)) {
      const newZones = [...form?.getValues("preferredZones"), zone];
      form.setValue("preferredZones", newZones);
    }
    setZone("");
  };

  const removeZone = (zoneToRemove: string) => {
    const newZones = form
      ?.getValues("preferredZones")
      ?.filter((t) => t !== zoneToRemove);
    form.setValue("preferredZones", newZones);
  };

  const sendOtp = async () => {
    if (!email || !password) return;

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

    const result = await registerPartnerAndSendOtpReq({
      email,
      password,
    });

    if (result.success) {
      toast.success(result.message || "OTP sent successfully!", {
        id: toastId,
      });
      setOtpSent(true);
      return;
    }

    toast.error(result.message || "OTP send failed", { id: toastId });
    console.log(result);
  };

  const resendOtp = async () => {
    const toastId = toast.loading("Resending OTP...");
    try {
      const result = (await resendOtpReq({
        email,
      })) as unknown as TResponse<null>;

      if (result.success) {
        setTimer(300);
        console.log("OTP resent!");
        toast.success("OTP resent successfully!", { id: toastId });
        return;
      }
      toast.error(result.message, { id: toastId });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "OTP resend failed", {
        id: toastId,
      });
      console.log(error);
    }
  };

  const verifyOtp = async () => {
    const toastId = toast.loading("Verifying OTP...");

    const result = await verifyOtpReq({
      email,
      otp,
    });

    if (result.success) {
      toast.success(result.message || "OTP verified successfully!", {
        id: toastId,
      });
      const decoded = jwtDecode(result.data.accessToken) as { userId: string };
      setPartnerId(decoded.userId);
      setEmailVerified(true);
      setOtpSent(false);
      setOtp("");
      return;
    }

    toast.error(result.message || "OTP verification failed", { id: toastId });
    console.log(result);
  };

  const onSubmit = async (data: TDeliveryPartnerForm) => {
    const toastId = toast.loading("Adding partner...");

    const partnerData = {
      name: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      contactNumber: data.phoneNumber,
      address: {
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        latitude: locationCoordinates.latitude,
        longitude: locationCoordinates.longitude,
      },
      personalInfo: {
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        nationality: data.nationality,
        nifNumber: data.nifNumber?.toUpperCase(),
        citizenCardNumber: data.citizenCardNumber?.toUpperCase(),
        passportNumber: data.passportNumber?.toUpperCase(),
        idExpiryDate: new Date(data.idExpiryDate),
      },
      legalStatus: {
        residencePermitType: data.residencePermitType,
        residencePermitNumber: data.residencePermitNumber?.toUpperCase(),
        residencePermitExpiry: new Date(data.residencePermitExpiry),
      },
      bankDetails: {
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        iban: data.iban?.toUpperCase(),
        swiftCode: data.swiftCode?.toUpperCase(),
      },
      vehicleInfo: {
        vehicleType: data.vehicleType,
        brand: data.brand,
        model: data.model,
        licensePlate: data.licensePlate?.toUpperCase(),
        drivingLicenseNumber: data.drivingLicenseNumber?.toUpperCase(),
        drivingLicenseExpiry: data.drivingLicenseExpiry,
        insurancePolicyNumber: data.insurancePolicyNumber?.toUpperCase(),
        insuranceExpiry: new Date(data.insuranceExpiry),
      },
      criminalRecord: {
        certificate: data.haveCriminalRecordCertificate,
        issueDate: new Date(data.issueDate as string),
      },
      workPreferences: {
        preferredZones: data.preferredZones,
        preferredHours: data.preferredHours,
        hasEquipment: {
          isothermalBag: data.isothermalBag,
          helmet: data.helmet,
          powerBank: data.powerBank,
        },
        workedWithOtherPlatform: data.workedWithOtherPlatform,
        otherPlatformName: data.otherPlatformName,
      },
    };

    const result = await updatePartnerDataReq(
      partnerId,
      partnerData as unknown as Partial<TDeliveryPartner>,
    );

    if (result.success) {
      const approveResult = await approveOrRejectReq(partnerId, {
        status: "APPROVED",
        remarks: "",
      });
      if (approveResult.success) {
        form.reset();
        setPartnerId("");
        setEmailVerified(false);
        toast.success(
          result.message || "Delivery partner added successfully!",
          {
            id: toastId,
          },
        );
        return;
      }

      toast.error(approveResult.message || "Delivery partner approved failed", {
        id: toastId,
      });
      console.log(approveResult);
    }

    toast.error(result.message || "Delivery partner add failed", {
      id: toastId,
    });
    console.log(result);
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-h-screen p-6 bg-slate-50"
      >
        <TitleHeader
          title="Add New Delivery Partner"
          subtitle="Create a new delivery partner with the form below"
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Section*/}
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
                        placeholder={t("partner_email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {!otpSent && !emailVerified && (
                        <Button
                          disabled={!email || !password}
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
                          disabled={timer > 0}
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
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name="prefixPhoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="absolute left-2 z-10">
                              <PhoneInput
                                {...field}
                                defaultCountry="pt"
                                countrySelectorStyleProps={{
                                  buttonStyle: {
                                    border: "none",
                                    height: "36px",
                                    backgroundColor: "transparent",
                                  },
                                }}
                                inputStyle={{
                                  marginTop: "1px",
                                  border: "none",
                                  height: "34px",
                                  width: "48px",
                                  borderRadius: "0px",
                                  backgroundColor: "#ccc",
                                  zIndex: "-99",
                                  position: "relative",
                                }}
                                inputProps={{
                                  placeholder: t("phone_number"),
                                  disabled: true,
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="tel"
                              className="pl-26 py-3"
                              {...field}
                              onChange={(e) => {
                                const onlyDigits = e.target.value.replace(
                                  /\D/g,
                                  "",
                                );
                                field.onChange(onlyDigits);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            <AnimatePresence>
              {partnerId && (
                <>
                  {/* Personal Information */}
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
                        2. Personal Information
                      </h2>

                      <div className="space-y-4 items-start">
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a Gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">
                                      Female
                                    </SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nationality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nationality</FormLabel>
                              <FormControl>
                                <Input placeholder="Nationality" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nifNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NIF Number</FormLabel>
                              <FormControl>
                                <Input
                                  className="uppercase placeholder:capitalize"
                                  placeholder="NIF Number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="citizenCardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Citizen Card Number</FormLabel>
                              <FormControl>
                                <Input
                                  className="uppercase placeholder:capitalize"
                                  placeholder="Citizen Card Number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="passportNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Passport Number</FormLabel>
                              <FormControl>
                                <Input
                                  className="uppercase placeholder:capitalize"
                                  placeholder="Passport Number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="idExpiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID Expiry Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  </motion.div>

                  {/* Address */}
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
                        3. Address
                      </h2>

                      <BusinessLocationMap
                        form={form}
                        setLocationCoordinates={setLocationCoordinates}
                      />
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
                        4. {t("bank_nd_payment_information")}
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
                                <Input
                                  className="uppercase placeholder:capitalize"
                                  placeholder={t("iban")}
                                  {...field}
                                />
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
                                  className="uppercase placeholder:capitalize"
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

          {/* Right Section */}
          <AnimatePresence>
            {partnerId && (
              <div className="space-y-8">
                {/* Legal Status */}
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
                      5. Legal Status
                    </h2>

                    <div className="space-y-4 items-start">
                      <FormField
                        control={form.control}
                        name="residencePermitType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Residence Permit Type</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a permit type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {permitTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
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
                        name="residencePermitNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Residence Permit Number</FormLabel>
                            <FormControl>
                              <Input
                                className="uppercase placeholder:capitalize"
                                placeholder="Residence Permit Number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="residencePermitExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Residence Permit Expiry</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                </motion.div>

                {/* Vehicle Information */}
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
                      6. Vehicle Information
                    </h2>

                    <div className="space-y-4 items-start">
                      <FormField
                        control={form.control}
                        name="vehicleType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Type</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a vehicle type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "BICYCLE",
                                    "E-BIKE",
                                    "SCOOTER",
                                    "MOTORBIKE",
                                    "CAR",
                                  ].map((vehicleType) => (
                                    <SelectItem
                                      key={vehicleType}
                                      value={vehicleType}
                                    >
                                      {vehicleType[0] +
                                        vehicleType.slice(1).toLowerCase()}
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
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                              <Input placeholder="Brand" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model</FormLabel>
                            <FormControl>
                              <Input placeholder="Model" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="licensePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Plate</FormLabel>
                            <FormControl>
                              <Input
                                className="uppercase placeholder:capitalize"
                                placeholder="License Plate"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="drivingLicenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Driving License Number</FormLabel>
                            <FormControl>
                              <Input
                                className="uppercase placeholder:capitalize"
                                placeholder="Driving License Number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="drivingLicenseExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Driving License Expiry</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="insurancePolicyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Policy Number</FormLabel>
                            <FormControl>
                              <Input
                                className="uppercase placeholder:capitalize"
                                placeholder="Insurance Policy Number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="insuranceExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Expiry</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                </motion.div>

                {/* Criminal Record Status */}
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
                      7. Criminal Record Status
                    </h2>

                    <div className="space-y-4 items-start">
                      <FormField
                        control={form.control}
                        name="haveCriminalRecordCertificate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Have Criminal Record Certificate?
                            </FormLabel>
                            <FormControl>
                              <FormLabel
                                htmlFor="haveCriminalRecordCertificate"
                                className="text-sm text-gray-700 flex items-center"
                              >
                                <Input
                                  type="checkbox"
                                  id="haveCriminalRecordCertificate"
                                  checked={!!field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                Yes
                              </FormLabel>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="issueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                </motion.div>

                {/* Work Preferences and Equipments */}
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
                      8. Work Preferences and Equipments
                    </h2>

                    <div className="space-y-4 items-start">
                      <div className="space-y-2">
                        <Label className="">Preferred Working Zones</Label>
                        {watchZones?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-1">
                            {watchZones?.map((zone) => (
                              <motion.div
                                key={zone}
                                initial={{
                                  scale: 0,
                                }}
                                animate={{
                                  scale: 1,
                                }}
                                className="flex items-center bg-[#DC3173] bg-opacity-10 text-white px-3 py-1 rounded-full"
                              >
                                <span>{zone}</span>
                                <button
                                  type="button"
                                  onClick={() => removeZone(zone)}
                                  className="ml-2 text-white hover:text-[#CCC]"
                                >
                                  <XIcon className="h-4 w-4" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        <FormField
                          control={form.control}
                          name="preferredZones"
                          render={() => (
                            <FormItem className="gap-1">
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="text"
                                    value={zone}
                                    onChange={(e) => setZone(e.target.value)}
                                    placeholder="Add a zone"
                                    onKeyUp={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addZone();
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={addZone}
                                    className="bg-[#DC3173] text-white px-4 py-2 rounded-e-md hover:bg-[#B02458] transition-colors absolute top-0 right-0 h-full"
                                  >
                                    <PlusIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="preferredHours"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>Preferred Working Hours</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange([value])
                                }
                                value={field.value?.[0]}
                              >
                                <SelectTrigger
                                  className={cn(
                                    "w-full ",
                                    fieldState.invalid
                                      ? "border-red-500"
                                      : "border-gray-300",
                                  )}
                                >
                                  <SelectValue placeholder="Select Preferred Hours" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="morning">
                                    Morning (8AM-12PM)
                                  </SelectItem>
                                  <SelectItem value="afternoon">
                                    Afternoon (12PM-6PM)
                                  </SelectItem>
                                  <SelectItem value="evening">
                                    Evening (6PM-10PM)
                                  </SelectItem>
                                  <SelectItem value="night">
                                    Night (10PM-12AM)
                                  </SelectItem>
                                  <SelectItem value="fullday">
                                    Full Day
                                  </SelectItem>
                                  <SelectItem value="flexible">
                                    Flexible
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4 items-start">
                        <Label className="">Delivery equipments</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {equipment.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name={
                                item.id as
                                  | "isothermalBag"
                                  | "helmet"
                                  | "powerBank"
                              }
                              render={({ field }) => (
                                <FormItem className="content-start">
                                  <FormControl>
                                    <FormLabel
                                      htmlFor={item.id}
                                      className="text-sm text-gray-700 flex items-center"
                                    >
                                      <Input
                                        type="checkbox"
                                        id={item.id}
                                        checked={!!field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4"
                                      />
                                      {item.label}
                                    </FormLabel>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="workedWithOtherPlatform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Worked With Other Platforms</FormLabel>
                            <FormControl>
                              <FormLabel
                                htmlFor="workedWithOtherPlatform"
                                className="text-sm text-gray-700 flex items-center"
                              >
                                <Input
                                  type="checkbox"
                                  id="workedWithOtherPlatform"
                                  checked={!!field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                                Yes
                              </FormLabel>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="otherPlatformName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Other Platform Name (If Applicable)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Other Platform Name"
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
                      9. {t("documents_nd_verification")}
                    </h2>

                    <UploadPartnerDocuments partnerId={partnerId} />
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* SUBMIT BUTTON */}
        {partnerId && (
          <div className="mt-10 flex justify-end">
            <Button
              className="px-8 py-2 text-white"
              style={{ background: DELIGO }}
            >
              Add Delivery Partner
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
