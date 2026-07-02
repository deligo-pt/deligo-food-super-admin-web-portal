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
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";
import { updateProductCategoryReq } from "@/services/dashboard/category/product-category.service";
import { useStore } from "@/store/store";
import { TProductCategory } from "@/types/category.type";
import { translateObject } from "@/utils/translation/translationObject";
import { updateProductCategoryValidation } from "@/validations/category/product-category.validation";
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
  category: TProductCategory;
}

type FormData = z.infer<typeof updateProductCategoryValidation>;

export default function EditProductCategoryModal({
  isOpen,
  onClose,
  category,
}: IProps) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(updateProductCategoryValidation),
    defaultValues: {
      name: {
        en: category.name.en,
        pt: category.name.pt,
      },
      description: category?.description || "",
      image: { file: null, url: category?.icon || "" },
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

    const { image, ...rest } = data;

    const translated = await translateObject(rest, lang);

    const categoryData = {
      name: translated?.name ? translated?.name : data?.name,
      description: data.description,
    };

    const result = await updateProductCategoryReq(
      category._id,
      categoryData,
      data.image?.file,
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
          className="bg-white rounded-lg shadow-xl w-full max-w-md z-10 max-h-[90vh] overflow-y-auto"
        >
          <Dialog open={isOpen} onOpenChange={onClose}>
            <form>
              <DialogContent className="w-full h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("edit_product_category")}</DialogTitle>
                  <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      {lang === 'en' && <FormField
                        control={form.control}
                        name="name.en"
                        render={({ field }) => (
                          <FormItem className="content-start">
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                              <div className="flex items-center">
                                <FileTextIcon className="w-5 h-5 text-[#DC3173]" />
                                <span className="ml-2">{t("category_name_english")}</span>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t("eg_pizza")}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#DC3173] focus:border-[#DC3173] outline-none transition-all border-gray-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}

                      {lang === 'pt' && <FormField
                        control={form.control}
                        name="name.pt"
                        render={({ field }) => (
                          <FormItem className="content-start">
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                              <div className="flex items-center">
                                <FileTextIcon className="w-5 h-5 text-[#DC3173]" />
                                <span className="ml-2">{t("category_name_portugues")}</span>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t("eg_pizza")}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#DC3173] focus:border-[#DC3173] outline-none transition-all border-gray-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}

                      <FormField
                        control={form.control}
                        name="image"
                        render={() => (
                          <FormItem className="content-start">
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                              <div className="flex items-center">
                                <FileTextIcon className="w-5 h-5 text-[#DC3173]" />
                                <span className="ml-2">
                                  {t("category_image")}
                                </span>
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
                        {t("update_product_category")}
                      </motion.button>
                    </div>
                  </form>
                </Form>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">{t("cancel")}</Button>
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
