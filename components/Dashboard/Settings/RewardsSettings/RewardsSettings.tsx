"use client";

import SettingsCard from "@/components/Dashboard/Settings/GlobalSettings/SettingsCard";
import SettingsInput from "@/components/Dashboard/Settings/GlobalSettings/SettingsInput";
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
import {
  CheckCircle2,
  Clock,
  Gift,
  Save,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FieldPath, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TRewardsForm = z.infer<typeof RewardsSettingsSchema>;


function RewardNumberField({
  form,
  name,
  label,
  description,
  suffix = "pts",
  className,
}: {
  form: UseFormReturn<TRewardsForm>;
  name: FieldPath<TRewardsForm>;
  label: string;
  description: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const raw = field.value as number | undefined;
        const value =
          typeof raw === "number" && !Number.isNaN(raw) ? raw : "";

        return (
          <FormItem className={className}>
            <FormControl>
              <SettingsInput
                fieldState={fieldState}
                label={label}
                type="number"
                value={value as number}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                suffix={suffix}
                description={description}
                min={0}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

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

  const r = settings?.rewards;

  const formValues = useMemo<TRewardsForm>(
    () => ({
      customerOrderPoints: r?.customerOrderPoints ?? 0,
      riderDeliveryPoints: r?.riderDeliveryPoints ?? 0,
      vendorOrderPoints: r?.vendorOrderPoints ?? 0,
      referralPoints: {
        customer: r?.referralPoints?.customer ?? 0,
        rider: r?.referralPoints?.rider ?? 0,
        vendor: r?.referralPoints?.vendor ?? 0,
      },
      welcomeBonus: {
        customer: r?.welcomeBonus?.customer ?? 0,
        rider: r?.welcomeBonus?.rider ?? 0,
        vendor: r?.welcomeBonus?.vendor ?? 0,
      },
      pointsExpiryDays: r?.pointsExpiryDays ?? 0,
      maxRewardClaimsPerYear: r?.maxRewardClaimsPerYear ?? 0,
    }),
    [r],
  );

  const form = useForm<TRewardsForm>({
    resolver: zodResolver(RewardsSettingsSchema),
    defaultValues: formValues,
    values: formValues,
  });

  const onSubmit = async (data: TRewardsForm) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving global settings...");

    const payload = {
      rewards: {
        customerOrderPoints: data.customerOrderPoints,
        riderDeliveryPoints: data.riderDeliveryPoints,
        vendorOrderPoints: data.vendorOrderPoints,
        referralPoints: data.referralPoints,
        welcomeBonus: data.welcomeBonus,
        pointsExpiryDays: data.pointsExpiryDays,
        maxRewardClaimsPerYear: data.maxRewardClaimsPerYear,
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
    } else {
      toast.error(result.message || "Global settings save failed", {
        id: toastId,
      });
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus("idle"), 3000);
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen">
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header */}
          <TitleHeader
            title={t("rewards_settings")}
            subtitle={t("configure_loyalty_referral_rewards")}
            extraComponent={
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
            {/* Order / delivery points */}
            <SettingsCard
              title={t("order_points") || "Order Points"}
              description={
                t("points_earned_per_completed_order") ||
                "Points each role earns when an order is completed"
              }
              icon={ShoppingBag}
              delay={0.55}
            >
              <div className="grid grid-cols-1 gap-4">
                <RewardNumberField
                  form={form}
                  name="customerOrderPoints"
                  label={t("customer_order_points") || "Customer order points"}
                  description={
                    t("customer_order_points_desc") ||
                    "Loyalty points a customer earns each time one of their orders is completed. Customers can later redeem these points for rewards."
                  }
                />
                <RewardNumberField
                  form={form}
                  name="riderDeliveryPoints"
                  label={
                    t("rider_delivery_points") || "Rider delivery points"
                  }
                  description={
                    t("rider_delivery_points_desc") ||
                    "Points a rider earns for every order they successfully deliver. Higher values motivate riders to complete more deliveries."
                  }
                />
                <RewardNumberField
                  form={form}
                  name="vendorOrderPoints"
                  label={t("vendor_order_points") || "Vendor order points"}
                  description={
                    t("vendor_order_points_desc") ||
                    "Points a vendor (restaurant) earns for every order they fulfil. Rewards vendors for staying active on the platform."
                  }
                />
              </div>
            </SettingsCard>

            {/* Referral points */}
            <SettingsCard
              title={t("referral_points") || "Referral Points"}
              description={
                t("points_for_successful_referrals") ||
                "Points awarded to each role for a successful referral"
              }
              icon={Users}
              delay={0.6}
            >
              <div className="grid grid-cols-1 gap-4">
                <RewardNumberField
                  form={form}
                  name="referralPoints.customer"
                  label={t("customer") || "Customer"}
                  description={
                    t("referral_points_customer_desc") ||
                    "Points a customer receives when someone they referred signs up and qualifies (e.g. completes their first order)."
                  }
                />
                <RewardNumberField
                  form={form}
                  name="referralPoints.rider"
                  label={t("rider") || "Rider"}
                  description={
                    t("referral_points_rider_desc") ||
                    "Points a rider receives when a person they referred joins and qualifies on the platform."
                  }
                />
                <RewardNumberField
                  form={form}
                  name="referralPoints.vendor"
                  label={t("vendor") || "Vendor"}
                  description={
                    t("referral_points_vendor_desc") ||
                    "Points a vendor receives when a business they referred joins and qualifies on the platform."
                  }
                />
              </div>
            </SettingsCard>

            {/* Welcome bonus */}
            <SettingsCard
              title={t("welcome_bonus") || "Welcome Bonus"}
              description={
                t("points_given_on_signup") ||
                "Points given to each role when they join"
              }
              icon={Gift}
              delay={0.65}
            >
              <div className="grid grid-cols-1 gap-4">
                <RewardNumberField
                  form={form}
                  name="welcomeBonus.customer"
                  label={t("customer") || "Customer"}
                  description={
                    t("welcome_bonus_customer_desc") ||
                    "One-time bonus points given to a new customer when they register. Set to 0 to disable."
                  }
                />
                <RewardNumberField
                  form={form}
                  name="welcomeBonus.rider"
                  label={t("rider") || "Rider"}
                  description={
                    t("welcome_bonus_rider_desc") ||
                    "One-time bonus points given to a new rider when they join the platform. Set to 0 to disable."
                  }
                />
                <RewardNumberField
                  form={form}
                  name="welcomeBonus.vendor"
                  label={t("vendor") || "Vendor"}
                  description={
                    t("welcome_bonus_vendor_desc") ||
                    "One-time bonus points given to a new vendor when they are onboarded. Set to 0 to disable."
                  }
                />
              </div>
            </SettingsCard>

            {/* Expiry & limits */}
            <SettingsCard
              title={t("expiry_and_limits") || "Expiry & Limits"}
              description={
                t("points_expiry_and_claim_limits") ||
                "Control how long points last and how often rewards can be claimed"
              }
              icon={Clock}
              delay={0.7}
            >
              <div className="grid grid-cols-1 gap-4">
                <RewardNumberField
                  form={form}
                  name="pointsExpiryDays"
                  label={t("points_expiry") || "Points expiry"}
                  suffix="days"
                  description={
                    t("points_expiry_desc") ||
                    "Number of days after which earned points expire if they are not used. Set to 0 if points should never expire."
                  }
                />
                <RewardNumberField
                  form={form}
                  name="maxRewardClaimsPerYear"
                  label={
                    t("max_reward_claims_per_year") ||
                    "Max reward claims per year"
                  }
                  suffix="claims"
                  description={
                    t("max_reward_claims_per_year_desc") ||
                    "Maximum number of times a single user can claim a reward in one year. Prevents abuse and keeps reward costs predictable."
                  }
                />
              </div>
            </SettingsCard>
          </div>
        </form>
      </Form>
    </div>
  );
}