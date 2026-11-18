/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    AdminOfferBadge,
    FirstOrderBadge,
    OfferTypeIcon,
} from "../../Vendors/VendorDetails/Products/OfferBadges";
import { Toggle } from "../../Vendors/VendorDetails/Products/FirstOrderOfferCard";
import { ProductSelector } from "../../Vendors/VendorDetails/Products/ProductSelector";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { useTranslation } from "@/hooks/use-translation";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { updateOfferReq } from "@/services/dashboard/offer/offer.service";
import { getAllProducts } from "@/services/dashboard/product/product.service";
import { useStore } from "@/store/store";
import { TMeta } from "@/types";
import { TProductCategoryResponse } from "@/types/category.type";
import { TOffer } from "@/types/offer.type";
import { TProduct } from "@/types/product.type";
import { queryStringFormatter } from "@/utils/formatter";
import { applyOfferServerError } from "@/utils/offer.error";
import { isFirstOrderOffer, toId } from "@/utils/offer.util";
import { translateObject } from "@/utils/translation/translationObject";
import {
    getProductSkuOptions,
    productHasVariations,
    TOfferForm,
    vendorOfferValidation,
} from "@/validations/offer/offer.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

const PRIMARY = "#DC3173";
const PRODUCT_LIMIT = 30;
const CATEGORY_LIMIT = 50;

const TYPE_LABEL: Record<string, string> = {
    PERCENT: "Percentage discount",
    FLAT: "Flat amount off",
    BUY_AND_REWARD: "Buy & Reward",
};

const countLabel = (n: number, noun: string) =>
    `${n} ${noun}${n === 1 ? "" : "s"} selected`;

/* ── small field helpers ─────────────────────────────────────────────────── */

