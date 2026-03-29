"use client";

import ImageUpload from "@/components/Dashboard/Sponsorships/ImageUpload";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TResponse } from "@/types";
import { TIngredient } from "@/types/ingredient.type";
import { catchAsync } from "@/utils/catchAsync";
import { updateData } from "@/utils/requests";
import { ingredientSchema } from "@/validations/Ingredients/Ingredients.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TIngredientForm = z.infer<typeof ingredientSchema>;

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevValues: TIngredient;
}

export default function EditIngredientModal({
  open,
  onOpenChange,
  prevValues,
}: IProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TIngredientForm>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: prevValues.name,
      category: prevValues.category,
      price: prevValues.price,
      stock: prevValues.stock,
      minOrder: prevValues.minOrder,
      description: prevValues.description,
      image: {
        url: prevValues.image,
        file: null,
      },
    },
  });

  const onSubmit = async (data: TIngredientForm) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating ingredient...");

    const payload = {
      name: data.name,
      category: data.category,
      price: data.price,
      stock: data.stock,
      minOrder: data.minOrder,
      description: data.description,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    if (data.image?.file) {
      formData.append("file", data.image.file);
    }

    const result = await catchAsync<null>(async () => {
      return (await updateData(
        `/ingredients/update-ingredient/${prevValues._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )) as unknown as TResponse<null>;
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message || "Ingredient updated successfully!", {
        id: toastId,
      });
      form.reset();
      onOpenChange(false);
      router.refresh();
      return;
    }

    toast.error(result.message || "Ingredient update failed", { id: toastId });
    console.log(result);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-2xl font-medium">
          Edit Ingredient
        </DialogTitle>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            id="editIngredient"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Large Pizza Box" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Box" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Unit (€)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 2.50"
                        type="number"
                        step="any"
                        min={0}
                        {...field}
                        value={String(field.value)}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stock */}
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 100"
                        type="number"
                        min={0}
                        {...field}
                        value={String(field.value)}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Minimum Order */}
              <FormField
                control={form.control}
                name="minOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 100"
                        type="number"
                        min={1}
                        {...field}
                        value={String(field.value)}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Large Pizza Box" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      label="Image"
                      value={field.value.url}
                      onChange={(file) => {
                        const url = file ? URL.createObjectURL(file) : "";
                        field.onChange({ file: file ? file : null, url });
                      }}
                      isInvalid={fieldState.invalid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            className={cn(
              "inline-flex items-center justify-center gap-2 text-white bg-[#DC3173]",
              isSubmitting ? "cursor-wait" : "hover:bg-[#DC3173]/90",
            )}
            form="editIngredient"
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
