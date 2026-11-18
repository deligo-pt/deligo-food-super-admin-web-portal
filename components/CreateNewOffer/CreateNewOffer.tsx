/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { normalizeList, usePaginatedList } from "@/hooks/use-paginated-list";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { createOfferReq } from "@/services/dashboard/offer/offer.service";
import { getAllProducts } from "@/services/dashboard/product/product.service";
import { useStore } from "@/store/store";
import { TMeta } from "@/types";
import { TProductCategoryResponse } from "@/types/category.type";
import { TOffer } from "@/types/offer.type";
import { TProduct } from "@/types/product.type";
import { queryStringFormatter } from "@/utils/formatter";
import { translateObject } from "@/utils/translation/translationObject";
import { offerValidation } from "@/validations/offer/offer.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Accessibility } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import FirstOrderOfferCard, {
  Toggle,
} from "../Dashboard/Vendors/VendorDetails/Products/FirstOrderOfferCard";
import { ProductSelector } from "../Dashboard/Vendors/VendorDetails/Products/ProductSelector";
import { Label } from "../ui/label";

const PRIMARY = "#DC3173";
const PRODUCT_LIMIT = 30;
const CATEGORY_LIMIT = 50;

type TOfferForm = z.infer<typeof offerValidation>;

interface IProps {
  itemsResult: { data: TProduct[]; meta?: TMeta };
  productCategories: { data: TProductCategoryResponse[]; meta?: TMeta };
}

