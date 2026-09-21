import { Badge } from "@/components/ui/badge";
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
    SelectTrigger,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { TProductCategory } from "@/types/category.type";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

type BasicInfoFormValues = {
    name: {
        en?: string;
        pt?: string;
    };
    category: string;
    additionalCategories?: string[];
};

interface IProps {
    form: UseFormReturn<BasicInfoFormValues>;
    productCategories: TProductCategory[];
    selectedLanguage: "en" | "pt";
}

const BasicInfoForm = ({
    form,
    productCategories,
    selectedLanguage,
}: IProps) => {
    const { t, lang } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <h2 className="text-xl font-semibold text-gray-800">
                {t("basic_information")}
            </h2>

            {/* Product Name - EN */}
            {selectedLanguage === "en" && (
                <FormField
                    control={form.control}
                    name="name.en"
                    render={({ field }) => (
                        <FormItem className="gap-1">
                            <FormLabel className="block text-sm font-medium text-gray-700">
                                {t("product_name")}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder={t("product_name_placeholder")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {/* Product Name - PT */}
            {selectedLanguage === "pt" && (
                <FormField
                    control={form.control}
                    name="name.pt"
                    render={({ field }) => (
                        <FormItem className="gap-1">
                            <FormLabel className="block text-sm font-medium text-gray-700">
                                {t("product_name")}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder={t("product_name_placeholder")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {/* Main Category */}
            {/* <FormField
                control={form.control}
                name="category"
                render={({ field, fieldState }) => (
                    <FormItem className="gap-1">
                        <FormLabel className="block text-sm font-medium text-gray-700">
                            {t("product_category")}
                        </FormLabel>
                        <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10",
                                        fieldState.invalid
                                            ? "border-destructive"
                                            : "border-gray-300"
                                    )}
                                >
                                    <SelectValue
                                        placeholder={t("select_category_placeholder")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {productCategories?.map((category) => (
                                        <SelectItem key={category?._id} value={category?._id}>
                                            {category?.name?.[lang]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            /> */}
            {/* Category Selection – inside Select dropdown */}
            <FormField
                control={form.control}
                name="category"
                render={({ field, fieldState }) => {
                    const additional: string[] = form.watch("additionalCategories") || [];
                    const primaryId = field.value || "";

                    const getCategoryName = (id: string) =>
                        productCategories?.find((c) => c._id === id)?.name?.[lang] ?? id;

                    const setPrimary = (id: string) => {
                        const newAdditional = additional.filter((x) => x !== id);
                        form.setValue("additionalCategories", newAdditional, {
                            shouldValidate: true,
                        });
                        field.onChange(id);
                    };

                    const setAdditional = (id: string) => {
                        if (!primaryId) {
                            // No main yet → make it main
                            field.onChange(id);
                            return;
                        }
                        if (id === primaryId) {
                            field.onChange("");
                        }
                        if (!additional.includes(id)) {
                            form.setValue(
                                "additionalCategories",
                                [...additional, id],
                                { shouldValidate: true }
                            );
                        }
                    };

                    const removeCategory = (id: string, e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        e?.preventDefault();

                        if (id === primaryId) {
                            if (additional.length > 0) {
                                const [newPrimary, ...rest] = additional;
                                field.onChange(newPrimary);
                                form.setValue("additionalCategories", rest, {
                                    shouldValidate: true,
                                });
                            } else {
                                field.onChange("");
                            }
                        } else {
                            form.setValue(
                                "additionalCategories",
                                additional.filter((x) => x !== id),
                                { shouldValidate: true }
                            );
                        }
                    };

                    const isPrimary = (id: string) => id === primaryId;
                    const isAdditional = (id: string) => additional.includes(id);
                    const isSelected = (id: string) => isPrimary(id) || isAdditional(id);

                    return (
                        <FormItem className="gap-1">
                            <FormLabel className="block text-sm font-medium text-gray-700">
                                {t("product_category")}
                            </FormLabel>

                            <FormControl>
                                <Select value="" onValueChange={() => { }}>
                                    <SelectTrigger
                                        className={cn(
                                            "w-full min-h-10 h-auto px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none",
                                            fieldState.invalid ? "border-destructive" : "border-gray-300"
                                        )}
                                    >
                                        <div className="flex flex-wrap items-center gap-1.5 w-full text-left">
                                            {!primaryId && additional.length === 0 ? (
                                                <span className="text-muted-foreground">
                                                    {t("select_category_placeholder")}
                                                </span>
                                            ) : (
                                                <>
                                                    {primaryId && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-[#DC3173]/10 text-[#DC3173] hover:bg-[#DC3173]/20 gap-1 pl-2 pr-1 py-0.5 text-xs"
                                                        >
                                                            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                                                                {t("main")}
                                                            </span>
                                                            {getCategoryName(primaryId)}
                                                            <span
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    removeCategory(primaryId);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" || e.key === " ") {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        removeCategory(primaryId);
                                                                    }
                                                                }}
                                                                className="ml-0.5 rounded-full p-0.5 hover:bg-[#DC3173]/20 cursor-pointer"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </span>
                                                        </Badge>
                                                    )}

                                                    {additional.map((id) => (
                                                        <Badge
                                                            key={id}
                                                            variant="outline"
                                                            className="gap-1 pl-2 pr-1 py-0.5 text-xs text-slate-700"
                                                        >
                                                            {getCategoryName(id)}
                                                            <span
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    removeCategory(id);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" || e.key === " ") {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        removeCategory(id);
                                                                    }
                                                                }}
                                                                className="ml-0.5 rounded-full p-0.5 hover:bg-slate-200 cursor-pointer"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </span>
                                                        </Badge>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </SelectTrigger>

                                    <SelectContent className="w-(--radix-select-trigger-width) max-h-80 p-1.5">
                                        <div className="px-2 py-1.5 text-[11px] text-muted-foreground border-b mb-1.5">
                                            {t("select_one_main_category")}
                                        </div>

                                        <div className="space-y-1">
                                            {productCategories?.length ? (
                                                productCategories.map((category) => {
                                                    const id = category._id;
                                                    const selected = isSelected(id);
                                                    const primary = isPrimary(id);
                                                    const additionalSelected = isAdditional(id);

                                                    return (
                                                        <div
                                                            key={id}
                                                            className={cn(
                                                                "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-all",
                                                                selected
                                                                    ? "border-[#DC3173]/30 bg-[#DC3173]/5"
                                                                    : "border-slate-100 bg-white hover:border-slate-200"
                                                            )}
                                                        >
                                                            {/* Left */}
                                                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                                                <span className="text-sm font-medium text-slate-800 truncate leading-tight">
                                                                    {category?.name?.[lang]}
                                                                </span>

                                                                <div className="flex items-center gap-3">
                                                                    <label className="flex items-center gap-1 cursor-pointer select-none">
                                                                        <input
                                                                            type="radio"
                                                                            name={`cat-role-${id}`}
                                                                            checked={primary}
                                                                            onChange={() => setPrimary(id)}
                                                                            className="h-3.5 w-3.5 accent-[#DC3173] cursor-pointer"
                                                                        />
                                                                        <span className="text-xs text-slate-600">
                                                                            {t("main")}
                                                                        </span>
                                                                    </label>

                                                                    <label
                                                                        className={cn(
                                                                            "flex items-center gap-1 select-none",
                                                                            !primaryId && !selected
                                                                                ? "opacity-40 cursor-not-allowed"
                                                                                : "cursor-pointer"
                                                                        )}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name={`cat-role-${id}`}
                                                                            checked={additionalSelected}
                                                                            disabled={!primaryId && !selected}
                                                                            onChange={() => setAdditional(id)}
                                                                            className="h-3.5 w-3.5 accent-[#DC3173] cursor-pointer disabled:cursor-not-allowed"
                                                                        />
                                                                        <span className="text-xs text-slate-600">
                                                                            {t("additional")}
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {/* Right */}
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {primary && (
                                                                    <span className="rounded-full bg-[#DC3173] px-2 py-0.5 text-[10px] font-medium text-white leading-none">
                                                                        {t("main")}
                                                                    </span>
                                                                )}
                                                                {additionalSelected && (
                                                                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 leading-none">
                                                                        {t("additional")}
                                                                    </span>
                                                                )}

                                                                {selected && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => removeCategory(id, e)}
                                                                        className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                    {t("no_items_found") || "No categories found"}
                                                </div>
                                            )}
                                        </div>
                                    </SelectContent>
                                </Select>
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    );
                }}
            />

        </motion.div>
    );
};

export default BasicInfoForm;