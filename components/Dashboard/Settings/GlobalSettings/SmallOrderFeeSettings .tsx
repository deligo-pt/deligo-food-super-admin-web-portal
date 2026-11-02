"use client";

import SettingsCard from "@/components/Dashboard/Settings/GlobalSettings/SettingsCard";
import SettingsInput from "@/components/Dashboard/Settings/GlobalSettings/SettingsInput";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { TTax } from "@/types/tax.type";
import { globalSettingsSchema } from "@/validations/settings/global-settings/global-settings.validation";
import { AlertTriangle, Info, Loader2, Receipt } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";
import z from "zod";

type TGlobalSettingsForm = z.infer<typeof globalSettingsSchema>;

export type TSmallOrderFeeValues = {
    isEnabled: boolean;
    threshold: number;
    fee: number;
    isTaxable: boolean;
    taxPercentage: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const safe = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : 0);
const euro = (n: number) => `${round2(n).toFixed(2)} €`;
/** never hand NaN / undefined to an <input value> */
const inputValue = (v: unknown) =>
    typeof v === "number" && !Number.isNaN(v) ? v : "";

function ToggleRow({
    checked,
    onChange,
    label,
    description,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onChange}
                className="data-[state=checked]:bg-[#DC3173]"
            />
        </div>
    );
}

