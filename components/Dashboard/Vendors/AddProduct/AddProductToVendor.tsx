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
    StarIcon,
    TagIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { translateObject } from "@/utils/translation/translationObject";
import { TProduct } from "@/types/product.type";
import { catchAsync } from "@/utils/catchAsync";
import { postData } from "@/utils/requests";
import { TResponse } from "@/types";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import BasicInfoForm from "./BasicInfoForm";
import PricingForm from "./PricingForm";
import AddOnsAndVariants from "./AddOns&Variants";
import ImageAndDescriptionForm from "./Image&DescriptionForm";
import StockInformationForm from "./StockInformationForm";
import DeligoMetadata from "./DeligoMetadata";
import { TVendor } from "@/types/user.type";

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
            images: [],
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
            isAvailableForPreOrder: false,
            isActive: false,
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
                case "images":
                    newErrors[t("images")] = true;
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
            }
        });

        return newErrors;
    }, [errors, tabs, t]);

    const [watchPrice, watchDiscount, watchDiscountType, watchTaxId, watchAddons, watchVariations] =
        useWatch({
            control: form.control,
            name: ["price", "discount", "discountType", "taxId", "addonGroups", "variations"],
        });

    const onSubmit = async (data: FormData) => {
        const toastId = toast.loading("Translating and Creating product...");

        const status = data.isActive === true ? "ACTIVE" : "INACTIVE";

        try {
            const translated = await translateObject(data, lang);

            if (!translated) {
                toast.error("Translation failed!", { id: toastId });
                return;
            }

            const productData = {
                name: translated.name,
                ...(data?.description?.[lang] && { description: translated.description }),
                category: data.category,
                ...(data.additionalCategories && { additionalCategories: data.additionalCategories }),
                images: data.images,
                pricing: {
                    price: data.price,
                    discountType: data.discountType,
                    discount: data.discount,
                    taxId: data.taxId,
                    currency: "€",
                },
                addonGroups: data.addonGroups,
                variations: translated.variations,
                meta: {
                    isFeatured: data.isFeatured,
                    isAvailableForPreOrder: data.isAvailableForPreOrder,
                    status,
                },
                ...(businessTypeSlug !== "restaurant"
                    ? {
                        stock: {
                            quantity: data.quantity,
                            unit: data.unit,
                            availabilityStatus: data.availabilityStatus,
                        },
                    }
                    : {}),
                userId: vendor?._id,
            };

            const result = await catchAsync<TProduct>(async () => {
                return (await postData(
                    "/products/admin/create-product",
                    productData,
                )) as unknown as TResponse<TProduct>;
            });

            if (result.success) {
                toast.success(result.message || "Product created successfully!", {
                    id: toastId,
                });
                form.reset();
                setActiveTab(0);
                router.push(`/admin/vendor/${vendor?.userId}/manage-products`)
                return;
            }

            if (result?.data?.errorSources) {
                result?.data?.errorSources?.map((err: { path: string, message: string }) => (
                    toast.error(err?.message, { id: toastId })
                ));
                return;
            } else {
                toast.error(result.message || "Product creation failed", {
                    id: toastId,
                });
            }

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong", {
                id: toastId,
            });
        }
    };

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
                    title={t("add_new_item")}
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
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                    <motion.button
                                        whileHover={{
                                            scale: 1.05,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                        }}
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => form.handleSubmit(onSubmit)()}
                                    >
                                        {/* <SaveIcon className="h-5 w-5" /> */}
                                        <span>{t("save_product")}</span>
                                    </motion.button>
                                </DropdownMenuItem>

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
                                <div className="flex justify-between pt-6">
                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                        }}
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
                                    {/* {activeTab === lastTabIndex && (
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-[#DC3173] hover:bg-[#B02458] text-white rounded-lg flex items-center space-x-2 shadow-lg shadow-pink-200/50"
                    >
                      <SaveIcon className="h-5 w-5" />
                      {
                        lang === "en" ? <span>Translate to PT and Save Product</span> :
                          <span>{t("translate_en")}</span>
                      }
                    </motion.button>
                  )} */}
                                    {activeTab < lastTabIndex && (
                                        <motion.button
                                            whileHover={{
                                                scale: 1.02,
                                            }}
                                            whileTap={{
                                                scale: 0.98,
                                            }}
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
