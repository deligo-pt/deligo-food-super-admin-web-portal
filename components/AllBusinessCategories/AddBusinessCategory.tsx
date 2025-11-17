"use client";

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
import { TResponse } from "@/types";
import { TBusinessCategory } from "@/types/category.type";
import { getCookie } from "@/utils/cookies";
import { postData } from "@/utils/requests";
import { businessCategoryValidation } from "@/validations/category/business-category.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FileTextIcon, LoaderIcon, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type FormData = z.infer<typeof businessCategoryValidation>;

export function AddBusinessCategoryForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(businessCategoryValidation),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading("Adding category...");
    setIsSubmitting(true);
    try {
      const response = (await postData("/categories/businessCategory", data, {
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<TBusinessCategory>;

      if (response?.success) {
        toast.success("Category added successfully!", {
          id: toastId,
        });
        form.reset();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error?.response?.data?.message || "Failed to add category", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="bg-linear-to-r from-[#DC3173] to-[#E95A9E] p-6">
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
          Add Business Category
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
          Create a new business category with details and visuals
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
                      placeholder="e.g. Restaurant"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#DC3173] focus:border-[#DC3173] outline-none transition-all border-gray-300"
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
                  Add Business Category
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </Form>
    </motion.div>
  );
}
