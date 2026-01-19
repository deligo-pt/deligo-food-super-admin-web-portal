"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { TAX_RATE } from "@/consts/tax.const";
import { cn } from "@/lib/utils";
import { createTaxReq } from "@/services/dashboard/tax/tax";
import { TTax } from "@/types/tax.type";
import { taxValidation } from "@/validations/tax/tax.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TaxForm = z.infer<typeof taxValidation>;

export default function CreateTax() {
  const form = useForm<TaxForm>({
    resolver: zodResolver(taxValidation),
    defaultValues: {
      taxName: "",
      taxCode: "",
      taxRate: 0,
      countryID: "",
      description: "",
      taxExemptionCode: "",
      taxExemptionReason: "",
    },
  });

  const handleCreateTax = async (data: TaxForm) => {
    const toastId = toast.loading("Creating Tax...");

    const result = await createTaxReq(data as Partial<TTax>);

    if (result.success) {
      toast.success(result.message || "Tax created successfully!", {
        id: toastId,
      });
      form.reset();
      return;
    }

    toast.error(result.message || "Failed to create tax", {
      id: toastId,
    });
    console.log(result);
  };

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="py-0">
          <CardContent className="space-y-10 bg-white shadow-xl p-6 rounded-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-[#DC3173]">
                Create Tax
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Create a new tax rule
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCreateTax)}
                className="space-y-8"
              >
                <div className="grid lg:grid-cols-2 gap-6">
                  <FormField
                    name="taxName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Tax Name"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="taxCode"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Tax Code</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue(
                                "taxRate",
                                TAX_RATE[value as keyof typeof TAX_RATE],
                              );
                            }}
                          >
                            <SelectTrigger
                              className={cn(
                                "w-full",
                                fieldState.invalid ? "border-destructive" : "",
                              )}
                            >
                              <SelectValue placeholder="Select Tax Code" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(TAX_RATE).map((key) => (
                                <SelectItem key={key} value={key}>
                                  {key}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="taxRate"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            placeholder="Tax Rate"
                            className="w-full"
                            disabled={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="countryID"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Country ID"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Description"
                            className="w-full h-20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="taxExemptionCode"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Exemption Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Tax Exemption Code"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="taxExemptionReason"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Exemption Reason</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Tax Exemption Reason"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#DC3173] text-white py-2 px-4 rounded-lg w-full"
                >
                  Create Tax
                </button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
