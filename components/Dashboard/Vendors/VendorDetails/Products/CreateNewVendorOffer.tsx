/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/store/store";
import { TMeta } from "@/types";
import { TOffer } from "@/types/offer.type";
import { TProduct } from "@/types/product.type";
import { translateObject } from "@/utils/translation/translationObject";
import {
    getProductSkuOptions,
    vendorOfferValidation,
    productHasVariations,
    TOfferForm,
} from "@/validations/offer/offer.validation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ProductSelector } from "./ProductSelector";
import { createOfferReq } from "@/services/dashboard/offer/offer.service";
import { TProductCategoryResponse } from "@/types/category.type";
import { queryStringFormatter } from "@/utils/formatter";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { getAllProducts } from "@/services/dashboard/product/product.service";
import { ChevronDown } from "lucide-react";

const PRIMARY = "#DC3173";

interface IProps {
    itemsResult: { data: TProduct[]; meta?: TMeta };
    vendorMongoId: string;
    vendorUserId: string;
    productCategories: { data: TProductCategoryResponse[]; meta?: TMeta };
}

export default function CreateNewVendorOffer({ itemsResult, vendorMongoId, vendorUserId, productCategories }: IProps) {
    const { t } = useTranslation();
    const { lang } = useStore();
    const router = useRouter();

    const PRODUCT_LIMIT = 30;
    const CATEGORY_LIMIT = 50;

    const {
        items: products,
        hasMore: productsHasMore,
        loading: productsLoading,
        loadMore: loadMoreProducts,
    } = usePaginatedList<TProduct>({
        initialItems: itemsResult.data || [],
        initialMeta: itemsResult.meta,
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
        initialItems: productCategories?.data || [],
        initialMeta: productCategories?.meta,
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

    // Categories are light, so quietly fetch all remaining pages in the background
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
    const [initialDates] = useState(() => {
        const validFrom = new Date();
        return {
            validFrom,
            expiresAt: new Date(validFrom.getTime() + 30 * 24 * 60 * 60 * 1000),
        };
    });

    const form = useForm<TOfferForm>({
        resolver: zodResolver(vendorOfferValidation) as unknown as Resolver<TOfferForm>,
        mode: "onChange",
        defaultValues: {
            title: { en: "", pt: "" },
            description: { en: "", pt: "" },
            offerType: "PERCENT",
            discountValue: undefined,
            maxDiscountAmount: undefined,
            scopeType: undefined,
            scopeCategories: [],
            scopeProducts: [],
            buyAndReward: {
                buy: {
                    scope: "SPECIFIC_PRODUCTS",
                    productIds: [],
                    categoryIds: [],
                    quantity: 1,
                },
                reward: {
                    type: "SAME_PRODUCT",
                    quantity: 1,
                    productId: "",
                    variationSku: "",
                    options: [],
                },
            },
            validFrom: initialDates.validFrom,
            expiresAt: initialDates.expiresAt,
            minOrderAmount: undefined,
            code: "",
            isAutoApply: true,
            userUsageLimit: "",
            isActive: true,
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
        watchOfferType,
        watchIsAutoApply,
        watchScopeType,
        watchRewardType,
        watchScopeProducts,
        watchBuyProductIds,
        watchRewardProductId,
        // watchRewardVariationSku,
        watchRewardOptions,
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
            // "buyAndReward.reward.variationSku",
            "buyAndReward.reward.options",
        ],
    });

    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        products.forEach((p) => map.set(p._id as string, p));
        return map;
    }, [products]);

    const fixedRewardProduct = watchRewardProductId
        ? productsById.get(watchRewardProductId)
        : undefined;
    const fixedNeedsSku = fixedRewardProduct
        ? productHasVariations(fixedRewardProduct)
        : false;
    const fixedSkuOptions = fixedRewardProduct
        ? getProductSkuOptions(fixedRewardProduct, lang)
        : [];

    const toggleInArray = (
        fieldName: "scopeProducts" | "buyAndReward.buy.productIds",
        id: string,
    ) => {
        const current = (getValues(fieldName) as string[]) || [];
        const next = current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id];
        setValue(fieldName, next, { shouldValidate: true });
    };

    const toggleCategoryProducts = (
        fieldName: "scopeProducts" | "buyAndReward.buy.productIds",
        categoryId: string,
        selectAll: boolean,
    ) => {
        const idsInCat = products
            .filter((p) => {
                const catId = (p as any).category?._id || "uncategorized";
                return catId === categoryId;
            })
            .map((p) => p._id as string);

        const current = (getValues(fieldName) as string[]) || [];
        const next = selectAll
            ? Array.from(new Set([...current, ...idsInCat]))
            : current.filter((id) => !idsInCat.includes(id));

        setValue(fieldName, next, { shouldValidate: true });
    };

    const selectSingleRewardProduct = (productId: string) => {
        const current = getValues("buyAndReward.reward.productId");
        const next = current === productId ? "" : productId;
        setValue("buyAndReward.reward.productId", next, { shouldValidate: true });
        setValue("buyAndReward.reward.variationSku", "", { shouldValidate: true });
    };

    const toggleRewardOptionProduct = (productId: string) => {
        const current =
            (getValues("buyAndReward.reward.options") as any[]) || [];
        const exists = current.find((o) => o.productId === productId);

        if (exists) {
            setValue(
                "buyAndReward.reward.options",
                current.filter((o) => o.productId !== productId),
                { shouldValidate: true },
            );
        } else {
            setValue(
                "buyAndReward.reward.options",
                [...current, { productId, variationSku: "" }],
                { shouldValidate: true },
            );
        }
    };

    const setOptionSku = (productId: string, sku: string) => {
        const current =
            (getValues("buyAndReward.reward.options") as any[]) || [];
        setValue(
            "buyAndReward.reward.options",
            current.map((o) =>
                o.productId === productId ? { ...o, variationSku: sku } : o,
            ),
            { shouldValidate: true },
        );
    };

    const selectedRewardOptionIds = useMemo(() => {
        return (watchRewardOptions || [])
            .map((o: any) => o.productId)
            .filter(Boolean);
    }, [watchRewardOptions]);

    /** Validate SKUs required for products with variations before submit */
    const validateVariationSkus = (data: TOfferForm): boolean => {
        clearErrors("buyAndReward.reward.variationSku");
        clearErrors("buyAndReward.reward.options");

        if (data.offerType !== "BUY_AND_REWARD" || !data.buyAndReward) return true;

        const reward = data.buyAndReward.reward;

        if (reward.type === "FIXED_PRODUCT" && reward.productId) {
            const prod = productsById.get(reward.productId);
            if (prod && productHasVariations(prod)) {
                if (!reward.variationSku || !reward.variationSku.trim()) {
                    setError("buyAndReward.reward.variationSku", {
                        type: "manual",
                        message: "Variation SKU is required for this product",
                    });
                    return false;
                }
            }
        }

        if (reward.type === "CUSTOMER_CHOICE" && reward.options?.length) {
            for (let i = 0; i < reward.options.length; i++) {
                const opt = reward.options[i];
                const prod = productsById.get(opt.productId);
                if (prod && productHasVariations(prod)) {
                    if (!opt.variationSku || !opt.variationSku.trim()) {
                        setError("buyAndReward.reward.options", {
                            type: "manual",
                            message: `Variation SKU is required for ${prod.name?.[lang as "en" | "pt"] || "selected product"}`,
                        });
                        return false;
                    }
                }
            }
        }

        return true;
    };

    const onSubmit = async (data: TOfferForm) => {
        if (!validateVariationSkus(data)) {
            toast.error("Please select variation SKU for products that have variations");
            return;
        }

        const toastId = toast.loading("Creating offer...");

        try {
            const translated = await translateObject(
                { title: data.title, description: data.description },
                lang,
            );

            if (!translated) {
                toast.error("Translation failed!", { id: toastId });
                return;
            }

            const offerData: Record<string, any> = {
                title: translated.title,
                description: translated.description,
                offerType: data.offerType,
                vendorId: vendorMongoId,
                validFrom: format(data.validFrom, "yyyy-MM-dd"),
                expiresAt: format(data.expiresAt, "yyyy-MM-dd"),
                ...(data.minOrderAmount != null && data.minOrderAmount > 0
                    ? { minOrderAmount: data.minOrderAmount }
                    : {}),
                ...(data.userUsageLimit
                    ? { userUsageLimit: Number(data.userUsageLimit) }
                    : {}),
                isActive: data.isActive ?? true,
                isAutoApply: data.isAutoApply ?? false,
            };

            if (data.offerType === "PERCENT" || data.offerType === "FLAT") {
                offerData.discountValue = data.discountValue;

                if (data.offerType === "PERCENT" && data.maxDiscountAmount != null) {
                    offerData.maxDiscountAmount = data.maxDiscountAmount;
                }

                if (
                    data.scopeType === "SPECIFIC_PRODUCTS" &&
                    data.scopeProducts?.length
                ) {
                    offerData.scopeType = "SPECIFIC_PRODUCTS";
                    offerData.scopeProducts = data.scopeProducts;
                } else {
                    offerData.scopeType = "ALL_PRODUCTS"
                }

                if (!data.isAutoApply && data.code) {
                    offerData.code = data.code.toUpperCase();
                }
            }

            if (data.offerType === "BUY_AND_REWARD" && data.buyAndReward) {
                offerData.isAutoApply = true;

                const buy: Record<string, any> = {
                    scope: "SPECIFIC_PRODUCTS",
                    productIds: data.buyAndReward.buy.productIds || [],
                    quantity: data.buyAndReward.buy.quantity,
                };

                const reward: Record<string, any> = {
                    type: data.buyAndReward.reward.type,
                    quantity: data.buyAndReward.reward.quantity,
                };

                if (data.buyAndReward.reward.type === "FIXED_PRODUCT") {
                    reward.productId = data.buyAndReward.reward.productId;
                    if (data.buyAndReward.reward.variationSku) {
                        reward.variationSku = data.buyAndReward.reward.variationSku;
                    }
                }

                if (data.buyAndReward.reward.type === "CUSTOMER_CHOICE") {
                    reward.options = (data.buyAndReward.reward.options || [])
                        .filter((opt) => opt.productId)
                        .map((opt) => {
                            const o: any = { productId: opt.productId };
                            if (opt.variationSku) o.variationSku = opt.variationSku;
                            return o;
                        });
                }

                offerData.buyAndReward = { buy, reward };
            }

            const result = await createOfferReq(offerData as Partial<TOffer>);

            if (result.success) {
                toast.success(result.message || "Offer created successfully!", {
                    id: toastId,
                });
                form.reset();
                router.push(`/admin/vendor/${vendorUserId}/products/offers`);
                return;
            }

            if (result?.data?.errorSources) {
                result.data.errorSources.forEach(
                    (err: { path: string; message: string }) => {
                        toast.error(err.message, { id: toastId });
                    },
                );
                return;
            }

            toast.error(result.message || "Offer creation failed", { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Offer creation failed",
                { id: toastId },
            );
        }
    };

    return (
        <div className="min-h-screen space-y-10">
            <TitleHeader
                title={t("create_new_offer")}
                subtitle={t("add_promotion_boost_restaurant")}
                onBackClick={() => router.back()}
                extraComponent={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white flex items-center gap-2">
                                {t("actions") || "Actions"}
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 bg-white shadow-lg border rounded-lg p-1"
                        >
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/vendor/${vendorUserId}/manage-products`)
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("manage_products") || "Manage Product"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/vendor/${vendorUserId}/add-product`)
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("add_product") || "Add Product"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/update-discount`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("update_discounts") || "Update Discount"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/increase-price`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("increase_prices") || "Increase Price"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 border-gray-100" />

                            {/* Newly added sections */}
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/categories`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("product_categories") || "Product Categories"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/variation-management`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {/* <Layers className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
                                {t("variation_management") || "Variation Management"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/add-ons`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("add_ons") || "Add-ons"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/offers`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("created_offers") || ""}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />

            <Card className="rounded-3xl bg-white border shadow-lg">
                <CardContent className="p-0">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="p-6 space-y-8"
                        >
                            <div className="space-y-4">
                                <h2 className="font-bold text-lg">{t("offer_details")}</h2>
                                <Separator />

                                {lang === "en" ? (
                                    <FormField
                                        control={control}
                                        name="title.en"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("offer_title_20_perc_off")}{" "}
                                                    <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={t("offer_title_20_perc_off")}
                                                        className="h-12"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ) : (
                                    <FormField
                                        control={control}
                                        name="title.pt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("offer_title_20_perc_off")}{" "}
                                                    <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={t("offer_title_20_perc_off")}
                                                        className="h-12"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {lang === "en" ? (
                                    <FormField
                                        control={control}
                                        name="description.en"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("offer_description")}{" "}
                                                    <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder={t("offer_description")}
                                                        rows={3}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ) : (
                                    <FormField
                                        control={control}
                                        name="description.pt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("offer_description")}{" "}
                                                    <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder={t("offer_description")}
                                                        rows={3}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={control}
                                    name="offerType"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("offer_type")}{" "}
                                                <span className="text-red-600">*</span>
                                            </FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    if (val === "BUY_AND_REWARD") {
                                                        setValue("isAutoApply", true);
                                                    }
                                                }}
                                                value={field.value}
                                            >
                                                <SelectTrigger
                                                    className={cn(
                                                        "w-full h-12",
                                                        fieldState.invalid && "border-destructive",
                                                    )}
                                                >
                                                    <SelectValue placeholder={t("select_type")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PERCENT">
                                                        {t("percentage_discount")}
                                                    </SelectItem>
                                                    <SelectItem value="FLAT">
                                                        {t("flat_amount_off")}
                                                    </SelectItem>
                                                    <SelectItem value="BUY_AND_REWARD">
                                                        Buy & Reward
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {(watchOfferType === "PERCENT" ||
                                    watchOfferType === "FLAT") && (
                                        <>
                                            <div className="flex flex-col md:flex-row gap-5">
                                                <FormField
                                                    control={control}
                                                    name="discountValue"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>
                                                                {watchOfferType === "PERCENT"
                                                                    ? t("discount_perc_20")
                                                                    : t("discount_value")}{" "}
                                                                <span className="text-red-600">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder={
                                                                        watchOfferType === "PERCENT"
                                                                            ? t("discount_perc_20")
                                                                            : t("discount_value")
                                                                    }
                                                                    min={0}
                                                                    max={
                                                                        watchOfferType === "PERCENT"
                                                                            ? 100
                                                                            : undefined
                                                                    }
                                                                    className="h-12"
                                                                    value={field.value ?? ""}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            e.target.value === ""
                                                                                ? undefined
                                                                                : Number(e.target.value),
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {watchOfferType === "PERCENT" && (
                                                    <FormField
                                                        control={control}
                                                        name="maxDiscountAmount"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full">
                                                                <FormLabel>
                                                                    {t("max_discount_amount")}
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder={t("max_discount_amount")}
                                                                        min={0}
                                                                        className="h-12"
                                                                        value={field.value ?? ""}
                                                                        onChange={(e) =>
                                                                            field.onChange(
                                                                                e.target.value === ""
                                                                                    ? undefined
                                                                                    : Number(e.target.value),
                                                                            )
                                                                        }
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="font-medium text-sm text-gray-700">
                                                    Applicable Products
                                                </Label>
                                                <div className="flex flex-wrap gap-6">
                                                    <Label className="flex items-center gap-2 cursor-pointer">
                                                        <Input
                                                            type="radio"
                                                            className="w-4 h-4 accent-[#DC3173]"
                                                            checked={!watchScopeType}
                                                            onChange={() => {
                                                                setValue("scopeType", "ALL_PRODUCTS");
                                                                setValue("scopeProducts", []);
                                                            }}
                                                        />
                                                        <span className="text-sm">All Products</span>
                                                    </Label>
                                                    <Label className="flex items-center gap-2 cursor-pointer">
                                                        <Input
                                                            type="radio"
                                                            className="w-4 h-4 accent-[#DC3173]"
                                                            checked={
                                                                watchScopeType === "SPECIFIC_PRODUCTS"
                                                            }
                                                            onChange={() => {
                                                                setValue("scopeType", "SPECIFIC_PRODUCTS");
                                                            }}
                                                        />
                                                        <span className="text-sm">
                                                            Specific Products
                                                        </span>
                                                    </Label>
                                                </div>

                                                {watchScopeType === "SPECIFIC_PRODUCTS" && (
                                                    <FormField
                                                        control={control}
                                                        name="scopeProducts"
                                                        render={() => (
                                                            <FormItem className="space-y-2 pt-1">
                                                                <ProductSelector
                                                                    {...selectorProps}
                                                                    selectionMode="multi"
                                                                    selectedIds={watchScopeProducts || []}
                                                                    onToggle={(id) =>
                                                                        toggleInArray("scopeProducts", id)
                                                                    }
                                                                    onToggleCategory={(catId, selectAll) =>
                                                                        toggleCategoryProducts(
                                                                            "scopeProducts",
                                                                            catId,
                                                                            selectAll,
                                                                        )
                                                                    }
                                                                    height="h-72"
                                                                />
                                                                {(watchScopeProducts?.length ?? 0) > 0 && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {watchScopeProducts!.length} product
                                                                        {watchScopeProducts!.length === 1
                                                                            ? ""
                                                                            : "s"}{" "}
                                                                        selected
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

                                {watchOfferType === "BUY_AND_REWARD" && (
                                    <div className="space-y-6 border border-gray-200 rounded-xl p-5 bg-gray-50/50 grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-base">
                                                Buy Condition
                                            </h3>

                                            <FormField
                                                control={control}
                                                name="buyAndReward.buy.quantity"
                                                render={({ field }) => (
                                                    <FormItem className="max-w-xs">
                                                        <FormLabel>
                                                            Buy Quantity{" "}
                                                            <span className="text-red-600">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                className="h-12"
                                                                value={field.value ?? 1}
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        Number(e.target.value) || 1,
                                                                    )
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={control}
                                                name="buyAndReward.buy.productIds"
                                                render={() => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-medium">
                                                            Products to buy{" "}
                                                            <span className="text-red-600">*</span>
                                                        </FormLabel>
                                                        <ProductSelector
                                                            {...selectorProps}
                                                            selectionMode="multi"
                                                            selectedIds={watchBuyProductIds || []}
                                                            onToggle={(id) =>
                                                                toggleInArray(
                                                                    "buyAndReward.buy.productIds",
                                                                    id,
                                                                )
                                                            }
                                                            onToggleCategory={(catId, selectAll) =>
                                                                toggleCategoryProducts(
                                                                    "buyAndReward.buy.productIds",
                                                                    catId,
                                                                    selectAll,
                                                                )
                                                            }
                                                            height="h-64"
                                                        />
                                                        {(watchBuyProductIds?.length ?? 0) > 0 && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {watchBuyProductIds!.length} product
                                                                {watchBuyProductIds!.length === 1
                                                                    ? ""
                                                                    : "s"}{" "}
                                                                selected
                                                            </p>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-base">Reward</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={control}
                                                    name="buyAndReward.reward.type"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Reward Type</FormLabel>
                                                            <Select
                                                                onValueChange={(val) => {
                                                                    field.onChange(val);
                                                                    setValue(
                                                                        "buyAndReward.reward.productId",
                                                                        "",
                                                                    );
                                                                    setValue(
                                                                        "buyAndReward.reward.variationSku",
                                                                        "",
                                                                    );
                                                                    setValue(
                                                                        "buyAndReward.reward.options",
                                                                        [],
                                                                    );
                                                                }}
                                                                value={field.value}
                                                            >
                                                                <SelectTrigger className="h-12">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="SAME_PRODUCT">
                                                                        Same Product
                                                                    </SelectItem>
                                                                    <SelectItem value="FIXED_PRODUCT">
                                                                        Fixed Product
                                                                    </SelectItem>
                                                                    <SelectItem value="CUSTOMER_CHOICE">
                                                                        Customer Choice
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={control}
                                                    name="buyAndReward.reward.quantity"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Reward Quantity{" "}
                                                                <span className="text-red-600">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    className="h-12"
                                                                    value={field.value ?? 1}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            Number(e.target.value) || 1,
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {watchRewardType === "FIXED_PRODUCT" && (
                                                <div className="space-y-3">
                                                    <FormField
                                                        control={control}
                                                        name="buyAndReward.reward.productId"
                                                        render={() => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-sm font-medium">
                                                                    Reward Product{" "}
                                                                    <span className="text-red-600">*</span>
                                                                </FormLabel>
                                                                <ProductSelector
                                                                    {...selectorProps}
                                                                    selectionMode="single"
                                                                    selectedIds={
                                                                        watchRewardProductId
                                                                            ? [watchRewardProductId]
                                                                            : []
                                                                    }
                                                                    onToggle={(id) =>
                                                                        selectSingleRewardProduct(id)
                                                                    }
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
                                                                        Variation SKU{" "}
                                                                        <span className="text-red-600">*</span>
                                                                    </FormLabel>
                                                                    <Select
                                                                        onValueChange={field.onChange}
                                                                        value={field.value || ""}
                                                                    >
                                                                        <SelectTrigger className="h-12">
                                                                            <SelectValue placeholder="Select variation SKU" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {fixedSkuOptions.map((opt) => (
                                                                                <SelectItem
                                                                                    key={opt.sku}
                                                                                    value={opt.sku}
                                                                                >
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

                                            {watchRewardType === "CUSTOMER_CHOICE" && (
                                                <FormField
                                                    control={control}
                                                    name="buyAndReward.reward.options"
                                                    render={() => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-sm font-medium">
                                                                Reward Options{" "}
                                                                <span className="text-red-600">*</span>
                                                            </FormLabel>
                                                            <ProductSelector
                                                                {...selectorProps}
                                                                selectionMode="multi"
                                                                selectedIds={selectedRewardOptionIds}
                                                                onToggle={(id) =>
                                                                    toggleRewardOptionProduct(id)
                                                                }
                                                                onToggleCategory={(catId, selectAll) => {
                                                                    const idsInCat = products
                                                                        .filter((p) => {
                                                                            const cId =
                                                                                (p as any).category?._id ||
                                                                                "uncategorized";
                                                                            return cId === catId;
                                                                        })
                                                                        .map((p) => p._id as string);

                                                                    const current =
                                                                        (getValues(
                                                                            "buyAndReward.reward.options",
                                                                        ) as any[]) || [];

                                                                    if (selectAll) {
                                                                        const existingIds = new Set(
                                                                            current.map((o) => o.productId),
                                                                        );
                                                                        const toAdd = idsInCat
                                                                            .filter((id) => !existingIds.has(id))
                                                                            .map((id) => ({
                                                                                productId: id,
                                                                                variationSku: "",
                                                                            }));
                                                                        setValue(
                                                                            "buyAndReward.reward.options",
                                                                            [...current, ...toAdd],
                                                                            { shouldValidate: true },
                                                                        );
                                                                    } else {
                                                                        setValue(
                                                                            "buyAndReward.reward.options",
                                                                            current.filter(
                                                                                (o) =>
                                                                                    !idsInCat.includes(o.productId),
                                                                            ),
                                                                            { shouldValidate: true },
                                                                        );
                                                                    }
                                                                }}
                                                                height="h-56"
                                                            />

                                                            {/* SKU per selected option when product has variations */}
                                                            {selectedRewardOptionIds.length > 0 && (
                                                                <div className="space-y-3 pt-2 border-t border-gray-100">
                                                                    {(watchRewardOptions || []).map(
                                                                        (opt: any) => {
                                                                            if (!opt.productId) return null;
                                                                            const prod = productsById.get(
                                                                                opt.productId,
                                                                            );
                                                                            if (
                                                                                !prod ||
                                                                                !productHasVariations(prod)
                                                                            )
                                                                                return null;
                                                                            const skuOpts = getProductSkuOptions(
                                                                                prod,
                                                                                lang,
                                                                            );
                                                                            return (
                                                                                <div
                                                                                    key={opt.productId}
                                                                                    className="space-y-1"
                                                                                >
                                                                                    <Label className="text-sm">
                                                                                        SKU for{" "}
                                                                                        {prod.name?.[
                                                                                            lang as "en" | "pt"
                                                                                        ] || "product"}{" "}
                                                                                        <span className="text-red-600">
                                                                                            *
                                                                                        </span>
                                                                                    </Label>
                                                                                    <Select
                                                                                        value={opt.variationSku || ""}
                                                                                        onValueChange={(sku) =>
                                                                                            setOptionSku(
                                                                                                opt.productId,
                                                                                                sku,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger className="h-11">
                                                                                            <SelectValue placeholder="Select variation SKU" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            {skuOpts.map((s) => (
                                                                                                <SelectItem
                                                                                                    key={s.sku}
                                                                                                    value={s.sku}
                                                                                                >
                                                                                                    {s.label}
                                                                                                </SelectItem>
                                                                                            ))}
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            )}

                                                            {selectedRewardOptionIds.length > 0 && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {selectedRewardOptionIds.length} option
                                                                    {selectedRewardOptionIds.length === 1
                                                                        ? ""
                                                                        : "s"}{" "}
                                                                    selected
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

                            <div className="space-y-4">
                                <h2 className="font-bold text-lg">{t("validity")}</h2>
                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="validFrom"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("start_date")}{" "}
                                                    <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        className="h-12"
                                                        min={format(new Date(), "yyyy-MM-dd")}
                                                        value={
                                                            field.value
                                                                ? format(
                                                                    new Date(field.value),
                                                                    "yyyy-MM-dd",
                                                                )
                                                                : ""
                                                        }
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value
                                                                    ? new Date(e.target.value)
                                                                    : null,
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="expiresAt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("end_date")}{" "}
                                                    <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        className="h-12"
                                                        min={format(new Date(), "yyyy-MM-dd")}
                                                        value={
                                                            field.value
                                                                ? format(
                                                                    new Date(field.value),
                                                                    "yyyy-MM-dd",
                                                                )
                                                                : ""
                                                        }
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value
                                                                    ? new Date(e.target.value)
                                                                    : null,
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="minOrderAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("minimum_order_amount")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder={t("minimum_order_amount")}
                                                    min={0}
                                                    className="h-12"
                                                    value={field.value ?? ""}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value === ""
                                                                ? undefined
                                                                : Number(e.target.value),
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="userUsageLimit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("users_usage_limit")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder={t("users_usage_limit")}
                                                    min={1}
                                                    className="h-12"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {watchOfferType !== "BUY_AND_REWARD" && (
                                    <FormField
                                        control={control}
                                        name="isAutoApply"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 cursor-pointer">
                                                    <Input
                                                        type="checkbox"
                                                        className="w-4 h-4"
                                                        checked={!!field.value}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.checked)
                                                        }
                                                    />
                                                    <span>{t("will_auto_apply")}</span>
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            {watchOfferType !== "BUY_AND_REWARD" &&
                                !watchIsAutoApply && (
                                    <div className="space-y-4">
                                        <h2 className="font-bold text-lg">
                                            {t("promo_code")}
                                        </h2>
                                        <Separator />
                                        <FormField
                                            control={control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t("enter_promo_code")}
                                                            className="h-12 uppercase"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target.value.toUpperCase(),
                                                                )
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                            <div className="pt-4 flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-12 px-6"
                                    onClick={() => router.back()}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-12 px-6 text-white"
                                    style={{ background: PRIMARY }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Creating..."
                                        : t("create_offer")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}