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
import { TFleetDocKey } from "@/types/document.type";
import { TAgent } from "@/types/user.type";
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
  const { t } = useTranslation();
  const router = useRouter();
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: 0,
    longitude: 0,
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
      bankName: fleetManager.bankDetails?.bankName || "",
      accountHolderName: fleetManager.bankDetails?.accountHolderName || "",
      iban: fleetManager.bankDetails?.iban || "",
      swiftCode: fleetManager.bankDetails?.swiftCode || "",
    },
  });

  const onSubmit = async (data: TFleetManagerForm) => {
    const toastId = toast.loading("Adding fleet manager...");

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

    const updatedResult = await updateUserDataReq(
      `/fleet-managers/${fleetManager.userId}`,
      fleetManagerData,
    );

    if (updatedResult.success) {
      if (fleetManager.status !== USER_STATUS.APPROVED) {
        const approveResult = await approveOrRejectReq(fleetManager.userId, {
          status: "APPROVED",
        });

        if (approveResult.success) {
          form.reset();
          router.refresh();
          toast.success(
            approveResult.message || "Fleet manager updated successfully!",
            {
              id: toastId,
            },
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
      toast.success(
        updatedResult.message || "Fleet manager updated successfully!",
        {
          id: toastId,
        },
      );
      return;
    }

    toast.error(updatedResult.message || "Fleet manager add failed", {
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
        title="Edit Fleet Manager Details"
        subtitle="Update fleet manager details and information"
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

                      <UploadFleetManagerDocuments
                        fleetManagerId={fleetManager.userId}
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
          {fleetManager.userId && (
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
    </>
  );
}
