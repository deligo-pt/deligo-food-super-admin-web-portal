/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BusinessLocationMap from "@/components/BusinessLocationMap/BusinessLocationMap";
import UploadPartnerDocuments, { BASE_REQUIRED_DOCS, DocKey } from "@/components/Dashboard/DeliveryPartners/AddDeliveryPartner/UploadPartnerDocuments";
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
import { bankNames } from "@/consts/bankNames.const";
import { USER_STATUS } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { submitForApproval, updateUserDataReq } from "@/services/auth/register-user.service";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TFilePreview, TPartnerDocKey } from "@/types/document.type";
import { TBusinessLocation } from "@/types/user.type";
import { getTodayDateString } from "@/utils/formatTime";
import { deliveryPartnerValidation } from "@/validations/delivery-partner/delivery-partner.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { PlusIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";
import z from "zod";

const DELIGO = "#DC3173";

type TDeliveryPartnerForm = z.infer<typeof deliveryPartnerValidation>;

const permitTypes = [
  "Temporary Residence",
  "Permanent Residence",
  "EU Citizen",
  "Passport",
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

const generateFilePreview = (url: string | undefined): TFilePreview | null => {
  if (!url) return null;

  return {
    file: null,
    url,
    isImage: url.includes("image"),
  };
};

export default function UpdateDeliveryPartner({
  partner,
}: {
  partner: TDeliveryPartner;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [zone, setZone] = useState("");
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [previews, setPreviews] = useState<
    Record<TPartnerDocKey, TFilePreview | null>
  >({
    myPhoto: generateFilePreview(partner?.documents?.myPhoto),
    idProofFront: generateFilePreview(partner?.documents?.idProofFront),
    idProofBack: generateFilePreview(partner?.documents?.idProofBack),
    drivingLicenseFront: generateFilePreview(
      partner?.documents?.drivingLicenseFront,
    ),

    drivingLicenseBack: generateFilePreview(
      partner?.documents?.drivingLicenseBack,
    ),
    vehicleRegistration: generateFilePreview(
      partner?.documents?.vehicleRegistration,
    ),
    criminalRecordCertificate: generateFilePreview(
      partner?.documents?.criminalRecordCertificate,
    ),
    activity: generateFilePreview(partner?.documents?.activity),
    insurancePolicy: generateFilePreview(partner?.documents?.insurancePolicy),
  });

  const form = useForm<TDeliveryPartnerForm>({
    resolver: zodResolver(deliveryPartnerValidation),
    defaultValues: {
      firstName: partner.name?.firstName || "",
      lastName: partner.name?.lastName || "",
      phoneNumber: partner?.contactNumber || "",
      dateOfBirth: partner.personalInfo?.dateOfBirth
        ? format(new Date(partner.personalInfo?.dateOfBirth), "yyyy-MM-dd")
        : "",
      gender: partner.personalInfo?.gender || "MALE",
      nationality: partner.personalInfo?.nationality || "",
      nifNumber: partner.personalInfo?.NIF || "",
      // passportNumber: partner.personalInfo?.passportNumber || "",
      street: partner.address?.street || "",
      city: partner.address?.city || "",
      postalCode: partner.address?.postalCode || "",
      country: partner.address?.country || "",
      latitude: partner?.address?.latitude || 0,
      longitude: partner?.address?.longitude || 0,
      vehicleType: partner.vehicleInfo?.vehicleType || "SCOOTER",
      brand: partner.vehicleInfo?.brand || "",
      model: partner.vehicleInfo?.model || "",
      licensePlate: partner.vehicleInfo?.licensePlate || "",
      drivingLicenseNumber: partner.vehicleInfo?.drivingLicenseNumber || "",
      drivingLicenseExpiry: partner.vehicleInfo?.drivingLicenseExpiry
        ? format(partner.vehicleInfo?.drivingLicenseExpiry, "yyyy-MM-dd")
        : "",
      insurancePolicyNumber: partner.vehicleInfo?.insurancePolicyNumber || "",
      insuranceExpiry: partner.vehicleInfo?.insuranceExpiry
        ? format(partner.vehicleInfo?.insuranceExpiry, "yyyy-MM-dd")
        : "",
      bankName: partner.bankDetails?.bankName || "",
      accountHolderName: partner.bankDetails?.accountHolderName || "",
      iban: partner.bankDetails?.iban || "",
      swiftCode: partner.bankDetails?.swiftCode || "",
      preferredZones: partner.workPreferences?.preferredZones || [],
      preferredHours: partner.workPreferences?.preferredHours || [],
      isothermalBag:
        partner.workPreferences?.hasEquipment?.isothermalBag || false,
      helmet: partner.workPreferences?.hasEquipment?.helmet || false,
      powerBank: partner.workPreferences?.hasEquipment?.powerBank || false,
      workedWithOtherPlatform:
        partner.workPreferences?.workedWithOtherPlatform || false,
      otherPlatformName: partner.workPreferences?.otherPlatformName || "",
      residencePermitType: partner.legalStatus?.residencePermitType || "",
      residencePermitNumber: partner.legalStatus?.residencePermitNumber || "",
      residencePermitExpiry: partner.legalStatus?.residencePermitExpiry
        ? format(partner.legalStatus?.residencePermitExpiry, "yyyy-MM-dd")
        : "",
      haveCriminalRecordCertificate:
        partner.criminalRecord?.certificate || true,
      issueDate: partner.criminalRecord?.issueDate
        ? format(partner.criminalRecord?.issueDate, "yyyy-MM-dd")
        : "",
      expiryDate: partner.criminalRecord?.expiryDate
        ? format(partner.criminalRecord?.expiryDate, "yyyy-MM-dd")
        : "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const [watchZones, vehicleType, haveCriminalRecordCertificate, residencePermitType] = useWatch({
    control: form.control,
    name: ["preferredZones", "vehicleType", "haveCriminalRecordCertificate", "residencePermitType"],
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

  const onSubmit = async (data: TDeliveryPartnerForm) => {
    const toastId = toast.loading("Updating partner...");

    const isMotorVehicle = (
      type: typeof data.vehicleType
    ): type is "CAR" | "SCOOTER" | "MOTORBIKE" =>
      type === "CAR" || type === "SCOOTER" || type === "MOTORBIKE";

    const vehicleInfo = isMotorVehicle(data.vehicleType)
      ? {
        vehicleType: data.vehicleType,
        brand: data.brand,
        model: data.model,
        licensePlate: (data as any).licensePlate
          ? (data as any).licensePlate.toUpperCase()
          : undefined,
        drivingLicenseNumber: (data as any).drivingLicenseNumber
          ? (data as any).drivingLicenseNumber.toUpperCase()
          : undefined,
        drivingLicenseExpiry: (data as any).drivingLicenseExpiry,
        insurancePolicyNumber: (data as any).insurancePolicyNumber
          ? (data as any).insurancePolicyNumber.toUpperCase()
          : undefined,
        insuranceExpiry: (data as any).insuranceExpiry
          ? new Date((data as any).insuranceExpiry)
          : undefined,
      }
      : {
        vehicleType: data.vehicleType,
        brand: data.brand,
        model: data.model,
      };

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
        NIF: data.nifNumber?.toUpperCase(),
        // passportNumber: data.passportNumber?.toUpperCase(),
      },
      legalStatus: {
        residencePermitType: data.residencePermitType,
        residencePermitNumber: data.residencePermitNumber?.toUpperCase(),
        residencePermitExpiry: data.residencePermitExpiry
          ? new Date(data.residencePermitExpiry).toISOString()
          : undefined,
      },
      bankDetails: {
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        iban: data.iban?.toUpperCase(),
        swiftCode: data.swiftCode?.toUpperCase(),
      },

      vehicleInfo,

      criminalRecord: {
        certificate: data.haveCriminalRecordCertificate,
        ...(data.haveCriminalRecordCertificate && {
          issueDate: new Date(data.issueDate as string),
          expiryDate: new Date(data.expiryDate as string),
        }),
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

    const updatedResult = await updateUserDataReq(
      `/delivery-partners/${partner.userId}`,
      partnerData,
    );
    console.log("update result", updatedResult);
    if (updatedResult.success) {
      if (partner.status === USER_STATUS.PENDING) {
        const approveResult = await submitForApproval(partner.userId);

        if (approveResult.success) {
          form.reset();
          toast.success(
            approveResult.message || "Delivery partner submitted successfully!",
            {
              id: toastId,
            },
          );
          router.refresh();
          router.back();
          return;
        }

        toast.error(approveResult.message || "Delivery partner add failed", {
          id: toastId,
        });
        console.log(approveResult);
        return;
      }

      form.reset();
      toast.success(
        updatedResult.message || "Delivery partner updated successfully!",
        {
          id: toastId,
        },
      );
      router.refresh();
      router.back();
      return;
    }

    toast.error(updatedResult.message || "Delivery partner add failed", {
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

  // Dynamically build required docs based on vehicle type
  const getRequiredDocs = (): DocKey[] => {
    const base = [...BASE_REQUIRED_DOCS];

    if (vehicleType === "MOTORBIKE" || vehicleType === "CAR") {
      return [
        ...base,
        "drivingLicenseFront",
        "drivingLicenseBack",
        "vehicleRegistration",
      ];
    }

    if (vehicleType === "SCOOTER") {
      return [...base, "vehicleRegistration"];
    }

    // BICYCLE | E-BIKE | undefined → only base required docs
    return base;
  };

  const REQUIRED_DOCS = getRequiredDocs();

  const isDocumentsValid = REQUIRED_DOCS.every(
    (key) => previews[key] !== null);

  const isSubmitDisabled = isSubmitting || !isDocumentsValid

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-h-screen bg-slate-50"
      >
        <TitleHeader
          title="Update Delivery Partner"
          subtitle="Update the delivery partner information with the form below"
          onBackClick={() => router.back()}
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
                        <FormLabel>{t("first_name")} <span className="text-[#DC3173]">*</span></FormLabel>
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
                        <FormLabel>{t("last_name")} <span className="text-[#DC3173]">*</span></FormLabel>
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
                        placeholder={t("partner_email")}
                        value={partner.email}
                        onChange={() => { }}
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
              {partner.userId && (
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
                        2. {t("personal_information")}
                      </h2>

                      <div className="space-y-4 items-start">
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("date_of_birth")} <span className="text-[#DC3173]">*</span></FormLabel>
                              <FormControl>
                                <Input type="date" {...field} max={getTodayDateString()} />
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
                              <FormLabel>{t("gender")} <span className="text-[#DC3173]">*</span></FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a Gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MALE">{t("male")}</SelectItem>
                                    <SelectItem value="FEMALE">
                                      {t("female")}
                                    </SelectItem>
                                    <SelectItem value="OTHER">{t("other")}</SelectItem>
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
                              <FormLabel>{t("nationality")} <span className="text-[#DC3173]">*</span></FormLabel>
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
                              <FormLabel>{t("nif_number")} <span className="text-[#DC3173]">*</span></FormLabel>
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

                        {/* <FormField
                          control={form.control}
                          name="passportNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("passport_number")}</FormLabel>
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
                        /> */}
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
                        3. {t("address")}
                      </h2>

                      <BusinessLocationMap
                        form={form}
                        businessLocation={partner?.address as TBusinessLocation}
                        setLocationCoordinates={setLocationCoordinates}
                        t={t}
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
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>{t("bank_name")} <span className="text-[#DC3173]">*</span></FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value || partner?.bankDetails?.bankName || "undefined"}>
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
                        />

                        <FormField
                          control={form.control}
                          name="accountHolderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("account_holder_name")} <span className="text-[#DC3173]">*</span></FormLabel>
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
                              <FormLabel>{t("swift_code")} <span className="text-[#DC3173]">*</span></FormLabel>
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
            {partner.userId && (
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
                      5. {t("legal_address")}
                    </h2>

                    <div className="space-y-4 items-start">
                      <FormField
                        control={form.control}
                        name="residencePermitType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("residence_permit_type")}</FormLabel>
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
                            <FormLabel>{residencePermitType === "Passport" ? t("passport_number") : t("residence_permit_number")}</FormLabel>
                            <FormControl>
                              <Input
                                className="uppercase placeholder:capitalize"
                                placeholder={residencePermitType === "Passport" ? t("passport_number") : t("residence_permit_number")}
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
                            <FormLabel>{residencePermitType === "Passport" ? t("passport_expiry") : t("residence_permit_expiry")}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} min={getTodayDateString()} />
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
                      6. {t("vehicle_information")}
                    </h2>

                    <div className="space-y-4 items-start">
                      <FormField
                        control={form.control}
                        name="vehicleType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("vehicle_type")} <span className="text-[#DC3173]">*</span></FormLabel>
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
                            <FormLabel>{t("brand")}</FormLabel>
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
                            <FormLabel>{t("model")}</FormLabel>
                            <FormControl>
                              <Input placeholder="Model" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(!(vehicleType === "BICYCLE" || vehicleType === "E-BIKE")) && <FormField
                        control={form.control}
                        name="licensePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("license_plate")}<span className="text-red-600">*</span></FormLabel>
                            <FormControl>
                              <Input
                                className="uppercase placeholder:capitalize"
                                placeholder={t("license_plate")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}

                      {(!(vehicleType === "BICYCLE" || vehicleType === "E-BIKE")) && <FormField
                        control={form.control}
                        name="drivingLicenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("driving_license_number")}<span className="text-red-600">*</span></FormLabel>
                            <FormControl>
                              <Input
                                className="uppercase placeholder:capitalize"
                                placeholder={t("driving_license_number")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}

                      {(!(vehicleType === "BICYCLE" || vehicleType === "E-BIKE")) && <FormField
                        control={form.control}
                        name="drivingLicenseExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("driving_license_expiry")}<span className="text-red-600">*</span></FormLabel>
                            <FormControl>
                              <Input type="date" {...field} min={getTodayDateString()} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}

                      {(!(vehicleType === "BICYCLE" || vehicleType === "E-BIKE")) && <FormField
                        control={form.control}
                        name="insurancePolicyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("insurance_policy_number")}<span className="text-red-600">*</span></FormLabel>
                            <FormControl>
                              <Input
                                className="uppercase placeholder:capitalize"
                                placeholder={t("insurance_policy_number")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}

                      {(!(vehicleType === "BICYCLE" || vehicleType === "E-BIKE")) && <FormField
                        control={form.control}
                        name="insuranceExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("insurance_expiry")}<span className="text-red-600">*</span></FormLabel>
                            <FormControl>
                              <Input type="date" {...field} min={getTodayDateString()} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}
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
                      7. {t("criminal_record_status")}
                    </h2>

                    <div className="space-y-4 items-start">
                      <FormField
                        control={form.control}
                        name="haveCriminalRecordCertificate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("have_criminal_record_certificate")}
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
                                {t("yes")}
                              </FormLabel>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {haveCriminalRecordCertificate && <FormField
                        control={form.control}
                        name="issueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("issue_date")}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} max={getTodayDateString()} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}

                      {haveCriminalRecordCertificate && <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("expiry_date")}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} min={getTodayDateString()} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}
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
                      8. {t("work_preferences_equipments")}
                    </h2>

                    <div className="space-y-4 items-start">
                      <div className="space-y-2">
                        <Label className="">{t("preferred_working_zones")}</Label>
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
                            <FormLabel>{t("preferred_working_hours")}</FormLabel>
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
                                    {t("morning")} (8AM-12PM)
                                  </SelectItem>
                                  <SelectItem value="afternoon">
                                    {t("afternoon")} (12PM-6PM)
                                  </SelectItem>
                                  <SelectItem value="evening">
                                    {t("evening")} (6PM-10PM)
                                  </SelectItem>
                                  <SelectItem value="night">
                                    {t("night")} (10PM-12AM)
                                  </SelectItem>
                                  <SelectItem value="fullday">
                                    {t("full_day")}
                                  </SelectItem>
                                  <SelectItem value="flexible">
                                    {t("flexible")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4 items-start">
                        <Label className="">{t("delivery_equipments")}</Label>
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
                            <FormLabel>{t("worked_with_other_platform")}</FormLabel>
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
                              {t("other_platform_name_if_applicable")}
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

                    <UploadPartnerDocuments
                      partnerId={partner.userId}
                      vehicleType={vehicleType}
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
        {partner.userId && (
          <div className="mt-10 flex justify-end">
            <Button
              className="px-8 py-2 text-white"
              style={{ background: DELIGO }}
              disabled={isSubmitDisabled}
            >
              {t("update_delivery_partner")}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
