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
import { createOffer } from "@/services/dashboard/offers/offers";
import { TMeta } from "@/types";
import { TProduct } from "@/types/product.type";
import { offerValidation } from "@/validations/offer/offer.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const PRIMARY = "#DC3173";
const BG = "#FFF1F7";

type TOfferForm = z.infer<typeof offerValidation>;

interface IProps {
  itemsResult: { data: TProduct[]; meta?: TMeta };
}

export default function CreateNewOffer({ itemsResult }: IProps) {
  const form = useForm<TOfferForm>({
    resolver: zodResolver(offerValidation),
    defaultValues: {
      title: "",
      description: "",
      offerType: "PERCENT",
      discountValue: 0,
      maxDiscountAmount: 0,
      buyQty: 1,
      getQty: 1,
      itemId: "",
      startDate: new Date(),
      endDate: new Date(),
      minOrderAmount: 0,
      code: "",
      isAutoApply: false,
    },
  });

  const watchOfferType = useWatch({
    control: form.control,
    name: "offerType",
  });

  const onSubmit = async (data: TOfferForm) => {
    const toastId = toast.loading("Creating offer...");

    try {
      const result = await createOffer(data);

      if (result.success) {
        toast.success(result.message || "Offer created successfully!", {
          id: toastId,
        });
        form.reset();
        return;
      }

      toast.error(result.message || "Offer creation failed", { id: toastId });
      console.log(result);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error.response);
      toast.error(error?.response?.data?.message || "Password Update Failed", {
        id: toastId,
      });
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: BG }}>
      <div className="max-w-[900px] mx-auto space-y-10">
        <h1 className="text-4xl font-extrabold" style={{ color: PRIMARY }}>
          Create New Offer
        </h1>
        <p className="text-gray-600 text-sm">
          Add a promotion to boost your restaurant&apos;s sales
        </p>

        <Card className="rounded-3xl bg-white border shadow-lg">
          <CardContent className="p-0">
            {/* OFFER DETAILS */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-6 space-y-8"
              >
                <div className="space-y-4">
                  <h2 className="font-bold text-lg">Offer Details</h2>
                  <Separator />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Offer Title (e.g., 20% OFF on Burgers)"
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
                            placeholder="Offer Description"
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
                              Offer Type
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger
                                className={cn(
                                  "w-full h-12",
                                  fieldState.invalid ? "border-destructive" : ""
                                )}
                              >
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PERCENT">
                                  Percentage Discount
                                </SelectItem>
                                <SelectItem value="FLAT">
                                  Flat Amount OFF
                                </SelectItem>
                                <SelectItem value="BOGO">
                                  Buy 1 Get 1
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
                              placeholder="Discount % (e.g., 20)"
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
                              placeholder="Flat Discount (€)"
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

                  {watchOfferType === "BOGO" && (
                    <FormField
                      control={form.control}
                      name="itemId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-2">
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="w-full h-12">
                                  <SelectValue placeholder="Choose an Item" />
                                </SelectTrigger>
                                <SelectContent>
                                  {itemsResult?.data.map((item: TProduct) => (
                                    <SelectItem
                                      key={item._id}
                                      value={item.productId}
                                    >
                                      {item.name}
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

                {/* VALIDITY */}
                <div className="space-y-4">
                  <h2 className="font-bold text-lg">Validity</h2>
                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-2">
                              <FormLabel className="font-medium text-sm text-gray-700">
                                Start Date
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
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-2">
                              <FormLabel className="font-medium text-sm text-gray-700">
                                End Date
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
                              Minimum Order Amount (€)
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
                  <FormField
                    control={form.control}
                    name="isAutoApply"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FormLabel className="flex space-y-2 gap-2 items-center">
                            <Input
                              type="checkbox"
                              placeholder="Offer Description"
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
                              Will Auto Apply?
                            </span>
                          </FormLabel>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* PROMO CODE */}
                <div className="space-y-4">
                  <h2 className="font-bold text-lg">Promo Code</h2>
                  <Separator />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter promo code (optional)"
                            className="h-12 text-base uppercase"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ACTION */}
                <div className="pt-4 flex justify-end gap-4">
                  <Button variant="outline" className="h-12 px-6 text-base">
                    Cancel
                  </Button>
                  <Button
                    className="h-12 px-6 text-base text-white"
                    style={{ background: PRIMARY }}
                  >
                    Create Offer
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
