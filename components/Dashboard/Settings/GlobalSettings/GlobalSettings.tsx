"use client";

import SettingsCard from "@/components/Dashboard/Settings/GlobalSettings/SettingsCard";
import SettingsInput from "@/components/Dashboard/Settings/GlobalSettings/SettingsInput";
import SettingsToggle from "@/components/Dashboard/Settings/GlobalSettings/SettingsToggle";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useTranslation } from "@/hooks/use-translation";
import {
  createGlobalSettingsReq,
  updateGlobalSettingsReq,
} from "@/services/dashboard/global-settings/global-settings.service";
import { TGlobalSettings } from "@/types/global-settings.type";
import { globalSettingsSchema } from "@/validations/settings/global-settings/global-settings.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Clock,
  EuroIcon,
  Gift,
  Package,
  Percent,
  Save,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TGlobalSettingsForm = z.infer<typeof globalSettingsSchema>;

export default function GlobalSettings({
  settingsResult: settings,
}: {
  settingsResult: TGlobalSettings;
}) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const form = useForm<TGlobalSettingsForm>({
    resolver: zodResolver(globalSettingsSchema),
    values: {
      // delivery
      deliveryChargePerKm: settings?.delivery?.chargePerKm || 0,
      baseDeliveryCharge: settings?.delivery?.baseCharge || 0,
      minDeliveryCharge: settings?.delivery?.minCharge || 0,
      maxDeliveryCharge: settings?.delivery?.maxCharge || 0,
      freeDeliveryAbove: settings?.delivery?.freeAbove || 0,
      maxDeliveryDistanceKm: settings?.delivery?.maxDistanceKm || 0,
      deliveryVatRate: settings?.delivery?.vatRate || 0,

      // commission
      platformCommissionPercent: settings?.commission?.platformPercent || 0,
      platformVatRate: settings?.commission?.platformVatRate || 0,
      deliveryPartnerCommissionPercent:
        settings?.commission?.deliveryPartnerPercent || 0,
      fleetManagerCommissionPercent:
        settings?.commission?.fleetManagerPercent || 0,
      vendorVatPercent: settings?.commission?.vendorVatPercent || 0,

      // order
      minOrderAmount: settings?.order?.minAmount || 0,
      maxOrderAmount: settings?.order?.maxAmount || 0,
      maxItemsPerOrder: settings?.order?.maxItemsPerOrder || 1,
      customerNearestVendorRadiusKm:
        settings?.order?.nearestVendorRadiusKm || 0,
      cancelTimeLimitMinutes: settings?.order?.cancelTimeLimitMinutes || 0,
      autoCancelUnacceptedOrderMinutes:
        settings?.order?.autoCancelUnacceptedMinutes || 0,
      autoMarkDeliveredAfterMinutes:
        settings?.order?.autoMarkDeliveredMinutes || 0,

      // system - otp
      orderOtpEnabled: settings?.system?.otp?.enabled || false,
      otpLength: settings?.system?.otp?.length || 0,
      otpExpiryMinutes: settings?.system?.otp?.expiryMinutes || 0,

      // system - others
      isOfferEnabled: settings?.system?.isOfferEnabled || false,
      isPlatformLive: settings?.system?.isPlatformLive || false,
      maintenanceMessage: settings?.system?.maintenanceMessage || "",
      refundProcessingDays: settings?.system?.refundProcessingDays || 0,
      maxDiscountPercent: settings?.system?.maxDiscountPercent || 0,

      // ingredients and delivery charges
      deliveryChargeInsideLisbon: settings?.ingredientsOrder?.deliveryChargeInsideLisbon || 20,
      deliveryChargeOutsideLisbon: settings?.ingredientsOrder?.deliveryChargeOutsideLisbon || 30,
      vatRate: settings?.ingredientsOrder?.vatRate || 23,
    },
  });

  const [watchIsPlatformLive] = useWatch({
    control: form.control,
    name: ["isPlatformLive"],
  });

  const onSubmit = async (data: TGlobalSettingsForm) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving global settings...");

    const payload = {
      delivery: {
        chargePerKm: data.deliveryChargePerKm,
        baseCharge: data.baseDeliveryCharge,
        minCharge: data.minDeliveryCharge,
        maxCharge: data.maxDeliveryCharge,
        freeAbove: data.freeDeliveryAbove,
        maxDistanceKm: data.maxDeliveryDistanceKm,
        vatRate: data.deliveryVatRate,
      },
      commission: {
        platformPercent: data.platformCommissionPercent,
        platformVatRate: data.platformVatRate,
        deliveryPartnerPercent: data.deliveryPartnerCommissionPercent,
        fleetManagerPercent: data.fleetManagerCommissionPercent,
        vendorVatPercent: data.vendorVatPercent,
      },
      order: {
        minAmount: data.minOrderAmount,
        maxAmount: data.maxOrderAmount,
        maxItemsPerOrder: data.maxItemsPerOrder,
        nearestVendorRadiusKm: data.customerNearestVendorRadiusKm,
        cancelTimeLimitMinutes: data.cancelTimeLimitMinutes,
        autoCancelUnacceptedMinutes: data.autoCancelUnacceptedOrderMinutes,
        autoMarkDeliveredMinutes: data.autoMarkDeliveredAfterMinutes,
      },
      system: {
        otp: {
          enabled: data.orderOtpEnabled,
          length: data.otpLength,
          expiryMinutes: data.otpExpiryMinutes,
        },
        isOfferEnabled: data.isOfferEnabled,
        isPlatformLive: data.isPlatformLive,
        maintenanceMessage: data.maintenanceMessage,
        refundProcessingDays: data.refundProcessingDays,
        maxDiscountPercent: data.maxDiscountPercent,
      },
      ingredientsOrder: {
        deliveryChargeInsideLisbon: data.deliveryChargeInsideLisbon,
        deliveryChargeOutsideLisbon: data.deliveryChargeOutsideLisbon,
        vatRate: data.vatRate
      }
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
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="">
          {/* Header */}
          <TitleHeader
            title={t("global_settings")}
            subtitle={t("manage_your_platform_core_configuration")}
            extraComponent={
              <motion.button
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                type="submit"
                disabled={isSaving}
                className={`
              relative overflow-hidden group flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-[#DC3173] transition-all
              ${isSaving
                    ? "bg-white/50 cursor-wait"
                    : "bg-white hover:bg-white/90 cursor-pointer"
                  }
            `}
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

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Status */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                }}
                className={`
                relative overflow-hidden rounded-2xl border transition-all duration-300
                ${watchIsPlatformLive
                    ? "bg-white border-gray-200 shadow-sm"
                    : "bg-gray-900 border-gray-800 shadow-xl"
                  }
              `}
              >
                <div className="absolute top-0 right-0 p-32 bg-[#DC3173]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div
                      className={`
                    p-4 rounded-2xl transition-colors duration-300
                    ${watchIsPlatformLive
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-800 text-gray-400"
                        }
                  `}
                    >
                      <Activity size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2
                        className={`text-2xl font-bold ${watchIsPlatformLive ? "text-gray-900" : "text-white"
                          }`}
                      >
                        {t("platform_status")}
                      </h2>
                      <p
                        className={`mt-1 font-medium ${watchIsPlatformLive
                          ? "text-gray-500"
                          : "text-gray-400"
                          }`}
                      >
                        {watchIsPlatformLive
                          ? t("your_platform_currently_live")
                          : t("platform_maintenance_mode")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-bold uppercase tracking-wider ${watchIsPlatformLive ? "text-green-600" : "text-gray-400"
                        }`}
                    >
                      {watchIsPlatformLive ? t("live") : t("maintenance")}
                    </span>
                    <FormField
                      control={form.control}
                      name="isPlatformLive"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <SettingsToggle
                              label=""
                              checked={field.value}
                              onChange={(val) => field.onChange(val)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {!watchIsPlatformLive && (
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
                      className="border-t border-gray-800 bg-gray-900/50 px-8 py-6"
                    >
                      <FormField
                        control={form.control}
                        name="maintenanceMessage"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormControl>
                              <SettingsInput
                                fieldState={fieldState}
                                label={t("maintenance_message")}
                                type="text"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder={t("enter_message_shown_to_users")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Delivery Pricing */}
            <SettingsCard
              title={t("delivery_pricing")}
              description={t("configure_base_rates_distance")}
              icon={EuroIcon}
              delay={0.1}
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
                  name="minDeliveryCharge"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("min_charge")}
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
                  name="maxDeliveryCharge"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("max_charge")}
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
                  name="freeDeliveryAbove"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-2">
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("free_delivery_above")}
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
                  name="maxDeliveryDistanceKm"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-2">
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("maximum_delivery_distance")}
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          suffix="km"
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
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-2">
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label="Delivery VAT Rate"
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
              </div>
            </SettingsCard>

            {/* Commission & Fees */}
            <SettingsCard
              title={t("commissions_and_fees")}
              description={t("set_platform_earnings_tax_rates")}
              icon={Percent}
              delay={0.2}
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
                            // description={t(
                            //   "percentage_taken_from_each_order_total",
                            // )}
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
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <SettingsInput
                            fieldState={fieldState}
                            label="Platform VAT"
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
                </div>
                <FormField
                  control={form.control}
                  name="fleetManagerCommissionPercent"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label="Fleet Manager Commission"
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
                <FormField
                  control={form.control}
                  name="deliveryPartnerCommissionPercent"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("delivery_partner_commission")}
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          suffix="%"
                          description={t("percentage_paid_to_driver")}
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
                  name="vendorVatPercent"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("vendor_vat")}
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          suffix="%"
                          description="VAT percentage added to vendor earnings"
                          min={0}
                          max={100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SettingsCard>

            {/* Order Rules */}
            <SettingsCard
              title={t("order_rules")}
              description={t("define_constraints_for_customer_orders")}
              icon={Package}
              delay={0.3}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minOrderAmount"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("min_order_amount")}
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
                  name="maxOrderAmount"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("max_order_amount")}
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
                  name="maxItemsPerOrder"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-2">
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("max_items_per_order")}
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          suffix="items"
                          description="Maximum number of items allowed per order"
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

            {/* Cancellation & Automation */}
            <SettingsCard
              title={t("cancellation_and_refunds")}
              description={t("manage_time_limits_processing")}
              icon={Clock}
              delay={0.4}
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
                <FormField
                  control={form.control}
                  name="autoCancelUnacceptedOrderMinutes"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("auto_cancel_unaccepted_orders")}
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          suffix="min"
                          description={t("cancel_orders_if_no_driver_accepts")}
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="autoMarkDeliveredAfterMinutes"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("auto_mark_delivered")}
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          suffix="min"
                          description={t("automatically_complete_orders")}
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SettingsCard>

            {/* OTP & Security */}
            <SettingsCard
              title={t("otp_security")}
              description={t("configure_order_verification_settings")}
              icon={Shield}
              delay={0.45}
            >
              <div className="space-y-6">
                <div className="p-4 bg-[#DC3173]/5 rounded-xl border border-[#DC3173]/10">
                  <FormField
                    control={form.control}
                    name="orderOtpEnabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SettingsToggle
                            label={t("enable_order_otp")}
                            description={t(
                              "require_otp_verification_order_delivery",
                            )}
                            checked={field.value}
                            onChange={(val) => field.onChange(val)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <AnimatePresence>
                  {/* {watchOrderOtpEnabled && ( */}
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
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="otpLength"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <SettingsInput
                              fieldState={fieldState}
                              label={t("otp_length")}
                              type="number"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              suffix="digits"
                              description={t("number_of_digits_otp_code")}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="otpExpiryMinutes"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <SettingsInput
                              fieldState={fieldState}
                              label={t("otp_expiry_time")}
                              type="number"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              suffix="min"
                              description={t("time_before_otp_expires")}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                  {/* )} */}
                </AnimatePresence>
              </div>
            </SettingsCard>

            {/* Offers & Refunds */}
            <SettingsCard
              title="Offers & Refunds"
              description={t("control_global_discount_settings")}
              icon={Gift}
              delay={0.5}
            >
              <div className="space-y-6">
                <div className="p-4 bg-[#DC3173]/5 rounded-xl border border-[#DC3173]/10">
                  <FormField
                    control={form.control}
                    name="isOfferEnabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SettingsToggle
                            label="Enable Offers"
                            description={t("activate_sitewide_promotional")}
                            checked={field.value}
                            onChange={(val) => field.onChange(val)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="maxDiscountPercent"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("max_discount_percentage")}
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          suffix="%"
                          description={t("safety_cap_generated_discounts")}
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
                  name="refundProcessingDays"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("refund_processing_days")}
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          suffix="days"
                          description="Number of days to process refunds"
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SettingsCard>

            {/* Ingredients order and delivery changes */}
            <SettingsCard
              title="Ingredients Delivery Charges"
              description={t("control_global_discount_settings")}
              icon={Gift}
              delay={0.5}
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

                <FormField
                  control={form.control}
                  name="vatRate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("vatRate")}
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

              </div>
            </SettingsCard>
          </div>
        </form>
      </Form>
    </div>
  );
}
