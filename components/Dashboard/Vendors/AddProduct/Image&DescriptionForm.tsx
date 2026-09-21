/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";
import { catchAsync } from "@/utils/catchAsync";
import { postData } from "@/utils/requests";
import { TResponse } from "@/types";
import { ProductImageUpload } from "./ProductImageUpload";

interface IProps {
    form: any;
    selectedLanguage: string;
    productId?: string;
}

const ImageAndDescriptionForm = ({ form, selectedLanguage, productId }: IProps) => {
    const { t, lang } = useTranslation();
    // State for inline AI description generator
    const [generatingDescription, setGeneratingDescription] = useState(false);
    const [descriptionLanguage, setDescriptionLanguage] = useState<"Portuguese" | "English">(
        lang === "pt" ? "Portuguese" : "English"
    );

    // AI description generation
    const generateDescription = async () => {
        const productName = form.getValues("name");
        const categoryId = form.getValues("category");

        if (!productName?.[selectedLanguage]) {
            toast.error(t("product_name_required") || "Product name is required");
            return;
        } else if (!categoryId) {
            toast.error(t("select_a_product_category"));
            return;
        }

        const payload = {
            productName: productName?.[selectedLanguage],
            productCategory: categoryId,
            language: descriptionLanguage,
        }

        setGeneratingDescription(true);
        try {
            const result = await catchAsync<any>(async () => {
                return (await postData(
                    "/ai/generate-product-description",
                    payload,
                )) as unknown as TResponse<any>;
            });

            if (result.success && result.data?.description) {
                form.setValue("description", result.data.description);
                toast.success(t("description_generated") || "Description generated!");
            } else {
                toast.error(result.message || "Failed to generate description");
            }
        } catch (error) {
            console.error(error);
            toast.error(t("description_generation_failed") || "Failed to generate description");
        } finally {
            setGeneratingDescription(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <h2 className="text-xl font-semibold text-gray-800">{t("product_images")}</h2>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <ProductImageUpload
                                        images={field.value}
                                        productId={productId}
                                        onChange={(urls) => {
                                            form.setValue("images", urls, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                                shouldValidate: true,
                                            });
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex-1 border rounded-lg p-4 bg-gray-50">
                    <div className="space-y-4">
                        <div>
                            <Label>{t("description")}</Label>
                            <FormField
                                control={form.control}
                                name={`description.${selectedLanguage}`}
                                render={({ field }) => (
                                    <FormItem className="mt-1">
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder={t("enter_product_description")}
                                                className="min-h-30"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="border-t pt-4">
                            <Label className="mb-2 block">
                                {t("ai_generate_description") || "AI Generate Description"}
                            </Label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Select
                                    value={descriptionLanguage}
                                    onValueChange={(val) =>
                                        setDescriptionLanguage(val as "Portuguese" | "English")
                                    }
                                >
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Portuguese">Português</SelectItem>
                                        <SelectItem value="English">English</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    onClick={generateDescription}
                                    disabled={generatingDescription || !form.getValues("name")}
                                    className="bg-[#DC3173] hover:bg-[#DC3173]/90"
                                >
                                    {generatingDescription ? (
                                        <>
                                            <span className="animate-spin mr-2">⏳</span>
                                            {t("generating") || "Generating..."}
                                        </>
                                    ) : (
                                        <>
                                            <FileTextIcon className="h-4 w-4 mr-2" />
                                            {t("generate") || "Generate"}
                                        </>
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {t("generate_description_hint")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ImageAndDescriptionForm;