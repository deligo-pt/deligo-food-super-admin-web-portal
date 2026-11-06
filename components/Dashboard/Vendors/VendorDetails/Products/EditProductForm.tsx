/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/store/store";
import { TMeta, TResponse } from "@/types";
import { TAddonGroup } from "@/types/add-ons.type";
import { TProductCategory } from "@/types/category.type";
import { TProduct } from "@/types/product.type";
import { TTax } from "@/types/tax.type";
import { catchAsync } from "@/utils/catchAsync";
import { translateObject } from "@/utils/translation/translationObject";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ImageIcon,
    LayersIcon,
    PackageIcon,
    SaveIcon,
    StarIcon,
    TagIcon,
    XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { productValidation } from "@/validations/item/product.validation";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import BasicInfoForm from "../../AddProduct/BasicInfoForm";
import ImageAndDescriptionForm from "../../AddProduct/Image&DescriptionForm";
import PricingForm from "../../AddProduct/PricingForm";
import StockInformationForm from "../../AddProduct/StockInformationForm";
import DeligoMetadata from "../../AddProduct/DeligoMetadata";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { getAllTaxes } from "@/services/dashboard/tax/tax.service";
import { getAllAddOnsGroup, updateProduct, updateProductPriceStock } from "@/services/dashboard/product/product.service";
import { uploadImagesReq } from "@/services/upload/upload.service";
import { queryStringFormatter } from "@/utils/formatter";

type FormData = z.infer<typeof productValidation>;

interface IProps {
    prevData: TProduct;
    closeModal: () => void;
    businessTypeSlug: string;
    onSuccess: (value: TProduct) => void;
    vendorMongoId: string;
}

interface IData<T> {
    data: T[];
    meta?: TMeta;
}

// Same shape the Add form starts with: name/description are { en, pt } objects.
const buildDefaultValues = (
    prevData: TProduct,
    businessTypeSlug: string,
    lang: "en" | "pt"
): FormData =>
    ({
        name: { en: prevData?.name?.en ?? "", pt: prevData?.name?.pt ?? "" },
        image:
            (typeof prevData?.image === "string" && prevData.image.trim()) ||
            (Array.isArray(prevData?.images) && prevData.images[0]?.trim()) ||
            "",
        description: {
            en: prevData?.description?.en ?? "",
            pt: prevData?.description?.pt ?? "",
        },
        brand: prevData?.brand ?? "",
        category: prevData?.category?._id ?? "",
        additionalCategories: (prevData?.additionalCategories ?? [])
            .map((c: any) => (typeof c === "string" ? c : c?._id))
            .filter((id: unknown): id is string => Boolean(id)),
        price: prevData?.pricing?.price || 0,
        discountType: prevData?.pricing?.discountType ?? "PERCENTAGE",
        discount: prevData?.pricing?.discount ?? 0,
        taxId: String(prevData?.pricing?.taxId || ""),
        addonGroups: prevData?.addonGroups || [],
        variations: prevData?.variations || [],
        quantity: prevData?.stock?.quantity || 0,
        unit: prevData?.stock?.unit || "",
        availabilityStatus: prevData?.stock?.availabilityStatus || "",
        isFeatured: prevData?.meta?.isFeatured || false,
        sdrApplicable: prevData?.sdr?.applicable ?? false,
        sdrContainerCount: prevData?.sdr?.containerCount ?? 1,
        isAvailableForPreOrder: prevData?.meta?.isAvailableForPreOrder || false,
        isActive: prevData?.meta?.status === "ACTIVE",
        businessTypeSlug,
        currentLang: lang,
    }) as unknown as FormData;

// RHF error objects hold DOM refs, so skip `ref` / `types` while walking them
const IGNORED_ERROR_KEYS = new Set(["ref", "types"]);

const hasErrorMessage = (node: any): boolean => {
    if (!node || typeof node !== "object") return false;
    if (typeof node.message === "string" && node.message) return true;
    return Object.entries(node).some(
        ([key, child]) => !IGNORED_ERROR_KEYS.has(key) && hasErrorMessage(child)
    );
};

