"use client";

import SettingsInput from "@/components/Dashboard/Settings/GlobalSettings/SettingsInput";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { useTranslation } from "@/hooks/use-translation";
import { useFieldArray } from "react-hook-form";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReferralMilestoneSettings({ form }: any) {
  const {t} = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customerReferralMilestones",
  });

  return (
    <div className="space-y-4">
      {fields.map((item, index) => (
        <div
          key={item.id}
          className="p-4 border rounded-xl bg-gray-50 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Friends Required */}
            <FormField
              control={form.control}
              name={`customerReferralMilestones.${index}.friendsRequired`}
              render={({ field, fieldState }) => (
                <SettingsInput
                  fieldState={fieldState}
                  label={t("friends_required")}
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  min={1}
                />
              )}
            />

            {/* Reward Value */}
            <FormField
              control={form.control}
              name={`customerReferralMilestones.${index}.rewardValue`}
              render={({ field, fieldState }) => (
                <SettingsInput
                  fieldState={fieldState}
                  label={t("reward_value")}
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  min={0}
                />
              )}
            />

            {/* Min Order */}
            <FormField
              control={form.control}
              name={`customerReferralMilestones.${index}.minOrderAmountPerFriend`}
              render={({ field, fieldState }) => (
                <SettingsInput
                  fieldState={fieldState}
                  label={t("min_order_per_friend")}
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  suffix="€"
                  min={0}
                />
              )}
            />

            {/* Reward Type */}
            <FormField
              control={form.control}
              name={`customerReferralMilestones.${index}.rewardType`}
              render={({ field }) => (
                <select
                  className="border rounded-lg px-3 py-2"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value="CASHBACK">Cashback</option>
                  <option value="FREE_MEAL">Free Meal</option>
                  <option value="FREE_DELIVERY">Free Delivery</option>
                  <option value="CREDIT">Credit</option>
                </select>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
            >
              {t("remove")}
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        className="bg-[#DC3173] hover:bg-[#DC3173]/90"
        onClick={() =>
          append({
            friendsRequired: 1,
            rewardType: "CASHBACK",
            rewardValue: 0,
            minOrderAmountPerFriend: 0,
          })
        }
      >
        + {t("add_milestone")}
      </Button>
    </div>
  );
}
