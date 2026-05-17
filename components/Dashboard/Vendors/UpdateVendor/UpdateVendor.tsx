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
import { USER_STATUS } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { approveOrRejectReq } from "@/services/auth/approve-or-reject.service";
import { updateUserDataReq } from "@/services/auth/register-user.service";
import { TBusinessCategory } from "@/types/category.type";
import { TVendorDocKey } from "@/types/document.type";
import { TVendor } from "@/types/user.type";
import { addVendorValidation } from "@/validations/add-vendor/add-vendor.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
// import parsePhoneNumberFromString from "libphonenumber-js";
import { Banknote, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";
import z from "zod";

const DELIGO = "#DC3173";
interface IProps {
  businessCategories: TBusinessCategory[];
  vendor: TVendor;
}

type TVendorForm = z.infer<typeof addVendorValidation>;

export default function UpdateVendor({ businessCategories, vendor }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: vendor.businessLocation?.latitude || 0,
    longitude: vendor.businessLocation?.longitude || 0,
  });
  const [previews, setPreviews] = useState<
    Record<TVendorDocKey, string[] | null>
  >({
    businessLicenseDoc: Array.isArray(vendor?.documents?.businessLicenseDoc)
      ? vendor?.documents?.businessLicenseDoc
      : null,
    taxDoc: Array.isArray(vendor?.documents?.taxDoc)
      ? vendor?.documents?.taxDoc
      : null,
    idProofFront: Array.isArray(vendor?.documents?.idProofFront)
      ? vendor?.documents?.idProofFront
      : null,
    idProofBack: Array.isArray(vendor?.documents?.idProofBack)
      ? vendor?.documents?.idProofBack
      : null,
    storePhoto: Array.isArray(vendor?.documents?.storePhoto)
      ? vendor?.documents?.storePhoto
      : null,
    menuUpload: Array.isArray(vendor?.documents?.menuUpload)
      ? vendor?.documents?.menuUpload
      : null,
  });
  const daysOfWeek = [
    t("sunday"),
    t("monday"),
    t("tuesday"),
    t("wednesday"),
    t("thursday"),
    t("friday"),
    t("saturday"),
  ];

  const form = useForm<TVendorForm>({
    resolver: zodResolver(addVendorValidation),
    defaultValues: {
      firstName: vendor.name?.firstName || "",
      lastName: vendor.name?.lastName || "",
      // prefixPhoneNumber: phone?.countryCallingCode
      //   ? `+${phone?.countryCallingCode}`
      //   : "+351",
      phoneNumber: vendor?.contactNumber || "",
      businessName: vendor.businessDetails?.businessName || "",
      businessType: vendor.businessDetails?.businessType || "",
      businessLicenseNumber:
        vendor.businessDetails?.businessLicenseNumber || "",
      NIF: vendor.businessDetails?.NIF || "",
      branches: vendor.businessDetails?.totalBranches?.toString() || "1",
      openingHours: vendor.businessDetails?.openingHours || "",
      closingHours: vendor.businessDetails?.closingHours || "",
      closingDays: vendor.businessDetails?.closingDays || [],
      street: vendor.businessLocation?.street || "",
      city: vendor.businessLocation?.city || "",
      postalCode: vendor.businessLocation?.postalCode || "",
      country: vendor.businessLocation?.country || "",
      bankName: vendor.bankDetails?.bankName || "",
      accountHolderName: vendor.bankDetails?.accountHolderName || "",
      iban: vendor.bankDetails?.iban || "",
      swiftCode: vendor.bankDetails?.swiftCode || "",
    },
  });

  const onSubmit = async (data: TVendorForm) => {
    const toastId = toast.loading("Updating vendor data...");

    const vendorData = {
      name: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      contactNumber: data.phoneNumber,
      businessDetails: {
        businessName: data.businessName,
        businessType: data.businessType,
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
      `/vendors/${vendor.userId}`,
      vendorData,
    );

    if (updatedResult.success) {
      if (vendor.status !== USER_STATUS.APPROVED) {
        const approveResult = await approveOrRejectReq(vendor.userId, {
          status: USER_STATUS.APPROVED,
        });

        if (approveResult.success) {
          form.reset();
          router.refresh();
          toast.success(
            approveResult.message || "Vendor updated successfully!",
            {
              id: toastId,
            },
          );
          return;
        }

        toast.error(approveResult.message || "Vendor updated failed", {
          id: toastId,
        });
        console.log(approveResult);
        return;
      }

      form.reset();
      toast.success(updatedResult.message || "Vendor updated successfully!", {
        id: toastId,
      });
      router.refresh();
      return;
    }

    toast.error(updatedResult.message || "Vendor updated failed", {
      id: toastId,
    });
    console.log(updatedResult);
  };

  useEffect(() => {
    const currentPhone = form.getValues("phoneNumber");
    if (!currentPhone) {
      form.setValue("phoneNumber", "+351", { shouldValidate: true });
    }
  }, [form]);

  return (
    <>
      <TitleHeader
        title="Edit Vendor Details"
        subtitle="Update vendor details and information"
        onBackClick={() => router.back()}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="min-h-screen bg-slate-50"
        >
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
                          value={vendor.email}
                          disabled
                        />
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
              </motion.div>
              <AnimatePresence>
                {vendor.userId && (
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
                                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                                          field.value.includes(day)
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
                                <FormLabel>
                                  {t("account_holder_name")}
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
              {vendor.userId && (
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
                        businessLocation={vendor.businessLocation}
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
                        vendorId={vendor.userId}
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
          {vendor.userId && (
            <div className="mt-10 flex justify-end">
              <Button
                className="px-8 py-2 text-white"
                style={{ background: DELIGO }}
              >
                {t("submit_vendor")}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </>
  );
}
