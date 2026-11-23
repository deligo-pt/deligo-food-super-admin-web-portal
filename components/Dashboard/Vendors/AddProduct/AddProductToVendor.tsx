/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Form,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { TAddonGroup } from "@/types/add-ons.type";
import { TProductCategory } from "@/types/category.type";
import { TTax } from "@/types/tax.type";
import { productValidation } from "@/validations/item/product.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
    ChevronDown,
    ChevronLeftIcon,
    ChevronRightIcon,
    ImageIcon,
    LayersIcon,
    PackageIcon,
    SaveIcon,
    StarIcon,
    TagIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { translateObject } from "@/utils/translation/translationObject";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import BasicInfoForm from "./BasicInfoForm";
import PricingForm from "./PricingForm";
import AddOnsAndVariants from "./AddOns&Variants";
import ImageAndDescriptionForm from "./Image&DescriptionForm";
import StockInformationForm from "./StockInformationForm";
import DeligoMetadata from "./DeligoMetadata";
import { TVendor } from "@/types/user.type";
import { adminBulkCreateProductsReq } from "@/services/dashboard/product/product-bulk.service";
import { createTwoForOneReq } from "@/services/dashboard/offer/offer.service";
import { getVendorCategoryProductsReq } from "@/services/dashboard/product/product.service";
import { KIND_SETTINGS, kindFromProducts, taxIdForRate, type TProductKind } from "@/utils/productKind";
import type { TBulkProductItem } from "@/types/product-bulk.type";
import { bulkErrorText, bulkRequestErrorText } from "@/utils/bulkErrors";
import {
    productFieldForCode,
    productFieldForPath,
    productTabKeyForField,
    type TProductFormField,
} from "@/utils/productFormErrors";
import { useVendorTopbarTitle } from "@/hooks/useVendorTopbarTitle";
import { invalidateProductsCache } from "@/hooks/use-progressive-products";

type FormData = z.infer<typeof productValidation>;

