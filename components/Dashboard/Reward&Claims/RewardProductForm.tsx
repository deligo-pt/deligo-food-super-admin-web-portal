// src/components/Dashboard/Reward&Claims/RewardProductForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/use-translation";
import {
    createRewardProductSchema,
    REWARD_TARGET_ROLES,
    RewardProductFormValues,
} from "@/validations/reward-claim/reward-claim.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { Controller, FieldNamesMarkedBoolean, useForm } from "react-hook-form";

export type RewardFormDirtyFields = Partial<
    Readonly<FieldNamesMarkedBoolean<RewardProductFormValues>>
>;

interface IProps {
    mode: "create" | "edit";
    defaultValues?: Partial<RewardProductFormValues>;
    isSubmitting: boolean;
    onSubmit: (
        values: RewardProductFormValues,
        dirtyFields: RewardFormDirtyFields
    ) => void | Promise<void>;
    onCancel: () => void;
    className?: string;
}

const Field = ({
    label,
    error,
    hint,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) => (
    <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        {children}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

export default function RewardProductForm({
    mode,
    defaultValues,
    isSubmitting,
    onSubmit,
    onCancel,
    className,
}: IProps) {
    const { t } = useTranslation();
    const isEdit = mode === "edit";

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, dirtyFields },
    } = useForm<RewardProductFormValues>({
        resolver: zodResolver(createRewardProductSchema),
        defaultValues: {
            name: "",
            targetRole: undefined,
            requiredPoints: undefined,
            cashPrice: undefined,
            regularPrice: undefined,
            isActive: true,
            ...defaultValues,
        },
    });

    return (
        <form
            onSubmit={handleSubmit((values) => onSubmit(values, dirtyFields))}
            className={className ?? "bg-white shadow-md rounded-2xl p-4 md:p-6 space-y-6"}
            noValidate
        >
            <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <Field label={t("product_name") || "Product name"} error={errors.name?.message}>
                        <Input
                            {...register("name")}
                            maxLength={120}
                            placeholder="e.g. Power bank"
                            disabled={isSubmitting}
                        />
                    </Field>
                </div>

                <Field
                    label={t("target_role") || "Target role"}
                    error={errors.targetRole?.message}
                    hint={isEdit ? t("role_cannot_be_changed") || "Role can't be changed. Create a new product instead." : undefined}
                >
                    <Controller
                        control={control}
                        name="targetRole"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isEdit || isSubmitting}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t("select_role") || "Select role"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {REWARD_TARGET_ROLES.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </Field>

                <Field
                    label={t("required_points") || "Required points"}
                    error={errors.requiredPoints?.message}
                >
                    <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        placeholder="300"
                        disabled={isSubmitting}
                        {...register("requiredPoints", { valueAsNumber: true })}
                    />
                </Field>

                <Field
                    label={t("cash_price") || "Cash price (€)"}
                    error={errors.cashPrice?.message}
                    hint={t("cash_price_hint") || "What the user pays at pickup. 0 = free."}
                >
                    <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        placeholder="7.50"
                        disabled={isSubmitting}
                        {...register("cashPrice", { valueAsNumber: true })}
                    />
                </Field>

                <Field
                    label={t("regular_price") || "Regular price (€)"}
                    error={errors.regularPrice?.message}
                    hint={t("regular_price_hint") || "Normal shelf price, shown struck through."}
                >
                    <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        placeholder="12.50"
                        disabled={isSubmitting}
                        {...register("regularPrice", { valueAsNumber: true })}
                    />
                </Field>

                <div className="md:col-span-2 flex items-center justify-between rounded-xl border p-4"
                    style={{ borderColor: "#DC317320" }}>
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            {t("active") || "Active"}
                        </p>
                        <p className="text-xs text-gray-400">
                            {t("inactive_products_hidden") ||
                                "Inactive products are hidden from the catalog and can't be claimed."}
                        </p>
                    </div>
                    <Controller
                        control={control}
                        name="isActive"
                        render={({ field }) => (
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "#DC317315" }}>
                <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
                    {t("cancel") || "Cancel"}
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="text-white font-medium"
                    style={{ backgroundColor: "#DC3173" }}
                >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? t("save_changes") || "Save changes" : t("create_product") || "Create product"}
                </Button>
            </div>
        </form>
    );
}