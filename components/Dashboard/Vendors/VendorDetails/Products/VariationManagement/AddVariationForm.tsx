"use client";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/store/store";
import { LocalizedType } from "@/types";
import { translateObject } from "@/utils/translation/translationObject";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { addVariationReq } from "@/services/dashboard/product/variation.service";
import { variationValidation } from "@/validations/item/product.validation";

interface IProps {
  productId: string;
  onCancel: () => void;
  businessTypeSlug: "store" | "restaurant";
}

interface IOption {
  label: LocalizedType;
  price: number;
  stockQuantity: number;
}

type TVariationForm = z.infer<typeof variationValidation>;

export default function AddVariationForm({ productId, onCancel, businessTypeSlug }: IProps) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const router = useRouter();

  const [option, setOption] = useState<IOption>({
    label: {
      en: "",
      pt: ""
    },
    price: 0,
    stockQuantity: 0,
  });

  const form = useForm<TVariationForm>({
    resolver: zodResolver(variationValidation),
    defaultValues: {
      name: {
        en: "",
        pt: ""
      },
      options: [],
      currentLang: lang
    },
  });
  const { formState: { isSubmitting } } = form;

  const watchOptions = useWatch({
    control: form.control,
    name: "options",
  });

  const addOption = () => {
    if ((option?.label?.[lang] as string)?.length > 1) {
      if (!watchOptions.find((opt) => opt.label?.[lang] === option.label?.[lang])) {
        form.setValue("options", [...watchOptions, option]);
        setOption({ label: { en: "", pt: "" }, price: 0, stockQuantity: 0 });
      }
    } else {
      toast.error("Option label is required and must be at least 3 characters");
    }
  };

  const removeOption = (optionToRemove: string) => {
    form.setValue(
      "options",
      watchOptions.filter((opt) => opt.label?.[lang] !== optionToRemove),
    );
  };

  const onSubmit = async (data: TVariationForm) => {
    const toastId = toast.loading("Adding variation...");
    const translated = await translateObject(data, lang);

    const payload = {
      name: translated.name,
      options: translated.options
    };

    const result = await addVariationReq(productId, payload);

    onCancel();
    if (result.success) {
      toast.success(result.message || "Variation added successfully!", {
        id: toastId,
      });
      form.reset();
      router.refresh();
      setOption({ label: { en: "", pt: "" }, price: 0, stockQuantity: 0 });
      return;
    }

    toast.error(result.message || "Failed to add variation.", { id: toastId });
    console.log(result);
  };

  return (
    <Form {...form}>
      <motion.form
        onSubmit={form.handleSubmit(onSubmit)}
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: -10,
        }}
        className="p-4 rounded-xl border border-dashed border-[#DC3173]/20 space-y-4"
      >
        {lang === "en" && <FormField
          control={form.control}
          name="name.en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("variation_name_placeholder")}
                  className=""
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />}
        {lang === "pt" && <FormField
          control={form.control}
          name="name.pt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("variation_name_placeholder")}
                  className=""
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />}

        <Label className="text-gray-700">{t("options")}</Label>
        {watchOptions?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {watchOptions?.map((option) => (
              <div
                key={option.label?.[lang]}
                className="flex items-center bg-[#DC3173] bg-opacity-10 text-white px-3 py-1 rounded-full"
              >
                <span>{option.label?.[lang]}</span>
                <span className="ml-2">(€{option.price})</span>
                <button
                  type="button"
                  onClick={() => removeOption(option.label?.[lang] as string)}
                  className="ml-2 text-white hover:text-[#CCC]"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className={cn(
            "border border-dashed rounded-md p-4 space-y-2",
            form.formState.errors.options && "border-destructive bg-red-200",
          )}
        >
          <div>
            <Label className="text-gray-700 mb-1">{t("label")}</Label>
            <Input
              type="text"
              value={option.label?.[lang]}
              onChange={(e) =>
                setOption({
                  ...option,
                  label: { ...option.label, [lang]: e.target.value },
                })
              }
              placeholder={t("add_an_option_label")}
            />
          </div>
          <div>
            <Label className="text-gray-700 mb-1">{t("price")}</Label>
            <Input
              type="number"
              min={0}
              value={option.price}
              onChange={(e) =>
                setOption({ ...option, price: Number(e.target.value) })
              }
              placeholder={t("add_an_option_price")}
            />
          </div>
          {businessTypeSlug === "store" && <div>
            <Label className="text-gray-700 mb-1">{t("stock_quantity")}</Label>
            <Input
              type="number"
              min={0}
              value={option.stockQuantity}
              onChange={(e) =>
                setOption({
                  ...option,
                  stockQuantity: Number(e.target.value),
                })
              }
              placeholder={t("add_stock_quantity")}
            />
          </div>}
          {form.formState.errors.options && (
            <p className="text-destructive text-sm">
              {form.formState.errors.options.message}
            </p>
          )}
          <div className="text-right">
            <Button
              onClick={addOption}
              type="button"
              size="sm"
              className="bg-[#DC3173] hover:bg-[#DC3173]/90"
            >
              {t("add_option")}
            </Button>
          </div>
        </div>
        <div>
          <Button disabled={isSubmitting} className="bg-[#DC3173] text-sm font-bold hover:bg-[#DC3173]/90 transition-colors mr-2">
            {t("create")}
          </Button>
          <Button
            onClick={onCancel}
            className="bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {t("cancel")}
          </Button>
        </div>
      </motion.form>
    </Form>
  );
}
