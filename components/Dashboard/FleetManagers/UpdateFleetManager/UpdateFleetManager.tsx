/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BusinessLocationMap from "@/components/BusinessLocationMap/BusinessLocationMap";
import UploadFleetManagerDocuments from "@/components/Dashboard/FleetManagers/AddFleetManager/UploadFleetManagerDocuments";
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
import { USER_STATUS } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { approveOrRejectReq } from "@/services/auth/approve-or-reject.service";
import { updateUserDataReq } from "@/services/auth/register-user.service";
import { FLEET_REQUIRED_DOCS, TFleetDocKey } from "@/types/document.type";
import { TAgent, TBusinessLocation } from "@/types/user.type";
import { addFleetManagerValidation } from "@/validations/add-fleet-manager/add-fleet-manager.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
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
  fleetManager: TAgent;
}

type TFleetManagerForm = z.infer<typeof addFleetManagerValidation>;

export default function UpdateFleetManager({ fleetManager }: IProps) {
  const [fleetManagerState, setFleetManagerState] = useState(fleetManager);
  const { t } = useTranslation();
  const router = useRouter();
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: fleetManager?.businessLocation?.latitude || 0,
    longitude: fleetManager?.businessLocation?.longitude || 0,
  });
  const [previews, setPreviews] = useState<
    Record<TFleetDocKey, string[] | null>
  >({
    businessLicense: Array.isArray(fleetManager?.documents?.businessLicense)
      ? fleetManager?.documents?.businessLicense
      : null,
    myPhoto: Array.isArray(fleetManager?.documents?.myPhoto)
      ? fleetManager?.documents?.myPhoto
      : null,
    idProofFront: Array.isArray(fleetManager?.documents?.idProofFront)
      ? fleetManager?.documents?.idProofFront
      : null,
    idProofBack: Array.isArray(fleetManager?.documents?.idProofBack)
      ? fleetManager?.documents?.idProofBack
      : null,
    proofOfAddress: Array.isArray(fleetManager?.documents?.proofOfAddress)
      ? fleetManager?.documents?.proofOfAddress
      : null,
    activityDocument: Array.isArray(fleetManager?.documents?.activityDocument)
      ? fleetManager?.documents?.activityDocument
      : null,
    ibanProof: Array.isArray(fleetManager?.documents?.ibanProof)
      ? fleetManager?.documents?.ibanProof
      : null,
  });

  const form = useForm<TFleetManagerForm>({
    resolver: zodResolver(addFleetManagerValidation),
    defaultValues: {
      firstName: fleetManager.name?.firstName || "",
      lastName: fleetManager.name?.lastName || "",
      phoneNumber: fleetManager?.contactNumber || "",
      businessName: fleetManager.businessDetails?.businessName || "",
      businessLicenseNumber:
        fleetManager.businessDetails?.businessLicenseNumber || "",
      street: fleetManager.businessLocation?.street || "",
      city: fleetManager.businessLocation?.city || "",
      postalCode: fleetManager.businessLocation?.postalCode || "",
      country: fleetManager.businessLocation?.country || "",
      latitude: fleetManager?.businessLocation?.latitude || 0,
      longitude: fleetManager?.businessLocation?.longitude || 0,
      // bankName: fleetManager.bankDetails?.bankName || "",
      accountHolderName: fleetManager.bankDetails?.accountHolderName || "",
      iban: fleetManager.bankDetails?.iban || "",
      // swiftCode: fleetManager.bankDetails?.swiftCode || "",
    },
  });

  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    form.reset({
      firstName: fleetManagerState.name?.firstName || "",
      lastName: fleetManagerState.name?.lastName || "",
      phoneNumber: fleetManagerState?.contactNumber || "",
      businessName:
        fleetManagerState.businessDetails?.businessName || "",
      businessLicenseNumber:
        fleetManagerState.businessDetails?.businessLicenseNumber || "",
      street: fleetManagerState.businessLocation?.street || "",
      city: fleetManagerState.businessLocation?.city || "",
      postalCode:
        fleetManagerState.businessLocation?.postalCode || "",
      country: fleetManagerState.businessLocation?.country || "",
      // bankName: fleetManagerState.bankDetails?.bankName || "",
      accountHolderName: fleetManagerState.bankDetails?.accountHolderName || "",
      iban: fleetManagerState.bankDetails?.iban || "",
      // swiftCode: fleetManagerState.bankDetails?.swiftCode || "",
    });
  }, [fleetManagerState, form]);

  const onSubmit = async (data: TFleetManagerForm) => {
    const toastId = toast.loading("Updating fleet manager...");

    // Helper to check if a value really changed
    const hasChanged = (current: any, original: any) => {
      if (Array.isArray(current) || Array.isArray(original)) {
        return JSON.stringify(current || []) !== JSON.stringify(original || []);
      }
      return current !== original;
    };

    const fleetManagerData: Record<string, any> = {};

    // name
    const originalFirstName = fleetManager?.name?.firstName || "";
    const originalLastName = fleetManager?.name?.lastName || "";

    if (
      hasChanged(data.firstName, originalFirstName) ||
      hasChanged(data.lastName, originalLastName)
    ) {
      fleetManagerData.name = {
        firstName: data.firstName,
        lastName: data.lastName,
      };
    }

    // contactNumber
    if (hasChanged(data.phoneNumber, fleetManager?.contactNumber || "")) {
      fleetManagerData.contactNumber = data.phoneNumber;
    }

    // businessDetails
    const originalBusinessName = fleetManager?.businessDetails?.businessName || "";
    const originalLicense = fleetManager?.businessDetails?.businessLicenseNumber || "";

    if (
      hasChanged(data.businessName, originalBusinessName) ||
      hasChanged(data.businessLicenseNumber?.toUpperCase(), originalLicense)
    ) {
      // Send full object so backend doesn't wipe other fields
      fleetManagerData.businessDetails = {
        businessName: data.businessName,
        businessLicenseNumber: data.businessLicenseNumber?.toUpperCase(),
      };
    }

    // businessLocation
    // Use the real coordinates (prefer state, fallback to original)
    const currentLat = locationCoordinates.latitude || fleetManager?.businessLocation?.latitude || 0;
    const currentLng = locationCoordinates.longitude || fleetManager?.businessLocation?.longitude || 0;

    const originalStreet = fleetManager?.businessLocation?.street || "";
    const originalCity = fleetManager?.businessLocation?.city || "";
    const originalPostalCode = fleetManager?.businessLocation?.postalCode || "";
    const originalCountry = fleetManager?.businessLocation?.country || "";
    const originalLat = fleetManager?.businessLocation?.latitude ?? 0;
    const originalLng = fleetManager?.businessLocation?.longitude ?? 0;

    const locationChanged =
      hasChanged(data.street, originalStreet) ||
      hasChanged(data.city, originalCity) ||
      hasChanged(data.postalCode, originalPostalCode) ||
      hasChanged(data.country, originalCountry) ||
      hasChanged(currentLat, originalLat) ||
      hasChanged(currentLng, originalLng);

    if (locationChanged) {
      // Send FULL location object so nothing is wiped
      fleetManagerData.businessLocation = {
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        latitude: currentLat,
        longitude: currentLng,
      };
    }

    // bankDetails
    const originalAccountHolder =
      fleetManager?.bankDetails?.accountHolderName || "";
    const originalIban = fleetManager?.bankDetails?.iban || "";

    if (
      hasChanged(data.accountHolderName, originalAccountHolder) ||
      hasChanged(data.iban, originalIban)
    ) {
      // CRITICAL: send full bankDetails so IBAN is never deleted
      fleetManagerData.bankDetails = {
        accountHolderName: data.accountHolderName,
        iban: data.iban,
      };
    }

    // final check
    const hasAnyChange = Object.keys(fleetManagerData).length > 0;

    if (!hasAnyChange) {
      toast.info("No changes detected", { id: toastId });
      return;
    }

    const updatedResult = await updateUserDataReq(
      `/fleet-managers/${fleetManager.userId}`,
      fleetManagerData
    );

    if (updatedResult.success) {
      setFleetManagerState((prev) => ({
        ...prev,
        ...fleetManagerData,
      }));

      if (fleetManager.status !== USER_STATUS.APPROVED) {
        const approveResult = await approveOrRejectReq(fleetManager.userId, {
          status: "APPROVED",
        });

        if (approveResult.success) {
          form.reset();
          router.refresh();
          router.push(`/admin/agent/${fleetManager.userId}`);
          toast.success(
            approveResult.message || "Fleet manager updated successfully!",
            { id: toastId }
          );
          return;
        }

        toast.error(approveResult.message || "Fleet manager update failed", {
          id: toastId,
        });
        console.log(approveResult);
        return;
      }

      form.reset();
      router.push(`/admin/agent/${fleetManager.userId}`);
      toast.success(
        updatedResult.message || "Fleet manager updated successfully!",
        { id: toastId }
      );
      return;
    }

    toast.error(updatedResult.message || "Fleet manager update failed", {
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

  const isDocumentsValid = FLEET_REQUIRED_DOCS.every(
    (key) => previews[key] !== null && (previews[key]?.length ?? 0) > 0
  );

  const isSubmitDisabled = isSubmitting || !isDocumentsValid;

  return (
    <>
      <TitleHeader
        title={t("edit_fleet_manager_details")}
        subtitle={t("update_fleet_manager_update_and_information")}
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
                          placeholder={t("fleet_manager_email")}
                          value={fleetManager.email}
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
                {fleetManager.userId && (
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
                                <FormLabel>{t("bank_name")}</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value || fleetManager?.bankDetails?.bankName || "undefined"}>
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

                          {/* <FormField
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
              {fleetManager.userId && (
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
                        <Banknote className="w-5 h-5" /> 4.{" "}
                        {t("business_location_information")}
                      </h2>

                      <BusinessLocationMap
                        form={form}
                        businessLocation={fleetManager.businessLocation as TBusinessLocation}
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

                      <UploadFleetManagerDocuments
                        fleetManagerId={fleetManager.userId}
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
          {fleetManager.userId && (
            <div className="mt-10 flex justify-end">
              <Button
                className="px-8 py-2 text-white"
                style={{ background: DELIGO }}
                disabled={isSubmitDisabled}
              >
                {t("submit_fleetManager")}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </>
  );
}
