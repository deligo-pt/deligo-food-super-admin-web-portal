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
import {
  registerFleetManagerandSendOtpReq,
  updateFleetManagerDataReq,
  verifyOtpReq,
} from "@/services/dashboard/add-fleet-manager/add-fleet-manager";
import { TAgent } from "@/types/user.type";
import { addFleetManagerValidation } from "@/validations/add-fleet-manager/add-fleet-manager.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, CheckCircle, FileText, Mail, Store } from "lucide-react";
import { useState } from "react";
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
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fleetManagerId, setFleetManagerId] = useState("");
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
          <Store className="w-8 h-8 text-slate-800" /> Add New Fleet Manager
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
                  1. Account Information
                </h2>

                <div className="space-y-4 items-start">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First Name" {...field} />
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label>Email</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="email"
                        placeholder="FleetManager Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {!otpSent && !emailVerified && (
                        <Button
                          disabled={!email || !password}
                          type="button"
                          style={{ background: DELIGO }}
                          onClick={sendOtp}
                        >
                          <Mail className="w-4 h-4 mr-2" /> Send OTP
                        </Button>
                      )}
                      {otpSent && !emailVerified && (
                        <Input
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-32"
                          onKeyUp={(e) => e.key === "Enter" && verifyOtp()}
                        />
                      )}
                      {emailVerified && (
                        <span className="text-green-600 flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4" /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2">Password</Label>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Label className="mb-2">Phone Number</Label>
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
                                  placeholder: "Phone Number",
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
                        2. Business Details
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Business Name" {...field} />
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
                              <FormLabel>Business License Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="License Number"
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
                        <Banknote className="w-5 h-5" /> 3. Bank & Payment
                        Information
                      </h2>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Bank Name" {...field} />
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
                              <FormLabel>Account Holder Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Account Holder Name"
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
                              <FormLabel>IBAN</FormLabel>
                              <FormControl>
                                <Input placeholder="IBAN" {...field} />
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
                              <FormLabel>Swift Code</FormLabel>
                              <FormControl>
                                <Input placeholder="Swift Code" {...field} />
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
                      <Banknote className="w-5 h-5" /> 4. Bank & Payment
                      Information
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
                      <FileText className="w-5 h-5" /> 5. Documents &
                      Verification
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
              Submit FleetManager
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
