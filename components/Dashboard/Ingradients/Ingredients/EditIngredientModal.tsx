"use client";

import { useState, useEffect } from "react";
import { Resolver, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Save, X, Calendar } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import ImageUpload from "@/components/Dashboard/Sponsorships/ImageUpload";

import { updateIngredientReq } from "@/services/dashboard/ingredient/ingredient.service";
import { uploadImagesReq } from "@/services/upload/upload.service";
import { TIngredient } from "@/types/ingredient.type";
import { ingredientSchema } from "@/validations/Ingredients/Ingredients.validation";
import { TTax } from "@/types/tax.type";

interface EditIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredientData: TIngredient;
  taxes: TTax[];
  onSuccess?: () => void;
}

type TIngredientForm = z.infer<typeof ingredientSchema>;

export default function EditIngredientModal({
  isOpen,
  onClose,
  ingredientData,
  taxes,
  onSuccess,
}: EditIngredientModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(ingredientData.image || "");

  const form = useForm<TIngredientForm>({
    resolver: zodResolver(ingredientSchema) as Resolver<TIngredientForm>,
    defaultValues: {
      name: ingredientData.name || "",
      category: ingredientData.category || "",
      price: ingredientData.price || 0,
      stock: ingredientData.stock || 0,
      minOrder: ingredientData.minOrder || 1,
      lowStockAlert: ingredientData.lowStockAlert || 5,
      unit: ingredientData.unit,
      tax: typeof ingredientData.tax === "string" ? ingredientData.tax : (ingredientData.tax?._id || ""),
      description: ingredientData.description || "",
      image: ingredientData.image || "",
      shelfLifeDays: ingredientData?.shelfLifeDays ?? undefined,
      bulkDiscount: ingredientData.bulkDiscount || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bulkDiscount",
  });

  // Sync state if initial data changes downstream
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: ingredientData.name || "",
        category: ingredientData.category || "",
        description: ingredientData.description || "",
        price: ingredientData.price || 0,
        stock: ingredientData.stock || 0,
        minOrder: ingredientData.minOrder || 1,
        lowStockAlert: ingredientData.lowStockAlert || 5,
        tax: typeof ingredientData.tax === "object" ? ingredientData.tax?._id : ingredientData.tax || "",
        unit: ingredientData.unit || "",
        image: ingredientData.image || "",
        shelfLifeDays: ingredientData?.shelfLifeDays ?? undefined,
        bulkDiscount: ingredientData.bulkDiscount || [],
      });

    }
  }, [isOpen, ingredientData, form]);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    const toastId = toast.loading("Uploading image...");
    setIsUploadingImage(true);

    const uploadResult = await uploadImagesReq([file]);

    if (!uploadResult.success) {
      toast.error(uploadResult.message || "File upload failed", { id: toastId });
      setIsUploadingImage(false);
      return;
    }

    const newUrl = uploadResult.data?.[0];
    if (!newUrl) {
      toast.error("Upload failed: no URL returned", { id: toastId });
      setIsUploadingImage(false);
      return;
    }

    toast.success("Image uploaded successfully!", { id: toastId });
    setPreviewImage(newUrl);
    setIsUploadingImage(false);
    form.setValue("image", newUrl, { shouldValidate: true });
  };

  const removeFile = () => {
    setPreviewImage("");
    form.setValue("image", "");
    toast.success("Image preview cleared!");
  };

  const onSubmit = async (data: TIngredientForm) => {
    console.log("data", data);
    setIsSaving(true);
    const toastId = toast.loading("Saving updates...");

    const payload = {
      ...data,
      shelfLifeDays: data.shelfLifeDays ? Number(data.shelfLifeDays) : undefined,
      bulkDiscount: data.bulkDiscount?.filter((tier) => tier.minQty && tier.discountPrice) || [],
    };

    const result = await updateIngredientReq(payload, ingredientData?._id);
    setIsSaving(false);

    if (result.success) {
      toast.success(result?.message || "Ingredient updated successfully!", { id: toastId });
      onSuccess?.();
      onClose();
      return;
    }

    toast.error(result.message || "Update failed", { id: toastId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-gray-900">
            Edit Ingredient Specifications
          </DialogTitle>
          <DialogDescription>
            Modify catalog parameters and wholesale matrix definitions for SKU:{" "}
            <span className="font-mono text-gray-700">{ingredientData.sku}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Form Validation Errors:", errors))} className="space-y-6 mt-4">

            {/* Core Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Premium Extra Virgin Olive Oil" {...field} />
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
                      <Input placeholder="e.g. Oils & Vinegars" {...field} />
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
                        placeholder="e.g. 12.50"
                        type="number"
                        step="any"
                        min={0}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax Dropdown */}
              <FormField
                name="tax"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax rate</FormLabel>
                    {/* Fallback to undefined if value is empty so the placeholder shows instead of a broken empty selection */}
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="w-full h-10!">
                          <SelectValue placeholder="Select a tax profile" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taxes?.map((tax) => (
                          <SelectItem key={tax._id} value={tax._id}>
                            {tax.taxName} ({tax.taxRate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Dropdown */}
              <FormField
                name="unit"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="w-full h-10!">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["kg", "g", "litre", "ml", "piece", "packet", "box"].map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        placeholder="e.g. 150"
                        type="number"
                        min={0}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Low Stock Alert */}
              <FormField
                control={form.control}
                name="lowStockAlert"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Alert Level</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 15"
                        type="number"
                        min={0}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                        placeholder="e.g. 2"
                        type="number"
                        min={1}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                  <FormLabel>Catalog Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document / Media Management */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4">
              <FormField
                control={form.control}
                name="image"
                render={({ fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        label="Replace Thumbnail Asset Image"
                        value={previewImage}
                        onChange={(file) => (file ? handleImageUpload(file) : removeFile())}
                        isInvalid={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Grid for Inventory Guardrails & Shelf Life */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <FormField
                control={form.control}
                name="lowStockAlert"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Warning Limit ({ingredientData.unit})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shelfLifeDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Calendar size={14} /> Shelf Life Safeguard (Days)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Indefinite if left empty"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bulk Wholesaler Discount Array Section */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Dynamic Discount Matrix</h4>
                  <p className="text-xs text-gray-400">Map localized pricing offsets against bulk volume thresholds</p>
                </div>
                <button
                  type="button"
                  onClick={() => append({ minQty: 1, discountPrice: 0 })}
                  className="flex items-center gap-1 text-xs font-bold bg-gray-100 hover:bg-[#DC3173] hover:text-white transition-all px-3 py-1.5 rounded-lg text-gray-700"
                >
                  <Plus size={14} /> Add Tier
                </button>
              </div>

              <div className="space-y-2 max-h-45 overflow-y-auto pr-1">
                {fields.length === 0 && (
                  <p className="text-xs text-gray-400 bg-gray-50 p-3 text-center rounded-lg italic">
                    No active discount tiers mapped to this object profile.
                  </p>
                )}
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-end gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <FormField
                      control={form.control}
                      name={`bulkDiscount.${index}.minQty`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-[11px] text-gray-500">Min Volume ({ingredientData.unit})</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-9"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`bulkDiscount.${index}.discountPrice`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-[11px] text-gray-500">Promo Rate (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              className="h-9"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm"
                disabled={isSaving}
              >
                <X size={16} /> Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-[#DC3173] text-white rounded-xl font-bold shadow-md shadow-[#DC3173]/10 hover:bg-[#DC3173]/90 transition-all text-sm"
                disabled={isSaving || isUploadingImage}
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}