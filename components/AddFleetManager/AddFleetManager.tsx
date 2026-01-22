"use client";

import UploadFleetManagerDocuments from "@/components/AddFleetManager/UploadFleetManagerDocuments";
import BusinessLocationMap from "@/components/BusinessLocationMap/BusinessLocationMap";
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
import { useTranslation } from "@/hooks/use-translation";
import { resendOtpReq, verifyOtpReq } from "@/services/auth/OTP";
import {
  registerFleetManagerandSendOtpReq,
  updateFleetManagerDataReq,
} from "@/services/dashboard/add-fleet-manager/add-fleet-manager";
import { TResponse } from "@/types";
import { TAgent } from "@/types/user.type";
import { formatTime } from "@/utils/formatTime";
import { addFleetManagerValidation } from "@/validations/add-fleet-manager/add-fleet-manager.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Banknote,
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Mail,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";
import z from "zod";

const DELIGO = "#DC3173";

type TFleetManagerForm = z.infer<typeof addFleetManagerValidation>;

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export default function AddFleetManager() {
  const { t } = useTranslation();
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fleetManagerId, setFleetManagerId] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [timer, setTimer] = useState(300);
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });

  const form = useForm<TFleetManagerForm>({
    resolver: zodResolver(addFleetManagerValidation),
    defaultValues: {
      firstName: "",
      lastName: "",
      prefixPhoneNumber: "",
      phoneNumber: "",
      businessName: "",
      businessLicenseNumber: "",
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
        }
      );

    try {
      const result = await registerFleetManagerandSendOtpReq({
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "OTP send failed", {
        id: toastId,
      });
    }
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
    try {
      const result = await verifyOtpReq({
        email,
        otp,
      });

      if (result.success) {
        toast.success(result.message || "OTP verified successfully!", {
          id: toastId,
        });
        setFleetManagerId(result.data as string);
        setEmailVerified(true);
        return;
      }

      toast.error(result.message || "OTP verification failed", { id: toastId });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "OTP verification failed", {
        id: toastId,
      });
    }
  };

  const onSubmit = async (data: TFleetManagerForm) => {
    const toastId = toast.loading("Adding fleet manager...");

    try {
      const fleetManagerData = {
        name: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        contactNumber: data.phoneNumber,
        businessDetails: {
          businessName: data.businessName,
          businessLicenseNumber: data.businessLicenseNumber?.toUpperCase(),
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
      } as Partial<TAgent>;

      const result = await updateFleetManagerDataReq(
        fleetManagerId,
        fleetManagerData
      );

      if (result.success) {
        form.reset();
        toast.success(result.message || "Fleet manager added successfully!", {
          id: toastId,
        });
        return;
      }

      toast.error(result.message || "Fleet manager add failed", {
        id: toastId,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to add fleet manager",
        {
          id: toastId,
        }
      );
    }
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
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold mb-6 flex items-center gap-3"
        >
          <Store className="w-8 h-8 text-slate-800" /> {t("add_new_fleet_manager")}
        </motion.h1>

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
                        placeholder={t("fleet_manager_email")}
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
                          <BadgeCheck className="w-4 h-4 mr-2" /> {t("verify_otp")}
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
                                  ""
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
              {fleetManagerId && (
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
                                <Input placeholder={t('business_name')} {...field} />
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
                              <FormLabel>{t("business_license_number")}</FormLabel>
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
                        <Banknote className="w-5 h-5" /> 3. {t("bank_nd_payment_information")}
                      </h2>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("bank_name")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("bank_name")} {...field} />
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
                                <Input placeholder={t("swift_code")} {...field} />
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
            {fleetManagerId && (
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
                      {/* <Banknote className="w-5 h-5" /> 4. Bank & Payment
                      Information */}
                      <Banknote className="w-5 h-5" /> 4. {t("business_location_information")}
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
                      <FileText className="w-5 h-5" /> 5. {t("documents_nd_verification")}
                    </h2>

                    <UploadFleetManagerDocuments
                      fleetManagerId={fleetManagerId}
                    />
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* SUBMIT BUTTON */}
        {fleetManagerId && (
          <div className="mt-10 flex justify-end">
            <Button
              className="px-8 py-2 text-white"
              style={{ background: DELIGO }}
            >
              {t("submit_fleetManager")}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
