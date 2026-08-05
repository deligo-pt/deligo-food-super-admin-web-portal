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
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { createOfferReq } from "@/services/dashboard/offer/offer.service";
import { useStore } from "@/store/store";
import { TOffer } from "@/types/offer.type";
import { TProduct } from "@/types/product.type";
import { translateObject } from "@/utils/translation/translationObject";
import { offerValidation } from "@/validations/offer/offer.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Label } from "../ui/label";
import { XIcon } from "lucide-react";

const PRIMARY = "#DC3173";
const BG = "#FFF1F7";

type TOfferForm = z.infer<typeof offerValidation>;

export default function CreateNewOffer({ products }: { products: TProduct[] }) {
  const { lang } = useStore();
  const { t } = useTranslation();
  const router = useRouter();
  const [isSelectedAllProducts, setIsSelectedAllProducts] = useState(true);
  const [filteredItems, setFilteredItems] = useState<TProduct[]>(
    products || [],
  );

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
      applicableProducts: [],
      currentLang: lang
    },
  });
  const { formState: { isSubmitting } } = form;

  const [watchOfferType, isAutoApply, watchApplicableProducts] = useWatch({
    control: form.control,
    name: ["offerType", "isAutoApply", "applicableProducts"],
  });

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
      const translated = await translateObject(data, lang);

      const { maxUsageCount, userUsageLimit, currentLang, ...restData } = data;

      const payload = {
        ...restData,
        title: translated.title,
        description: translated.description,
        applicableProducts: data.applicableProducts,
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
      } as Partial<TOffer>;

      if (isSelectedAllProducts) {
        delete payload.applicableProducts;
      }

      if (data.maxUsageCount === "") {
        delete payload.maxUsageCount;
      }

      if (data.userUsageLimit === "") {
        delete payload.userUsageLimit;
      }

      const result = await createOfferReq(payload);

      if (result.success) {
        toast.success(result.message || "Offer created successfully!", {
          id: toastId,
        });
        form.reset();
        router.push('/admin/all-offers');
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
    <div className="min-h-screen p-6 md:p-10" style={{ background: BG }}>
      <div className="max-w-225 mx-auto space-y-10">
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

                  <div className="flex items-center w-full gap-4">
                    <Label className="font-medium text-sm text-gray-700">
                      <Input
                        className="w-4 h-4"
                        name="products"
                        type="radio"
                        checked={isSelectedAllProducts}
                        onChange={() => {
                          setIsSelectedAllProducts(true);
                        }}
                      />
                      <span>{t("all_products")}</span>
                    </Label>
                    <Label className="font-medium text-sm text-gray-700">
                      <Input
                        className="w-4 h-4"
                        name="products"
                        type="radio"
                        checked={!isSelectedAllProducts}
                        onChange={() => {
                          setIsSelectedAllProducts(false);
                        }}
                      />
                      <span>{t("selected_products")}</span>
                    </Label>
                  </div>

                  {!isSelectedAllProducts &&
                    watchApplicableProducts &&
                    watchApplicableProducts?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1">
                        {watchApplicableProducts?.map((itemId) => (
                          <div
                            key={itemId}
                            className="flex items-center bg-[#DC3173] bg-opacity-10 text-white px-3 py-1 rounded-full"
                          >
                            <span>
                              {products?.find((i) => i._id === itemId)
                                ?.name?.[lang] || "-"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setFilteredItems((prev) => {
                                  const removedItem = products?.find(
                                    (i) => i._id === itemId,
                                  );
                                  if (removedItem) {
                                    return [...prev, removedItem];
                                  }
                                  return prev;
                                });
                                form.setValue(
                                  "applicableProducts",
                                  watchApplicableProducts.filter(
                                    (i) => i !== itemId,
                                  ),
                                );
                              }}
                              className="ml-2 text-white hover:text-[#CCC]"
                            >
                              <XIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  {!isSelectedAllProducts && (
                    <FormField
                      control={form.control}
                      name="applicableProducts"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-2">
                              <Select
                                onValueChange={(value) => {
                                  const newValue = [
                                    ...(field.value || []),
                                    value,
                                  ];
                                  field.onChange(newValue);
                                  setFilteredItems((prev) =>
                                    prev.filter((item) => item._id !== value),
                                  );
                                }}
                                value="select_products"
                              >
                                <SelectTrigger className="w-full h-12!">
                                  <SelectValue placeholder={t("select_products")} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="select_products">
                                    {t("select_products")}
                                  </SelectItem>
                                  {filteredItems?.map((item: TProduct) => (
                                    <SelectItem
                                      key={item._id}
                                      value={item._id as string}
                                    >
                                      {item.name?.[lang]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* ACTION */}
                <div className="pt-4 flex justify-end gap-4">
                  <Button variant="outline" className="h-12 px-6 text-base">
                    {t("cancel")}
                  </Button>
                  <Button
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
    </div>
  );
}
