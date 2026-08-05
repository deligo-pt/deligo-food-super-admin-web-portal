/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
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
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { updateOfferReq } from "@/services/dashboard/offer/offer.service";
import { getAllProductsReq } from "@/services/dashboard/product/product.service";
import { useStore } from "@/store/store";
import { TMeta } from "@/types";
import { TOffer } from "@/types/offer.type";
import { TProduct } from "@/types/product.type";
import { translateObject } from "@/utils/translation/translationObject";
import { offerValidation } from "@/validations/offer/offer.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TOfferForm = z.infer<typeof offerValidation>;

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevValues: TOffer;
}

export default function EditOfferModal({
  open,
  onOpenChange,
  prevValues,
}: IProps) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const router = useRouter();
  const form = useForm<TOfferForm>({
    resolver: zodResolver(offerValidation),
    defaultValues: {
      title: {
        en: prevValues?.title?.en || "",
        pt: prevValues?.title?.pt || "",
      },
      description: {
        en: prevValues?.description?.en || "",
        pt: prevValues?.description?.pt || "",
      },
      offerType:
        (prevValues.offerType as "PERCENT" | "FLAT") ||
        "PERCENT",
      discountValue: prevValues.discountValue || 0,
      maxDiscountAmount: prevValues.maxDiscountAmount || 0,
      validFrom: new Date(prevValues.validFrom) || new Date(),
      expiresAt: new Date(prevValues.expiresAt) || new Date(),
      minOrderAmount: prevValues.minOrderAmount || 0,
      code: prevValues.code || "",
      isAutoApply: prevValues.isAutoApply || false,
      maxUsageCount: prevValues?.maxUsageCount ? String(prevValues.maxUsageCount) : "",
      userUsageLimit: prevValues?.userUsageLimit ? String(prevValues.userUsageLimit) : "",
      applicableProducts: prevValues?.applicableProducts ? (prevValues?.applicableProducts as string[]) : [],
      currentLang: lang
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemsResult, setItemsResult] = useState<{
    data: TProduct[];
    meta?: TMeta;
  }>({ data: [] });
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSelectedAllProducts, setIsSelectedAllProducts] = useState(true);

  const [watchOfferType, isAutoApply, watchApplicableProducts] = useWatch({
    control: form.control,
    name: ["offerType", "isAutoApply", "applicableProducts"],
  });

  const onSubmit = async (data: TOfferForm) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating offer...");

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

      const offerData = {
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
        delete offerData.applicableProducts;
      }

      if (data.maxUsageCount === "") {
        delete offerData.maxUsageCount;
      }

      if (data.userUsageLimit === "") {
        delete offerData.userUsageLimit;
      }

      const result = await updateOfferReq(prevValues._id, offerData);

      if (result.success) {
        toast.success(result.message || "Offer updated successfully!", {
          id: toastId,
        });
        form.reset();
        onOpenChange(false);
        setIsSubmitting(false);
        router.refresh();
        return;
      }

      toast.error(result.message || "Offer update failed", { id: toastId });
      console.log(result);
      setIsSubmitting(false);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Offer creation failed",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItems = async ({ limit = "10" }: { limit?: string | number } = {}) => {
    try {
      setIsLoadingProducts(true);

      const result = await getAllProductsReq({ limit: String(limit) });

      if (result.success) {
        setItemsResult({
          data: result.data,
          meta: result.meta,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const applicableProducts = watchApplicableProducts || [];

  const filteredItems = useMemo(() => {
    return itemsResult.data.filter(
      (item) => !applicableProducts.includes(item._id as string)
    );
  }, [itemsResult.data, applicableProducts]);

  useEffect(() => {
    if (!isSelectedAllProducts) {
      const timeoutId = setTimeout(() => {
        getItems({ limit: 50 });
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [isSelectedAllProducts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-2xl font-medium">{t("edit_offer")}</DialogTitle>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="py-6 space-y-8"
            id="editOffer"
          >
            <div className="space-y-4">
              <h2 className="font-bold text-lg">{t("offer_details")}</h2>
              <Separator />

              <FormField
                control={form.control}
                name={`title.${lang}`}
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
              />

              <FormField
                control={form.control}
                name={`description.${lang}`}
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
              />

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
                              fieldState.invalid ? "border-destructive" : "",
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
                            {/* <SelectItem value="BOGO">
                              {t("buy_1_get_1")}
                            </SelectItem> */}
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
                          {itemsResult.data.find((i) => i._id === itemId)
                            ?.name?.[lang] || "-"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
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
                              const newValue = [...(field.value || []), value];
                              field.onChange(newValue);
                            }}
                            value="select_products"
                          >
                            <SelectTrigger className="w-full h-12!">
                              <SelectValue placeholder={t("select_products")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="select_products">
                                {isLoadingProducts ? "Loading..." : t("select_products")}
                              </SelectItem>

                              {!isLoadingProducts &&
                                filteredItems.map((item) => (
                                  <SelectItem key={item._id} value={item._id as string}>
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

          </form>
        </Form>

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            className={cn(
              "inline-flex items-center justify-center gap-2 text-white bg-[#DC3173]",
              isSubmitting ? "cursor-wait" : "hover:bg-[#DC3173]/90",
            )}
            form="editOffer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              t("update")
            )}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
