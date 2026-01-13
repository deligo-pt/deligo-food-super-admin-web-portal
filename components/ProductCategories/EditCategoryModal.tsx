import { ImageUploader } from "@/components/AllBusinessCategories/BusinessCategoryImageUploader";
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
import { updateProductCategoryReq } from "@/services/dashboard/category/product-category";
import { TResponse } from "@/types";
import { TBusinessCategory, TProductCategory } from "@/types/category.type";
import { getCookie } from "@/utils/cookies";
import { fetchData } from "@/utils/requests";
import { updateProductCategoryValidation } from "@/validations/category/product-category.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { FileTextIcon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  category: TProductCategory;
}

type FormData = z.infer<typeof updateProductCategoryValidation>;

export default function EditProductCategoryModal({
  isOpen,
  onClose,
  category,
}: IProps) {
  const router = useRouter();
  const [businessCategories, setBusinessCategories] = useState<
    TBusinessCategory[]
  >([]);
  const form = useForm<FormData>({
    resolver: zodResolver(updateProductCategoryValidation),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      image: { file: null, url: category?.icon || "" },
      businessCategoryId: category?.businessCategoryId || "",
    },
  });

  const [watchImage] = useWatch({
    control: form.control,
    name: ["image"],
  });

  const onChangeImage = (image: { file: File | null; url: string }) => {
    form.setValue("image", image);
  };

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading("Updating category...");
    try {
      const categoryData = {
        name: data.name,
        description: data.description,
      };

      const result = await updateProductCategoryReq(
        category._id,
        categoryData,
        data.image?.file
      );

      if (result?.success) {
        toast.success(result.message || "Category updated successfully!", {
          id: toastId,
        });
        form.reset();
        onClose();
        router.refresh();
        return;
      }

      toast.error(result?.message || "Failed to update category", {
        id: toastId,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update category",
        {
          id: toastId,
        }
      );
    }
  };

  const getBusinessCategories = async () => {
    try {
      const result = (await fetchData("/categories/businessCategory", {
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<{ data: TBusinessCategory[] }>;
      if (result?.success) {
        setBusinessCategories(result?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (() => getBusinessCategories())();
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 20,
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
          }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md z-10 max-h-[90vh] overflow-y-auto"
        >
          <Dialog open={isOpen} onOpenChange={onClose}>
            <form>
              <DialogContent className="w-full h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Product Category</DialogTitle>
                  <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
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
                                <PlusCircleIcon className="w-5 h-5 text-[#DC3173]" />
                                <span className="ml-2">Business Category</span>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#DC3173] focus:border-[#DC3173] outline-none transition-all border-gray-300">
                                  <SelectValue placeholder="Select Business Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {businessCategories.map(
                                    (businessCategory) => (
                                      <SelectItem
                                        key={businessCategory._id}
                                        value={businessCategory._id}
                                      >
                                        {businessCategory.name}
                                      </SelectItem>
                                    )
                                  )}
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
                        className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#DC3173] hover:bg-[#DC3173]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC3173] transition-all duration-200"
                        whileHover={{
                          scale: 1.02,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                      >
                        Update Product Category
                      </motion.button>
                    </div>
                  </form>
                </Form>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
