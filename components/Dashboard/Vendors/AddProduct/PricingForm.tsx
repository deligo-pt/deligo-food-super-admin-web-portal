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
import { useTranslation } from "@/hooks/use-translation";
import { TTax } from "@/types/tax.type";
import { motion } from "framer-motion";

interface IProps {
    form: any;
    watchVariations: any;
    watchPrice: any;
    watchDiscount: any;
    watchTaxId: any;
    watchDiscountType: any;
    taxesData: TTax[];
}

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
    const taxRate = taxesData?.find((tax) => tax._id === watchTaxId)?.taxRate || 0;

    const discountAmount = watchDiscountType === "PERCENTAGE"
        ? inputPrice * (watchDiscount / 100)
        : Math.min(watchDiscount || 0, inputPrice);

    const finalPrice = Math.max(inputPrice - discountAmount, 0);

    // Tax is included in finalPrice
    const taxAmount = finalPrice * (taxRate / (100 + taxRate));
    const netItemPrice = finalPrice - taxAmount;

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
                                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">PERCENTAGE</SelectItem>
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
                                {watchDiscountType === "PERCENTAGE" ? "(%)" : "(€)"}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    min={0}
                                    max={watchDiscountType === "PERCENTAGE"
                                        ? 100
                                        : watchPrice || undefined}
                                    value={String(field.value)}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (watchDiscountType === "PERCENTAGE") {
                                            field.onChange(Math.min(value, 100));
                                        } else {
                                            field.onChange(Math.min(value, watchPrice || 0));
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10">
                                        <SelectValue placeholder="Select tax" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taxesData?.map((tax) => (
                                            <SelectItem key={tax._id} value={tax._id}>
                                                {tax.taxName?.[lang]} ({tax.taxRate}%)
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

            {/* Live Preview Breakdown - Matching the design */}
            {!!watchPrice && watchPrice > 0 && (
                <div className="mt-6">
                    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white font-semibold">
                        {/* Header */}
                        <div className="bg-[#DC3173] px-5 py-3.5 flex items-center justify-between">
                            <h3 className="text-white font-semibold text-base">
                                {t("price_tax_breakdown")}
                            </h3>
                            <span className="text-xs font-medium bg-white/20 text-white px-2.5 py-1 rounded-full">
                                {t("live_preview")}
                            </span>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Original Price */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">{t("original_price")}</span>
                                <span className="font-medium text-gray-800">
                                    €{inputPrice.toFixed(2)}
                                </span>
                            </div>

                            {/* Discount */}
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

                            {/* Customer Order Price (highlighted box) */}
                            <div className="bg-[#FFF0F5] rounded-xl px-4 py-3.5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">
                                            {t("customer_order_price")}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">({t("incl_vat")})</p>
                                    </div>
                                    <span className="text-lg font-bold text-[#DC3173]">
                                        €{finalPrice.toFixed(2)}
                                    </span>
                                </div>

                                {/* Nested breakdown */}
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