import { ImageUploader } from "@/components/AllBusinessCategories/BusinessCategoryImageUploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useTranslation } from "@/hooks/use-translation";
import { updateBusinessCategoryReq } from "@/services/dashboard/category/business-category";
import { TBusinessCategory } from "@/types/category.type";
import { updateBusinessCategoryValidation } from "@/validations/category/business-category.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { FileTextIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
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
  const { t } = useTranslation();
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(updateBusinessCategoryValidation),
    defaultValues: {
      name: category?.name || "",
      image: { file: null, url: category?.icon || "" },
      description: category?.description || "",
    },
  });

  const [watchImage] = useWatch({
    control: form.control,
    name: ["image"],
  });

  const onChangeImage = (image: { file: File | null; url: string }) => {
    form.setValue("image", image);
  };

  const onDialogClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading("Updating category...");

    const categoryData = {
      name: data.name,
      description: data.description,
    };

    const result = await updateBusinessCategoryReq(
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
    console.log(result);
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
          className="bg-white rounded-lg shadow-xl w-full max-w-xl z-10 max-h-[90vh] overflow-y-auto"
        >
          <Dialog open={isOpen} onOpenChange={onDialogClose}>
            <form>
              <DialogContent className="w-full h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("edit_business_category")}</DialogTitle>
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
                                <span className="ml-2">{t("category_name")}</span>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t("eg_restaurant")}
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
                                <span className="ml-2">{t("category_image")}</span>
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
                                <span className="ml-2">{t("description")}</span>
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
                        className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#DC3173] hover:bg-[#DC3173]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC3173] transition-all duration-200"
                        whileHover={{
                          scale: 1.02,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                      >
                        {t("update_business_category")}
                      </motion.button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </form>
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
