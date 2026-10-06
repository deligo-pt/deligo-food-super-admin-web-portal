/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/hooks/use-translation";
import { TTax } from "@/types/tax.type";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

interface IProps {
    form: any;
    watchVariations: any;
    watchPrice: any;
    watchDiscount: any;
    watchTaxId: any;
    watchDiscountType: any;
    taxesData: TTax[];
}

// Ordered rates + tooltips (Portuguese VAT)
const VAT_INFO: Record<number, { label: string; description: string }> = {
    23: {
        label: "23% VAT — Standard Rate",
        description:
            "The standard VAT rate for goods and services that do not qualify for the reduced or intermediate rates.",
    },
    13: {
        label: "13% VAT — Intermediate Rate",
        description:
            "Certain food and restaurant-related products/services. For DeliGo, ready-to-eat meals for takeaway or home delivery are generally subject to 13% VAT.",
    },
    6: {
        label: "6% VAT — Reduced Rate",
        description:
            "Basic essential goods and certain services, including many basic food products such as bread, rice, flour, fresh meat, fish, milk and certain other qualifying food items.",
    },
    0: {
        label: "0% VAT — Exempt / Zero-rated",
        description:
            "Only applicable where the specific product or transaction is legally exempt or subject to a 0% VAT treatment. Vendors should select this rate only when applicable under Portuguese VAT rules.",
    },
};

const PricingForm = ({
    form,
    watchVariations,
    watchPrice,
    watchDiscountType,
    watchDiscount,
    watchTaxId,
    taxesData,
}: IProps) => {
    const { t, lang } = useTranslation();

    const inputPrice = watchPrice || 0;
    const taxRate =
        taxesData?.find((tax) => tax._id === watchTaxId)?.taxRate || 0;

    const discountAmount =
        watchDiscountType === "PERCENTAGE"
            ? inputPrice * (watchDiscount / 100)
            : Math.min(watchDiscount || 0, inputPrice);

    const finalPrice = Math.max(inputPrice - discountAmount, 0);

    // Tax is included in finalPrice
    const taxAmount = finalPrice * (taxRate / (100 + taxRate));
    const netItemPrice = finalPrice - taxAmount;

    // Sort taxes in the required order: 23 → 13 → 6 → 0
    const orderedTaxes = [...(taxesData || [])].sort((a, b) => {
        const order = [23, 13, 6, 0];
        return order.indexOf(a.taxRate) - order.indexOf(b.taxRate);
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <h2 className="text-xl font-semibold text-gray-800">
                {t("pricing_information")}
            </h2>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {watchVariations.length === 0 && (
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem className="gap-1">
                                <FormLabel
                                    htmlFor="price"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    {t("price_E")}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        min={0}
                                        value={String(field.value)}
                                        onChange={(e) =>
                                            field.onChange(Number(e.target.value))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                        <FormItem className="gap-1">
                            <FormLabel className="block text-sm font-medium text-gray-700">
                                {t("select_discount_type")}
                            </FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">
                                            PERCENTAGE
                                        </SelectItem>
                                        <SelectItem value="FLAT">FLAT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                        <FormItem className="gap-1">
                            <FormLabel
                                htmlFor="discount"
                                className="block text-sm font-medium text-gray-700"
                            >
                                {t("discount_2")}{" "}
                                {watchDiscountType === "PERCENTAGE"
                                    ? "(%)"
                                    : "(€)"}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    min={0}
                                    max={
                                        watchDiscountType === "PERCENTAGE"
                                            ? 100
                                            : watchPrice || undefined
                                    }
                                    value={String(field.value)}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (watchDiscountType === "PERCENTAGE") {
                                            field.onChange(Math.min(value, 100));
                                        } else {
                                            field.onChange(
                                                Math.min(value, watchPrice || 0)
                                            );
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Tax / VAT field with Info icons */}
                <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                        <FormItem className="gap-1">
                            <FormLabel
                                htmlFor="tax"
                                className="block text-sm font-medium text-gray-700"
                            >
                                {t("tax_2")}
                            </FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10">
                                        <SelectValue placeholder="Select tax" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <TooltipProvider delayDuration={200}>
                                            {orderedTaxes.map((tax) => {
                                                const info =
                                                    VAT_INFO[tax.taxRate];
                                                return (
                                                    <SelectItem
                                                        key={tax._id}
                                                        value={tax._id}
                                                        className="flex items-center justify-between pr-2"
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            <span>
                                                                {tax.taxName?.[
                                                                    lang
                                                                ] ||
                                                                    `${tax.taxRate}%`}{" "}
                                                                ({tax.taxRate}%)
                                                            </span>

                                                            {info && (
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <span className="ml-auto inline-flex">
                                                                            <Info className="h-3.5 w-3.5 text-gray-400 hover:text-[#DC3173] cursor-help transition-colors" />
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent
                                                                        side="right"
                                                                        className="max-w-xs rounded-xl border-0 bg-[#DC3173] px-4 py-3 text-white shadow-lg shadow-[#DC3173]/25"
                                                                    >
                                                                        <p className="mb-1.5 text-sm font-semibold tracking-wide">
                                                                            {info.label}
                                                                        </p>
                                                                        <p className="text-xs leading-relaxed text-white/90">
                                                                            {info.description}
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </TooltipProvider>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Live Preview Breakdown */}
            {!!watchPrice && watchPrice > 0 && (
                <div className="mt-6">
                    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white font-semibold">
                        <div className="bg-[#DC3173] px-5 py-3.5 flex items-center justify-between">
                            <h3 className="text-white font-semibold text-base">
                                {t("price_tax_breakdown")}
                            </h3>
                            <span className="text-xs font-medium bg-white/20 text-white px-2.5 py-1 rounded-full">
                                {t("live_preview")}
                            </span>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">
                                    {t("original_price")}
                                </span>
                                <span className="font-medium text-gray-800">
                                    €{inputPrice.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-red-500">
                                    {t("discount")}{" "}
                                    {watchDiscountType === "PERCENTAGE"
                                        ? `(${watchDiscount}%)`
                                        : ""}
                                </span>
                                <span className="font-medium text-red-500">
                                    -€{discountAmount.toFixed(2)}
                                </span>
                            </div>

                            <div className="bg-[#FFF0F5] rounded-xl px-4 py-3.5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">
                                            {t("customer_order_price")}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            ({t("incl_vat")})
                                        </p>
                                    </div>
                                    <span className="text-lg font-bold text-[#DC3173]">
                                        €{finalPrice.toFixed(2)}
                                    </span>
                                </div>

                                <div className="space-y-2 pl-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#DC3173]" />
                                            <span className="text-gray-600">
                                                {t("net_item_price")}
                                            </span>
                                        </div>
                                        <span className="font-medium text-gray-800">
                                            €{netItemPrice.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#DC3173]" />
                                            <span className="text-gray-600">
                                                {t("govt_vat")} ({taxRate}%)
                                            </span>
                                        </div>
                                        <span className="font-medium text-gray-800">
                                            €{taxAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default PricingForm;