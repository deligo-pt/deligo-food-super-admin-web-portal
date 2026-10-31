/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Minus, Pencil, Plus, XIcon } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TAddonGroup, TAddonOption } from "@/types/add-ons.type";
import { TTax } from "@/types/tax.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { Path, useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { useStore } from "@/store/store";
import { translateObject } from "@/utils/translation/translationObject";
import { createAddonGroupValidationSchema } from "@/validations/item/addons.validation";
import {
    createAdminAddonGroupReq,
    updateAddOnsGroup,
} from "@/services/dashboard/product/product.service";

const PRIMARY = "#DC3173";

// Deposit charged per container. Display only, the backend is the source of truth.
const SDR_DEPOSIT_PER_CONTAINER = 0.1;
const formatEuro = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(2)} €`;

/** number inputs: no "-", "+", "e" → negatives / exponents can't be typed */
const blockInvalidNumberKeys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
};

/** "" → NaN (so the field can be cleared while typing), negatives → 0 */
const parseNonNegative = (raw: string) =>
    raw === "" ? NaN : Math.max(0, parseFloat(raw));

/** same, but whole numbers only (min / max selectable) */
const parseNonNegativeInt = (raw: string) => {
    const n = parseNonNegative(raw);
    return Number.isNaN(n) ? n : Math.trunc(n);
};

type TAddonGroupForm = z.infer<typeof createAddonGroupValidationSchema>;
type TOptionForm = TAddonGroupForm["options"][number];
type Lang = "en" | "pt";
type TLocalized = TAddonGroup["title"]; // { en?: string; pt?: string }

/** changed fields of a SAVED option (identified by sku / _id) */
type TAddonOptionPatch = Partial<Omit<TAddonOption, "sdr">> & {
    sdr?: { applicable: boolean; containerCount?: number };
};

/** what the edit request sends: only the changed parts */
type TAddonGroupPatch = {
    title?: TLocalized;
    minSelectable?: number;
    maxSelectable?: number;
    options?: (TAddonOption | TAddonOptionPatch)[];
};

interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendorId: string;
    prevValues?: TAddonGroup;
    taxes: TTax[];
    actionType?: "create" | "edit";
    t: (key: string) => string;
}

// ────────────────────────────────────────────────
// helpers
// ────────────────────────────────────────────────

/** API option → form option (tax always as id, SDR only when ON) */
const toFormOption = (o: TAddonOption): TOptionForm => ({
    _id: o?._id,
    sku: o?.sku,
    isActive: o?.isActive,
    name: { en: o?.name?.en || "", pt: o?.name?.pt || "" },
    price: Number(o?.price ?? 0),
    tax: typeof o?.tax === "string" ? o.tax : o?.tax?._id || "",
    sdr: o?.sdr?.applicable
        ? {
            applicable: true,
            containerCount: Math.max(1, Number(o.sdr.containerCount) || 1),
        }
        : undefined,
});

/** form option → full API option (used for NEW options) */
const toApiOption = (o: TOptionForm): TAddonOption => ({
    name: o.name,
    price: Number(o.price),
    tax: o.tax,
    ...(o.sdr?.applicable
        ? {
            sdr: {
                applicable: true,
                containerCount: Number(o.sdr.containerCount),
            },
        }
        : {}),
});

// ────────────────────────────────────────────────
// small UI pieces
// ────────────────────────────────────────────────

function Stepper({
    value,
    onChange,
    min = 1,
    max = 99,
}: {
    value: number;
    onChange: (n: number) => void;
    min?: number;
    max?: number;
}) {
    return (
        <div className="inline-flex items-center overflow-hidden rounded-lg border bg-white">
            <button
                type="button"
                disabled={value <= min}
                onClick={() => onChange(value - 1)}
                className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="decrease"
            >
                <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-10 border-x px-2 text-center text-sm font-medium tabular-nums leading-9">
                {value}
            </span>
            <button
                type="button"
                disabled={value >= max}
                onClick={() => onChange(value + 1)}
                className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="increase"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}

/** A single option inside the group (new OR existing). */
function OptionCard({
    form,
    index,
    option,
    error,
    taxes,
    lang,
    t,
    onRemove,
}: {
    form: UseFormReturn<TAddonGroupForm>;
    index: number;
    option: TOptionForm;
    error?: any;
    taxes: TTax[];
    lang: Lang;
    t: (key: string) => string;
    /** only passed for options that are not saved yet */
    onRemove?: () => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const showEditor = isEditing || !!error; // always reveal an invalid card

    const name = option.name?.[lang] || option.name?.en || option.name?.pt || "";
    const taxObj = taxes.find((tx) => tx._id === option.tax);
    const sdr = option.sdr;
    const count = sdr?.containerCount ?? 1;

    const setSdr = (value: TOptionForm["sdr"]) =>
        form.setValue(`options.${index}.sdr` as Path<TAddonGroupForm>, value as any, {
            shouldDirty: true,
            shouldValidate: true,
        });

    return (
        <div className="space-y-3 rounded-xl border border-[#DC3173]/25 bg-[#DC3173]/5 p-3">
            {/* header */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{name || "—"}</p>
                    <p className="text-xs text-gray-500">
                        {t("price") || "Price"}: {formatEuro(Number(option.price))} ·{" "}
                        {t("incl_tax") || "incl. Tax"}: {taxObj?.taxRate ?? 0}%
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setIsEditing((v) => !v)}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-white hover:text-gray-800"
                        title={isEditing ? t("done") || "Done" : t("edit") || "Edit"}
                    >
                        {showEditor ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Pencil className="h-4 w-4" />
                        )}
                    </button>
                    {onRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-white hover:text-red-600"
                            title={t("remove") || "Remove"}
                        >
                            <XIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* editor (name / price / tax) */}
            {showEditor && (
                <div className="grid grid-cols-1 gap-3 border-t border-[#DC3173]/15 pt-3 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name={`options.${index}.name.${lang}` as Path<TAddonGroupForm>}
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>{t("option_name")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={(field.value as string) ?? ""}
                                        placeholder={t("add_an_option_name")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={`options.${index}.price` as Path<TAddonGroupForm>}
                        render={({ field }) => {
                            const v = field.value as number | undefined;
                            return (
                                <FormItem>
                                    <FormLabel>{t("option_price")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={v === undefined || Number.isNaN(v) ? "" : v}
                                            onKeyDown={blockInvalidNumberKeys}
                                            onChange={(e) =>
                                                field.onChange(parseNonNegative(e.target.value))
                                            }
                                            onBlur={() => {
                                                // empty → default 0 (0 is allowed, negative is not)
                                                if (v === undefined || Number.isNaN(v)) field.onChange(0);
                                                field.onBlur();
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

                    <FormField
                        control={form.control}
                        name={`options.${index}.tax` as Path<TAddonGroupForm>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("option_tax")}</FormLabel>
                                <Select
                                    value={(field.value as string) || ""}
                                    onValueChange={field.onChange}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t("select_tax")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {taxes.map((tax) => (
                                            <SelectItem key={tax._id} value={tax._id}>
                                                {tax.taxName?.[lang]} ({tax.taxRate}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {/* SDR row */}
            <div className="flex flex-wrap items-center gap-3">
                <Switch
                    checked={!!sdr?.applicable}
                    onCheckedChange={(on) =>
                        setSdr(on ? { applicable: true, containerCount: 1 } : undefined)
                    }
                    className="data-[state=checked]:bg-[#DC3173]"
                />
                <span className="text-sm font-semibold text-gray-700">SDR</span>

                {sdr?.applicable && (
                    <>
                        <Stepper
                            value={count}
                            onChange={(n) => setSdr({ applicable: true, containerCount: n })}
                        />
                        <span className="text-sm text-gray-500">
                            {count === 1
                                ? t("container") || "container"
                                : t("containers") || "containers"}
                        </span>
                    </>
                )}
            </div>
            {sdr?.applicable && (
                <p className="text-xs text-gray-500">
                    ={" "}
                    <span className="font-semibold text-gray-700">
                        +{formatEuro(count * SDR_DEPOSIT_PER_CONTAINER)}
                    </span>{" "}
                    {t("deposit") || "deposit"}
                </p>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────
// main modal
// ────────────────────────────────────────────────
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
    const L = lang as Lang;
    const router = useRouter();

    const isEditMode = actionType === "edit";
    const isCreateMode = !isEditMode;

    const buildDefaults = (): TAddonGroupForm => ({
        title: {
            en: prevValues?.title?.en || "",
            pt: prevValues?.title?.pt || "",
        },
        minSelectable: prevValues?.minSelectable ?? 0,
        maxSelectable: prevValues?.maxSelectable ?? 1,
        // Edit → existing options are loaded into the form so they can be edited
        options: isEditMode ? (prevValues?.options || []).map(toFormOption) : [],
        currentLang: lang,
    });

    const form = useForm<TAddonGroupForm>({
        resolver: zodResolver(createAddonGroupValidationSchema),
        defaultValues: buildDefaults(),
    });

    const {
        formState: { isSubmitting, isSubmitted, errors },
    } = form;

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "options",
    });
    const options = form.watch("options") ?? [];

    // snapshot of the saved options, used to send ONLY what changed
    const originalBySku = useMemo(() => {
        const map = new Map<string, TOptionForm>();
        (prevValues?.options || []).forEach((o) => {
            const f = toFormOption(o);
            if (f.sku) map.set(f.sku, f);
        });
        return map;
    }, [prevValues]);

    // ── "add a new option" draft form ───────────────
    const [draftName, setDraftName] = useState("");
    const [draftPrice, setDraftPrice] = useState("0");
    const [draftTax, setDraftTax] = useState("");
    const [draftSdr, setDraftSdr] = useState(false);
    const [draftCount, setDraftCount] = useState(1);

    const resetDraft = () => {
        setDraftName("");
        setDraftPrice("0");
        setDraftTax("");
        setDraftSdr(false);
        setDraftCount(1);
    };

    const resetEverything = () => {
        form.reset(buildDefaults());
        resetDraft();
    };

    // (re)load the form every time the modal opens / another group is chosen
    useEffect(() => {
        if (open) resetEverything();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, actionType, prevValues, lang]);

    // after a failed submit, re-check max/options when the option count changes
    // (otherwise the "max cannot exceed options" error would stay stale)
    useEffect(() => {
        if (isSubmitted) form.trigger(["maxSelectable", "options"]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields.length]);

    const addDraftOption = () => {
        const price = parseFloat(draftPrice);
        if (!draftName.trim() || Number.isNaN(price) || price < 0 || !draftTax) {
            toast.error(
                "Please fill in option name, price, and select tax."
            );
            return;
        }

        append({
            name: {
                en: L === "en" ? draftName.trim() : "",
                pt: L === "pt" ? draftName.trim() : "",
            },
            price,
            tax: draftTax,
            ...(draftSdr
                ? { sdr: { applicable: true, containerCount: draftCount } }
                : {}),
        });
        resetDraft();
    };

    // ────────────────────────────────────────────────
    // submit handlers
    // ────────────────────────────────────────────────
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

    const handleCreateGroup = async (data: TAddonGroupForm) => {
        const toastId = toast.loading("Creating add-on group...");

        const payload = {
            ...(vendorId && { vendorId }),
            title: data.title,
            minSelectable: data.minSelectable,
            maxSelectable: data.maxSelectable,
            options: data.options.map(toApiOption),
        };

        try {
            const translated = await translateObject(payload, lang);

            const result = await createAdminAddonGroupReq({
                ...payload,
                title: translated.title,
                options: translated.options,
            } as Parameters<typeof createAdminAddonGroupReq>[0]);

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

    /** name object with only the current language filled (the other one gets re-translated) */
    const localized = (value: string): TLocalized =>
        L === "en" ? { en: value, pt: "" } : { en: "", pt: value };

    /**
     * Edit payload = ONLY what changed:
     *  - title / minSelectable / maxSelectable  → only if changed
     *  - options → changed saved options as { _id?, sku, ...changedFields }
     *              + brand-new options (no sku) as full objects
     */
    const buildEditPayload = (data: TAddonGroupForm): TAddonGroupPatch => {
        const payload: TAddonGroupPatch = {};

        const newTitle = (data.title?.[L] || "").trim();
        if (newTitle !== (prevValues?.title?.[L] || "").trim()) {
            payload.title = localized(newTitle);
        }
        if (data.minSelectable !== prevValues?.minSelectable) {
            payload.minSelectable = data.minSelectable;
        }
        if (data.maxSelectable !== prevValues?.maxSelectable) {
            payload.maxSelectable = data.maxSelectable;
        }

        const changedOptions: (TAddonOption | TAddonOptionPatch)[] = [];
        data.options.forEach((opt) => {
            // new option → send everything
            if (!opt.sku) {
                changedOptions.push(toApiOption(opt));
                return;
            }

            const orig = originalBySku.get(opt.sku);
            if (!orig) return;

            const diff: TAddonOptionPatch = {};

            const newName = (opt.name?.[L] || "").trim();
            if (newName !== (orig.name?.[L] || "").trim()) {
                diff.name = localized(newName);
            }
            if (Number(opt.price) !== Number(orig.price)) {
                diff.price = Number(opt.price);
            }
            if (opt.tax !== orig.tax) diff.tax = opt.tax;

            const sdrChanged =
                !!opt.sdr?.applicable !== !!orig.sdr?.applicable ||
                (opt.sdr?.containerCount ?? 0) !== (orig.sdr?.containerCount ?? 0);
            if (sdrChanged) {
                diff.sdr = opt.sdr?.applicable
                    ? { applicable: true, containerCount: opt.sdr.containerCount }
                    : { applicable: false };
            }

            if (Object.keys(diff).length > 0) {
                changedOptions.push({
                    ...(opt._id ? { _id: opt._id } : {}),
                    sku: opt.sku,
                    ...diff,
                });
            }
        });

        if (changedOptions.length > 0) payload.options = changedOptions;
        return payload;
    };

    const handleEditGroup = async (data: TAddonGroupForm) => {
        if (!prevValues?._id) return;

        const payload = buildEditPayload(data);

        if (Object.keys(payload).length === 0) {
            toast.info(t("no_changes_to_save") || "No changes to save.");
            return;
        }

        const toastId = toast.loading("Updating add-on group...");

        try {
            const needsTranslation = !!(payload.title || payload.options);
            const translated: any = needsTranslation
                ? await translateObject(payload as any, lang)
                : payload;

            const finalPayload: TAddonGroupPatch = {
                ...payload,
                ...(payload.title ? { title: translated.title } : {}),
                ...(payload.options ? { options: translated.options } : {}),
            };

            const result = await updateAddOnsGroup(
                prevValues._id,
                finalPayload as unknown as Parameters<typeof updateAddOnsGroup>[1]
            );

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

    const onSubmit = (data: TAddonGroupForm) =>
        isEditMode ? handleEditGroup(data) : handleCreateGroup(data);

    const onInvalid = () =>
        toast.error("Please fix the highlighted errors.");

    // array-level error (e.g. "At least one option...")
    const optionsRootError =
        (errors.options as any)?.message || (errors.options as any)?.root?.message;

    // ────────────────────────────────────────────────
    // UI
    // ────────────────────────────────────────────────
    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                if (!val) resetEverything();
                onOpenChange(val);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-6">
                <DialogHeader className="px-0">
                    <DialogTitle className="text-xl font-bold">
                        {isCreateMode && `${t("create")} ${t("addon_group")}`}
                        {isEditMode && `${t("edit")} ${t("addon_group")}`}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                        className="mt-4 space-y-4"
                    >
                        {/* ── Group fields ── */}
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
                                                value={field.value ?? ""}
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
                                                value={field.value ?? ""}
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
                                            step={1}
                                            {...field}
                                            value={Number.isNaN(field.value) ? "" : field.value}
                                            onKeyDown={blockInvalidNumberKeys}
                                            onChange={(e) =>
                                                field.onChange(parseNonNegativeInt(e.target.value))
                                            }
                                            onBlur={() => {
                                                if (Number.isNaN(field.value)) field.onChange(0);
                                                field.onBlur();
                                            }}
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
                                            step={1}
                                            {...field}
                                            value={Number.isNaN(field.value) ? "" : field.value}
                                            onKeyDown={blockInvalidNumberKeys}
                                            onChange={(e) =>
                                                field.onChange(parseNonNegativeInt(e.target.value))
                                            }
                                            onBlur={() => {
                                                if (Number.isNaN(field.value)) field.onChange(1);
                                                field.onBlur();
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── Options ── */}
                        <div className="space-y-3">
                            <label className="block font-medium">
                                {t("options")}{" "}
                                <span className="text-sm font-normal text-gray-400">
                                    ({fields.length})
                                </span>
                            </label>

                            {optionsRootError && (
                                <p className="text-sm text-destructive">{optionsRootError}</p>
                            )}

                            {/* existing + new options (all editable) */}
                            {fields.length > 0 && (
                                <div className="space-y-2">
                                    {fields.map((f, index) => {
                                        const opt = (options[index] ?? f) as TOptionForm;
                                        return (
                                            <OptionCard
                                                key={f.id}
                                                form={form}
                                                index={index}
                                                option={opt}
                                                error={(errors.options as any)?.[index]}
                                                taxes={taxes}
                                                lang={L}
                                                t={t}
                                                // saved options are deleted from the list page (with confirmation)
                                                onRemove={opt.sku ? undefined : () => remove(index)}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {/* add a new option */}
                            <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold">{t("option_name")}</Label>
                                    <Input
                                        value={draftName}
                                        onChange={(e) => setDraftName(e.target.value)}
                                        placeholder={t("add_an_option_name")}
                                        className="bg-white"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addDraftOption();
                                            }
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-semibold">{t("option_price")}</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={draftPrice}
                                        onKeyDown={blockInvalidNumberKeys}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            // never allow a negative price (0 is fine)
                                            setDraftPrice(v !== "" && parseFloat(v) < 0 ? "0" : v);
                                        }}
                                        onBlur={() => {
                                            if (draftPrice === "") setDraftPrice("0");
                                        }}
                                        placeholder={t("option_price")}
                                        className="bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-semibold">{t("option_tax")}</Label>
                                    <Select value={draftTax} onValueChange={setDraftTax}>
                                        <SelectTrigger className="w-full bg-white">
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
                                <div className="space-y-3 border-t pt-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label className="font-semibold">
                                                {t("container_deposit_sdr") || "Container deposit (SDR)"}
                                            </Label>
                                            <p className="text-xs text-gray-500">
                                                {t("sdr_description") ||
                                                    "For bottles and cans. Customers pay this deposit per container, on top of the price:"}{" "}
                                                <span className="font-semibold text-gray-700">
                                                    +{formatEuro(SDR_DEPOSIT_PER_CONTAINER)}
                                                </span>
                                            </p>
                                        </div>
                                        <Switch
                                            checked={draftSdr}
                                            onCheckedChange={(on) => {
                                                setDraftSdr(on);
                                                setDraftCount(1);
                                            }}
                                            className="data-[state=checked]:bg-[#DC3173]"
                                        />
                                    </div>

                                    {draftSdr && (
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600">
                                                    {t("containers") || "Containers"}
                                                </span>
                                                <Stepper value={draftCount} onChange={setDraftCount} />
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                ={" "}
                                                <span className="font-semibold text-gray-700">
                                                    +{formatEuro(draftCount * SDR_DEPOSIT_PER_CONTAINER)}
                                                </span>{" "}
                                                {t("deposit") || "deposit"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={addDraftOption}
                                        className="bg-[#DC3173] hover:bg-[#B02458]"
                                    >
                                        {t("add_option")}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full text-white"
                                style={{ background: PRIMARY }}
                                disabled={isSubmitting}
                            >
                                {isCreateMode ? t("create") : t("update")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}