const getFirstErrorMessage = (node: any): string | undefined => {
    if (!node || typeof node !== "object") return undefined;
    if (typeof node.message === "string" && node.message) return node.message;
    for (const [key, child] of Object.entries(node)) {
        if (IGNORED_ERROR_KEYS.has(key)) continue;
        const found = getFirstErrorMessage(child);
        if (found) return found;
    }
    return undefined;
};

export function EditProductForm({
    prevData,
    closeModal,
    businessTypeSlug,
    onSuccess,
    vendorMongoId
}: IProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();
    const { lang } = useStore();
    const [activeTab, setActiveTab] = useState(0);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const tabs = useMemo(() => {
        const baseTabs = [
            { name: t("basic_info"), icon: <PackageIcon className="h-5 w-5" /> },
            { name: t("images"), icon: <ImageIcon className="h-5 w-5" /> },
            { name: t("add_ons_and_variants"), icon: <LayersIcon className="h-5 w-5" /> },
            { name: t("pricing"), icon: <TagIcon className="h-5 w-5" /> },
        ];

        if (businessTypeSlug !== "restaurant") {
            baseTabs.push({ name: t("stock"), icon: <PackageIcon className="h-5 w-5" /> });
        }

        baseTabs.push({ name: t("deligo_metadata"), icon: <StarIcon className="h-5 w-5" /> });

        return baseTabs;
    }, [businessTypeSlug, t]);

    const lastTabIndex = tabs.length - 1;

    const [addonGroupsData, setAddonsGroupsData] = useState<IData<TAddonGroup>>({
        data: [],
    });
    const [productCategoriesData, setProductCategoriesData] = useState<TProductCategory[]>([]);
    const [taxesData, setTaxesData] = useState<TTax[]>([]);

    // `values` keeps the form in sync when prevData changes (e.g. after router.refresh()
    // or when the modal is reopened for another product). keepDirtyValues protects
    // anything the user is currently typing.
    const defaultValues = useMemo(
        () => buildDefaultValues(prevData, businessTypeSlug, lang),
        [prevData, businessTypeSlug, lang]
    );

    const form = useForm<FormData>({
        resolver: zodResolver(productValidation),
        defaultValues,
        values: defaultValues,
        resetOptions: { keepDirtyValues: true },
    });
    const { formState: { errors } } = form;

    // Which tab does a field live in? (same mapping as the Add form;
    // description is edited inside the Images tab)
    const fieldToTabName = (key: string): string | null => {
        switch (key) {
            case "name":
            case "brand":
            case "category":
            case "additionalCategories":
                return t("basic_info");
            case "description":
            case "image":
            case "images":
                return t("images");
            case "addonGroups":
            case "variations":
                return t("add_ons_and_variants");
            case "price":
            case "discount":
            case "discountType":
            case "taxId":
                return t("pricing");
            case "quantity":
            case "unit":
            case "availabilityStatus":
                return t("stock");
            case "isFeatured":
            case "isAvailableForPreOrder":
            case "isActive":
            case "sdrApplicable":
            case "sdrContainerCount":
                return t("deligo_metadata");
            default:
                return null;
        }
    };

    // Derived from current errors (like the Add form), so it updates AND clears itself
    const tabError = useMemo(() => {
        const next = tabs.reduce((acc, tab) => {
            acc[tab.name] = false;
            return acc;
        }, {} as Record<string, boolean>);

        Object.entries(errors).forEach(([key, value]) => {
            if (!hasErrorMessage(value)) return;
            const tabName = fieldToTabName(key);
            if (tabName) next[tabName] = true;
        });

        return next;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errors, tabs]);

    const [watchName, watchPrice, watchDiscount, watchDiscountType, watchTaxId, watchAddons, watchVariations] =
        useWatch({
            control: form.control,
            name: [`name.${lang}`, "price", "discount", "discountType", "taxId", "addonGroups", "variations"],
        });

    const addAddon = (id: string) => {
        if (!form?.getValues("addonGroups")?.includes(id)) {
            const newAddonGroups = [...form?.getValues("addonGroups"), id];
            form.setValue("addonGroups", newAddonGroups, { shouldDirty: true });
        }
    };

    const removeAddon = (idToRemove: string) => {
        const newAddonGroups = form
            ?.getValues("addonGroups")
            ?.filter((id) => id !== idToRemove);
        form.setValue("addonGroups", newAddonGroups, { shouldDirty: true });
    };

    // Validation failed: jump to the first broken tab and say which field it is
    const onInvalid = (errs: Record<string, any>) => {
        console.log("Product form errors:", errs);

        const firstKey = Object.keys(errs).find((k) => hasErrorMessage(errs[k]));
        if (!firstKey) {
            toast.error("Please check the form");
            return;
        }

        const tabName = fieldToTabName(firstKey);
        const tabIndex = tabName ? tabs.findIndex((tb) => tb.name === tabName) : -1;
        if (tabIndex >= 0) setActiveTab(tabIndex);

        toast.error(`${firstKey}: ${getFirstErrorMessage(errs[firstKey]) ?? "invalid value"}`);
    };

    const submitUpdate = async (data: FormData) => {
        const toastId = toast.loading("Updating product...");

        const productData: Record<string, any> = {};

        // Helper to check if a value really changed
        const hasChanged = (current: any, original: any) => {
            if (Array.isArray(current) || Array.isArray(original)) {
                return JSON.stringify(current || []) !== JSON.stringify(original || []);
            }
            return current !== original;
        };

        // name & description (with translation)
        const originalName = prevData?.name?.[lang] || "";
        const originalDescription = prevData?.description?.[lang] || "";

        if (hasChanged(data.name?.[lang], originalName) || hasChanged(data.description?.[lang], originalDescription)) {
            const translated = await translateObject(
                { name: data.name, description: data.description },
                lang
            );

            if (!translated) {
                toast.error("Translation failed!", { id: toastId });
                return;
            }

            if (hasChanged(data.name?.[lang], originalName)) {
                productData.name = translated.name;
            }
            if (hasChanged(data.description?.[lang], originalDescription)) {
                productData.description = translated.description;
            }
        }

        // category + additionalCategories
        const originalCategoryId = prevData?.category?._id || "";
        const originalAdditional: string[] = Array.isArray(prevData?.additionalCategories)
            ? prevData.additionalCategories
                .map((c: any) => (typeof c === "string" ? c : c?._id))
                .filter(Boolean)
            : [];

        const currentCategoryId = data.category || "";
        const currentAdditional: string[] = Array.isArray(data.additionalCategories)
            ? data.additionalCategories.filter((category): category is string => Boolean(category))
            : [];

        const categoryChanged = hasChanged(currentCategoryId, originalCategoryId);
        const additionalChanged = hasChanged(currentAdditional, originalAdditional);

        if (categoryChanged || additionalChanged) {
            if (categoryChanged) {
                productData.category = currentCategoryId;
            }
            productData.additionalCategories = currentAdditional;
        }

        // addonGroups
        if (hasChanged(data.addonGroups, prevData?.addonGroups || [])) {
            productData.addonGroups = data.addonGroups;
        }

        // image (single string)
        const originalImage =
            (typeof prevData?.image === "string" && prevData.image.trim()) ||
            (Array.isArray(prevData?.images) && prevData.images[0]?.trim()) ||
            "";

        let currentImage = typeof data.image === "string" && data.image.trim() ? data.image.trim() : "";

        // No image left → upload default
        if (!currentImage) {
            try {
                const imagePath = "/defaults/dl1.png";
                const response = await fetch(imagePath, { cache: "no-store" });
                const blob = await response.blob();

                if (blob.size === 0) {
                    throw new Error(
                        `Default image fetched with 0 bytes — check the asset path: ${imagePath}`
                    );
                }

                const file = new window.File(
                    [blob],
                    imagePath.split("/").pop() ?? "default.png",
                    { type: blob.type || "image/png" }
                );

                const uploadResult = await uploadImagesReq([file]);

                if (!uploadResult?.success || !uploadResult?.data?.length) {
                    toast.error(
                        uploadResult?.message || "Default image upload failed!",
                        { id: toastId }
                    );
                    return;
                }

                currentImage = uploadResult.data[0];
            } catch (err) {
                console.error("Default image error:", err);
                toast.error("Failed to load default product image", { id: toastId });
                return;
            }
        }

        // Only send when the URL actually changed (replace or default fill)
        if (currentImage !== originalImage) {
            productData.image = currentImage;
        }

        // pricing update
        const originalPricing = prevData?.pricing || {};
        const originalDiscountType = originalPricing.discountType ?? "PERCENTAGE";
        const pricingChanged =
            hasChanged(data.discount, originalPricing.discount ?? 0) ||
            hasChanged(data.discountType, originalDiscountType) ||
            hasChanged(data.taxId, String(originalPricing.taxId || ""));

        if (pricingChanged) {
            productData.pricing = {};
            if (hasChanged(data.discount, originalPricing.discount ?? 0)) {
                productData.pricing.discount = data.discount;
            }
            if (hasChanged(data.discountType, originalDiscountType)) {
                productData.pricing.discountType = data.discountType;
            }
            if (hasChanged(data.taxId, String(originalPricing.taxId || ""))) {
                productData.pricing.taxId = data.taxId;
            }
        }

        // sdr update (send both fields when both changed)
        const originalSdr = prevData?.sdr;
        const sdrApplicableChanged = hasChanged(data.sdrApplicable, originalSdr?.applicable ?? false);
        const sdrContainerCountChanged = hasChanged(data.sdrContainerCount, originalSdr?.containerCount ?? 1);

        if (sdrApplicableChanged || sdrContainerCountChanged) {
            productData.sdr = {
                ...(sdrApplicableChanged && { applicable: data.sdrApplicable }),
                ...(sdrContainerCountChanged && { containerCount: data.sdrContainerCount }),
            };
        }

        // meta update
        const originalMeta = prevData?.meta || {};
        const originalStatus = originalMeta.status === "ACTIVE";
        const metaChanged =
            hasChanged(data.isFeatured, originalMeta.isFeatured || false) ||
            hasChanged(data.isAvailableForPreOrder, originalMeta.isAvailableForPreOrder || false) ||
            hasChanged(data.isActive, originalStatus);

        if (metaChanged) {
            productData.meta = {};
            if (hasChanged(data.isFeatured, originalMeta.isFeatured || false)) {
                productData.meta.isFeatured = data.isFeatured;
            }
            if (hasChanged(data.isAvailableForPreOrder, originalMeta.isAvailableForPreOrder || false)) {
                productData.meta.isAvailableForPreOrder = data.isAvailableForPreOrder;
            }
            if (hasChanged(data.isActive, originalStatus)) {
                productData.meta.status = data.isActive === true ? "ACTIVE" : "INACTIVE";
            }
        }

        // stock
        if (businessTypeSlug !== "restaurant") {
            const originalUnit = prevData?.stock?.unit || "";
            if (hasChanged(data.unit, originalUnit)) {
                productData.stock = { unit: data.unit };
            }
        }

        // price check
        const priceChanged = hasChanged(data.price, prevData?.pricing?.price || 0);

        const hasAnyChange = Object.keys(productData).length > 0 || priceChanged;

        if (!hasAnyChange) {
            toast.info("No changes detected", { id: toastId });
            setActiveTab(0);
            closeModal();
            return;
        }

        const result = await updateProduct(prevData?.productId, productData);

        if (!result.success) {
            toast.error(result.message || "Product update failed", { id: toastId });
            return;
        }

        if (
            (result?.data?.variations?.length === 0 || !result?.data?.variations) &&
            priceChanged
        ) {
            const pricingResult = await updateProductPriceStock(prevData?.productId, data?.price as number);

            if (!pricingResult.success) {
                toast.error(pricingResult.message || "Product saved, but the price update failed", {
                    id: toastId,
                });
                router.refresh();
                return;
            }
        }

        toast.success("Product updated successfully!", { id: toastId });
        setActiveTab(0);
        onSuccess(result?.data);
        router.refresh();
        closeModal();
    };

    // isSubmitting is always released, whatever path submitUpdate takes
    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await submitUpdate(data);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAddonsGroups = async () => {
        const result = await catchAsync(async () => {
            return await getAllAddOnsGroup();
        });

        if (result.success) {
            setAddonsGroupsData({
                data: result.data,
                meta: result.meta,
            });
        }
    };

    const getProductCategories = async () => {
        setCategoriesLoading(true);
        const query = queryStringFormatter({
            vendorId: vendorMongoId,
            limit: "30",
        });
        try {
            const result = await catchAsync<TProductCategory[]>(async () => {
                return (await getAllProductCategories(query)) as unknown as TResponse<TProductCategory[]>;
            });

            if (result.success) {
                setProductCategoriesData(result.data ?? []);
            }
        } finally {
            setCategoriesLoading(false);
        }
    };

    const getTaxes = async () => {
        const result = await catchAsync(async () => {
            return await getAllTaxes();
        });

        if (result.success) {
            setTaxesData(result.data);
        }
    };

    useEffect(() => {
        (() => getAddonsGroups())();
        (() => getProductCategories())();
        (() => getTaxes())();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white overflow-hidden"
            >
                <TitleHeader
                    title={`${t("update_item")}${watchName && ` - ${watchName}`}`}
                    subtitle={t("update_product_details")}
                    extraComponent={
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            onClick={() => form.handleSubmit(onSubmit, onInvalid)()}
                            className="px-6 py-2 bg-[#DC3173] hover:bg-[#B02458] text-white rounded-lg flex items-center space-x-2 shadow-lg shadow-pink-200/50 disabled:opacity-60"
                        >
                            <SaveIcon className="h-5 w-5" />
                            <span>{t("save_product")}</span>
                        </motion.button>
                    }
                />
                <div className="flex flex-col md:flex-row">
                    {/* Tabs */}
                    <div className="md:w-52 lg:w-64 bg-gray-50 p-4">
                        <div className="space-y-1">
                            {tabs.map((tab, index) => (
                                <motion.button
                                    key={tab.name}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
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
                                    {tab.icon}
                                    <span>{tab.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    {/* Form */}
                    <div className="flex-1 p-6">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                                className="space-y-8"
                            >
                                {/* Basic Info Tab */}
                                {activeTab === 0 && (
                                    <BasicInfoForm
                                        form={form as any}
                                        productCategories={productCategoriesData}
                                        selectedLanguage={lang}
                                        categoryLoading={categoriesLoading}
                                    />
                                )}
                                {/* Images Tab */}
                                {activeTab === 1 && (
                                    <ImageAndDescriptionForm
                                        form={form}
                                        selectedLanguage={lang}
                                        productId={prevData?.productId}
                                    />
                                )}
                                {/* Add-Ons & Variants Tab */}
                                {activeTab === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {t("add_ons_and_variants")}
                                        </h2>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("add_ons")}
                                            </label>
                                            {watchAddons?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-1">
                                                    {watchAddons?.map((id) => (
                                                        <motion.div
                                                            key={id}
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="flex items-center bg-[#DC3173] bg-opacity-10 text-white px-3 py-1 rounded-full"
                                                        >
                                                            <span>
                                                                {
                                                                    addonGroupsData?.data?.find(
                                                                        (group) => group._id === id,
                                                                    )?.title?.[lang]
                                                                }
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAddon(id)}
                                                                className="ml-2 text-white hover:text-[#CCC]"
                                                            >
                                                                <XIcon className="h-4 w-4" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                            <FormField
                                                control={form.control}
                                                name="addonGroups"
                                                render={({ fieldState }) => (
                                                    <FormItem className="gap-1">
                                                        <FormControl>
                                                            <Select onValueChange={(val) => addAddon(val)}>
                                                                <SelectTrigger
                                                                    className={cn(
                                                                        "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-0! foce focus:border-[#DC3173]! outline-none inset-0 h-10!",
                                                                        fieldState.invalid
                                                                            ? "border-destructive"
                                                                            : "border-gray-300",
                                                                    )}
                                                                >
                                                                    <SelectValue placeholder={t("choose_add_on")} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {addonGroupsData?.data?.map((group) => (
                                                                        <SelectItem
                                                                            key={group._id}
                                                                            value={group._id}
                                                                        >
                                                                            {group.title?.[lang]}
                                                                        </SelectItem>
                                                                    ))}
                                                                    {addonGroupsData?.data?.length === 0 && (
                                                                        <p className='italic text-sm text-gray-500 text-center'>{t("no_add_ons_found")}</p>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2 ">
                                            <label className="block mb-1">{t("variations")}</label>
                                            <div>
                                                {watchVariations?.length > 0 ? (
                                                    watchVariations?.map((variation, i) => (
                                                        <div
                                                            key={i}
                                                            className="relative p-4 border rounded-md bg-gray-50 mb-4"
                                                        >
                                                            <div>
                                                                {t("name")}: {variation.name?.[lang]}
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 items-center">
                                                                {t("options")}:{" "}
                                                                {variation.options?.map((option, i2) => (
                                                                    <div
                                                                        key={i2}
                                                                        className="flex items-center bg-[#DC3173] bg-opacity-10 text-white px-3 py-1 rounded-full"
                                                                    >
                                                                        <span>{option.label?.[lang]}</span>
                                                                        <span className="ml-2">
                                                                            (€{option.price})
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500">
                                                        No variations added
                                                    </p>
                                                )}
                                            </div>
                                            {(prevData?.variations || prevData?.variations?.length !== 0) && <div className="flex items-start gap-3 p-4 rounded-xl border border-[#DC3173] bg-[#DC3173]/20">
                                                <div className="shrink-0 mt-0.5">
                                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#DC3173] text-white text-xs font-bold select-none">
                                                        !
                                                    </span>
                                                </div>

                                                <p className="text-[#DC3173] text-sm font-medium italic leading-relaxed">
                                                    For updating variation prices,Please visit Variation Management page
                                                </p>
                                            </div>}
                                        </div>
                                    </motion.div>
                                )}
                                {/* Pricing Tab */}
                                {activeTab === 3 && (
                                    <PricingForm
                                        form={form}
                                        taxesData={taxesData}
                                        watchDiscount={watchDiscount}
                                        watchPrice={watchPrice}
                                        watchVariations={watchVariations}
                                        watchTaxId={watchTaxId}
                                        watchDiscountType={watchDiscountType}
                                    />
                                )}
                                {/* Stock Tab */}
                                {businessTypeSlug !== "restaurant" && activeTab === 4 && (
                                    <StockInformationForm
                                        form={form}
                                        watchVariations={watchVariations}
                                    />
                                )}
                                {/* DeliGo Metadata Tab */}
                                {activeTab === lastTabIndex && (
                                    <DeligoMetadata
                                        form={form}
                                    />
                                )}
                                <div className="flex justify-between pt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => activeTab > 0 && setActiveTab(activeTab - 1)}
                                        disabled={activeTab === 0}
                                        className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 0
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                            }`}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        <span>{t("previous")}</span>
                                    </motion.button>
                                    {activeTab < lastTabIndex && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={() =>
                                                activeTab < lastTabIndex && setActiveTab(activeTab + 1)
                                            }
                                            className="px-6 py-2 bg-[#DC3173] hover:bg-[#B02458] text-white rounded-lg flex items-center space-x-2"
                                        >
                                            <span>{t("next")}</span>
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </motion.button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}