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
import { Textarea } from "@/components/ui/textarea";
import { ingredientSchema } from "@/validations/Ingredients/Ingredients.validation";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TIngredientForm = z.infer<typeof ingredientSchema>;

export default function AddIngredients() {
  const form = useForm<TIngredientForm>({
    defaultValues: {
      name: "",
      category: "",
      price: 0,
      stock: 0,
      description: "",
      image: {
        url: "",
        file: null,
      },
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: TIngredientForm) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Adding ingredient...");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(data);
    setIsSubmitting(false);
    toast.success("Ingredient added successfully!", { id: toastId });
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <TitleHeader
        title="Add New Ingredient"
        subtitle="Add packaging materials and ingredients to the inventory."
      />

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold shadow-lg shadow-[#DC3173]/20 transition-all ${isSubmitting ? "bg-[#DC3173]/70 cursor-wait" : "bg-[#DC3173] hover:bg-[#DC3173]/90 hover:shadow-[#DC3173]/30"}`}
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={20} /> Save Ingredient
                    </>
                  )}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
