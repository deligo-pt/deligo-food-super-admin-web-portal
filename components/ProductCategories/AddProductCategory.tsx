"use client";

import { ImageUploader } from "@/components/AllBusinessCategories/BusinessCategoryImageUploader";
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
import { addProductCategoryReq } from "@/services/dashboard/category/product-category";
import { TBusinessCategory } from "@/types/category.type";
import { productCategoryValidation } from "@/validations/category/product-category.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FileTextIcon, LoaderIcon, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export type TProductCategory = {
  name: string;
  description?: string;
  icon?: string;
  image?: string;
};

type FormData = z.infer<typeof productCategoryValidation>;

export default function AddProductCategory({
  businessCategories,
}: {
  businessCategories: TBusinessCategory[];
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(productCategoryValidation),
    defaultValues: {
      name: "",
      description: "",
      image: { file: null, url: "" },
      businessCategoryId: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [watchImage] = useWatch({
    control: form.control,
    name: ["image"],
  });

  const onChangeImage = (image: { file: File | null; url: string }) => {
    form.setValue("image", image);
  };

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading("Adding category...");
    setIsSubmitting(true);

    const categoryData = {
      name: data.name,
      description: data.description,
      businessCategoryId: data.businessCategoryId,
    };

    const result = await addProductCategoryReq(categoryData, data.image?.file);

    if (result?.success) {
      toast.success(result.message || "Category added successfully!", {
        id: toastId,
      });
      form.reset();
      setIsSubmitting(false);
      return;
    }

    toast.error(result.message || "Failed to add category", {
      id: toastId,
    });
    setIsSubmitting(false);
    console.log(result);
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-linear-to-r from-[#DC3173] to-[#E95A9E] p-6 rounded-t-xl">
        <motion.h1
          className="text-2xl font-bold text-white"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.2,
          }}
        >
          Add Product Category
        </motion.h1>
        <motion.p
          className="text-pink-100 mt-2"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.3,
          }}
        >
          Create a new product category with details and visuals
        </motion.p>
      </div>
      <Form {...form}>
        <motion.form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 space-y-6"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
          }}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="content-start">
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <FileTextIcon className="w-5 h-5 text-[#DC3173]" />
                      <span className="ml-2">Category Name</span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Pizza"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#DC3173] focus:border-[#DC3173] outline-none transition-all border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem className="content-start">
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <FileTextIcon className="w-5 h-5 text-[#DC3173]" />
                      <span className="ml-2">Category Image</span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <ImageUploader
                      image={watchImage}
                      onChange={onChangeImage}
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
                <FormItem className="content-start">
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <FileTextIcon className="w-5 h-5 text-[#DC3173]" />
                      <span className="ml-2">Description</span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#DC3173] focus:border-[#DC3173] outline-none transition-all border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessCategoryId"
              render={({ field }) => (
                <FormItem className="content-start">
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <PlusCircle className="w-5 h-5 text-[#DC3173]" />
                      <span className="ml-2">Business Category</span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#DC3173] focus:border-[#DC3173] outline-none transition-all border-gray-300">
                        <SelectValue placeholder="Select Business Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((businessCategory) => (
                          <SelectItem
                            key={businessCategory._id}
                            value={businessCategory._id}
                          >
                            {businessCategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="pt-4">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#DC3173] hover:bg-[#DC3173]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC3173] transition-all duration-200"
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              {isSubmitting ? (
                <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Add Product Category
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </Form>
    </motion.div>
  );
}
