"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FileTextIcon, ActivitySquareIcon, LoaderIcon, PlusCircle, Edit3 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/use-translation";
import { translateObject } from "@/utils/translation/translationObject";
import { productCategoryValidation } from "@/validations/item/product-categories.validation";
import {
    addAdminProductCategoryReq,
    updateAdminProductCategoryReq
} from "@/services/dashboard/category/product-category.service";
import { TProductCategoryResponse } from "@/types/category.type";

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    initialData: TProductCategoryResponse | null;
    onSuccess?: () => void;
}

type FormData = z.infer<typeof productCategoryValidation>;

export default function AddCategoryModal({
    isOpen,
    onClose,
    vendorId,
    initialData,
    onSuccess,
}: AddCategoryModalProps) {
    const { t, lang } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = Boolean(initialData);

    const form = useForm<FormData>({
        resolver: zodResolver(productCategoryValidation),
        defaultValues: {
            name: { en: "", pt: "" },
            isActive: true,
            currentLang: lang,
        },
    });

    // Prefill or reset form values when modal opens/closes or initialData changes
    useEffect(() => {
        if (initialData) {
            form.reset({
                name: {
                    en: initialData.name?.en || "",
                    pt: initialData.name?.pt || "",
                },
                isActive: initialData.isActive ?? true,
                currentLang: lang,
            });
        } else {
            form.reset({
                name: { en: "", pt: "" },
                isActive: true,
                currentLang: lang,
            });
        }
    }, [initialData, lang, form, isOpen]);

    const onSubmit = async (data: FormData) => {
        const toastId = toast.loading(
            isEditMode ? "Updating category..." : "Creating category for vendor..."
        );
        setIsSubmitting(true);

        // Translate the input object if needed
        const translated = await translateObject(data, lang);
        if (!translated) {
            toast.error("Translation failed", { id: toastId });
            setIsSubmitting(false);
            return;
        }

        let result;

        if (isEditMode && initialData) {
            const payload: Record<string, unknown> = {};

            // Compare names
            const originalEn = initialData.name?.en || "";
            const originalPt = initialData.name?.pt || "";
            const newEn = translated?.name?.en || "";
            const newPt = translated?.name?.pt || "";

            if (newEn !== originalEn || newPt !== originalPt) {
                payload.name = {
                    en: newEn,
                    pt: newPt,
                };
            }

            // Compare active status
            if (data.isActive !== initialData.isActive) {
                payload.isActive = data.isActive;
            }

            // Check if anything actually changed before sending the request
            if (Object.keys(payload).length === 0) {
                toast.info("No changes detected", { id: toastId });
                setIsSubmitting(false);
                onClose();
                return;
            }

            // Fire update API request (replace with your actual update function name if different)
            result = await updateAdminProductCategoryReq(initialData._id, payload);

        } else {
            // --- CREATE MODE ---
            const payload = {
                vendorId,
                name: translated?.name,
                isActive: data.isActive,
            };

            result = await addAdminProductCategoryReq(payload);
        }

        if (result?.success) {
            toast.success(
                result.message || (isEditMode ? "Category updated successfully!" : "Category created successfully!"),
                { id: toastId }
            );
            form.reset();
            setIsSubmitting(false);
            onSuccess?.();
            onClose();
            return;
        }

        if (result?.data?.errorSources) {
            result.data.errorSources.map((err: { path: string; message: string }) =>
                toast.error(err?.message, { id: toastId })
            );
        } else {
            toast.error(
                result.message || (isEditMode ? "Failed to update category" : "Failed to create category"),
                { id: toastId }
            );
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="p-0 overflow-hidden max-w-lg rounded-xl shadow-2xl bg-white border-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <DialogHeader className="bg-linear-to-r from-[#DC3173] to-[#E95A9E] p-6 text-left space-y-1">
                        <DialogTitle className="text-xl font-bold text-white">
                            {isEditMode ? t("edit_product_category") : t("add_product_category")}
                        </DialogTitle>
                        <DialogDescription className="text-pink-100 text-sm">
                            {isEditMode ? t("update_existing_product_category") : t("create_new_product_category")}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                            {lang === "en" && (
                                <FormField
                                    control={form.control}
                                    name="name.en"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                <FileTextIcon className="w-4 h-4 text-[#DC3173]" />
                                                {t("category_name")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t("category_name")}
                                                    className="w-full p-3 border rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {lang === "pt" && (
                                <FormField
                                    control={form.control}
                                    name="name.pt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                <FileTextIcon className="w-4 h-4 text-[#DC3173]" />
                                                {t("category_name")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t("category_name")}
                                                    className="w-full p-3 border rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div>
                                <div className="flex items-center mb-2 text-sm font-medium text-gray-700">
                                    <ActivitySquareIcon className="w-4 h-4 text-[#DC3173] mr-2" />
                                    <span>{t("active_status")}</span>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <FormLabel className="text-sm font-medium">{t("is_active")}</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 transition"
                                >
                                    {t("cancel")}
                                </button>
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center px-5 py-2 rounded-md text-white bg-[#DC3173] hover:bg-[#DC3173]/95 transition disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                                    ) : isEditMode ? (
                                        <Edit3 className="w-4 h-4 mr-2" />
                                    ) : (
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                    )}
                                    {isEditMode ? t("update_category") : t("save_category")}
                                </motion.button>
                            </div>
                        </form>
                    </Form>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}