function NumberField({
    control,
    name,
    label,
    required,
    hint,
    min,
    max,
}: {
    control: any;
    name: string;
    label: string;
    required?: boolean;
    hint?: string;
    min?: number;
    max?: number;
}) {
    return (
        <FormField
            control={control}
            name={name as any}
            render={({ field }) => (
                <FormItem className="w-full">
                    <FormLabel>
                        {label}
                        {required && <span className="text-red-600"> *</span>}
                    </FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            className="h-12"
                            placeholder={label}
                            min={min}
                            max={max}
                            value={(field.value as number | undefined) ?? ""}
                            onChange={(e) =>
                                field.onChange(
                                    e.target.value === "" ? undefined : Number(e.target.value),
                                )
                            }
                        />
                    </FormControl>
                    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

function CheckboxField({
    control,
    name,
    label,
    description,
}: {
    control: any;
    name: string;
    label: string;
    description?: string;
}) {
    return (
        <FormField
            control={control}
            name={name as any}
            render={({ field }) => (
                <FormItem>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 hover:bg-gray-50">
                        <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-[#DC3173]"
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <span>
                            <span className="block text-sm font-medium">{label}</span>
                            {description && (
                                <span className="block text-xs text-muted-foreground">
                                    {description}
                                </span>
                            )}
                        </span>
                    </label>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

/* ── modal shell: loads the first page of products + categories ───────────── */

type TInitial = {
    products: { data: TProduct[]; meta?: TMeta };
    categories: { data: TProductCategoryResponse[]; meta?: TMeta };
};

interface IModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    offer: TOffer;
    /** The vendor's Mongo _id (vendor._id) */
    vendorMongoId: string;
}

export default function EditVendorOfferModal({
    open,
    onOpenChange,
    offer,
    vendorMongoId,
}: IModalProps) {
    const { lang } = useStore();
    const [initial, setInitial] = useState<TInitial | null>(null);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;

        (async () => {
            try {
                const [p, c] = await Promise.all([
                    getAllProducts(
                        queryStringFormatter({
                            vendorId: vendorMongoId,
                            limit: String(PRODUCT_LIMIT),
                            page: "1",
                            isDeleted: false,
                            "meta.status": "ACTIVE",
                        }),
                    ),
                    getAllProductCategories(
                        queryStringFormatter({
                            vendorId: vendorMongoId,
                            limit: String(CATEGORY_LIMIT),
                            page: "1",
                            isDeleted: false,
                            isActive: true,
                        }),
                    ),
                ]);
                if (cancelled) return;
                setInitial({
                    products: { data: (p?.data as TProduct[]) ?? [], meta: p?.meta },
                    categories: {
                        data: (c?.data as TProductCategoryResponse[]) ?? [],
                        meta: c?.meta,
                    },
                });
            } catch (e) {
                console.error(e);
                if (cancelled) return;
                toast.error("Could not load products. You can still edit the other fields.");
                setInitial({
                    products: { data: [] },
                    categories: { data: [] },
                });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [open, vendorMongoId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] w-[95vw] overflow-y-auto p-0 sm:max-w-4xl">
                <DialogHeader className="border-b px-6 py-4 text-left">
                    <DialogTitle>Edit offer</DialogTitle>
                    <DialogDescription>
                        {offer.title?.[lang as "en" | "pt"] || offer.title?.en || ""}
                    </DialogDescription>
                </DialogHeader>

                {!initial ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading offer...
                    </div>
                ) : (
                    // Mounted only after the first page is in, so the paginated hook gets real initial items
                    <EditOfferForm
                        offer={offer}
                        vendorMongoId={vendorMongoId}
                        initial={initial}
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

/* ── the form ─────────────────────────────────────────────────────────────── */

function EditOfferForm({
    offer,
    vendorMongoId,
    initial,
    onClose,
}: {
    offer: TOffer;
    vendorMongoId: string;
    initial: TInitial;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const { lang } = useStore();
    const l = lang as "en" | "pt";
    const router = useRouter();

    /* products + categories: first page is already loaded, the rest stream in */
    const {
        items: products,
        hasMore: productsHasMore,
        loading: productsLoading,
        loadMore: loadMoreProducts,
    } = usePaginatedList<TProduct>({
        initialItems: initial.products.data,
        initialMeta: initial.products.meta,
        limit: PRODUCT_LIMIT,
        cacheKey: `offer-products:${vendorMongoId}`,
        autoLoadAll: true,
        autoLoadDelay: 150,
        fetchPage: async (page) => {
            const result = await getAllProducts(
                queryStringFormatter({
                    vendorId: vendorMongoId,
                    limit: String(PRODUCT_LIMIT),
                    page: String(page),
                    isDeleted: false,
                    "meta.status": "ACTIVE",
                }),
            );
            return { ...result, data: result.data as TProduct[] | undefined };
        },
    });

    const {
        items: categories,
        hasMore: categoriesHasMore,
        loading: categoriesLoading,
        loadMore: loadMoreCategories,
    } = usePaginatedList<TProductCategoryResponse>({
        initialItems: initial.categories.data,
        initialMeta: initial.categories.meta,
        limit: CATEGORY_LIMIT,
        cacheKey: `offer-categories:${vendorMongoId}`,
        autoLoadAll: true,
        fetchPage: async (page) => {
            const result = await getAllProductCategories(
                queryStringFormatter({
                    vendorId: vendorMongoId,
                    limit: String(CATEGORY_LIMIT),
                    page: String(page),
                    isDeleted: false,
                    isActive: true,
                }),
            );
            return {
                ...result,
                data: result.data as TProductCategoryResponse[] | undefined,
            };
        },
    });

    useEffect(() => {
        if (!categoriesHasMore || categoriesLoading) return;
        const id = setTimeout(loadMoreCategories, 300);
        return () => clearTimeout(id);
    }, [categoriesHasMore, categoriesLoading, loadMoreCategories]);

    const selectorProps = {
        products,
        categories,
        lang,
        hasMore: productsHasMore,
        loadingMore: productsLoading,
        onLoadMore: loadMoreProducts,
    };

    /* first-order settings live outside the zod form (they map to `eligibility`) */
    const firstOrder = isFirstOrderOffer(offer);
    const origPhone = offer.eligibility?.requireVerifiedPhone ?? true;
    const origRestores = offer.eligibility?.maxRestores ?? 2;
    const [requirePhone, setRequirePhone] = useState<boolean>(origPhone);
    const [maxRestores, setMaxRestores] = useState<number>(origRestores);

    /* form, pre-filled from the offer */
    const br = offer.buyAndReward;
    const form = useForm<TOfferForm>({
        resolver: zodResolver(vendorOfferValidation) as unknown as Resolver<TOfferForm>,
        mode: "onChange",
        defaultValues: {
            title: { en: offer.title?.en ?? "", pt: offer.title?.pt ?? "" },
            description: {
                en: offer.description?.en ?? "",
                pt: offer.description?.pt ?? "",
            },
            offerType: offer.offerType as TOfferForm["offerType"],
            discountValue: offer.discountValue,
            maxDiscountAmount: offer.maxDiscountAmount,
            scopeType: offer.scopeType ?? "ALL_PRODUCTS",
            scopeCategories: [],
            scopeProducts: (offer.scopeProducts ?? []).map(toId),
            allowDiscountedProducts: offer.allowDiscountedProducts ?? false,
            buyAndReward: br
                ? {
                    buy: {
                        scope: "SPECIFIC_PRODUCTS",
                        productIds: (br.buy.productIds ?? []).map(toId),
                        categoryIds: [],
                        quantity: br.buy.quantity,
                    },
                    reward: {
                        type: br.reward.type,
                        quantity: br.reward.quantity,
                        productId: toId(br.reward.productId),
                        variationSku: br.reward.variationSku ?? "",
                        options: (br.reward.options ?? []).map((o) => ({
                            productId: toId(o.productId),
                            variationSku: o.variationSku ?? "",
                        })),
                    },
                }
                : undefined,
            validFrom: new Date(offer.validFrom),
            expiresAt: new Date(offer.expiresAt),
            minOrderAmount: offer.minOrderAmount,
            code: offer.code ?? "",
            isAutoApply: offer.isAutoApply,
            userUsageLimit: offer.userUsageLimit ? String(offer.userUsageLimit) : "",
            isActive: offer.isActive,
            currentLang: lang,
        },
    });

    const {
        formState: { isSubmitting },
        control,
        setValue,
        getValues,
        setError,
        clearErrors,
    } = form;

    const [
        offerType,
        isAutoApply,
        scopeType,
        rewardType,
        scopeProducts,
        buyProductIds,
        rewardProductId,
        rewardOptions,
        discountValue,
        validFrom,
    ] = useWatch({
        control,
        name: [
            "offerType",
            "isAutoApply",
            "scopeType",
            "buyAndReward.reward.type",
            "scopeProducts",
            "buyAndReward.buy.productIds",
            "buyAndReward.reward.productId",
            "buyAndReward.reward.options",
            "discountValue",
            "validFrom",
        ],
    });

    const isBuyReward = offerType === "BUY_AND_REWARD";

    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        products.forEach((p) => map.set(p._id as string, p));
        return map;
    }, [products]);

    const fixedRewardProduct = rewardProductId
        ? productsById.get(rewardProductId)
        : undefined;
    const fixedNeedsSku = fixedRewardProduct
        ? productHasVariations(fixedRewardProduct)
        : false;
    const fixedSkuOptions = fixedRewardProduct
        ? getProductSkuOptions(fixedRewardProduct, lang)
        : [];

    const selectedRewardOptionIds = useMemo(
        () => (rewardOptions || []).map((o: any) => o.productId).filter(Boolean),
        [rewardOptions],
    );

    /* selection helpers */
    const idsInCategory = (categoryId: string) =>
        products
            .filter(
                (p) => ((p as any).category?._id || "uncategorized") === categoryId,
            )
            .map((p) => p._id as string);

    const toggleInArray = (
        field: "scopeProducts" | "buyAndReward.buy.productIds",
        id: string,
    ) => {
        const current = (getValues(field) as string[]) || [];
        setValue(
            field,
            current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
            { shouldValidate: true },
        );
    };

    const toggleCategoryProducts = (
        field: "scopeProducts" | "buyAndReward.buy.productIds",
        categoryId: string,
        selectAll: boolean,
    ) => {
        const ids = idsInCategory(categoryId);
        const current = (getValues(field) as string[]) || [];
        setValue(
            field,
            selectAll
                ? Array.from(new Set([...current, ...ids]))
                : current.filter((id) => !ids.includes(id)),
            { shouldValidate: true },
        );
    };

    const selectSingleRewardProduct = (productId: string) => {
        const current = getValues("buyAndReward.reward.productId");
        setValue(
            "buyAndReward.reward.productId",
            current === productId ? "" : productId,
            { shouldValidate: true },
        );
        setValue("buyAndReward.reward.variationSku", "", { shouldValidate: true });
    };

    const toggleRewardOptionProduct = (productId: string) => {
        const current = (getValues("buyAndReward.reward.options") as any[]) || [];
        setValue(
            "buyAndReward.reward.options",
            current.some((o) => o.productId === productId)
                ? current.filter((o) => o.productId !== productId)
                : [...current, { productId, variationSku: "" }],
            { shouldValidate: true },
        );
    };

    const toggleRewardOptionCategory = (categoryId: string, selectAll: boolean) => {
        const ids = idsInCategory(categoryId);
        const current = (getValues("buyAndReward.reward.options") as any[]) || [];
        const existing = new Set(current.map((o) => o.productId));
        setValue(
            "buyAndReward.reward.options",
            selectAll
                ? [
                    ...current,
                    ...ids
                        .filter((id) => !existing.has(id))
                        .map((id) => ({ productId: id, variationSku: "" })),
                ]
                : current.filter((o) => !ids.includes(o.productId)),
            { shouldValidate: true },
        );
    };

    const setOptionSku = (productId: string, sku: string) => {
        const current = (getValues("buyAndReward.reward.options") as any[]) || [];
        setValue(
            "buyAndReward.reward.options",
            current.map((o) =>
                o.productId === productId ? { ...o, variationSku: sku } : o,
            ),
            { shouldValidate: true },
        );
    };

    /** Products with variations need a SKU */
    const validateVariationSkus = (data: TOfferForm): boolean => {
        clearErrors("buyAndReward.reward.variationSku");
        clearErrors("buyAndReward.reward.options");
        if (data.offerType !== "BUY_AND_REWARD" || !data.buyAndReward) return true;

        const reward = data.buyAndReward.reward;

        if (reward.type === "FIXED_PRODUCT" && reward.productId) {
            const prod = productsById.get(reward.productId);
            if (prod && productHasVariations(prod) && !reward.variationSku?.trim()) {
                setError("buyAndReward.reward.variationSku", {
                    type: "manual",
                    message: "Variation SKU is required for this product",
                });
                return false;
            }
        }

        if (reward.type === "CUSTOMER_CHOICE") {
            for (const opt of reward.options ?? []) {
                const prod = productsById.get(opt.productId);
                if (prod && productHasVariations(prod) && !opt.variationSku?.trim()) {
                    setError("buyAndReward.reward.options", {
                        type: "manual",
                        message: `Variation SKU is required for ${prod.name?.[l] || "selected product"}`,
                    });
                    return false;
                }
            }
        }
        return true;
    };

    /* submit: PATCH /offers/:id with only what this form owns */
    const onSubmit = async (data: TOfferForm) => {
        if (!validateVariationSkus(data)) {
            toast.error("Select a variation SKU for products that have variations");
            return;
        }

        const toastId = toast.loading("Saving changes...");

        try {
            // Only call the translator when the visible text actually changed
            const textChanged =
                (data.title?.[l] ?? "") !== (offer.title?.[l] ?? "") ||
                (data.description?.[l] ?? "") !== (offer.description?.[l] ?? "");

            let title = offer.title;
            let description = offer.description;

            if (textChanged) {
                const translated = await translateObject(
                    { title: data.title, description: data.description },
                    lang,
                );
                if (!translated) {
                    toast.error("Translation failed!", { id: toastId });
                    return;
                }
                title = translated.title;
                description = translated.description;
            }

            // Not sent: offerType (fixed), isActive (use the Activate/Deactivate button),
            // vendorSharePercent / adminId / vendorId / isGlobal (backend owned)
            const payload: Record<string, any> = {
                title,
                ...(description ? { description } : {}),
                validFrom: format(data.validFrom, "yyyy-MM-dd"),
                expiresAt: format(data.expiresAt, "yyyy-MM-dd"),
                minOrderAmount: data.minOrderAmount ?? 0,
                isAutoApply: isBuyReward ? true : !!data.isAutoApply,
                ...(data.userUsageLimit
                    ? { userUsageLimit: Number(data.userUsageLimit) }
                    : {}),
            };

            if (!isBuyReward) {
                payload.discountValue = data.discountValue;
                payload.allowDiscountedProducts = !!data.allowDiscountedProducts;
                if (data.offerType === "PERCENT") {
                    payload.maxDiscountAmount = data.maxDiscountAmount;
                }

                const specific =
                    data.scopeType === "SPECIFIC_PRODUCTS" && !!data.scopeProducts?.length;
                payload.scopeType = specific ? "SPECIFIC_PRODUCTS" : "ALL_PRODUCTS";
                payload.scopeProducts = specific ? data.scopeProducts : [];

                if (!data.isAutoApply && data.code) {
                    payload.code = data.code.toUpperCase();
                }
            } else if (data.buyAndReward) {
                const { buy, reward } = data.buyAndReward;
                const nextReward: Record<string, any> = {
                    type: reward.type,
                    quantity: reward.quantity,
                };
                if (reward.type === "FIXED_PRODUCT") {
                    nextReward.productId = reward.productId;
                    if (reward.variationSku) nextReward.variationSku = reward.variationSku;
                }
                if (reward.type === "CUSTOMER_CHOICE") {
                    nextReward.options = (reward.options ?? [])
                        .filter((o) => o.productId)
                        .map((o) => ({
                            productId: o.productId,
                            ...(o.variationSku ? { variationSku: o.variationSku } : {}),
                        }));
                }
                payload.buyAndReward = {
                    buy: {
                        scope: "SPECIFIC_PRODUCTS",
                        productIds: buy.productIds ?? [],
                        quantity: buy.quantity,
                    },
                    reward: nextReward,
                };
            }

            // First-order: only send `eligibility` when a setting changed, always with the
            // offer's own scope (the scope can't be changed, and only these 4 keys are allowed)
            if (firstOrder && offer.eligibility) {
                const changed =
                    requirePhone !== origPhone || maxRestores !== origRestores;
                if (changed) {
                    payload.eligibility = {
                        type: "FIRST_ORDER",
                        scope: offer.eligibility.scope ?? "VENDOR",
                        requireVerifiedPhone: requirePhone,
                        maxRestores,
                    };
                }
            }

            const result = await updateOfferReq(offer._id, payload as Partial<TOffer>);

            if (result.success) {
                toast.success(result.message || "Offer updated successfully!", {
                    id: toastId,
                });
                router.refresh();
                onClose();
                return;
            }

            applyOfferServerError(result, setError, toastId);
        } catch (error: any) {
            console.error(error);
            toast.error(
                error?.response?.data?.message || error?.message || "Offer update failed",
                { id: toastId },
            );
        }
    };

    return (
        <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
                {/* DETAILS */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold">{t("offer_details")}</h2>
                    <Separator />

                    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 p-3">
                        <OfferTypeIcon
                            type={offer.offerType}
                            size={20}
                            className="h-10 w-10 rounded-xl"
                        />
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-gray-800">
                                    {TYPE_LABEL[offer.offerType] ?? offer.offerType}
                                </span>
                                <AdminOfferBadge />
                                {firstOrder && <FirstOrderBadge scope={offer.eligibility?.scope} />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                The offer type{firstOrder ? " and first-order scope" : ""} can&apos;t be
                                changed. To switch, deactivate this offer and create a new one.
                            </p>
                        </div>
                    </div>

                    <FormField
                        control={control}
                        name={l === "en" ? "title.en" : "title.pt"}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {t("offer_title_20_perc_off")}{" "}
                                    <span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-12"
                                        placeholder={t("offer_title_20_perc_off")}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={l === "en" ? "description.en" : "description.pt"}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {t("offer_description")} <span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea rows={3} placeholder={t("offer_description")} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* PERCENT / FLAT */}
                    {!isBuyReward && (
                        <>
                            <div className="flex flex-col gap-5 md:flex-row">
                                <NumberField
                                    control={control}
                                    name="discountValue"
                                    required
                                    min={0}
                                    max={offerType === "PERCENT" ? 100 : undefined}
                                    label={
                                        offerType === "PERCENT"
                                            ? t("discount_perc_20")
                                            : t("discount_value")
                                    }
                                />
                                {offerType === "PERCENT" && (
                                    <NumberField
                                        control={control}
                                        name="maxDiscountAmount"
                                        required
                                        min={0}
                                        label={t("max_discount_amount")}
                                        hint="Required. Caps the discount per order, in €."
                                    />
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700">
                                    Applicable Products
                                </Label>
                                <div className="flex flex-wrap gap-6">
                                    {(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS"] as const).map((v) => (
                                        <label
                                            key={v}
                                            className="flex cursor-pointer items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="radio"
                                                className="h-4 w-4 accent-[#DC3173]"
                                                checked={(scopeType ?? "ALL_PRODUCTS") === v}
                                                onChange={() => {
                                                    setValue("scopeType", v, { shouldValidate: true });
                                                    if (v === "ALL_PRODUCTS") {
                                                        setValue("scopeProducts", [], { shouldValidate: true });
                                                    }
                                                }}
                                            />
                                            {v === "ALL_PRODUCTS" ? "All Products" : "Specific Products"}
                                        </label>
                                    ))}
                                </div>

                                {scopeType === "SPECIFIC_PRODUCTS" && (
                                    <FormField
                                        control={control}
                                        name="scopeProducts"
                                        render={() => (
                                            <FormItem className="space-y-2 pt-1">
                                                <ProductSelector
                                                    {...selectorProps}
                                                    selectionMode="multi"
                                                    selectedIds={scopeProducts || []}
                                                    onToggle={(id) => toggleInArray("scopeProducts", id)}
                                                    onToggleCategory={(catId, all) =>
                                                        toggleCategoryProducts("scopeProducts", catId, all)
                                                    }
                                                    height="h-72"
                                                />
                                                {(scopeProducts?.length ?? 0) > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {countLabel(scopeProducts!.length, "product")}
                                                    </p>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {/* BUY_AND_REWARD */}
                    {isBuyReward && (
                        <div className="grid grid-cols-1 gap-6 rounded-xl border border-gray-200 bg-gray-50/50 p-5 lg:grid-cols-2 lg:gap-8">
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold">Buy Condition</h3>
                                <div className="max-w-xs">
                                    <NumberField
                                        control={control}
                                        name="buyAndReward.buy.quantity"
                                        label="Buy Quantity"
                                        required
                                        min={1}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="buyAndReward.buy.productIds"
                                    render={() => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-medium">
                                                Products to buy <span className="text-red-600">*</span>
                                            </FormLabel>
                                            <ProductSelector
                                                {...selectorProps}
                                                selectionMode="multi"
                                                selectedIds={buyProductIds || []}
                                                onToggle={(id) =>
                                                    toggleInArray("buyAndReward.buy.productIds", id)
                                                }
                                                onToggleCategory={(catId, all) =>
                                                    toggleCategoryProducts(
                                                        "buyAndReward.buy.productIds",
                                                        catId,
                                                        all,
                                                    )
                                                }
                                                height="h-64"
                                            />
                                            {(buyProductIds?.length ?? 0) > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    {countLabel(buyProductIds!.length, "product")}
                                                </p>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-base font-semibold">Reward</h3>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={control}
                                        name="buyAndReward.reward.type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Reward Type</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        setValue("buyAndReward.reward.productId", "");
                                                        setValue("buyAndReward.reward.variationSku", "");
                                                        setValue("buyAndReward.reward.options", []);
                                                    }}
                                                >
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="SAME_PRODUCT">Same Product</SelectItem>
                                                        <SelectItem value="FIXED_PRODUCT">Fixed Product</SelectItem>
                                                        <SelectItem value="CUSTOMER_CHOICE">Customer Choice</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <NumberField
                                        control={control}
                                        name="buyAndReward.reward.quantity"
                                        label="Reward Quantity"
                                        required
                                        min={1}
                                    />
                                </div>

                                {rewardType === "FIXED_PRODUCT" && (
                                    <div className="space-y-3">
                                        <FormField
                                            control={control}
                                            name="buyAndReward.reward.productId"
                                            render={() => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium">
                                                        Reward Product <span className="text-red-600">*</span>
                                                    </FormLabel>
                                                    <ProductSelector
                                                        {...selectorProps}
                                                        selectionMode="single"
                                                        selectedIds={rewardProductId ? [rewardProductId] : []}
                                                        onToggle={selectSingleRewardProduct}
                                                        onToggleCategory={() => { }}
                                                        height="h-56"
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {fixedNeedsSku && (
                                            <FormField
                                                control={control}
                                                name="buyAndReward.reward.variationSku"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Variation SKU <span className="text-red-600">*</span>
                                                        </FormLabel>
                                                        <Select
                                                            value={field.value || ""}
                                                            onValueChange={field.onChange}
                                                        >
                                                            <SelectTrigger className="h-12">
                                                                <SelectValue placeholder="Select variation SKU" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {fixedSkuOptions.map((opt) => (
                                                                    <SelectItem key={opt.sku} value={opt.sku}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>
                                )}

                                {rewardType === "CUSTOMER_CHOICE" && (
                                    <FormField
                                        control={control}
                                        name="buyAndReward.reward.options"
                                        render={() => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium">
                                                    Reward Options <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <ProductSelector
                                                    {...selectorProps}
                                                    selectionMode="multi"
                                                    selectedIds={selectedRewardOptionIds}
                                                    onToggle={toggleRewardOptionProduct}
                                                    onToggleCategory={toggleRewardOptionCategory}
                                                    height="h-56"
                                                />

                                                {(rewardOptions || []).some((opt: any) => {
                                                    const p = productsById.get(opt.productId);
                                                    return p && productHasVariations(p);
                                                }) && (
                                                        <div className="space-y-3 border-t border-gray-100 pt-2">
                                                            {(rewardOptions || []).map((opt: any) => {
                                                                const prod = productsById.get(opt.productId);
                                                                if (!prod || !productHasVariations(prod)) return null;
                                                                return (
                                                                    <div key={opt.productId} className="space-y-1">
                                                                        <Label className="text-sm">
                                                                            SKU for {prod.name?.[l] || "product"}{" "}
                                                                            <span className="text-red-600">*</span>
                                                                        </Label>
                                                                        <Select
                                                                            value={opt.variationSku || ""}
                                                                            onValueChange={(sku) =>
                                                                                setOptionSku(opt.productId, sku)
                                                                            }
                                                                        >
                                                                            <SelectTrigger className="h-11">
                                                                                <SelectValue placeholder="Select variation SKU" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {getProductSkuOptions(prod, lang).map((s) => (
                                                                                    <SelectItem key={s.sku} value={s.sku}>
                                                                                        {s.label}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                {selectedRewardOptionIds.length > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {countLabel(selectedRewardOptionIds.length, "option")}
                                                    </p>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* VALIDITY */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold">{t("validity")}</h2>
                    <Separator />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {(
                            [
                                { name: "validFrom", label: t("start_date") },
                                { name: "expiresAt", label: t("end_date") },
                            ] as const
                        ).map(({ name, label }) => (
                            <FormField
                                key={name}
                                control={control}
                                name={name}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {label} <span className="text-red-600">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                className="h-12"
                                                min={
                                                    name === "expiresAt" && validFrom
                                                        ? format(new Date(validFrom), "yyyy-MM-dd")
                                                        : undefined
                                                }
                                                value={
                                                    field.value
                                                        ? format(new Date(field.value), "yyyy-MM-dd")
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? new Date(e.target.value) : null,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>

                    <NumberField
                        control={control}
                        name="minOrderAmount"
                        min={0}
                        label={t("minimum_order_amount")}
                        required={offerType === "FLAT"}
                        hint={
                            offerType === "FLAT" && (discountValue ?? 0) > 0
                                ? `For a flat offer this must be at least €${2 * (discountValue ?? 0)} (2x the discount).`
                                : undefined
                        }
                    />

                    <FormField
                        control={control}
                        name="userUsageLimit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("users_usage_limit")}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        className="h-12"
                                        placeholder={t("users_usage_limit")}
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* FIRST-ORDER SETTINGS */}
                {firstOrder && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold">First-order settings</h2>
                        <Separator />

                        <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
                            <div>
                                <p className="font-medium text-gray-900">Verified phone required</p>
                                <p className="text-xs text-muted-foreground">
                                    The customer must verify their phone number to get the offer. This
                                    stops repeat use with new accounts.
                                </p>
                            </div>
                            <Toggle
                                checked={requirePhone}
                                onChange={setRequirePhone}
                                label="Verified phone required"
                            />
                        </div>

                        <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
                            <div>
                                <p className="font-medium text-gray-900">Times it can be given back</p>
                                <p className="text-xs text-muted-foreground">
                                    If an order with this offer is cancelled before the store accepts
                                    it, or the store rejects it, the customer gets the offer back up to
                                    this many times.
                                </p>
                            </div>
                            <Select
                                value={String(maxRestores)}
                                onValueChange={(v) => setMaxRestores(Number(v))}
                            >
                                <SelectTrigger className="h-11 w-24 shrink-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[0, 1, 2, 3, 4, 5].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* SETTINGS */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold">Settings</h2>
                    <Separator />

                    {!isBuyReward && (
                        <CheckboxField
                            control={control}
                            name="isAutoApply"
                            label={t("will_auto_apply")}
                            description="Customers don't need to enter a code."
                        />
                    )}

                    {!isBuyReward && !isAutoApply && (
                        <FormField
                            control={control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("promo_code")} <span className="text-red-600">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="h-12 uppercase"
                                            placeholder={t("enter_promo_code")}
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {!isBuyReward && (
                        <CheckboxField
                            control={control}
                            name="allowDiscountedProducts"
                            label="Also apply to already-discounted products"
                            description="Off by default. Products that already carry a discount are left out of this offer."
                        />
                    )}
                </div>

                <div className="flex justify-end gap-4 border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-12 px-6"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        type="submit"
                        className="h-12 px-6 text-white"
                        style={{ background: PRIMARY }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}