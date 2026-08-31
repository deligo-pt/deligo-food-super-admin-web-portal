"use client";

import SettingsCard from "@/components/Dashboard/Settings/GlobalSettings/SettingsCard";
import SettingsInput from "@/components/Dashboard/Settings/GlobalSettings/SettingsInput";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import {
  createGlobalSettingsReq,
  updateGlobalSettingsReq,
} from "@/services/dashboard/global-settings/global-settings.service";
import { TGlobalSettings } from "@/types/global-settings.type";
import { TTax } from "@/types/tax.type";
import { globalSettingsSchema } from "@/validations/settings/global-settings/global-settings.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  EuroIcon,
  FormInput,
  Gift,
  LogsIcon,
  Package,
  Percent,
  Save,
  Truck,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { cn } from "@/lib/utils";
import { uploadImagesReq } from "@/services/upload/upload.service";
import { FileUploadZone } from "./FileUploadZone";

type TGlobalSettingsForm = z.infer<typeof globalSettingsSchema>;

const TABS = [
  {
    id: "delivery",
    labelKey: "delivery_pricing",
    icon: Truck,
  },
  {
    id: "commission",
    labelKey: "commissions_and_fees",
    icon: Percent,
  },
  {
    id: "agreements",
    labelKey: "agreements",
    icon: FormInput,
  },
  {
    id: "order",
    labelKey: "order_rules",
    icon: Package,
  },
  {
    id: "activity-logs",
    labelKey: "activity_logs_retention",
    icon: LogsIcon,
  },
  {
    id: "cancellation",
    labelKey: "cancellation_and_refunds",
    icon: Clock,
  },
  {
    id: "ingredients",
    labelKey: "ingredients_delivery_charges",
    icon: Gift,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function GlobalSettings({
  settingsResult: settings,
  taxRates,
}: {
  settingsResult: TGlobalSettings;
  taxRates: TTax[];
}) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [activeTab, setActiveTab] = useState<TabId>("delivery");
  const signatureFileRef = useRef<HTMLInputElement | null>(null);
  const stampFileRef = useRef<HTMLInputElement | null>(null);
  const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string | null>(
    null
  );
  const [partyStamp, setPartyStamp] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingStamp, setIsUploadingStamp] = useState(false);

  const form = useForm<TGlobalSettingsForm>({
    resolver: zodResolver(globalSettingsSchema),
    values: {
      // delivery
      deliveryChargePerKm: settings?.delivery?.chargePerKm || 0,
      baseDeliveryCharge: settings?.delivery?.baseCharge || 0,
      deliveryVatRate: settings?.delivery?.vatRate || 0,

      // commission
      platformCommissionPercent: settings?.commission?.platformPercent || 0,
      platformVatRate: settings?.commission?.platformVatRate || 0,
      fleetManagerCommissionPercent: settings?.commission?.fleetManagerPercent || 0,
      serviceCharge: settings?.commission?.serviceCharge || 0,

      // agreements
      deligoSignatureUrl: settings?.agreement?.deligoSignatureUrl || undefined,
      deligoSignatoryName: settings?.agreement?.deligoSignatoryName || undefined,
      deligoSignatoryRole: settings?.agreement?.deligoSignatoryRole || undefined,
      deligoCompanyStampUrl: settings?.agreement?.deligoSignatureUrl || undefined,

      // order
      customerNearestVendorRadiusKm: settings?.order?.nearestVendorRadiusKm || 0,
      cancelTimeLimitMinutes: settings?.order?.cancelTimeLimitMinutes || 0,

      // activity logs retention
      archiveAfterMonths: settings?.activityLogRetention?.archiveAfterMonths || 0,
      deleteAfterMonths: settings?.activityLogRetention?.deleteAfterMonths || 0,
      batchSize: settings?.activityLogRetention?.batchSize || 0,

      // ingredients and delivery charges
      deliveryChargeInsideLisbon: settings?.ingredientsOrder?.deliveryChargeInsideLisbon || 20,
      deliveryChargeOutsideLisbon: settings?.ingredientsOrder?.deliveryChargeOutsideLisbon || 30,
    },
  });

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "signature" | "stamp"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    const toastId = toast.loading(
      type === "signature" ? "Uploading signature..." : "Uploading stamp..."
    );

    if (type === "signature") setIsUploading(true);
    else setIsUploadingStamp(true);

    try {
      const uploadResult = await uploadImagesReq([file]);

      if (uploadResult.success && uploadResult.data?.[0]) {
        if (type === "signature") {
          setUploadedSignatureUrl(uploadResult.data[0]);
        } else {
          setPartyStamp(uploadResult.data[0]);
        }
        toast.success(
          type === "signature"
            ? "Signature uploaded successfully!"
            : "Stamp uploaded successfully!",
          { id: toastId }
        );
      } else {
        toast.error(uploadResult.message || "Upload failed", { id: toastId });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error?.message || "Failed to upload", { id: toastId });
    } finally {
      if (type === "signature") setIsUploading(false);
      else setIsUploadingStamp(false);
    }
  };

  const clearStamp = () => {
    setPartyStamp(null);
    if (stampFileRef.current) {
      stampFileRef.current.value = "";
    }
  };

  const onSubmit = async (data: TGlobalSettingsForm) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving global settings...");

    const payload = {
      delivery: {
        chargePerKm: data.deliveryChargePerKm,
        baseCharge: data.baseDeliveryCharge,
        vatRate: data.deliveryVatRate,
      },
      commission: {
        platformPercent: data.platformCommissionPercent,
        platformVatRate: data.platformVatRate,
        fleetManagerPercent: data.fleetManagerCommissionPercent,
        serviceCharge: data.serviceCharge,
      },
      agreement: {
        deligoSignatureUrl: uploadedSignatureUrl,
        deligoSignatoryName: data.deligoSignatoryName,
        deligoSignatoryRole: data.deligoSignatoryRole,
        deligoCompanyStampUrl: partyStamp,
      },
      activityLogRetention: {
        archiveAfterMonths: data.archiveAfterMonths,
        deleteAfterMonths: data.deleteAfterMonths,
        batchSize: data.batchSize,
      },
      order: {
        nearestVendorRadiusKm: data.customerNearestVendorRadiusKm,
        cancelTimeLimitMinutes: data.cancelTimeLimitMinutes,
      },
      ingredientsOrder: {
        deliveryChargeInsideLisbon: data.deliveryChargeInsideLisbon,
        deliveryChargeOutsideLisbon: data.deliveryChargeOutsideLisbon,
      },
    } as Partial<TGlobalSettings>;

    const result = settings._id
      ? await updateGlobalSettingsReq(payload)
      : await createGlobalSettingsReq(payload);

    if (result.success) {
      toast.success(result.message || "Global settings saved successfully!", {
        id: toastId,
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      toast.error(result.message || "Global settings save failed", {
        id: toastId,
      });
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen">
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header */}
          <TitleHeader
            title={t("global_settings")}
            subtitle={t("manage_your_platform_core_configuration")}
            extraComponent={
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSaving}
                className={cn(
                  "relative overflow-hidden group flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-[#DC3173] transition-all",
                  isSaving
                    ? "bg-white/50 cursor-wait"
                    : "bg-white hover:bg-white/90 cursor-pointer",
                )}
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("saving")}</span>
                  </>
                ) : saveStatus === "success" ? (
                  <>
                    <CheckCircle2 size={20} />
                    <span>{t("saved")}</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{t("save_changes")}</span>
                  </>
                )}
              </motion.button>
            }
          />

          {/* Tabs + Content Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* SIDEBAR TABS (Desktop) + Horizontal Tabs (Mobile) */}
            <div className="lg:w-64 shrink-0">
              {/* Mobile: Horizontal scrollable tabs */}
              <div className="lg:hidden overflow-x-auto pb-2 -mx-1 px-1">
                <div className="flex gap-2 min-w-max">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                          isActive
                            ? "bg-[#DC3173] text-white shadow-md shadow-[#DC3173]/25"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200",
                        )}
                      >
                        <Icon size={16} />
                        {t(tab.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desktop: Vertical sidebar tabs */}
              <div className="hidden lg:flex flex-col gap-1.5 sticky top-6">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200",
                        isActive
                          ? "bg-[#DC3173]/10 text-[#DC3173] font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#DC3173] rounded-r-full"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      <div
                        className={cn(
                          "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
                          isActive
                            ? "bg-[#DC3173] text-white"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200",
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <span className="text-sm">{t(tab.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Delivery Pricing */}
                  {activeTab === "delivery" && (
                    <SettingsCard
                      title={t("delivery_pricing")}
                      description={t("configure_base_rates_distance")}
                      icon={EuroIcon}
                      delay={0}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="baseDeliveryCharge"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label={t("base_charge")}
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  suffix="€"
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="deliveryChargePerKm"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label={t("charge_per_km")}
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  suffix="€"
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="deliveryVatRate"
                          render={({ field }) => (
                            <FormItem className="col-span-2 w-full">
                              <FormLabel>{t("delivery_vat_rate")}</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value?.toString() ?? ""}
                                  onValueChange={(value) =>
                                    field.onChange(parseFloat(value))
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue
                                      placeholder={t("delivery_vat_rate")}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {taxRates.map((tax) => (
                                      <SelectItem
                                        key={tax?.taxRate}
                                        value={tax?.taxRate.toString()}
                                      >
                                        {tax?.taxRate}%
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </SettingsCard>
                  )}

                  {/* Commission & Fees */}
                  {activeTab === "commission" && (
                    <SettingsCard
                      title={t("commissions_and_fees")}
                      description={t("set_platform_earnings_tax_rates")}
                      icon={Percent}
                      delay={0}
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="platformCommissionPercent"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <SettingsInput
                                    fieldState={fieldState}
                                    label={t("platform_commission")}
                                    type="number"
                                    value={field.value}
                                    onChange={(e) =>
                                      field.onChange(parseFloat(e.target.value))
                                    }
                                    suffix="%"
                                    min={0}
                                    max={100}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="platformVatRate"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("platform_vat")}</FormLabel>
                                <FormControl>
                                  <Select
                                    value={field.value?.toString() ?? ""}
                                    onValueChange={(value) =>
                                      field.onChange(parseFloat(value))
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue
                                        placeholder={t("platform_vat")}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {taxRates.map((tax) => (
                                        <SelectItem
                                          key={tax?.taxRate}
                                          value={tax?.taxRate.toString()}
                                        >
                                          {tax?.taxRate}%
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fleetManagerCommissionPercent"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <SettingsInput
                                    fieldState={fieldState}
                                    label={t("fleet_manager_commission")}
                                    type="number"
                                    value={field.value}
                                    onChange={(e) =>
                                      field.onChange(parseFloat(e.target.value))
                                    }
                                    suffix="%"
                                    description="Percentage paid to fleet manager"
                                    min={0}
                                    max={100}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="serviceCharge"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <SettingsInput
                                    fieldState={fieldState}
                                    label={t("service_charge")}
                                    type="number"
                                    value={field.value}
                                    onChange={(e) =>
                                      field.onChange(parseFloat(e.target.value))
                                    }
                                    suffix="€"
                                    min={0}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </SettingsCard>
                  )}

                  {/* Agreements */}
                  {activeTab === "agreements" && (
                    <SettingsCard
                      title={t("agreements")}
                      description={t("set_agreements_related_urls_nd_infos")}
                      icon={Percent}
                      delay={0}
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="deligoSignatoryName"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <SettingsInput
                                    fieldState={fieldState}
                                    label={t("deligo_signatory_name")}
                                    type="text"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    description={t("deligo_signatory_name_for_agreement")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="deligoSignatoryRole"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <SettingsInput
                                    fieldState={fieldState}
                                    label={t("deligo_signatory_role")}
                                    type="text"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    description={t("deligo_signatory_role_in_agreement")}
                                  />
                                </FormControl>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FileUploadZone
                          inputRef={signatureFileRef}
                          onChange={(e) => handleFileUpload(e, "signature")}
                          isLoading={isUploading}
                          previewUrl={uploadedSignatureUrl}
                          onClear={() => {
                            setUploadedSignatureUrl(null);
                            if (signatureFileRef.current) {
                              signatureFileRef.current.value = "";
                            }
                          }}
                          label={t("deligo_signature_url")}
                        />
                        <FileUploadZone
                          inputRef={stampFileRef}
                          onChange={(e) => handleFileUpload(e, "stamp")}
                          isLoading={isUploadingStamp}
                          previewUrl={partyStamp}
                          onClear={clearStamp}
                          label={t("deligo_company_stamp_url")}
                          optional
                        />
                        {/* <FormField
                          control={form.control}
                          name="deligoSignatureUrl"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label={t("deligo_signature_url")}
                                  type="url"
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="deligoCompanyStampUrl"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label={t("deligo_company_stamp_url")}
                                  type="url"
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        /> */}
                      </div>
                    </SettingsCard>
                  )}

                  {/* Order Rules */}
                  {activeTab === "order" && (
                    <SettingsCard
                      title={t("order_rules")}
                      description={t("define_constraints_for_customer_orders")}
                      icon={Package}
                      delay={0}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customerNearestVendorRadiusKm"
                          render={({ field, fieldState }) => (
                            <FormItem className="col-span-2">
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label="Customer Nearest Vendor Radius"
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  suffix="km"
                                  description="Maximum distance between customer and nearest vendor"
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </SettingsCard>
                  )}

                  {/* activity log retention */}
                  {activeTab === "activity-logs" && (
                    <SettingsCard
                      title={t("activity_log_retention")}
                      description={t("control_activity_logs_nd_customize")}
                      icon={Package}
                      delay={0}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="archiveAfterMonths"
                          render={({ field, fieldState }) => (
                            <FormItem className="col-span-2">
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label={t("archive_after_months")}
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  suffix="month/s"
                                  description={t("months_after_which_an_activityLogArchive")}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="deleteAfterMonths"
                          render={({ field, fieldState }) => (
                            <FormItem className="col-span-2">
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label={t("permanently_delete_after_month")}
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  suffix="month/s"
                                  description={t("months_after_which_archived")}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="batchSize"
                          render={({ field, fieldState }) => (
                            <FormItem className="col-span-2">
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label={t("maximum_documents_per_batch")}
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  description={t("max_documents_the_retention_job")}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </SettingsCard>
                  )}

                  {/* Cancellation & Automation */}
                  {activeTab === "cancellation" && (
                    <SettingsCard
                      title={t("cancellation_and_refunds")}
                      description={t("manage_time_limits_processing")}
                      icon={Clock}
                      delay={0}
                    >
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="cancelTimeLimitMinutes"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label={t("cancellation_time_limit")}
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  suffix="min"
                                  description={t("time_widow_customers_cancel")}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </SettingsCard>
                  )}

                  {/* Ingredients Delivery Charges */}
                  {activeTab === "ingredients" && (
                    <SettingsCard
                      title={t("ingredients_delivery_charges")}
                      description={t(
                        "control_ingredients_delivery_charges_settings",
                      )}
                      icon={Gift}
                      delay={0}
                    >
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="deliveryChargeInsideLisbon"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label={t("deliveryChargeInsideLisbon")}
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  suffix="€"
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deliveryChargeOutsideLisbon"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <SettingsInput
                                  fieldState={fieldState}
                                  label={t("deliveryChargeOutsideLisbon")}
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  suffix="€"
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </SettingsCard>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}