export default function CreateNewOffer({
  itemsResult,
  productCategories,
}: IProps) {
  const { lang } = useStore();
  const { t } = useTranslation();
  const router = useRouter();
  // console.log("items res", itemsResult);
  // console.log("cate res", productCategories);

  const initialProducts = normalizeList<TProduct>(itemsResult);
  const initialCategories = normalizeList<TProductCategoryResponse>(productCategories);


  /* Products: first page comes from the server, the rest load in the background
     and as the selector scrolls (same hook the vendor form uses). */
  const { items: products, hasMore: productsHasMore, loading: productsLoading, loadMore: loadMoreProducts } =
    usePaginatedList<TProduct>({
      initialItems: initialProducts.data,
      initialMeta: initialProducts.meta,
      limit: PRODUCT_LIMIT,
      cacheKey: "offer-products:platform",
      autoLoadAll: true,
      autoLoadDelay: 150,
      fetchPage: async (page) =>
        normalizeList<TProduct>(
          await getAllProducts(
            queryStringFormatter({
              limit: String(PRODUCT_LIMIT),
              page: String(page),
              isDeleted: false,
              "meta.status": "ACTIVE",
            }),
          ),
        ),
    });

  const { items: categories, hasMore: categoriesHasMore, loading: categoriesLoading, loadMore: loadMoreCategories } =
    usePaginatedList<TProductCategoryResponse>({
      initialItems: initialCategories.data,
      initialMeta: initialCategories.meta,
      limit: CATEGORY_LIMIT,
      cacheKey: "offer-categories:platform",
      autoLoadAll: true,
      fetchPage: async (page) =>
        normalizeList<TProductCategoryResponse>(
          await getAllProductCategories(
            queryStringFormatter({
              limit: String(CATEGORY_LIMIT),
              page: String(page),
              isDeleted: false,
              isActive: true,
            }),
          ),
        ),
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

  const form = useForm<TOfferForm>({
    resolver: zodResolver(offerValidation),
    defaultValues: {
      title: {
        en: "",
        pt: ""
      },
      description: {
        en: "",
        pt: ""
      },
      offerType: "PERCENT",
      discountValue: 0,
      maxDiscountAmount: 0,
      validFrom: new Date(),
      expiresAt: new Date(),
      minOrderAmount: 0,
      code: "",
      isAutoApply: false,
      maxUsageCount: "",
      userUsageLimit: "",
      scopeType: "ALL_PRODUCTS",
      scopeProducts: [],
      isActive: true,
      isFirstOrder: false,
      firstOrderRequireVerifiedPhone: true,
      firstOrderMaxRestores: 2,

      currentLang: lang
    },
  });
  const { formState: { isSubmitting } } = form;

  const [watchOfferType, isAutoApply, watchScopeType, watchScopeProducts] =
    useWatch({
      control: form.control,
      name: ["offerType", "isAutoApply", "scopeType", "scopeProducts"],
    });

  /* selection helpers */
  const toggleProduct = (id: string) => {
    const current = form.getValues("scopeProducts") || [];
    form.setValue(
      "scopeProducts",
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      { shouldValidate: true },
    );
  };

  // Note: only affects products that are already loaded
  const toggleCategoryProducts = (categoryId: string, selectAll: boolean) => {
    const idsInCat = products
      .filter(
        (p) => ((p as any).category?._id || "uncategorized") === categoryId,
      )
      .map((p) => p._id as string);

    const current = form.getValues("scopeProducts") || [];
    form.setValue(
      "scopeProducts",
      selectAll
        ? Array.from(new Set([...current, ...idsInCat]))
        : current.filter((id) => !idsInCat.includes(id)),
      { shouldValidate: true },
    );
  };

  const onSubmit = async (data: TOfferForm) => {
    const toastId = toast.loading("Creating offer...");
    let isAutoApply = data.isAutoApply;
    if (data.offerType === "FLAT") {
      delete data.maxDiscountAmount;
    } else if (isAutoApply) {
      delete data.code;
    } else {
      isAutoApply = data.isAutoApply;
    }

    try {
      // Only the text fields need translating (not product ids etc.)
      const translated = await translateObject(
        { title: data.title, description: data.description },
        lang,
      );

      if (!translated) {
        toast.error("Translation failed!", { id: toastId });
        return;
      }

      const {
        maxUsageCount,
        userUsageLimit,
        currentLang,
        isFirstOrder,
        firstOrderRequireVerifiedPhone,
        firstOrderMaxRestores,
        scopeType,
        scopeProducts,
        ...restData
      } = data;

      const specificProducts =
        scopeType === "SPECIFIC_PRODUCTS" && !!scopeProducts?.length;

      const payload = {
        ...restData,
        title: translated.title,
        description: translated.description,
        isActive: data.isActive ?? true,
        scopeType: specificProducts ? "SPECIFIC_PRODUCTS" : "ALL_PRODUCTS",
        ...(specificProducts && { scopeProducts }),
        ...(data.discountValue && { discountValue: data.discountValue }),
        ...(data.maxDiscountAmount && { maxDiscountAmount: data.maxDiscountAmount }),
        ...(data.code && { code: data.code }),
        ...(isAutoApply && { isAutoApply: isAutoApply }),
        ...(maxUsageCount && {
          maxUsageCount: Number(maxUsageCount),
        }),
        ...(userUsageLimit && {
          userUsageLimit: Number(userUsageLimit),
        }),
        ...(isFirstOrder && {
          eligibility: {
            type: "FIRST_ORDER",
            scope: "GLOBAL",
            requireVerifiedPhone: firstOrderRequireVerifiedPhone ?? true,
            maxRestores: firstOrderMaxRestores ?? 2,
          },
        }),
      } as Partial<TOffer>;

      if (data.maxUsageCount === "") {
        delete payload.maxUsageCount;
      }

      if (data.userUsageLimit === "") {
        delete payload.userUsageLimit;
      }
      console.log("payload", payload);
      const result = await createOfferReq(payload);

      if (result.success) {
        toast.success(result.message || "Offer created successfully!", {
          id: toastId,
        });
        form.reset();
        router.push('/admin/all-offers');
        return;
      }

      // Check the known error key first, before the generic errorSources list
      const errorKey =
        (result as any)?.errorKey ??
        (result as any)?.data?.errorKey ??
        (result as any)?.data?.errorSources?.[0]?.errorKey;
      if (errorKey === "ACTIVE_FIRST_ORDER_OFFER_EXISTS") {
        toast.error(
          "A global first-order offer is already active. Deactivate it first, then try again.",
          { id: toastId },
        );
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
      console.log(result);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Offer creation failed",
        { id: toastId }
      );
    }

  };

  return (
    <div className="min-h-screen space-y-5">
      <TitleHeader
        title={t("create_new_offer")}
        subtitle={t("add_promotion_boost_restuarant_sales")}
      />

      <Card className="rounded-3xl bg-white border shadow-lg">
        <CardContent className="p-0">
          {/* OFFER DETAILS */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 space-y-8"
            >
              <div className="space-y-4">
                <h2 className="font-bold text-lg">{t("offer_details")}</h2>
                <Separator />

                {lang === "en" && <FormField
                  control={form.control}
                  name="title.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-sm text-gray-700">
                        {t("offer_title_eg")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("offer_title_eg")}
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}

                {lang === "pt" && <FormField
                  control={form.control}
                  name="title.pt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-sm text-gray-700">
                        {t("offer_title_eg")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("offer_title_eg")}
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}

                {lang === 'en' && <FormField
                  control={form.control}
                  name="description.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-sm text-gray-700">
                        {t("offer_description")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("offer_description")}
                          className="text-base"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}

                {lang === 'pt' && <FormField
                  control={form.control}
                  name="description.pt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-sm text-gray-700">
                        {t("offer_description")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("offer_description")}
                          className="text-base"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}

                <FormField
                  control={form.control}
                  name="offerType"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2">
                          <FormLabel className="font-medium text-sm text-gray-700">
                            {t("offer_type")}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger
                              className={cn(
                                "w-full h-12",
                                fieldState.invalid
                                  ? "border-destructive"
                                  : "",
                              )}
                            >
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PERCENT">
                                {t("percentage_discount")}
                              </SelectItem>
                              <SelectItem value="FLAT">
                                {t("flat_amount_off")}
                              </SelectItem>
                              {/* <SelectItem value="FREE_DELIVERY">
                                  {t("free_delivery")}
                                </SelectItem> */}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FirstOrderOfferCard scope="GLOBAL" />

                {/* CONDITIONAL INPUTS */}
                {watchOfferType === "PERCENT" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-sm text-gray-700">
                            {t("discount_eg_20")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("discount_eg_20")}
                              type="number"
                              min={0}
                              className="h-12 text-base"
                              {...field}
                              value={String(field.value)}
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
                      name="maxDiscountAmount"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="font-medium text-sm text-gray-700">
                            {t("max_discount_amount")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("max_discount_amount")}
                              type="number"
                              min={0}
                              max={1000}
                              className="h-12 text-base w-full"
                              {...field}
                              value={String(field.value)}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {watchOfferType === "FLAT" && (
                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-sm text-gray-700">
                          {t("flat_discount")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("flat_discount")}
                            type="number"
                            min={0}
                            max={100}
                            className="h-12 text-base"
                            {...field}
                            value={String(field.value)}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* VALIDITY */}
              <div className="space-y-4">
                <h2 className="font-bold text-lg">{t("validity")}</h2>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-2">
                            <FormLabel className="font-medium text-sm text-gray-700">
                              {t("start_date")}
                            </FormLabel>
                            <Input
                              type="date"
                              className="h-12"
                              min={format(new Date(), "yyyy-MM-dd")}
                              value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                              onChange={(e) =>
                                field.onChange(e.target.value ? new Date(e.target.value) : null)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-2">
                            <FormLabel className="font-medium text-sm text-gray-700">
                              {t("end_date")}
                            </FormLabel>
                            <Input
                              type="date"
                              className="h-12"
                              min={format(new Date(), "yyyy-MM-dd")}
                              value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                              onChange={(e) =>
                                field.onChange(e.target.value ? new Date(e.target.value) : null)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="minOrderAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2">
                          <FormLabel className="font-medium text-sm text-gray-700">
                            {t("minimum_order_amount")} (€)
                          </FormLabel>
                          <Input
                            type="number"
                            min={0}
                            className="h-12 text-base"
                            {...field}
                            value={String(field.value)}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxUsageCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-2">
                            <FormLabel className="font-medium text-sm text-gray-700">
                              {t("maximum_usage_count")}
                            </FormLabel>
                            <Input
                              placeholder="Maximum usage count"
                              type="number"
                              min={0}
                              className="h-12 text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userUsageLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-2">
                            <FormLabel className="font-medium text-sm text-gray-700">
                              {t("users_usage_limit")}
                            </FormLabel>
                            <Input
                              placeholder="Users usage limit"
                              type="number"
                              min={0}
                              className="h-12 text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isAutoApply"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FormLabel className="flex space-y-2 gap-2 items-center">
                          <Input
                            type="checkbox"
                            placeholder={t("offer_description")}
                            className="w-4 h-4 mb-0"
                            {...field}
                            checked={field.value ? true : false}
                            value={"true"}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                          <span
                            onClick={() => field.onChange(!field.value)}
                            className="font-medium text-sm text-gray-700"
                          >
                            {t("will_auto_apply")}
                          </span>
                        </FormLabel>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ACTIVE STATUS */}
              <div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <div className="flex items-start gap-4 bg-[#DC3173]/20 p-4 rounded-md">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-[#DC3173]">
                          <Accessibility size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900">Active Status</p>
                          <p className="">Offer activation status will be by default true.</p>
                        </div>
                        <FormControl>
                          <Toggle
                            checked={!!field.value}
                            onChange={field.onChange}
                            label="Active status"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* PROMO CODE */}
              {!isAutoApply && <div className="space-y-4">
                <h2 className="font-bold text-lg">{t("promo_code")}</h2>
                <Separator />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("enter_promo_code")}
                          className="h-12 text-base uppercase"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>}

              {/* APPLICABLE PRODUCTS */}
              <div className="space-y-4">
                <h2 className="font-bold text-lg">{t("applicable_products")}</h2>
                <Separator />

                <div className="flex flex-wrap gap-6">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <Input
                      type="radio"
                      name="scopeType"
                      className="w-4 h-4 accent-[#DC3173]"
                      checked={watchScopeType !== "SPECIFIC_PRODUCTS"}
                      onChange={() => {
                        form.setValue("scopeType", "ALL_PRODUCTS");
                        form.setValue("scopeProducts", [], {
                          shouldValidate: true,
                        });
                      }}
                    />
                    <span className="text-sm">{t("all_products")}</span>
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <Input
                      type="radio"
                      name="scopeType"
                      className="w-4 h-4 accent-[#DC3173]"
                      checked={watchScopeType === "SPECIFIC_PRODUCTS"}
                      onChange={() =>
                        form.setValue("scopeType", "SPECIFIC_PRODUCTS")
                      }
                    />
                    <span className="text-sm">{t("selected_products")}</span>
                  </Label>
                </div>

                {watchScopeType === "SPECIFIC_PRODUCTS" && (
                  <FormField
                    control={form.control}
                    name="scopeProducts"
                    render={() => (
                      <FormItem className="space-y-2 pt-1">
                        <ProductSelector
                          {...selectorProps}
                          selectionMode="multi"
                          selectedIds={watchScopeProducts || []}
                          onToggle={toggleProduct}
                          onToggleCategory={toggleCategoryProducts}
                          height="h-72"
                        />
                        {(watchScopeProducts?.length ?? 0) > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {watchScopeProducts!.length} product
                            {watchScopeProducts!.length === 1 ? "" : "s"}{" "}
                            selected
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* ACTION */}
              <div className="pt-4 flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-6 text-base"
                  onClick={() => router.back()}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="h-12 px-6 text-base text-white"
                  style={{ background: PRIMARY }}
                  disabled={isSubmitting}
                >
                  {t("create_offer")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}