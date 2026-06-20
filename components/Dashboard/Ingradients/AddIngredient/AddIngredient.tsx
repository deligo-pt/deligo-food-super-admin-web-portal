"use client";

import ImageUpload from "@/components/Dashboard/Sponsorships/ImageUpload";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createIngredientReq } from "@/services/dashboard/ingredient/ingredient.service";
import { uploadImagesReq } from "@/services/upload/upload.service";
import { TTax } from "@/types/tax.type";
import { ingredientSchema } from "@/validations/Ingredients/Ingredients.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TIngredientForm = z.infer<typeof ingredientSchema>;

export default function AddIngredients({ taxes }: { taxes: TTax[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<TIngredientForm>({
    resolver: zodResolver(ingredientSchema) as Resolver<TIngredientForm>,
    defaultValues: {
      name: "",
      category: "",
      price: 0,
      stock: 0,
      minOrder: 1,
      lowStockAlert: 5,
      unit: "piece",
      tax: "",
      description: "",
      image: "",
    },
  });

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    // Single image limit check
    if (previewImage) {
      toast.error("You can only upload one image");
      return;
    }

    const toastId = toast.loading("Uploading...");
    setIsUploadingImage(true);

    // Send the file directly inside an array exactly like your reference
    const uploadResult = await uploadImagesReq([file]);

    if (!uploadResult.success) {
      toast.error(uploadResult.message || "File upload failed", {
        id: toastId,
      });
      setIsUploadingImage(false);
      return;
    }

    const newUrl = uploadResult.data?.[0];

    if (!newUrl) {
      toast.error("Upload failed: no file URL returned", {
        id: toastId,
      });
      setIsUploadingImage(false);
      return;
    }

    toast.success("File uploaded successfully!", { id: toastId });

    // Update both the local state and the form state with the returned URL string
    setPreviewImage(newUrl);
    setIsUploadingImage(false);
    form.setValue("image", newUrl, { shouldValidate: true });
  };

  const removeFile = async () => {
    if (!previewImage) return;

    // Clear states directly (No updateDocumentReq or deleteDocumentReq needed here)
    setPreviewImage("");
    form.setValue("image", "");
    toast.success("File removed successfully!");
  };

  const onSubmit = async (data: TIngredientForm) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Adding ingredient...");

    const result = await createIngredientReq(data);

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Ingredient added successfully!", { id: toastId });
      form.reset();
      return;
    }

    toast.error(result.message || "Ingredient add failed", { id: toastId });
  };

  return (
    <div className="min-h-screen p-6">
      <TitleHeader
        title="Add New Ingredient"
        subtitle="Add packaging materials and ingredients to the inventory."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief details about the ingredient..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload Component */}
              <FormField
                control={form.control}
                name="image"
                render={({ fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        label="Ingredient Image"
                        value={previewImage}
                        onChange={(file) => {
                          if (file) {
                            handleImageUpload(file);
                          } else {
                            removeFile();
                          }
                        }}
                        isInvalid={fieldState.invalid}
                      />
                    </FormControl>
                    {fieldState.invalid && (
                      <p className="text-sm text-destructive mt-1">
                        {fieldState.error?.message || "Image is required"}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold shadow-lg shadow-[#DC3173]/20 transition-all ${isSubmitting || isUploadingImage
                    ? "bg-[#DC3173]/70 cursor-wait"
                    : "bg-[#DC3173] hover:bg-[#DC3173]/90 hover:shadow-[#DC3173]/30"
                    }`}
                >
                  {isSubmitting ? "Saving..." : <><Save size={20} /> Save Ingredient</>}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}