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
import { useTranslation } from "@/hooks/use-translation";
import { createCuisine } from "@/services/dashboard/category/cuisine.service";
import { useStore } from "@/store/store";
import { translateObject } from "@/utils/translation/translationObject";
import { cuisineValidation } from "@/validations/category/cuisine.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FileTextIcon, LoaderIcon, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type FormData = z.infer<typeof cuisineValidation>;

const CreateCuisine = () => {
    const { t } = useTranslation();
    const { lang } = useStore();
    const router = useRouter();
    const form = useForm<FormData>({
        resolver: zodResolver(cuisineValidation),
        defaultValues: {
            name: {
                en: "",
                pt: ""
            },
            image: { file: null, url: "" },
            currentLang: lang
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
        console.log("hit")
        const toastId = toast.loading("Adding cuisine...");
        setIsSubmitting(true);

        const { image, ...rest } = data;

        const translated = await translateObject(rest, lang);

        const cuisineData = {
            name: {
                en: translated.name.en ?? "",
                pt: translated.name.pt ?? "",
            },
        };

        const result = await createCuisine(cuisineData, image?.file);
        console.log("cuis result", result);
        if (result?.success) {
            toast.success(result.message || "Cuisine created successfully!", {
                id: toastId,
            });
            form.reset();
            setIsSubmitting(false);
            router.push('/admin/cuisine/all')
            return;
        }

        toast.error(result.message || "Failed to create cuisine", {
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
                    {t("create_cuisine")}
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
                    Create different types of cuisine
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
                        
                        {lang === "en" && <FormField
                            control={form.control}
                            name="name.en"
                            render={({ field }) => (
                                <FormItem className="content-start">
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center">
                                            <FileTextIcon className="w-5 h-5 text-[#DC3173]" />
                                            <span className="ml-2">Cusiine name english</span>
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
                        />}

                        {lang === "pt" && <FormField
                            control={form.control}
                            name="name.pt"
                            render={({ field }) => (
                                <FormItem className="content-start">
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center">
                                            <FileTextIcon className="w-5 h-5 text-[#DC3173]" />
                                            <span className="ml-2">{t("cuisine_name")}</span>
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
                        />}

                        <FormField
                            control={form.control}
                            name="image"
                            render={() => (
                                <FormItem className="content-start">
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center">
                                            <FileTextIcon className="w-5 h-5 text-[#DC3173]" />
                                            <span className="ml-2">{t("cuisine_image")}</span>
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
                                    {t("create_cuisine")}
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.form>
            </Form>
        </motion.div>
    );
}


export default CreateCuisine;