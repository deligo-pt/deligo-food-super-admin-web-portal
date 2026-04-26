"use client";

import SettingsCard from "@/components/Dashboard/Settings/GlobalSettings/SettingsCard";
import SettingsInput from "@/components/Dashboard/Settings/GlobalSettings/SettingsInput";
import ReferralMilestoneSettings from "@/components/Dashboard/Settings/RewardsSettings/ReferralMilestoneSettings";
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
import { RewardsSettingsSchema } from "@/validations/settings/rewards-settings/rewards-settings.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Gift, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TGlobalSettingsForm = z.infer<typeof RewardsSettingsSchema>;

export default function RewardsSettings({
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
    resolver: zodResolver(RewardsSettingsSchema),
    values: {
      customerPointsPerEuro: settings?.rewards?.customerPointsPerEuro || 0,
      riderPointsPerDelivery: settings?.rewards?.riderPointsPerDelivery || 0,
      referralPoints: settings?.rewards?.referralPoints || 0,
      newRiderWelcomeBonus: settings?.rewards?.newRiderWelcomeBonus || 0,
      pointsExpiryDays: settings?.rewards?.pointsExpiryDays || 0,
      customerReferralMilestones:
        settings?.rewards?.customerReferralMilestones || [],
    },
  });

  const onSubmit = async (data: TGlobalSettingsForm) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving global settings...");

    const payload = {
      rewards: {
        customerPointsPerEuro: data.customerPointsPerEuro,
        riderPointsPerDelivery: data.riderPointsPerDelivery,
        referralPoints: data.referralPoints,
        newRiderWelcomeBonus: data.newRiderWelcomeBonus,
        pointsExpiryDays: data.pointsExpiryDays,
        customerReferralMilestones: data.customerReferralMilestones,
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
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="">
          {/* Header */}
          <TitleHeader
            title="Rewards Settings"
            subtitle="Configure loyalty and referral rewards here"
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
              title="Loyalty & Rewards"
              description="Configure points, bonuses, and referral rewards"
              icon={Gift}
              delay={0.55}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">
                    Customer Rewards
                  </h3>

                  <FormField
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
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">
                    Rider Rewards
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="riderPointsPerDelivery"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <SettingsInput
                              fieldState={fieldState}
                              label="Points per delivery"
                              type="number"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              suffix="pts"
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referralPoints"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <SettingsInput
                              fieldState={fieldState}
                              label="Referral points"
                              type="number"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              suffix="pts"
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newRiderWelcomeBonus"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <SettingsInput
                              fieldState={fieldState}
                              label="New rider welcome bonus"
                              type="number"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              suffix="pts"
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pointsExpiryDays"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <SettingsInput
                              fieldState={fieldState}
                              label="Points Expiry"
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
              title="Referral Milestones"
              description="Configure referral milestones and rewards"
              icon={Gift}
              delay={0.55}
            >
              {/* Referral Milestones */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">
                  Customer Referral Milestones
                </h3>

                <ReferralMilestoneSettings form={form} />
              </div>
            </SettingsCard>
          </div>
        </form>
      </Form>
    </div>
  );
}
