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
import { updateOfferReq } from "@/services/dashboard/offers/offers";
import { TOffer } from "@/types/offer.type";
import { offerValidation } from "@/validations/offer/offer.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const router = useRouter();
  const form = useForm<TOfferForm>({
    resolver: zodResolver(offerValidation),
    defaultValues: {
      title: prevValues.title || "",
      description: prevValues.description || "",
      offerType:
        (prevValues.offerType as "PERCENT" | "FLAT" | "FREE_DELIVERY") ||
        "PERCENT",
      discountValue: prevValues.discountValue || 0,
      maxDiscountAmount: prevValues.maxDiscountAmount || 0,
      validFrom: new Date(prevValues.validFrom) || new Date(),
      expiresAt: new Date(prevValues.expiresAt) || new Date(),
      minOrderAmount: prevValues.minOrderAmount || 0,
      code: prevValues.code || "",
      isAutoApply: prevValues.isAutoApply || false,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const watchOfferType = useWatch({
    control: form.control,
    name: "offerType",
  });

  const onSubmit = async (data: TOfferForm) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating offer...");

    const offerData: Partial<TOffer> = {
      ...data,
      isAutoApply: false,
    };

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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-2xl font-medium">Edit Offer</DialogTitle>

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
                name="title"
                render={({ field }) => (
                  <FormItem>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
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
                            <SelectItem value="BOGO">
                              {t("buy_1_get_1")}
                            </SelectItem>
                            <SelectItem value="FREE_DELIVERY">
                              Free Delivery
                            </SelectItem>
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
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
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
              )}

              {watchOfferType === "FLAT" && (
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
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
                            value={format(field.value, "yyyy-MM-dd")}
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
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
                            value={format(field.value, "yyyy-MM-dd")}
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
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
            </div>

            {/* PROMO CODE */}
            <div className="space-y-4">
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
              "Update"
            )}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
