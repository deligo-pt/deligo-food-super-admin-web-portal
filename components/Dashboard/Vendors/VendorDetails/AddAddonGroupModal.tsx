/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TAddonGroup } from "@/types/add-ons.type";
import { TTax } from "@/types/tax.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { useStore } from "@/store/store";
import { translateObject } from "@/utils/translation/translationObject";
import { createAddonGroupValidationSchema } from "@/validations/item/addons.validation";
import { createAdminAddonGroupReq, updateAddOnsGroup } from "@/services/dashboard/product/product.service";

const PRIMARY = "#DC3173";

type TAddonGroupForm = z.infer<typeof createAddonGroupValidationSchema>;

interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendorId: string;
    prevValues?: TAddonGroup;
    taxes: TTax[];
    actionType?: "create" | "edit";
    t: (key: string) => string;
}

export default function AddAddonGroupModal({
    open,
    onOpenChange,
    vendorId,
    prevValues,
    taxes,
    t,
    actionType = "create",
}: IProps) {
    const { lang } = useStore();
    const form = useForm<TAddonGroupForm>({
        resolver: zodResolver(createAddonGroupValidationSchema),
        values: {
            title: {
                en: prevValues?.title?.en || "",
                pt: prevValues?.title?.pt || "",
            },
            minSelectable: prevValues?.minSelectable ?? 0,
            maxSelectable: prevValues?.maxSelectable ?? 1,
            options:
                prevValues?.options?.map((option) => ({
                    name: {
                        en: option?.name?.en || "",
                        pt: option?.name?.pt || "",
                    },
                    price: option.price,
                    tax:
                        typeof option.tax === "object"
                            ? option.tax?._id || ""
                            : option.tax,
                })) || [],
            currentLang: lang,
        },
    });

    const { formState: { isSubmitting } } = form;

    const [optionName, setOptionName] = useState("");
    const [optionPrice, setOptionPrice] = useState(0);
    const [optionTax, setOptionTax] = useState("");

    const router = useRouter();

    const { fields: optionsFields, append, remove } = useFieldArray({
        control: form.control,
        name: "options",
    });

    const addOption = () => {
        if (
            optionName.trim() !== "" &&
            optionPrice >= 0 &&
            optionTax !== ""
        ) {
            append({
                name: {
                    en: lang === "en" ? optionName.trim() : "",
                    pt: lang === "pt" ? optionName.trim() : "",
                },
                price: Number(optionPrice),
                tax: optionTax,
            });

            setOptionName("");
            setOptionPrice(0);
            setOptionTax("");
        } else {
            toast.error("Please fill in option name, price, and select tax.");
        }
    };

    const removeOption = (index: number) => {
        remove(index);
    };

    const handleAddOrEditGroup = async (data: TAddonGroupForm) => {
        if (isSubmitting) return;

        const payload = {
            ...(vendorId && { vendorId }),
            title: data.title,
            options: data.options,
            maxSelectable: data.maxSelectable,
            minSelectable: data.minSelectable,
        };

        try {
            if (actionType === "create") {
                const toastId = toast.loading("Creating add-on group...");
                const translated = await translateObject(payload, lang);

                const addonsPayload = {
                    ...payload,
                    title: translated.title,
                    options: translated.options,
                };

                const result = await createAdminAddonGroupReq(addonsPayload);

                if (result.success) {
                    form.reset();
                    toast.success(
                        result.message || "Add-on group created successfully!",
                        { id: toastId }
                    );
                    router.refresh();
                    onOpenChange(false);
                    return;
                }

                const errorSources = result?.data?.errorSources;
                if (errorSources?.length > 0) {
                    toast.error(
                        errorSources
                            ?.map((err: { path: string; message: string }) => err?.message)
                            .join(", "),
                        { id: toastId }
                    );
                } else {
                    toast.error(
                        result.message || "Failed to create add-on group.",
                        { id: toastId }
                    );
                }
            } else {
                const toastId = toast.loading("Updating add-on group...");
                const translated = await translateObject(payload, lang);

                if (payload.vendorId) {
                    delete payload.vendorId
                };

                const addonsPayload = {
                    ...payload,
                    title: translated.title,
                    options: translated.options,
                };

                const result = await updateAddOnsGroup(
                    prevValues?._id as string,
                    addonsPayload
                );

                if (result.success) {
                    form.reset();
                    toast.success(
                        result.message || "Add-on group updated successfully!",
                        { id: toastId }
                    );
                    router.refresh();
                    onOpenChange(false);
                    return;
                }

                const errorSources = result?.data?.errorSources;
                if (errorSources?.length > 0) {
                    errorSources?.map((err: any) => {
                        toast.error(err?.message, { id: toastId });
                    });
                } else {
                    toast.error(
                        result.message || "Failed to update add-on group.",
                        { id: toastId }
                    );
                }
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader className="px-0">
                    <DialogTitle className="text-xl font-bold">
                        {actionType === "create" ? t("create") : t("edit")} {t("addon_group")}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleAddOrEditGroup)}
                        className="space-y-4 mt-4"
                        id="creatAddOnsForm"
                    >
                        {lang === "en" && (
                            <FormField
                                control={form.control}
                                name="title.en"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("group_title")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("drinks_upgrade")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {lang === "pt" && (
                            <FormField
                                control={form.control}
                                name="title.pt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("group_title")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("drinks_upgrade")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="minSelectable"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("min_select")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            {...field}
                                            value={field.value}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maxSelectable"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("max_select")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            {...field}
                                            value={field.value}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <label className="block mb-1 font-medium">{t("options")}</label>
                            {optionsFields?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-1">
                                    {optionsFields?.map((option, index) => {
                                        const displayName = option.name?.[lang as "en" | "pt"] || option.name?.en;
                                        const matchedTax = taxes.find((t) => t._id === option.tax);
                                        return (
                                            <div
                                                key={option.id || index}
                                                className="flex items-center bg-[#DC3173] text-white px-3 py-1 rounded-full text-sm"
                                            >
                                                <span>{displayName}</span>
                                                <span className="ml-2 text-xs text-slate-100">
                                                    {t("price")}: (€{option.price})
                                                    {matchedTax
                                                        ? ` (incl. Tax: ${matchedTax.taxRate}%)`
                                                        : ""}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(index)}
                                                    className="ml-2 text-white hover:text-slate-200"
                                                >
                                                    <XIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="border rounded-md p-4 bg-gray-50 space-y-3">
                                <FormItem className="gap-1">
                                    <FormLabel>{t("option_name")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            value={optionName}
                                            onChange={(e) => setOptionName(e.target.value)}
                                            placeholder={t("add_an_option_name")}
                                            onKeyUp={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addOption();
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>

                                <FormItem className="gap-1">
                                    <FormLabel>{t("option_price")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={optionPrice}
                                            onChange={(e) =>
                                                setOptionPrice(Number(e.target.value))
                                            }
                                            placeholder={t("option_price")}
                                        />
                                    </FormControl>
                                </FormItem>

                                <FormItem className="gap-1">
                                    <FormLabel>{t("option_tax")}</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={optionTax}
                                            onValueChange={(val) => setOptionTax(val)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={t("select_tax")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {taxes?.map((tax) => (
                                                    <SelectItem key={tax._id} value={tax._id}>
                                                        {tax.taxName?.[lang]} ({tax.taxRate}%)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>

                                <div className="text-right">
                                    <Button
                                        size="sm"
                                        type="button"
                                        onClick={addOption}
                                        className="bg-[#DC3173] text-white px-4 py-2 rounded-md hover:bg-[#B02458] transition-colors"
                                    >
                                        {t("add_option")}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-2">
                            <Button
                                type="submit"
                                className="w-full text-white"
                                style={{ background: PRIMARY }}
                                disabled={isSubmitting}
                            >
                                {actionType === "create" ? t("create") : t("update")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}