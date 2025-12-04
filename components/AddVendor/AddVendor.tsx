"use client";

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
import { addVendorValidation } from "@/validations/add-vendor/add-vendor.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Banknote,
  CheckCircle,
  FileText,
  Mail,
  Store,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import z from "zod";

const DELIGO = "#DC3173";

type TVendorForm = z.infer<typeof addVendorValidation>;

export default function AddVendor() {
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

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

  function sendOtp() {
    setOtpSent(true);
    setTimeout(() => setEmailVerified(true), 1500);
  }

  const onSubmit = (data: TVendorForm) => {
    console.log(data);
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

              <div className="space-y-4">
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
                    </FormItem>
                  )}
                />

                <div>
                  <Label>Email</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input type="email" placeholder="Vendor Email" />
                    {!otpSent && !emailVerified && (
                      <Button style={{ background: DELIGO }} onClick={sendOtp}>
                        <Mail className="w-4 h-4 mr-2" /> Send OTP
                      </Button>
                    )}
                    {otpSent && !emailVerified && (
                      <Input
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-32"
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
                  <Input type="password" placeholder="Password" />
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

            {/* Business Details */}
            <Card
              className="p-6 shadow-md border-t-4"
              style={{ borderColor: DELIGO }}
            >
              <h2 className="text-xl font-semibold mb-4">
                2. Business Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <Input placeholder="Business Name" />
                </div>

                <div>
                  <Label>Business Type</Label>
                  <Input placeholder="Restaurant / Grocery / Pharmacy" />
                </div>

                <div>
                  <Label>Business License Number</Label>
                  <Input placeholder="License Number" />
                </div>

                <div>
                  <Label>NIF</Label>
                  <Input placeholder="Tax Identification Number" />
                </div>

                <div>
                  <Label>City</Label>
                  <Input placeholder="City" />
                </div>

                <div>
                  <Label>Postal Code</Label>
                  <Input placeholder="Postal Code" />
                </div>

                <div className="md:col-span-2">
                  <Label>Location (Google Maps Link)</Label>
                  <Input placeholder="https://maps.google.com/..." />
                </div>

                <div>
                  <Label>Opening Hours</Label>
                  <Input placeholder="e.g. 09:00 AM" />
                </div>

                <div>
                  <Label>Closing Hours</Label>
                  <Input placeholder="e.g. 10:00 PM" />
                </div>

                <div className="md:col-span-2">
                  <Label>Closing Days</Label>
                  <Input placeholder="e.g. Sunday, Monday" />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Section - Payments + Documents */}
          <div className="space-y-8">
            {/* Bank Details */}
            <Card
              className="p-6 shadow-md border-t-4"
              style={{ borderColor: DELIGO }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Banknote className="w-5 h-5" /> 3. Bank & Payment Information
              </h2>

              <div className="space-y-4">
                <div>
                  <Label>Bank Name</Label>
                  <Input placeholder="Bank Name" />
                </div>

                <div>
                  <Label>Account Holder Name</Label>
                  <Input placeholder="Account Holder" />
                </div>

                <div>
                  <Label>IBAN</Label>
                  <Input placeholder="IBAN" />
                </div>

                <div>
                  <Label>Swift Code</Label>
                  <Input placeholder="Swift Code" />
                </div>
              </div>
            </Card>

            {/* Documents */}
            <Card
              className="p-6 shadow-md border-t-4"
              style={{ borderColor: DELIGO }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> 4. Documents & Verification
              </h2>

              <div className="space-y-4">
                {[
                  "Business License",
                  "Tax Document",
                  "ID Proof",
                  "Store Photo",
                  "Menu Upload",
                ].map((label) => (
                  <div key={label}>
                    <Label>{label}</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Input type="file" className="cursor-pointer" />
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" /> Upload
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-10 flex justify-end">
          <Button
            className="px-8 py-2 text-white"
            style={{ background: DELIGO }}
          >
            Submit Vendor
          </Button>
        </div>
      </form>
    </Form>
  );
}