export function AddProductToVendor({
    productCategories,
    addonGroupsData,
    taxesData,
    businessTypeSlug,
    vendor,
}: {
    productCategories: TProductCategory[];
    addonGroupsData: TAddonGroup[];
    taxesData: TTax[];
    businessTypeSlug: string;
    vendor: TVendor;
}) {
    const { lang } = useStore();
    const { t } = useTranslation();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);

    const tabs = useMemo(() => {
        const baseTabs = [
            {
                name: t("basic_info"),
                icon: <PackageIcon className="h-5 w-5" />,
            },
            {
                name: t("images"),
                icon: <ImageIcon className="h-5 w-5" />,
            },
            {
                name: t("add_ons_and_variants"),
                icon: <LayersIcon className="h-5 w-5" />,
            },
            {
                name: t("pricing"),
                icon: <TagIcon className="h-5 w-5" />,
            },
        ];

        if (businessTypeSlug !== "restaurant") {
            baseTabs.push({
                name: t("stock"),
                icon: <PackageIcon className="h-5 w-5" />,
            });
        }

        baseTabs.push({
            name: t("deligo_metadata"),
            icon: <StarIcon className="h-5 w-5" />,
        });

        return baseTabs;
    }, [businessTypeSlug, t]);

    const lastTabIndex = tabs.length - 1;

    const form = useForm<FormData>({
        resolver: zodResolver(productValidation),
        values: {
            name: {
                en: "",
                pt: ""
            },
            image: "",
            description: {
                en: "",
                pt: ""
            },
            category: "",
            additionalCategories: [],
            price: 0,
            discountType: "PERCENTAGE",
            discount: 0,
            taxId: "",
            quantity: 0,
            unit: "",
            availabilityStatus: "",
            addonGroups: [],
            variations: [],
            isFeatured: false,
            isTwoForOne: false,
            sdrApplicable: false,
            sdrContainerCount: 1,
            isAvailableForPreOrder: false,
            isActive: true,
            businessTypeSlug,
            currentLang: lang
        },
    });
    const { formState: { errors, isSubmitting } } = form;

    const tabError = useMemo(() => {
        const newErrors = tabs.reduce(
            (err, tab) => {
                err[tab.name] = false;
                return err;
            },
            {} as Record<string, boolean>,
        );

        Object.entries(errors).forEach(([key, value]) => {
            const hasMessage =
                !!value?.message ||
                (typeof value === "object" &&
                    Object.values(value as any).some((v: any) => v?.message));

            if (!hasMessage) return;

            switch (key) {
                case "name":
                case "brand":
                case "category":
                case "additionalCategories":
                    newErrors[t("basic_info")] = true;
                    return;
                case "description":
                case "image":
                case "images":
                    newErrors[t("images")] = true;
                    return;
                case "addonGroups":
                case "variations":
                    newErrors[t("add_ons_and_variants")] = true;
                    return;
                case "price":
                case "discount":
                case "taxId":
                    newErrors[t("pricing")] = true;
                    return;
                case "quantity":
                case "unit":
                case "availabilityStatus":
                    newErrors[t("stock")] = true;
                    return;
                case "sdrApplicable":
                case "sdrContainerCount":
                case "isFeatured":
                case "isTwoForOne":
                case "isAvailableForPreOrder":
                    newErrors[t("deligo_metadata")] = true;
                    return;
            }
        });

        return newErrors;
    }, [errors, tabs, t]);

    const [watchName, watchPrice, watchDiscount, watchDiscountType, watchTaxId, watchAddons, watchVariations] =
        useWatch({
            control: form.control,
            name: [`name.${lang}`, "price", "discount", "discountType", "taxId", "addonGroups", "variations"],
        });

    /* ----- Food | Drinks pre-selected from the category (§10.5) ----- */

    const [watchCategory, watchSdr] = useWatch({ control: form.control, name: ["category", "sdrApplicable"] });
    /** Each category's kind, once looked up while the form is open. */
    const kindByCategory = useRef(new Map<string, TProductKind | null>());
    /** What the last pre-selection wrote: only that may be replaced, never the admin's own choice. */
    const autoKind = useRef<{ taxId: string; sdr: boolean }>({ taxId: "", sdr: false });
    /** The same, for rendering (a ref can't be read while rendering). */
    const [autoChoice, setAutoChoice] = useState<{ taxId: string; sdr: boolean } | null>(null);

    useEffect(() => {
        if (!watchCategory || !vendor?._id) return;
        let stale = false;
        const apply = (kind: TProductKind | null) => {
            if (stale || !kind) return;
            const taxId = form.getValues("taxId") || "";
            const sdr = form.getValues("sdrApplicable") === true;
            // VAT or SDR set by hand: leave them.
            if (taxId !== autoKind.current.taxId || sdr !== autoKind.current.sdr) return;
            const id = taxIdForRate(taxesData, KIND_SETTINGS[kind].rate);
            if (!id) return;
            const nextSdr = KIND_SETTINGS[kind].sdr;
            form.setValue("taxId", id, { shouldValidate: !!taxId });
            form.setValue("sdrApplicable", nextSdr);
            if (!nextSdr) form.setValue("sdrContainerCount", undefined);
            else if (!form.getValues("sdrContainerCount")) form.setValue("sdrContainerCount", 1);
            autoKind.current = { taxId: id, sdr: nextSdr };
            setAutoChoice(autoKind.current);
        };
        if (kindByCategory.current.has(watchCategory)) {
            apply(kindByCategory.current.get(watchCategory) ?? null);
        } else {
            getVendorCategoryProductsReq(vendor._id as string, watchCategory).then((products) => {
                const kind = products ? kindFromProducts(products) : null;
                if (products) kindByCategory.current.set(watchCategory, kind);
                apply(kind);
            });
        }
        return () => {
            stale = true;
        };
        // A new category only; taxes, vendor and the form are stable for the page.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchCategory]);

    // "Chosen from the category" only while VAT and SDR are still what it chose.
    const kindStillAuto =
        !!autoChoice && watchTaxId === autoChoice.taxId && (watchSdr === true) === autoChoice.sdr;

    /**
     * A refused save: each problem goes on its field and the form opens the
     * step holding the first one; what has no field is shown in the toast.
     */
    const showServerErrors = (
        result: Awaited<ReturnType<typeof adminBulkCreateProductsReq>>,
        toastId: string | number,
    ) => {
        const failed = result.data?.failed?.[0];

        // The request itself was refused (429, 403, network…): nothing per item.
        if (!failed && !result.errorSources.some((e) => productFieldForPath(e.path))) {
            toast.error(bulkRequestErrorText(t, result), { id: toastId });
            return;
        }

        const problems = failed
            ? failed.errors?.length
                ? failed.errors
                : [{ path: "", message: failed.message }]
            : result.errorSources;

        const leftovers: string[] = [];
        let firstField: TProductFormField | null = null;
        const placed = new Set<string>();

        for (const problem of problems) {
            const field =
                productFieldForPath(problem.path) ??
                (problem.path ? null : productFieldForCode(failed?.code));
            const text = problem.path
                ? problem.message
                : bulkErrorText(t, failed?.code, problem.message);

            if (field && !placed.has(field)) {
                placed.add(field);
                form.setError(field as never, { type: "server", message: text });
                firstField ??= field;
            } else if (!leftovers.includes(text)) {
                leftovers.push(text);
            }
        }

        if (firstField) {
            const tabIndex = tabs.findIndex((tab) => tab.name === t(productTabKeyForField(firstField!)));
            if (tabIndex >= 0) setActiveTab(tabIndex);
        }

        toast.error(
            leftovers[0] ?? bulkErrorText(t, failed?.code ?? result.errorKey, failed?.message ?? result.message),
            { id: toastId },
        );
    };

    const onSubmit = async (data: FormData) => {
        const toastId = toast.loading("Translating and Creating product...");

        const status = data.isActive === true ? "ACTIVE" : "INACTIVE";

        try {
            // Normalize: support both form.image (string) and legacy data.images (array)
            const imageUrl =
                typeof data.image === "string" && data.image.trim()
                    ? data.image.trim()
                    : "";

            // Translate + build payload
            const translated = await translateObject(data, lang);

            if (!translated) {
                toast.error("Translation failed!", { id: toastId });
                return;
            }

            const hasOptions = (translated.variations ?? []).some(
                (v: { options?: unknown[] }) => (v.options?.length ?? 0) > 0,
            );

            // One item for this vendor through the unified create
            // (`admin/create-product` is deprecated). Bodies are strict:
            // `vendorId` goes on the request, never inside the item.
            const productData: TBulkProductItem = {
                name: translated.name as TBulkProductItem["name"],
                ...(data?.description?.[lang] && {
                    description: translated.description as TBulkProductItem["description"],
                }),
                category: data.category,
                ...(data.additionalCategories?.length && {
                    additionalCategories: data.additionalCategories.filter((id): id is string => !!id),
                }),
                // Left out when empty: the API refuses "" and uses the default picture.
                ...(imageUrl && { image: imageUrl }),
                pricing: {
                    // With options the API sets the price to the cheapest one.
                    ...(!hasOptions && { price: data.price ?? undefined }),
                    discountType: data.discountType,
                    discount: data.discount ?? 0,
                    taxId: data.taxId,
                    // "€", as every existing product and the vendor panel have it.
                    currency: "€",
                },
                addonGroups: data.addonGroups,
                // Left out, not `[]`, when there are none (the bulk API's rule).
                ...(translated.variations?.length && {
                    variations: translated.variations.map((v: any) => ({
                        name: v.name,
                        options: v.options.map((o: any) => ({
                            label: o.label,
                            price: o.price,
                            // Restaurants don't track stock, per option either.
                            ...(businessTypeSlug !== "restaurant" &&
                                o.stockQuantity != null && { stockQuantity: o.stockQuantity }),
                        })),
                    })),
                }),
                sdr: {
                    applicable: data.sdrApplicable ?? false,
                    ...(data.sdrApplicable
                        ? { containerCount: data.sdrContainerCount ?? 1 }
                        : {}),
                },
                meta: {
                    isFeatured: data.isFeatured,
                    isAvailableForPreOrder: data.isAvailableForPreOrder,
                    status,
                },
                ...(businessTypeSlug !== "restaurant"
                    ? {
                        stock: {
                            quantity: data.quantity ?? 0,
                            unit: data.unit,
                            availabilityStatus: (data.availabilityStatus || undefined) as NonNullable<TBulkProductItem["stock"]>["availabilityStatus"],
                        },
                    }
                    : {}),
            };

            const result = await adminBulkCreateProductsReq(vendor._id as string, [productData]);

            if (result.ok && result.data?.created.length) {
                toast.success(t("product_created_successfully"), {
                    id: toastId,
                });
                // 2×1 (sheet row 77): an offer for the new product. The
                // product is saved either way; a failure is only a warning.
                if (data.isTwoForOne) {
                    const offer = await createTwoForOneReq(
                        vendor._id as string,
                        result.data.created[0]._id,
                        translated.name as { en: string; pt: string },
                    );
                    if (offer.success) toast.success(t("two_for_one_created"));
                    else toast.warning(t("two_for_one_create_failed").replace("{reason}", offer.message || ""));
                }
                form.reset();
                setActiveTab(0);
                invalidateProductsCache(); // the list's in-memory pages are now out of date
                router.push(`/admin/vendor/${vendor?.userId}/manage-products`);
                return;
            }

            showServerErrors(result, toastId);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong", {
                id: toastId,
            });
        }
    };

    useVendorTopbarTitle(
        vendor?.businessDetails?.businessName ||
        vendor?.businessDetails?.branchName,
    );

    return (
        <div>
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.5,
                }}
                className="bg-white shadow-xl rounded-2xl overflow-hidden"
            >
                <TitleHeader
                    title={`${t("add_new_item")}${watchName && ` - ${watchName}`}`}
                    subtitle={t("fill_the_details_to_add_new_food_item")}
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
                                        router.push(`/admin/vendor/${vendor?.userId}/manage-products`)
                                    }
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                    {t("manage_products") || "Manage Product"}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() =>
                                        router.push(
                                            `/admin/vendor/${vendor?.userId}/products/update-discount`
                                        )
                                    }
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                    {t("update_discounts") || "Update Discount"}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() =>
                                        router.push(
                                            `/admin/vendor/${vendor?.userId}/products/increase-price`
                                        )
                                    }
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                    {t("increase_prices") || "Increase Price"}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() =>
                                        router.push(
                                            `/admin/vendor/${vendor?.userId}/products/offers/create-new`
                                        )
                                    }
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                    {t("create_new_offer") || "Create New Offer"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 border-gray-100" />

                                {/* Newly added sections */}
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.push(
                                            `/admin/vendor/${vendor?.userId}/products/categories`
                                        )
                                    }
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                    {t("product_categories") || "Product Categories"}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() =>
                                        router.push(
                                            `/admin/vendor/${vendor?.userId}/products/add-ons`
                                        )
                                    }
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                    {t("add_ons") || "Add-ons"}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() =>
                                        router.push(
                                            `/admin/vendor/${vendor?.userId}/products/variation-management`
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
                                            `/admin/vendor/${vendor?.userId}/products/offers`
                                        )
                                    }
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                    {t("created_offers") || "Created Offers"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    }
                    buttonInfo={{
                        text: t("save_product"),
                        icon: SaveIcon,
                        onClick: form.handleSubmit(onSubmit),
                        disabled: isSubmitting
                    }}
                />
                <div className="flex flex-col md:flex-row">
                    {/* Tabs */}
                    <div className="md:w-52 lg:w-64 bg-gray-50 p-4">
                        <div className="space-y-1">
                            {tabs.map((tab, index) => (
                                <motion.button
                                    key={tab.name}
                                    whileHover={{
                                        scale: 1.02,
                                    }}
                                    whileTap={{
                                        scale: 0.98,
                                    }}
                                    onClick={() => setActiveTab(index)}
                                    className={cn(
                                        "w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-left",
                                        activeTab === index
                                            ? "bg-[#DC3173] text-white"
                                            : tabError[tab.name]
                                                ? "bg-destructive/20 text-destructive"
                                                : "hover:bg-gray-100 text-gray-700",
                                    )}
                                >
                                    <div className="w-5 h-5">{tab.icon}</div>
                                    <span>{tab.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    {/* Form */}
                    <div className="flex-1 p-6">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-8"
                            >
                                {activeTab === 0 && (
                                    <BasicInfoForm
                                        form={form as any}
                                        productCategories={productCategories}
                                        selectedLanguage={lang}
                                    />
                                )}
                                {activeTab === 1 && (
                                    <ImageAndDescriptionForm
                                        form={form}
                                        selectedLanguage={lang}
                                    />
                                )}
                                {activeTab === 2 && (
                                    <AddOnsAndVariants
                                        form={form}
                                        addonGroupsData={addonGroupsData}
                                        businessTypeSlug={businessTypeSlug}
                                        watchAddons={watchAddons}
                                        watchVariations={watchVariations}
                                        selectedLanguage={lang}
                                    />
                                )}
                                {activeTab === 3 && (
                                    <PricingForm
                                        form={form}
                                        taxesData={taxesData}
                                        watchDiscount={watchDiscount}
                                        watchPrice={watchPrice}
                                        watchVariations={watchVariations}
                                        watchTaxId={watchTaxId}
                                        watchDiscountType={watchDiscountType}
                                        kindFromCategory={kindStillAuto}
                                    />
                                )}
                                {businessTypeSlug !== "restaurant" && activeTab === 4 && (
                                    <StockInformationForm
                                        form={form}
                                        watchVariations={watchVariations}
                                    />
                                )}
                                {activeTab === lastTabIndex && (
                                    <DeligoMetadata
                                        form={form}
                                    />
                                )}
                                <div className="flex justify-start gap-3 pt-6">
                                    {/* Previous */}
                                    <motion.button
                                        whileHover={activeTab === 0 ? undefined : { scale: 1.02 }}
                                        whileTap={activeTab === 0 ? undefined : { scale: 0.98 }}
                                        type="button"
                                        onClick={() => activeTab > 0 && setActiveTab(activeTab - 1)}
                                        disabled={activeTab === 0}
                                        className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${activeTab === 0
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-[#DC3173] hover:bg-[#B02458] text-white"
                                            }`}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        <span>{t("previous")}</span>
                                    </motion.button>

                                    {/* Next */}
                                    <motion.button
                                        whileHover={activeTab === lastTabIndex ? undefined : { scale: 1.02 }}
                                        whileTap={activeTab === lastTabIndex ? undefined : { scale: 0.98 }}
                                        type="button"
                                        onClick={() =>
                                            activeTab < lastTabIndex && setActiveTab(activeTab + 1)
                                        }
                                        disabled={activeTab === lastTabIndex}
                                        className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${activeTab === lastTabIndex
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-[#DC3173] hover:bg-[#B02458] text-white"
                                            }`}
                                    >
                                        <span>{t("next")}</span>
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
