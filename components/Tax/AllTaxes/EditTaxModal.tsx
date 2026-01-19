"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import { Textarea } from "@/components/ui/textarea";
import { TAX_RATE } from "@/consts/tax.const";
import { cn } from "@/lib/utils";
import { updateTaxReq } from "@/services/dashboard/tax/tax";
import { TTax } from "@/types/tax.type";
import { taxValidation } from "@/validations/tax/tax.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevTax: TTax | null;
}

type TaxForm = z.infer<typeof taxValidation>;

export default function EditTaxModal({ open, onOpenChange, prevTax }: IProps) {
  const form = useForm<TaxForm>({
    resolver: zodResolver(taxValidation),
    values: {
      taxName: prevTax?.taxName || "",
      taxCode: prevTax?.taxCode || "NOR",
      taxRate: prevTax?.taxRate || 0,
      countryID: prevTax?.countryID || "",
      description: prevTax?.description || "",
      taxExemptionCode: prevTax?.taxExemptionCode || "",
      taxExemptionReason: prevTax?.taxExemptionReason || "",
    },
  });
  const router = useRouter();

  const handleEditTax = async (data: TaxForm) => {
    const toastId = toast.loading("Updating Tax...");

    const result = await updateTaxReq(
      prevTax?._id as string,
      data as Partial<TTax>,
    );

    if (result.success) {
      router.refresh();
      toast.success(result.message || "Tax updated successfully!", {
        id: toastId,
      });
      onOpenChange(false);
      return;
    }

    toast.error(result.message || "Failed to update tax", {
      id: toastId,
    });
    console.log(result);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tax</DialogTitle>
            <DialogDescription>Make changes to your tax</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              id="edit-tax-form"
              onSubmit={form.handleSubmit(handleEditTax)}
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
            </form>
          </Form>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="edit-tax-form"
              className="bg-[#DC3173] hover:bg-[#DC3173]/90"
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