// ────────────────────────────────────────────────
// Tab content
// ────────────────────────────────────────────────
export default function SmallOrderFeeSettings({
    form,
    taxRates,
}: {
    form: UseFormReturn<TGlobalSettingsForm>;
    taxRates: TTax[];
}) {
    const { t } = useTranslation();

    const [enabled, threshold, fee, isTaxable, taxPercentage] = useWatch({
        control: form.control,
        name: [
            "smallOrderFeeEnabled",
            "smallOrderFeeThreshold",
            "smallOrderFeeAmount",
            "smallOrderFeeIsTaxable",
            "smallOrderFeeTaxPercentage",
        ],
    });

    const feeNet = safe(fee);
    const tax = isTaxable ? round2((feeNet * safe(taxPercentage)) / 100) : 0;
    const total = round2(feeNet + tax);

    return (
        <SettingsCard
            title={t("small_order_fee") || "Small Order Fee"}
            description={
                t("small_order_fee_description") ||
                "Charge an extra fee when the basket is below a minimum amount"
            }
            icon={Receipt}
            delay={0}
        >
            <div className="space-y-5">
                {/* master switch */}
                <FormField
                    control={form.control}
                    name="smallOrderFeeEnabled"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <ToggleRow
                                    checked={!!field.value}
                                    onChange={field.onChange}
                                    label={t("enable_small_order_fee") || "Enable small order fee"}
                                    description={
                                        t("enable_small_order_fee_desc") ||
                                        "Off by default. When off, every cart and new checkout returns no small order fee."
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* the rest is greyed out while the fee is disabled (values are kept) */}
                <div
                    aria-disabled={!enabled}
                    className={cn(
                        "space-y-5 transition-opacity",
                        !enabled && "pointer-events-none select-none opacity-50"
                    )}
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* threshold */}
                        <div>
                            <FormField
                                control={form.control}
                                name="smallOrderFeeThreshold"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <SettingsInput
                                                fieldState={fieldState}
                                                label={t("small_order_threshold") || "Threshold"}
                                                type="number"
                                                value={inputValue(field.value) as number}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === "" ? NaN : parseFloat(e.target.value)
                                                    )
                                                }
                                                suffix="€"
                                                min={0}
                                                max={10000}
                                                description={
                                                    t("small_order_threshold_desc") ||
                                                    "The fee applies when the basket is strictly below this amount (0 – 10,000)."
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="mt-2 space-y-1 rounded-lg bg-[#DC3173]/5 p-3 text-xs">
                                <p className="flex items-center gap-1.5 font-medium text-[#DC3173]">
                                    <Info className="h-3.5 w-3.5 shrink-0" />
                                    {t("small_order_applies_to_all") ||
                                        "Applies to every order type: delivery, pickup, ASAP and scheduled"}
                                </p>
                                <p className="text-gray-500">
                                    {t("small_order_threshold_compared") ||
                                        "Compared with the items subtotal before offers (tax and add-ons included). Delivery, service charge, deposits and coupons are not counted."}
                                </p>
                            </div>
                        </div>

                        {/* fee */}
                        <FormField
                            control={form.control}
                            name="smallOrderFeeAmount"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <SettingsInput
                                            fieldState={fieldState}
                                            label={t("small_order_fee_amount") || "Fee (net)"}
                                            type="number"
                                            value={inputValue(field.value) as number}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? NaN : parseFloat(e.target.value)
                                                )
                                            }
                                            suffix="€"
                                            min={0}
                                            max={1000}
                                            description={
                                                t("small_order_fee_amount_desc") ||
                                                "Net amount charged to the customer, before tax (0 – 1,000). 0 means no fee."
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* taxable */}
                    <FormField
                        control={form.control}
                        name="smallOrderFeeIsTaxable"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <ToggleRow
                                        checked={!!field.value}
                                        onChange={field.onChange}
                                        label={t("small_order_fee_taxable") || "Fee is taxable"}
                                        description={
                                            t("small_order_fee_taxable_desc") ||
                                            "When on, the tax below is added on top of the fee."
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div
                        className={cn(
                            "transition-opacity sm:max-w-[50%]",
                            !isTaxable && "pointer-events-none opacity-50"
                        )}
                    >
                        <FormField
                            control={form.control}
                            name="smallOrderFeeTaxPercentage"
                            render={({ field }) => (
                                <FormItem className="col-span-2 w-full">
                                    <FormLabel>{t("small_order_fee_tax_percentage")}</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value?.toString() ?? ""}
                                            onValueChange={(value) =>
                                                field.onChange(parseFloat(value))
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={t("small_order_fee_tax_percentage")}
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
                        {/* <FormField
                            control={form.control}
                            name="smallOrderFeeTaxPercentage"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <SettingsInput
                                            fieldState={fieldState}
                                            label={t("small_order_fee_tax_percentage") || "Tax percentage"}
                                            type="number"
                                            value={inputValue(field.value) as number}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? NaN : parseFloat(e.target.value)
                                                )
                                            }
                                            suffix="%"
                                            min={0}
                                            max={100}
                                            description={
                                                t("small_order_fee_tax_percentage_desc") ||
                                                "Only used when the fee is taxable (0 – 100). Example: 23% on a 2.00 € fee = 0.46 € tax."
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}
                    </div>
                </div>

                {/* live preview */}
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {t("preview") || "Preview"}
                    </p>
                    {!enabled ? (
                        <p>
                            {t("small_order_preview_disabled") ||
                                "Disabled: customers are never charged a small order fee."}
                        </p>
                    ) : feeNet === 0 ? (
                        <p>
                            {t("small_order_preview_zero") ||
                                "The fee is 0 €, so no small order fee is charged."}
                        </p>
                    ) : (
                        <p>
                            {t("small_order_preview_basket_below") || "Basket below"}{" "}
                            <b>{euro(safe(threshold))}</b> →{" "}
                            {t("small_order_preview_customer_pays") || "customer pays"}{" "}
                            <b>{euro(total)}</b>{" "}
                            {isTaxable
                                ? `(${euro(feeNet)} + ${euro(tax)} ${t("tax") || "tax"})`
                                : `(${t("no_tax") || "no tax"})`}
                        </p>
                    )}
                </div>
            </div>
        </SettingsCard>
    );
}

// ────────────────────────────────────────────────
// Confirmation before saving
// ────────────────────────────────────────────────
export function SmallOrderFeeConfirmDialog({
    open,
    onOpenChange,
    values,
    isSaving,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    values: TSmallOrderFeeValues | null;
    isSaving: boolean;
    onConfirm: () => void;
}) {
    const { t } = useTranslation();
    if (!values) return null;

    const rows: [string, string][] = [
        [
            t("status") || "Status",
            values.isEnabled ? t("enabled") || "Enabled" : t("disabled") || "Disabled",
        ],
        [t("threshold") || "Threshold", euro(safe(values.threshold))],
        [t("small_order_fee_amount") || "Fee (net)", euro(safe(values.fee))],
        [
            t("small_order_fee_taxable") || "Taxable",
            values.isTaxable ? `${safe(values.taxPercentage)}%` : t("no") || "No",
        ],
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#DC3173]">
                        <AlertTriangle size={20} />
                        {t("confirm_small_order_fee_changes") || "Confirm small order fee changes"}
                    </DialogTitle>
                    <DialogDescription>
                        {t("confirm_small_order_fee_desc") ||
                            "These changes go live immediately for all carts and new checkouts."}
                    </DialogDescription>
                </DialogHeader>

                <dl className="divide-y rounded-lg border text-sm">
                    {rows.map(([label, value]) => (
                        <div key={label} className="flex justify-between px-3 py-2">
                            <dt className="text-gray-500">{label}</dt>
                            <dd className="font-semibold text-gray-900">{value}</dd>
                        </div>
                    ))}
                </dl>

                <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <p className="font-semibold">
                        {t("open_checkouts_will_refresh") ||
                            "Open checkouts will be asked to refresh"}
                    </p>
                    <ul className="list-disc space-y-1 pl-4">
                        <li>
                            {t("small_order_warning_quotes") ||
                                "A checkout quote created earlier is refused when the customer starts payment (409 CHECKOUT_TOTALS_CHANGED); they just refresh."}
                        </li>
                        <li>
                            {t("small_order_warning_orders") ||
                                "Existing orders keep the fee they paid, and their refunds are unchanged."}
                        </li>
                        {!values.isEnabled && (
                            <li>
                                {t("small_order_warning_disable") ||
                                    "Disabling takes effect on the next read: every cart and new checkout returns a small order fee of 0."}
                            </li>
                        )}
                    </ul>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSaving}
                        onClick={() => onOpenChange(false)}
                    >
                        {t("cancel") || "Cancel"}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={isSaving}
                        onClick={onConfirm}
                        className="font-medium text-white"
                        style={{ backgroundColor: "#DC3173" }}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("saving") || "Saving"}...
                            </>
                        ) : (
                            t("confirm_and_save") || "Confirm & save"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}