"use client";

import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import ImageUpload from "@/components/Dashboard/Sponsorships/ImageUpload";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TIngredient } from "@/types/ingredient.type";
import { formatPrice } from "@/utils/formatPrice";
import { ingredientSchema } from "@/validations/Ingredients/Ingredients.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Edit2,
  EuroIcon,
  Package,
  Save,
  Trash2,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface IProps {
  ingredientData: TIngredient;
}

type TIngredientForm = z.infer<typeof ingredientSchema>;

export default function IngredientDetails({ ingredientData }: IProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<TIngredientForm>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: ingredientData.name,
      category: ingredientData.category,
      description: ingredientData.description,
      price: ingredientData.price,
      stock: ingredientData.stock,
      minOrder: ingredientData.minOrder,
      image: {
        url: ingredientData.image,
        file: null,
      },
    },
  });

  const onSubmit = (data: TIngredientForm) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");

    setTimeout(() => {
      setIsSaving(false);
      toast.success("Ingredient updated successfully!", { id: toastId });
      console.log(data);
      setIsEditing(false);
      router.refresh();
    }, 1500);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/admin/all-ingredients"
          className="inline-flex items-center gap-2 text-[#DC3173] hover:underline mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Ingredients
        </Link>
      </div>

      {/* Header */}
      <TitleHeader
        title="Ingredient Details"
        subtitle="Details of the selected ingredient"
      />

      {/* Ingredient Info and Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <motion.h1
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="text-3xl font-extrabold text-gray-900"
        >
          {ingredientData.name}
        </motion.h1>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => btnRef.current?.click()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#DC3173] text-white rounded-xl font-bold shadow-lg shadow-[#DC3173]/20 hover:bg-[#DC3173]/90 transition-all"
                disabled={isSaving}
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                <XIcon size={18} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                <Edit2 size={18} />
                Edit
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium hover:bg-red-100 transition-all"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Current Stock"
          value={ingredientData.stock?.toLocaleString()}
          icon={Package}
          delay={0}
        />
        <StatsCard
          title="Unit Price"
          value={`€${formatPrice(ingredientData.price)}`}
          icon={EuroIcon}
          delay={0.1}
        />
        <StatsCard
          title="Last Updated"
          value={format(ingredientData.updatedAt, "do MMM yyyy, h:mm a")}
          icon={Clock}
          delay={0.3}
        />
      </div>

      <Form {...form}>
        <form
          id="saveIngredientForm"
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Ingredient Details
              </h2>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-32 h-32 rounded-2xl overflow-hidden">
                  <Image
                    src={ingredientData.image}
                    alt={ingredientData.name}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Name
                    </label>
                    {isEditing ? (
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {ingredientData.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Category
                    </label>
                    {isEditing ? (
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {ingredientData.category}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Price per Unit
                    </label>
                    {isEditing ? (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step="any"
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
                    ) : (
                      <p className="text-gray-900 font-medium">
                        €{ingredientData.price.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Minimum Order
                    </label>
                    {isEditing ? (
                      <FormField
                        control={form.control}
                        name="minOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
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
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {ingredientData.minOrder} units
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Description
                    </label>
                    {isEditing ? (
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <p className="text-gray-600">
                        {ingredientData.description}
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="md:col-span-2">
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
                                  const url = file
                                    ? URL.createObjectURL(file)
                                    : "";
                                  field.onChange({
                                    file: file ? file : null,
                                    url,
                                  });
                                }}
                                isInvalid={fieldState.invalid}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <button ref={btnRef} className="hidden">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="space-y-6"
          >
            {/* Stock Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Stock Management
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Current Level</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {ingredientData.stock}
                  </span>
                </div>

                {isEditing && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Update Stock
                    </label>
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              value={String(field.value)}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}
