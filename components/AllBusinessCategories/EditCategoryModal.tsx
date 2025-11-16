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
import { Textarea } from "@/components/ui/textarea";
import { TResponse } from "@/types";
import { TBusinessCategory } from "@/types/category.type";
import { getCookie } from "@/utils/cookies";
import { updateData } from "@/utils/requests";
import { updateBusinessCategoryValidation } from "@/validations/category/business-category.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { FileTextIcon, ImageIcon, PlusCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  category: TBusinessCategory;
}

type FormData = z.infer<typeof updateBusinessCategoryValidation>;

export default function EditBusinessCategoryModal({
  isOpen,
  onClose,
  category,
}: IProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(updateBusinessCategoryValidation),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      image: category?.image || "",
      icon: category?.icon || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading("Updating category...");
    try {
      const response = (await updateData(
        `/categories/businessCategory/${category._id}`,
        data,
        {
          headers: { authorization: getCookie("accessToken") },
        }
      )) as unknown as TResponse<TBusinessCategory>;

      if (response?.success) {
        toast.success("Category updated successfully!", {
          id: toastId,
        });
        form.reset();
        onClose();
      }

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
              <DialogContent className="sm:max-w-[425px]">
                {" "}
                <DialogHeader>
                  <DialogTitle>Edit Business Category</DialogTitle>{" "}
                  <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="p-6 space-y-6"
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
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem className="content-start">
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                              <div className="flex items-center">
                                <PlusCircleIcon className="w-5 h-5 text-[#DC3173]" />
                                <span className="ml-2">Icon</span>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <Input
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
                        name="image"
                        render={({ field }) => (
                          <FormItem className="content-start">
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                              <div className="flex items-center">
                                <ImageIcon className="w-5 h-5 text-[#DC3173]" />
                                <span className="ml-2">Image Url</span>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <Input
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
                        className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#DC3173] hover:bg-[#DC3173]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC3173] transition-all duration-200"
                        whileHover={{
                          scale: 1.02,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                      >
                        Update Business Category
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
