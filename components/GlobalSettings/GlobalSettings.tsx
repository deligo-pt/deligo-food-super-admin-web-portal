"use client";

import SettingsCard from "@/components/GlobalSettings/SettingsCard";
import SettingsInput from "@/components/GlobalSettings/SettingsInput";
import SettingsToggle from "@/components/GlobalSettings/SettingsToggle";
import { Button } from "@/components/ui/button";
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
} from "@/services/dashboard/global-settings/global-settings";
import { TGlobalSettings } from "@/types/global-settings.type";
import { globalSettingsSchema } from "@/validations/global-settings/global-settings.validation";
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
  SettingsIcon,
  Shield,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TGlobalSettingsForm = z.infer<typeof globalSettingsSchema>;

// const initialSettings: TGlobalSettings = {
//   deliveryChargePerKm: 1.5,
//   baseDeliveryCharge: 5.0,
//   minDeliveryCharge: 5.0,
//   maxDeliveryCharge: 25.0,
//   freeDeliveryAbove: 100.0,
//   maxDeliveryDistanceKm: 15,
//   platformCommissionPercent: 10,
//   deliveryPartnerCommissionPercent: 5,
//   vendorVatPercent: 15,
//   minOrderAmount: 10,
//   maxOrderAmount: 500,
//   maxItemsPerOrder: 20,
//   cancelTimeLimitMinutes: 5,
//   refundProcessingDays: 3,
//   isCouponEnabled: true,
//   isOfferEnabled: true,
//   maxDiscountPercent: 50,
//   autoCancelUnacceptedOrderMinutes: 10,
//   autoMarkDeliveredAfterMinutes: 60,
//   isPlatformLive: true,
//   maintenanceMessage:
//     "We are currently undergoing scheduled maintenance. We'll be back shortly!",
//   orderOtpEnabled: true,
//   otpLength: 6,
//   otpExpiryMinutes: 10,
// };

export function GlobalSettings({
  settingsResult: settings,
}: {
  settingsResult: TGlobalSettings;
}) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const form = useForm<TGlobalSettingsForm>({
    resolver: zodResolver(globalSettingsSchema),
    values: {
      deliveryChargePerKm: settings.deliveryChargePerKm || 0,
      baseDeliveryCharge: settings.baseDeliveryCharge || 0,
      minDeliveryCharge: settings.minDeliveryCharge || 0,
      maxDeliveryCharge: settings.maxDeliveryCharge || 0,
      freeDeliveryAbove: settings.freeDeliveryAbove || 0,
      maxDeliveryDistanceKm: settings.maxDeliveryDistanceKm || 0,
      platformCommissionPercent: settings.platformCommissionPercent || 0,
      deliveryPartnerCommissionPercent:
        settings.deliveryPartnerCommissionPercent || 0,
      vendorVatPercent: settings.vendorVatPercent || 0,
      minOrderAmount: settings.minOrderAmount || 0,
      maxOrderAmount: settings.maxOrderAmount || 0,
      maxItemsPerOrder: settings.maxItemsPerOrder || 0,
      cancelTimeLimitMinutes: settings.cancelTimeLimitMinutes || 0,
      refundProcessingDays: settings.refundProcessingDays || 0,
      maxDiscountPercent: settings.maxDiscountPercent || 0,
      autoCancelUnacceptedOrderMinutes:
        settings.autoCancelUnacceptedOrderMinutes || 0,
      autoMarkDeliveredAfterMinutes:
        settings.autoMarkDeliveredAfterMinutes || 0,
      otpLength: settings.otpLength || 0,
      otpExpiryMinutes: settings.otpExpiryMinutes || 0,
      isCouponEnabled: settings.isCouponEnabled || false,
      isOfferEnabled: settings.isOfferEnabled || false,
      isPlatformLive: settings.isPlatformLive || false,
      orderOtpEnabled: settings.orderOtpEnabled || false,
      maintenanceMessage: settings.maintenanceMessage || "",
    },
  });

  const [watchIsPlatformLive] = useWatch({
    control: form.control,
    name: ["isPlatformLive"],
  });

  const onSubmit = async (data: TGlobalSettingsForm) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving global settings...");

    const result = settings._id
      ? await updateGlobalSettingsReq(data)
      : await createGlobalSettingsReq(data);

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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-[#DC3173]/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <motion.h1
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3"
            >
              <SettingsIcon className="w-6 h-6 text-slate-800" />
              {t("global_settings")}
            </motion.h1>
            <motion.p
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="text-sm text-slate-500"
            >
              {t("manage_your_platform_core_configuration")}
            </motion.p>
          </div>

          <motion.button
            form="globalSettingsForm"
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
            // onClick={handleSave}
            disabled={isSaving}
            className={`
              relative overflow-hidden group flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-[#DC3173]/30 transition-all
              ${isSaving
                ? "bg-[#DC3173]/50 cursor-wait"
                : "bg-[#DC3173] hover:bg-[#DC3173]/90 hover:shadow-[#DC3173]/40"
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
        </div>

        {/* Main Grid */}
        <Form {...form}>
          <form
            id="globalSettingsForm"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Platform Status - Full Width Hero */}
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
                          description={t("percentage_taken_from_each_order_total")}
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
                            field.onChange(parseFloat(e.target.value))
                          }
                          suffix="items"
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SettingsCard>

            {/* Cancellation & Refunds */}
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
                            description={t("require_otp_verification_order_delivery")}
                            checked={field.value}
                            onChange={(val) => field.onChange(val)}
                          />
                          {/* <SettingsInput
                          fieldState={fieldState}
                          label="Refund Processing Days"
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          suffix="days"
                          min={0}
                        /> */}
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

            {/* Offers & Promotions */}
            <SettingsCard
              title={t("offers_and_promotions")}
              description={t("control_global_discount_settings")}
              icon={Gift}
              delay={0.5}
            >
              <div className="space-y-6">
                <div className="p-4 bg-[#DC3173]/5 rounded-xl border border-[#DC3173]/10">
                  <FormField
                    control={form.control}
                    name="isCouponEnabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SettingsToggle
                            label={t("enable_coupons")}
                            description={t("allow_customers_use_promo")}
                            checked={field.value}
                            onChange={(val) => field.onChange(val)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-4 bg-[#DC3173]/5 rounded-xl border border-[#DC3173]/10">
                  <FormField
                    control={form.control}
                    name="isOfferEnabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SettingsToggle
                            label={t("enable_global_offers")}
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
              </div>
            </SettingsCard>

            {/* Automation */}
            <SettingsCard
              title={t("automation")}
              description={t("configure_automated_system_actions")}
              icon={Zap}
              delay={0.6}
            >
              <div className="space-y-4">
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

            <Button type="submit" className="hidden" />
          </form>
        </Form>
      </div>
    </div>
  );
}
