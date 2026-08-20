/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BusinessLocationMap from "@/components/BusinessLocationMap/BusinessLocationMap";
import UploadVendorDocuments, { REQUIRED_DOCS } from "@/components/Dashboard/Vendors/AddVendor/UploadVendorDocuments";
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
import { useStore } from "@/store/store";
import { TBusinessCategoryResponse } from "@/types/category.type";
import { TCuisine } from "@/types/cuisine.type";
import { TVendorDocKey } from "@/types/document.type";
import { TBusinessLocation, TVendor } from "@/types/user.type";
import { uploadDefaultDocument } from "@/utils/uploadUserDocument";
import { addVendorValidation } from "@/validations/add-vendor/add-vendor.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Briefcase, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";
import z from "zod";

const DELIGO = "#DC3173";
interface IProps {
  businessCategories: TBusinessCategoryResponse[];
  vendor: TVendor;
  cuisines: TCuisine[]
}

type TVendorForm = z.infer<typeof addVendorValidation>;

export default function UpdateVendor({ businessCategories, vendor, cuisines }: IProps) {
  const [vendorState, setVendorState] = useState(vendor);
  const { t } = useTranslation();
  const { lang } = useStore();
  const router = useRouter();
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: vendor.businessLocation?.latitude || 0,
    longitude: vendor.businessLocation?.longitude || 0,
  });
  const [previews, setPreviews] = useState<
    Record<TVendorDocKey, string[] | null>
  >({
    myPhoto: Array.isArray(vendorState?.documents?.myPhoto)
      ? vendorState?.documents?.myPhoto
      : null,
    businessLicenseDoc: Array.isArray(vendorState?.documents?.businessLicenseDoc)
      ? vendorState?.documents?.businessLicenseDoc
      : null,
    taxDoc: Array.isArray(vendorState?.documents?.taxDoc)
      ? vendorState?.documents?.taxDoc
      : null,
    idProofFront: Array.isArray(vendorState?.documents?.idProofFront)
      ? vendorState?.documents?.idProofFront
      : null,
    idProofBack: Array.isArray(vendorState?.documents?.idProofBack)
      ? vendorState?.documents?.idProofBack
      : null,
    storePhoto: Array.isArray(vendorState?.documents?.storePhoto)
      ? vendorState?.documents?.storePhoto
      : null,
    menuUpload: Array.isArray(vendorState?.documents?.menuUpload)
      ? vendorState?.documents?.menuUpload
      : null,
    agoserisHaccpCertificate: Array.isArray(vendorState?.documents?.agoserisHaccpCertificate)
      ? vendorState?.documents?.agoserisHaccpCertificate
      : null,
    ibanProof: Array.isArray(vendorState?.documents?.ibanProof)
      ? vendorState?.documents?.ibanProof
      : null,
  });

  const OPTIONAL_DEFAULTS: TVendorDocKey[] = ["myPhoto", "menuUpload"];

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const form = useForm<TVendorForm>({
    resolver: zodResolver(addVendorValidation),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      businessName: "",
      businessType: "",
      restaurantCuisineType: [],
      NIF: "",
      branches: "1",
      openingHours: "",
      closingHours: "",
      closingDays: [],
      street: "",
      city: "",
      postalCode: "",
      country: "",
      latitude: 0,
      longitude: 0,
      // bankName: "",
      accountHolderName: "",
      iban: "",
      // swiftCode: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const businessType = useWatch({
    control: form.control,
    name: "businessType",
  });

  useEffect(() => {
    // for before only string type is catching for converting to array of string and for valid types
    const rawCuisineData = vendor?.businessDetails?.restaurantCuisineType;
    let normalizedCuisines: string[] = [];

    if (rawCuisineData) {
      normalizedCuisines = Array.isArray(rawCuisineData) ? rawCuisineData : [rawCuisineData];
    }

    const cuisineSlugs = normalizedCuisines.map((storedName) => {
      const cuisine = cuisines?.find(
        (c) => c.name?.[lang] === storedName
      );

      return cuisine?.slug;
    })
      .filter(Boolean) as string[];

    form.reset({
      firstName: vendor.name?.firstName || "",
      lastName: vendor.name?.lastName || "",
      phoneNumber: vendor?.contactNumber || "",
      businessName: vendor.businessDetails?.businessName || "",
      businessType: vendor?.businessDetails?.businessTypeSlug || "",
      restaurantCuisineType: cuisineSlugs,
      NIF: vendor?.businessDetails?.NIF || "",
      branches:
        vendor?.businessDetails?.totalBranches?.toString() || "1",
      openingHours: vendor?.businessDetails?.openingHours || "",
      closingHours: vendor?.businessDetails?.closingHours || "",
      closingDays: vendor?.businessDetails?.closingDays || [],
      street: vendor?.businessLocation?.street || "",
      city: vendor?.businessLocation?.city || "",
      postalCode: vendor?.businessLocation?.postalCode || "",
      country: vendor?.businessLocation?.country || "",
      latitude: vendor?.businessLocation?.latitude ?? 0,
      longitude: vendor?.businessLocation?.longitude ?? 0,
      // bankName: vendor?.bankDetails?.bankName || "",
      accountHolderName:
        vendor?.bankDetails?.accountHolderName || "",
      iban: vendor?.bankDetails?.iban || "",
      // swiftCode: vendor?.bankDetails?.swiftCode || "",
    });
  }, [vendor, form, cuisines, lang]);

  const onSubmit = async (data: TVendorForm) => {
    const toastId = toast.loading("Updating vendor data...");

    try {
      // Fill in defaults for any optional doc the user skipped
      for (const key of OPTIONAL_DEFAULTS) {
        if (!previews[key] || previews[key]!.length === 0) {
          await uploadDefaultDocument(key, vendor?.userId);
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to set default documents",
        { id: toastId }
      );
      console.log(err);
      return;
    }

    // Helper to check if a value really changed
    const hasChanged = (current: any, original: any) => {
      if (Array.isArray(current) || Array.isArray(original)) {
        return JSON.stringify(current || []) !== JSON.stringify(original || []);
      }
      return current !== original;
    };

    const vendorData: Record<string, any> = {};

    // name
    const originalFirstName = vendor?.name?.firstName || "";
    const originalLastName = vendor?.name?.lastName || "";

    if (
      hasChanged(data.firstName, originalFirstName) ||
      hasChanged(data.lastName, originalLastName)
    ) {
      vendorData.name = {};
      if (hasChanged(data.firstName, originalFirstName)) {
        vendorData.name.firstName = data.firstName;
      }
      if (hasChanged(data.lastName, originalLastName)) {
        vendorData.name.lastName = data.lastName;
      }
    }

    // contactNumber
    if (hasChanged(data.phoneNumber, vendor?.contactNumber || "")) {
      vendorData.contactNumber = data.phoneNumber;
    }

    // businessDetails
    const originalBusinessName = vendor?.businessDetails?.businessName || "";
    const originalBusinessType = vendor?.businessDetails?.businessTypeSlug || ""; // ← use slug
    const originalNIF = vendor?.businessDetails?.NIF || "";
    const originalBranches = vendor?.businessDetails?.totalBranches ?? 0;
    const originalOpeningHours = vendor?.businessDetails?.openingHours || "";
    const originalClosingHours = vendor?.businessDetails?.closingHours || "";
    const originalClosingDays = vendor?.businessDetails?.closingDays || [];

    // Normalize original cuisine the same way the form does (to slugs)
    const rawCuisineData = vendor?.businessDetails?.restaurantCuisineType;
    let originalCuisineSlugs: string[] = [];

    if (rawCuisineData) {
      const normalized = Array.isArray(rawCuisineData)
        ? rawCuisineData
        : [rawCuisineData];

      originalCuisineSlugs = normalized
        .map((storedName) => {
          const cuisine = cuisines?.find((c) => c.name?.[lang] === storedName);
          return cuisine?.slug;
        })
        .filter(Boolean) as string[];
    }

    const businessDetailsChanged =
      hasChanged(data.businessName, originalBusinessName) ||
      hasChanged(data.businessType, originalBusinessType) ||
      hasChanged(data.restaurantCuisineType, originalCuisineSlugs) || // ← now both are slug arrays
      hasChanged(data.NIF?.toUpperCase(), originalNIF) ||
      hasChanged(Number(data.branches), originalBranches) ||
      hasChanged(data.openingHours, originalOpeningHours) ||
      hasChanged(data.closingHours, originalClosingHours) ||
      hasChanged(data.closingDays, originalClosingDays);

    if (businessDetailsChanged) {
      vendorData.businessDetails = {};

      if (hasChanged(data.businessName, originalBusinessName)) {
        vendorData.businessDetails.businessName = data.businessName;
      }
      if (hasChanged(data.businessType, originalBusinessType)) {
        vendorData.businessDetails.businessType = data.businessType;
      }
      if (
        data.businessType === "restaurant" &&
        hasChanged(data.restaurantCuisineType, originalCuisineSlugs)
      ) {
        vendorData.businessDetails.restaurantCuisineType =
          data.restaurantCuisineType;
      }
      if (hasChanged(data.NIF?.toUpperCase(), originalNIF)) {
        vendorData.businessDetails.NIF = data.NIF?.toUpperCase();
      }
      if (hasChanged(Number(data.branches), originalBranches)) {
        vendorData.businessDetails.totalBranches = Number(data.branches);
      }
      if (hasChanged(data.openingHours, originalOpeningHours)) {
        vendorData.businessDetails.openingHours = data.openingHours;
      }
      if (hasChanged(data.closingHours, originalClosingHours)) {
        vendorData.businessDetails.closingHours = data.closingHours;
      }
      if (hasChanged(data.closingDays, originalClosingDays)) {
        vendorData.businessDetails.closingDays = data.closingDays;
      }
    }

    // businessLocation
    const originalStreet = vendor?.businessLocation?.street || "";
    const originalCity = vendor?.businessLocation?.city || "";
    const originalPostalCode = vendor?.businessLocation?.postalCode || "";
    const originalCountry = vendor?.businessLocation?.country || "";
    const originalLat = vendor?.businessLocation?.latitude;
    const originalLng = vendor?.businessLocation?.longitude;

    const locationChanged =
      hasChanged(data.street, originalStreet) ||
      hasChanged(data.city, originalCity) ||
      hasChanged(data.postalCode, originalPostalCode) ||
      hasChanged(data.country, originalCountry) ||
      hasChanged(locationCoordinates.latitude, originalLat) ||
      hasChanged(locationCoordinates.longitude, originalLng);

    if (locationChanged) {
      vendorData.businessLocation = {};

      if (hasChanged(data.street, originalStreet)) {
        vendorData.businessLocation.street = data.street;
      }
      if (hasChanged(data.city, originalCity)) {
        vendorData.businessLocation.city = data.city;
      }
      if (hasChanged(data.postalCode, originalPostalCode)) {
        vendorData.businessLocation.postalCode = data.postalCode;
      }
      if (hasChanged(data.country, originalCountry)) {
        vendorData.businessLocation.country = data.country;
      }
      if (hasChanged(locationCoordinates.latitude, originalLat)) {
        vendorData.businessLocation.latitude = locationCoordinates.latitude;
      }
      if (hasChanged(locationCoordinates.longitude, originalLng)) {
        vendorData.businessLocation.longitude = locationCoordinates.longitude;
      }
    }

    // bankDetails
    const originalAccountHolder =
      vendor?.bankDetails?.accountHolderName || "";
    const originalIban = vendor?.bankDetails?.iban || "";

    if (
      hasChanged(data.accountHolderName, originalAccountHolder) ||
      hasChanged(data.iban, originalIban)
    ) {
      vendorData.bankDetails = {};

      if (hasChanged(data.accountHolderName, originalAccountHolder)) {
        vendorData.bankDetails.accountHolderName = data.accountHolderName;
      }
      if (hasChanged(data.iban, originalIban)) {
        vendorData.bankDetails.iban = data.iban;
      }
    }

    // final check
    const hasAnyChange = Object.keys(vendorData).length > 0;
    console.log("has changed", vendorData);

    if (!hasAnyChange) {
      toast.info("No changes detected", { id: toastId });
      return;
    }

    const updatedResult = await updateUserDataReq(
      `/vendors/${vendor.userId}`,
      vendorData
    );

    if (updatedResult.success) {
      router.back();
      setVendorState((prev) => ({
        ...prev,
        ...vendorData,
      }));

      if (vendor.status !== USER_STATUS.APPROVED) {
        const approveResult = await approveOrRejectReq(vendor.userId, {
          status: USER_STATUS.APPROVED,
        });

        if (approveResult.success) {
          form.reset();
          router.refresh();
          toast.success(
            approveResult.message || "Vendor updated successfully!",
            { id: toastId }
          );
          return;
        }

        toast.error(approveResult.message || "Vendor update failed", {
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

    toast.error(updatedResult.message || "Vendor update failed", {
      id: toastId,
    });
  };

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
    <>
      <TitleHeader
        title={t("edit_vendor_details")}
        subtitle={t("update_vendor_details_information")}
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
                          <FormLabel>{t("first_name")} {vendor.userId && <span className="text-[#DC3173]">*</span>}</FormLabel>
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
                          <FormLabel>{t("last_name")} {vendor.userId && <span className="text-[#DC3173]">*</span>}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("last_name")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label>{t("email")} <span className="text-[#DC3173]">*</span></Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Input
                          type="email"
                          placeholder={t("vendor_email")}
                          value={vendorState.email}
                          disabled
                        />
                      </div>
                    </div>

                    <Label className="mb-2">{t("phone_number")} <span className="text-[#DC3173]">*</span></Label>
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
                                <FormLabel>{t("business_name")} <span className="text-[#DC3173]">*</span></FormLabel>
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
                                <FormLabel>{t("business_type")} <span className="text-[#DC3173]">*</span></FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={(value) => field.onChange(value)}
                                    value={field.value || vendorState.businessDetails?.businessTypeSlug || undefined}
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
                                <FormLabel>{t("nif")} <span className="text-[#DC3173]">*</span></FormLabel>
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

                          {/* if business type is restaurant */}
                          {businessType === "restaurant" && (
                            <FormField
                              control={form.control}
                              name="restaurantCuisineType"
                              render={({ field, fieldState }) => {
                                const selectedCuisines = Array.isArray(field.value) ? field.value : [];
                                const getCuisineName = (slug: string) => cuisines?.find((c) => c.slug === slug)?.name?.[lang] ?? slug;

                                // remove cuisine
                                const handleRemoveCuisine = (cuisineToRemove: string) => {
                                  const updatedCuisines = selectedCuisines.filter(
                                    (item) => item !== cuisineToRemove
                                  );
                                  field.onChange(updatedCuisines);
                                };

                                // add cuisine
                                const handleSelectCuisine = (cuisineToAdd: string) => {
                                  if (!selectedCuisines.includes(cuisineToAdd)) {
                                    field.onChange([...selectedCuisines, cuisineToAdd]);
                                  }
                                };

                                return (
                                  <FormItem className="col-span-2">
                                    <FormLabel className="mb-2 block text-sm font-medium text-gray-700">
                                      {t("restaurantCuisineType")} <span className="text-red-500">*</span>
                                    </FormLabel>

                                    {/* 4. Display Selected Badges ABOVE the Select Dropdown */}
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
                                              onClick={() => handleRemoveCuisine(slug)}
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
                                          onValueChange={handleSelectCuisine}
                                        >
                                          <SelectTrigger
                                            className={cn(
                                              "pl-11 pr-4 h-12 w-full bg-white/90 text-gray-700 shadow-sm focus-visible:ring-2 focus-visible:ring-[#DC3173]/70 hover:shadow-md transition-all cursor-pointer",
                                              fieldState.invalid ? "border-destructive focus-visible:ring-destructive/20" : "border-gray-300"
                                            )}
                                            style={{ height: "3rem" }}
                                          >
                                            <SelectValue placeholder="Select Multiple Cuisine" />
                                          </SelectTrigger>

                                          <SelectContent>
                                            {cuisines?.length < 1 ? (
                                              <div className="p-2 text-sm text-gray-500">
                                                {t("no_items_found")}
                                              </div>
                                            ) : (
                                              cuisines?.map((type, idx) => {
                                                const isAlreadySelected = selectedCuisines.includes(type?.slug);
                                                return (
                                                  <SelectItem
                                                    key={idx}
                                                    value={type?.slug}
                                                    className="capitalize"
                                                    disabled={isAlreadySelected}
                                                  >
                                                    {type?.name?.[lang]} {isAlreadySelected && "✓"}
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
                                <FormLabel>{t("total_branches")} <span className="text-[#DC3173]">*</span></FormLabel>
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
                                    {t("opening_hours")} <span className="text-[#DC3173]">*</span>
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
                                    {t("closing_hours")} <span className="text-[#DC3173]">*</span>
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
                                    {daysOfWeek.map((day) => {
                                      const isSelected = field.value?.includes(day) ?? false;

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
                          {/* <FormField
                            control={form.control}
                            name="bankName"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel>{t("bank_name")} <span className="text-[#DC3173]">*</span></FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value || vendor?.bankDetails?.bankName || "undefined"}>
                                    <SelectTrigger
                                      className={cn(
                                        "w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#DC3173] focus:border-[#DC3173] outline-none transition-all",
                                        fieldState.invalid
                                          ? "border-red-500"
                                          : "border-gray-300",
                                      )}
                                    >
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {bankNames.map((value) => (
                                        <SelectItem key={value} value={value}>
                                          {value}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          /> */}

                          <FormField
                            control={form.control}
                            name="accountHolderName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("account_holder_name")} <span className="text-[#DC3173]">*</span>
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
                                <FormLabel>{t("iban")} <span className="text-[#DC3173]">*</span></FormLabel>
                                <FormControl>
                                  <Input placeholder={t("iban")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* <FormField
                            control={form.control}
                            name="swiftCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("swift_code")} <span className="text-[#DC3173]">*</span></FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("swift_code")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          /> */}
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
                        businessLocation={vendorState.businessLocation as TBusinessLocation}
                        setLocationCoordinates={setLocationCoordinates}
                        t={t}

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
                        vendor={vendor}
                        businessType={businessType}
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

          {/* SUBMIT BUTTON */}
          {vendor.userId && (
            <div className="mt-10 flex justify-end">
              <Button
                className="px-8 py-2 text-white"
                style={{ background: DELIGO }}
                disabled={isSubmitDisabled}
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
