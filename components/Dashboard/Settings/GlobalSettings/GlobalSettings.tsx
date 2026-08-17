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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import {
  createGlobalSettingsReq,
  updateGlobalSettingsReq,
} from "@/services/dashboard/global-settings/global-settings.service";
import { TGlobalSettings } from "@/types/global-settings.type";
import { TTax } from "@/types/tax.type";
import { globalSettingsSchema } from "@/validations/settings/global-settings/global-settings.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  EuroIcon,
  Gift,
  Package,
  Percent,
  Save,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TGlobalSettingsForm = z.infer<typeof globalSettingsSchema>;

export default function GlobalSettings({
  settingsResult: settings,
  taxRates
}: {
  settingsResult: TGlobalSettings;
  taxRates: TTax[];
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
      deliveryVatRate: settings?.delivery?.vatRate || 0,

      // commission
      platformCommissionPercent: settings?.commission?.platformPercent || 0,
      platformVatRate: settings?.commission?.platformVatRate || 0,
      fleetManagerCommissionPercent: settings?.commission?.fleetManagerPercent || 0,
      serviceCharge: settings?.commission?.serviceCharge || 0,

      // order
      customerNearestVendorRadiusKm: settings?.order?.nearestVendorRadiusKm || 0,
      cancelTimeLimitMinutes: settings?.order?.cancelTimeLimitMinutes || 0,

      // ingredients and delivery charges
      deliveryChargeInsideLisbon: settings?.ingredientsOrder?.deliveryChargeInsideLisbon || 20,
      deliveryChargeOutsideLisbon: settings?.ingredientsOrder?.deliveryChargeOutsideLisbon || 30,
    },
  });
  console.log("taxes", taxRates);
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
      order: {
        nearestVendorRadiusKm: data.customerNearestVendorRadiusKm,
        cancelTimeLimitMinutes: data.cancelTimeLimitMinutes,
      },
      ingredientsOrder: {
        deliveryChargeInsideLisbon: data.deliveryChargeInsideLisbon,
        deliveryChargeOutsideLisbon: data.deliveryChargeOutsideLisbon,
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
                {/* <FormField
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
                /> */}
                <FormField
                  control={form.control}
                  name="deliveryVatRate"
                  render={({ field }) => (
                    <FormItem className="col-span-2 w-full">
                      <FormLabel>{t("delivery_vat_rate")}</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString() ?? ""}
                          onValueChange={(value) => field.onChange(parseFloat(value))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("delivery_vat_rate")} />
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
                {/* <FormField
                  control={form.control}
                  name="deliveryVatRate"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-2">
                      <FormControl>
                        <SettingsInput
                          fieldState={fieldState}
                          label={t("delivery_vat_rate")}
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
                /> */}
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
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("platform_vat")}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString() ?? ""}
                            onValueChange={(value) => field.onChange(parseFloat(value))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("platform_vat")} />
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
                  {/* <FormField
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
                  /> */}
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
                  {/* <FormField
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
                  /> */}
                </div>
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
                {/* <FormField
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
                /> */}
              </div>
            </SettingsCard>

            {/* Ingredients order and delivery changes */}
            <SettingsCard
              title={t("ingredients_delivery_charges")}
              description={t("control_ingredients_delivery_charges_settings")}
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
                {/* <FormField
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
                /> */}
              </div>
            </SettingsCard>
          </div>
        </form>
      </Form>
    </div>
  );
}
