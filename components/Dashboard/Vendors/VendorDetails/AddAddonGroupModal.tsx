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
import {
    createAdminAddonGroupReq,
    updateAddOnsGroup,
} from "@/services/dashboard/product/product.service";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PRIMARY = "#DC3173";

type TAddonGroupForm = z.infer<typeof createAddonGroupValidationSchema>;

interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendorId: string;
    prevValues?: TAddonGroup;
    taxes: TTax[];
    actionType?: "create" | "edit" | "add-option";
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
    const router = useRouter();

    // ────────────────────────────────────────────────
    // Form for CREATE and EDIT (group-level fields)
    // ────────────────────────────────────────────────
    const form = useForm<TAddonGroupForm>({
        resolver: zodResolver(createAddonGroupValidationSchema),
        values: {
            title: {
                en: prevValues?.title?.en || "",
                pt: prevValues?.title?.pt || "",
            },
            minSelectable: prevValues?.minSelectable ?? 0,
            maxSelectable: prevValues?.maxSelectable ?? 1,
            options: [], // we never load existing options into the form anymore
            currentLang: lang,
        },
    });

    const {
        formState: { isSubmitting },
    } = form;

    // Local state used only when adding options (create + add-option modes)
    const [optionName, setOptionName] = useState("");
    const [optionPrice, setOptionPrice] = useState(0);
    const [optionTax, setOptionTax] = useState("");
    const [sdrApplicable, setSdrApplicable] = useState(false);
    const [containerCount, setContainerCount] = useState(0);

    // Temporary list of NEW options the user is about to add
    const [newOptions, setNewOptions] = useState<any[]>([]);

    const addOptionToTempList = () => {
        if (optionName.trim() === "" || optionPrice < 0 || optionTax === "") {
            toast.error("Please fill in option name, price, and select tax.");
            return;
        }

        if (sdrApplicable && containerCount < 1) {
            toast.error(
                t("container_count_required") ||
                "Please enter a valid container count (minimum 1)."
            );
            return;
        }

        const newOption: any = {
            name: {
                en: lang === "en" ? optionName.trim() : "",
                pt: lang === "pt" ? optionName.trim() : "",
            },
            price: Number(optionPrice),
            tax: optionTax,
        };

        if (sdrApplicable) {
            newOption.sdr = {
                applicable: true,
                containerCount: Number(containerCount),
            };
        }

        setNewOptions((prev) => [...prev, newOption]);

        // reset
        setOptionName("");
        setOptionPrice(0);
        setOptionTax("");
        setSdrApplicable(false);
        setContainerCount(0);
    };

    const removeTempOption = (index: number) => {
        setNewOptions((prev) => prev.filter((_, i) => i !== index));
    };

    // ────────────────────────────────────────────────
    // Submit handlers
    // ────────────────────────────────────────────────
    const handleCreateGroup = async (data: TAddonGroupForm) => {
        if (newOptions.length === 0) {
            toast.error("Please add at least one option.");
            return;
        }

        const toastId = toast.loading("Creating add-on group...");

        const payload = {
            ...(vendorId && { vendorId }),
            title: data.title,
            minSelectable: data.minSelectable,
            maxSelectable: data.maxSelectable,
            options: newOptions,
        };

        try {
            const translated = await translateObject(payload, lang);

            const result = await createAdminAddonGroupReq({
                ...payload,
                title: translated.title,
                options: translated.options,
            });

            if (result.success) {
                toast.success(result.message || "Add-on group created successfully!", {
                    id: toastId,
                });
                resetEverything();
                router.refresh();
                onOpenChange(false);
            } else {
                handleError(result, toastId);
            }
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong", { id: toastId });
        }
    };

    const handleEditGroup = async (data: TAddonGroupForm) => {
        if (!prevValues?._id) return;

        const toastId = toast.loading("Updating add-on group...");

        // ⭐ IMPORTANT: we do NOT send options at all
        // so existing options cannot be duplicated
        const payload = {
            title: data.title,
            minSelectable: data.minSelectable,
            maxSelectable: data.maxSelectable,
        };

        try {
            const translated = await translateObject(payload, lang);

            const result = await updateAddOnsGroup(prevValues._id, {
                ...payload,
                title: translated.title,
            });

            if (result.success) {
                toast.success(result.message || "Add-on group updated successfully!", {
                    id: toastId,
                });
                resetEverything();
                router.refresh();
                onOpenChange(false);
            } else {
                handleError(result, toastId);
            }
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong", { id: toastId });
        }
    };

    const handleAddOptionsOnly = async () => {
        if (!prevValues?._id) return;

        if (newOptions.length === 0) {
            toast.error("Please add at least one option.");
            return;
        }

        const toastId = toast.loading("Adding option(s)...");

        // ⭐ Only send the NEW options
        const payload = {
            options: newOptions,
        };

        try {
            const translated = await translateObject(payload, lang);

            // Most backends accept partial update with only `options`
            // If your backend has a dedicated endpoint (e.g. addOptionToGroup),
            // replace the call below with that endpoint.
            const result = await updateAddOnsGroup(prevValues._id, {
                options: translated.options,
            });

            if (result.success) {
                toast.success(result.message || "Option(s) added successfully!", {
                    id: toastId,
                });
                resetEverything();
                router.refresh();
                onOpenChange(false);
            } else {
                handleError(result, toastId);
            }
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong", { id: toastId });
        }
    };

    const handleError = (result: any, toastId: string | number) => {
        const errorSources = result?.data?.errorSources;
        if (errorSources?.length > 0) {
            errorSources.forEach((err: any) =>
                toast.error(err?.message, { id: toastId })
            );
        } else {
            toast.error(result.message || "Operation failed", { id: toastId });
        }
    };

    const resetEverything = () => {
        form.reset();
        setNewOptions([]);
        setOptionName("");
        setOptionPrice(0);
        setOptionTax("");
        setSdrApplicable(false);
        setContainerCount(0);
    };

    // Decide which submit function to call
    const onSubmit = (data: TAddonGroupForm) => {
        if (actionType === "create") return handleCreateGroup(data);
        if (actionType === "edit") return handleEditGroup(data);
        // add-option is handled by its own button (see below)
    };

    // ────────────────────────────────────────────────
    // UI
    // ────────────────────────────────────────────────
    const isAddOptionMode = actionType === "add-option";
    const isEditMode = actionType === "edit";
    const isCreateMode = actionType === "create";

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                if (!val) resetEverything();
                onOpenChange(val);
            }}
        >
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader className="px-0">
                    <DialogTitle className="text-xl font-bold">
                        {isCreateMode && `${t("create")} ${t("addon_group")}`}
                        {isEditMode && `${t("edit")} ${t("addon_group")}`}
                        {isAddOptionMode &&
                            `${t("add_option") || "Add Option"} – ${prevValues?.title?.[lang] || prevValues?.title?.en
                            }`}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                    >
                        {/* ── Group fields (only for create + edit) ── */}
                        {(isCreateMode || isEditMode) && (
                            <>
                                {lang === "en" && (
                                    <FormField
                                        control={form.control}
                                        name="title.en"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("group_title")}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={t("drinks_upgrade")}
                                                        {...field}
                                                    />
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
                                                    <Input
                                                        placeholder={t("drinks_upgrade")}
                                                        {...field}
                                                    />
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
                                                    min={0}
                                                    {...field}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(Number(e.target.value))
                                                    }
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
                                                    min={1}
                                                    {...field}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(Number(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {/* ── Option form (create + add-option modes) ── */}
                        {(isCreateMode || isAddOptionMode) && (
                            <div className="space-y-3">
                                <label className="block font-medium">{t("options")}</label>

                                {/* Temporary new options */}
                                {newOptions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {newOptions.map((opt, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center bg-[#DC3173] text-white px-3 py-1.5 rounded-full text-sm"
                                            >
                                                <span>
                                                    {opt.name?.[lang] || opt.name?.en}
                                                </span>
                                                <span className="ml-2 text-xs opacity-90">
                                                    €{opt.price}
                                                    {opt.sdr?.applicable
                                                        ? ` · SDR: ${opt.sdr.containerCount}`
                                                        : ""}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTempOption(index)}
                                                    className="ml-2 hover:opacity-80"
                                                >
                                                    <XIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add option form */}
                                <div className="border rounded-md p-4 bg-gray-50 space-y-3">
                                    <div className="space-y-2">
                                        <Label>{t("option_name")}</Label>
                                        <Input
                                            value={optionName}
                                            onChange={(e) => setOptionName(e.target.value)}
                                            placeholder={t("add_an_option_name")}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addOptionToTempList();
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t("option_price")}</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={optionPrice}
                                            onChange={(e) =>
                                                setOptionPrice(Number(e.target.value))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t("option_tax")}</Label>
                                        <Select
                                            value={optionTax}
                                            onValueChange={setOptionTax}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={t("select_tax")} />
                                            </SelectTrigger>
                                            <SelectContent className="w-full">
                                                {taxes.map((tax) => (
                                                    <SelectItem key={tax._id} value={tax._id}>
                                                        {tax.taxName?.[lang]} ({tax.taxRate}%)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* SDR */}
                                    <div className="pt-2 border-t space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="sdr"
                                                checked={sdrApplicable}
                                                onCheckedChange={(c) => {
                                                    setSdrApplicable(!!c);
                                                    if (!c) setContainerCount(0);
                                                }}
                                            />
                                            <Label htmlFor="sdr" className="cursor-pointer">
                                                {t("sdr_applicable") || "SDR Applicable"}
                                            </Label>
                                        </div>

                                        {sdrApplicable && (
                                            <div className="space-y-1.5">
                                                <Label>
                                                    {t("container_count") || "Container Count"}
                                                </Label>
                                                <p className="text-xs text-gray-500">
                                                    {t("container_count_description") ||
                                                        "How many physical containers this option represents (required for SDR)."}
                                                </p>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={containerCount || ""}
                                                    onChange={(e) =>
                                                        setContainerCount(Number(e.target.value))
                                                    }
                                                    className="max-w-35"
                                                    placeholder="e.g. 1"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={addOptionToTempList}
                                            className="bg-[#DC3173] hover:bg-[#B02458]"
                                        >
                                            {t("add_option")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit buttons */}
                        <div className="pt-4">
                            {isAddOptionMode ? (
                                <Button
                                    type="button"
                                    className="w-full text-white"
                                    style={{ background: PRIMARY }}
                                    disabled={isSubmitting || newOptions.length === 0}
                                    onClick={handleAddOptionsOnly}
                                >
                                    {t("add_option") || "Add Option(s)"}
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="w-full text-white"
                                    style={{ background: PRIMARY }}
                                    disabled={isSubmitting}
                                >
                                    {isCreateMode ? t("create") : t("update")}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}