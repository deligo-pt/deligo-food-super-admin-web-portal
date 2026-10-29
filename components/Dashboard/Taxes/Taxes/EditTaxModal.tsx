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
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { updateTaxReq } from "@/services/dashboard/tax/tax.service";
import { useStore } from "@/store/store";
import { TTax } from "@/types/tax.type";
import { translateObject } from "@/utils/translation/translationObject";
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
  const { t } = useTranslation();
  const { lang } = useStore();
  const form = useForm<TaxForm>({
    resolver: zodResolver(taxValidation),
    values: {
      taxName: {
        en: prevTax?.taxName?.en || "",
        pt: prevTax?.taxName?.pt || "",
      },
      taxCode: prevTax?.taxCode || "NOR",
      taxRate: prevTax?.taxRate || 0,
      countryID: prevTax?.countryID || "",
      description: {
        en: prevTax?.description?.en || "",
        pt: prevTax?.description?.pt || "",
      },
      taxExemptionCode: prevTax?.taxExemptionCode || "",
      taxExemptionReason: {
        en: prevTax?.taxExemptionReason?.en || "",
        pt: prevTax?.taxExemptionReason?.pt || "",
      },
      currentLang: lang
    },
  });
  const router = useRouter();
  const { formState: { isSubmitting } } = form;

  const handleEditTax = async (data: TaxForm) => {
    const toastId = toast.loading("Updating Tax...");

    const translated = await translateObject(data, lang);

    if (!translated) {
      toast.error("Translation failed", { id: toastId });
      return;
    }

    // Helper: detect change between previous and current values
    const hasChanged = (prev: unknown, next: unknown) => {
      // normalize undefined/null/"" for simple scalars
      const normalize = (v: unknown) => {
        if (v === undefined || v === null || v === "") return null;
        return v;
      };

      // deep-ish compare for plain objects (localized fields)
      if (
        typeof prev === "object" &&
        prev !== null &&
        typeof next === "object" &&
        next !== null
      ) {
        return JSON.stringify(prev) !== JSON.stringify(next);
      }

      return normalize(prev) !== normalize(next);
    };

    const payload: Partial<TTax> = {};

    // Localized name
    if (hasChanged(prevTax?.taxName, translated.taxName)) {
      payload.taxName = {
        en: translated.taxName?.en ?? "",
        pt: translated.taxName?.pt ?? "",
      };
    }

    // Tax code
    if (hasChanged(prevTax?.taxCode, data.taxCode)) {
      payload.taxCode = data.taxCode as TTax["taxCode"];
    }

    // Tax rate
    if (hasChanged(prevTax?.taxRate, data.taxRate)) {
      payload.taxRate = data.taxRate as TTax["taxRate"];
    }

    // Country
    if (hasChanged(prevTax?.countryID, data.countryID)) {
      payload.countryID = data.countryID;
    }

    // Description
    if (hasChanged(prevTax?.description, translated.description)) {
      payload.description = {
        en: translated.description?.en ?? "",
        pt: translated.description?.pt ?? "",
      };
    }

    // Exemption code
    if (hasChanged(prevTax?.taxExemptionCode, data.taxExemptionCode)) {
      payload.taxExemptionCode = data.taxExemptionCode;
    }

    // Exemption reason
    if (
      hasChanged(prevTax?.taxExemptionReason, translated.taxExemptionReason)
    ) {
      payload.taxExemptionReason = {
        en: translated.taxExemptionReason?.en ?? "",
        pt: translated.taxExemptionReason?.pt ?? "",
      };
    }

    // Nothing changed → skip API call
    if (Object.keys(payload).length === 0) {
      toast.info("No changes detected", { id: toastId });
      onOpenChange(false);
      return;
    }

    const result = await updateTaxReq(prevTax?._id as string, payload);

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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("edit_tax")}</DialogTitle>
            <DialogDescription>{t("make_changes_to_your_tax")}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              id="edit-tax-form"
              onSubmit={form.handleSubmit(handleEditTax)}
              className="space-y-8"
            >
              <div className="grid lg:grid-cols-2 gap-6">
                <FormField
                  name={`taxName.${lang}`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tax_name")}</FormLabel>
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
                      <FormLabel>{t("tax_code")}</FormLabel>
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
                      <FormLabel>{t("tax_rate")}</FormLabel>
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
                      <FormLabel>{t("country_id")}</FormLabel>
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
                  name={`description.${lang}`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel>{t("description")}</FormLabel>
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
                      <FormLabel>{t("tax_exemption_code")}</FormLabel>
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
                  name={`taxExemptionReason.${lang}`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tax_exemption_reason")}</FormLabel>
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
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="edit-tax-form"
              className="bg-[#DC3173] hover:bg-[#DC3173]/90"
              disabled={isSubmitting}
            >
              {t("update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
