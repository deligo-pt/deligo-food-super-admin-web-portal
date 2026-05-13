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
import { USER_STATUS } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { approveOrRejectReq } from "@/services/auth/approve-or-reject.service";
import { updateUserDataReq } from "@/services/auth/register-user.service";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TFilePreview, TPartnerDocKey } from "@/types/document.type";
import { deliveryPartnerValidation } from "@/validations/delivery-partner/delivery-partner.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import parsePhoneNumberFromString from "libphonenumber-js";
import { PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
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

  const phone = parsePhoneNumberFromString(partner.contactNumber || "");

  const form = useForm<TDeliveryPartnerForm>({
    resolver: zodResolver(deliveryPartnerValidation),
    defaultValues: {
      firstName: partner.name?.firstName || "",
      lastName: partner.name?.lastName || "",
      prefixPhoneNumber: phone?.countryCallingCode
        ? `+${phone?.countryCallingCode}`
        : "+351",
      phoneNumber: phone?.nationalNumber || "",
      dateOfBirth: partner.personalInfo?.dateOfBirth
        ? format(new Date(partner.personalInfo?.dateOfBirth), "yyyy-MM-dd")
        : "",
      gender: partner.personalInfo?.gender || "MALE",
      nationality: partner.personalInfo?.nationality || "",
      nifNumber: partner.personalInfo?.NIF || "",
      passportNumber: partner.personalInfo?.passportNumber || "",
      street: partner.address?.street || "",
      city: partner.address?.city || "",
      postalCode: partner.address?.postalCode || "",
      country: partner.address?.country || "",
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

  const onSubmit = async (data: TDeliveryPartnerForm) => {
    const toastId = toast.loading("Updating partner...");

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
        passportNumber: data.passportNumber?.toUpperCase(),
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
        expiryDate: new Date(data.expiryDate as string),
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

    if (updatedResult.success) {
      if (partner.status !== USER_STATUS.APPROVED) {
        const approveResult = await approveOrRejectReq(partner.userId, {
          status: "APPROVED",
        });

        if (approveResult.success) {
          form.reset();
          toast.success(
            approveResult.message || "Delivery partner added successfully!",
            {
              id: toastId,
            },
          );
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
      return;
    }

    toast.error(updatedResult.message || "Delivery partner add failed", {
      id: toastId,
    });
    console.log(updatedResult);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-h-screen bg-slate-50"
      >
        <TitleHeader
          title="Update Delivery Partner"
          subtitle="Update the delivery partner information with the form below"
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
                        value={partner.email}
                        onChange={() => {}}
                      />
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

                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
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

                    <UploadPartnerDocuments
                      partnerId={partner.userId}
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
        {partner.userId && (
          <div className="mt-10 flex justify-end">
            <Button
              className="px-8 py-2 text-white"
              style={{ background: DELIGO }}
            >
              Update Delivery Partner
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
