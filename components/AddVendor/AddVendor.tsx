"use client";

import UploadVendorDocuments from "@/components/AddVendor/UploadVendorDocuments";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  registerVendorandSendOtpReq,
  updateVendorDataReq,
  verifyOtpReq,
} from "@/services/dashboard/add-vendor/add-vendor";
import { TBusinessCategory } from "@/types/category.type";
import { TVendor } from "@/types/user.type";
import { addVendorValidation } from "@/validations/add-vendor/add-vendor.validation";
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
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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

export default function AddVendor({
  businessCategories,
}: {
  businessCategories: TBusinessCategory[];
}) {
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });

  const form = useForm<TVendorForm>({
    resolver: zodResolver(addVendorValidation),
    defaultValues: {
      firstName: "",
      lastName: "",
      prefixPhoneNumber: "",
      phoneNumber: "",
      businessName: "",
      businessType: "",
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
      const result = await registerVendorandSendOtpReq({
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
        setVendorId(result.data as string);
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

  const onSubmit = async (data: TVendorForm) => {
    const toastId = toast.loading("Adding vendor...");

    try {
      const vendorData = {
        name: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        contactNumber: data.phoneNumber,
        businessDetails: {
          businessName: data.businessName,
          businessType: data.businessType,
          NIF: (data.NIF as string)?.toUpperCase(),
          businessLicenseNumber: (
            data.businessLicenseNumber as string
          )?.toUpperCase(),
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

      const result = await updateVendorDataReq(vendorId, vendorData);

      if (result.success) {
        toast.success(result.message || "Vendor added successfully!", {
          id: toastId,
        });
        return;
      }

      toast.error(result.message || "Vendor add failed", { id: toastId });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to add vendor", {
        id: toastId,
      });
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
          <Store className="w-8 h-8 text-slate-800" /> Add New Vendor
        </motion.h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Section - Registration Data */}
          <div className="space-y-8">
            {/* Account Information */}
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
                        <Input
                          placeholder="First Name"
                          {...field}
                          value={field.value as string}
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last Name"
                          {...field}
                          value={field.value as string}
                        />
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
                      placeholder="Vendor Email"
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
                              value={field.value as string}
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
                            value={field.value as string}
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
            <AnimatePresence>
              {vendorId && (
                <>
                  {/* Business Details */}
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.2,
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
                                <Input
                                  placeholder="Business Name"
                                  {...field}
                                  value={field.value as string}
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
                              <FormLabel>Business Type</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value as string}
                                >
                                  <SelectTrigger
                                    className={cn(
                                      "w-full",
                                      fieldState.invalid ? "border-red-500" : ""
                                    )}
                                  >
                                    <SelectValue placeholder="Select Business Type" />
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
                                  value={field.value as string}
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
                              <FormLabel>NIF</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Tax Identification Number"
                                  {...field}
                                  value={field.value as string}
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
                                  Opening Hours
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    placeholder="e.g. 09:00 AM"
                                    {...field}
                                    value={field.value as string}
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
                                  Closing Hours
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    placeholder="e.g. 09:00 AM"
                                    {...field}
                                    value={field.value as string}
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
                                  Closing Days
                                </FormLabel>
                                <div className="flex flex-wrap gap-2">
                                  {daysOfWeek.map((day) => (
                                    <motion.button
                                      key={day}
                                      type="button"
                                      onClick={() => {
                                        field.onChange(
                                          (field.value as string[])?.includes(
                                            day
                                          )
                                            ? (field.value as string[])?.filter(
                                                (d) => d !== day
                                              )
                                            : [
                                                ...(field.value as string[]),
                                                day,
                                              ]
                                        );
                                      }}
                                      whileTap={{ scale: 0.95 }}
                                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                                        (field.value as string[]).includes(day)
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
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      delay: 0.2,
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
                                <Input
                                  placeholder="Bank Name"
                                  {...field}
                                  value={field.value as string}
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
                              <FormLabel>Account Holder Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Account Holder Name"
                                  {...field}
                                  value={field.value as string}
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
                                <Input
                                  placeholder="IBAN"
                                  {...field}
                                  value={field.value as string}
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
                              <FormLabel>Swift Code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Swift Code"
                                  {...field}
                                  value={field.value as string}
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
            {vendorId && (
              <div className="space-y-8">
                {/* Business Location */}
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: 0.4,
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
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: 0.6,
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

                    <UploadVendorDocuments />
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* SUBMIT BUTTON */}
        {vendorId && (
          <div className="mt-10 flex justify-end">
            <Button
              className="px-8 py-2 text-white"
              style={{ background: DELIGO }}
            >
              Submit Vendor
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
