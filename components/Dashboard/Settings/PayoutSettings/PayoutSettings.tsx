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
import { payoutSettingsSchema } from "@/validations/settings/payout-settings/payout-settings.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Gift, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TPayoutSettingsForm = z.infer<typeof payoutSettingsSchema>;

export default function PayoutSettings({
  settingsResult: settings,
}: {
  settingsResult: TGlobalSettings;
}) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const form = useForm<TPayoutSettingsForm>({
    resolver: zodResolver(payoutSettingsSchema),
    values: {
      autoGenerate: settings?.payout?.autoGenerate || true,
      payoutDays: settings?.payout?.payoutDays || [],
      minPayoutAmount: settings?.payout?.minPayoutAmount || 0,
      payoutWindowDays: settings?.payout?.payoutWindowDays || 0,
    },
  });

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as (
    | "Sunday"
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
  )[];

  const onSubmit = async (data: TPayoutSettingsForm) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving settings...");

    const payload = {
      payout: {
        autoGenerate: data.autoGenerate,
        payoutDays: data.payoutDays,
        minPayoutAmount: data.minPayoutAmount,
        payoutWindowDays: data.payoutWindowDays,
      },
    } as Partial<TGlobalSettings>;

    const result = settings._id
      ? await updateGlobalSettingsReq(payload)
      : await createGlobalSettingsReq(payload);

    if (result.success) {
      toast.success(result.message || "Payout settings saved successfully!", {
        id: toastId,
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      toast.error(result.message || "Payout settings save failed", {
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
            title="Payouts Settings"
            subtitle="Configure payout options here"
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
              ${
                isSaving
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
            <SettingsCard
              title="Payout Automation"
              description="Configure automatic payout generation"
              icon={Gift}
              delay={0.55}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">
                    Auto Payout Generation
                  </h3>

                  {/* <FormField
                    control={form.control}
                    name="customerPointsPerEuro"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <SettingsInput
                            fieldState={fieldState}
                            label="Points per € spent"
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            suffix="pts"
                            description="Points earned per euro spent"
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                  <div className="p-4 bg-[#DC3173]/5 rounded-xl border border-[#DC3173]/10">
                    <FormField
                      control={form.control}
                      name="autoGenerate"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <SettingsToggle
                              label="Auto-generate payouts"
                              description="Automatically generate payouts based on the schedule and criteria you set."
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

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">
                    Payout Criteria
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minPayoutAmount"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <SettingsInput
                              fieldState={fieldState}
                              label="Minimum payout amount"
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
                      name="payoutWindowDays"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <SettingsInput
                              fieldState={fieldState}
                              label="Payout window days"
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
                </div>
              </div>
            </SettingsCard>

            <SettingsCard
              title="Payout Schedule"
              description="Configure payout schedule"
              icon={Gift}
              delay={0.55}
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">
                  Payout Days
                </h3>
                <FormField
                  control={form.control}
                  name="payoutDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {daysOfWeek.map((day) => (
                            <motion.button
                              key={day}
                              type="button"
                              onClick={() => {
                                field.onChange(
                                  field.value?.includes(day)
                                    ? field.value?.filter((d) => d !== day)
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
                              {t(day.toLowerCase())}
                            </motion.button>
                          ))}
                        </div>
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
