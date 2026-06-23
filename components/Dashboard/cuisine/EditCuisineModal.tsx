"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FileTextIcon, LoaderIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
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
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/AllBusinessCategories/BusinessCategoryImageUploader";
import { TCuisine } from "@/types/cuisine.type";
import { updateCuisineValidation } from "@/validations/category/cuisine.validation";
import { updateCuisine } from "@/services/dashboard/category/cuisine.service";

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    cuisine: TCuisine | null;
    t: (key: string) => string;
}

type FormData = z.infer<typeof updateCuisineValidation>;

export default function EditCuisineModal({ isOpen, onClose, cuisine, t }: EditModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 1. Setup Form with matching validation schema shape
    const form = useForm<FormData>({
        resolver: zodResolver(updateCuisineValidation),
        defaultValues: {
            name: cuisine?.name || "",
            image: { file: null, url: cuisine?.imageUrl || "" },
            isActive: cuisine?.isActive ?? true,
        },
    });

    // 2. Multi-field structural watch target definition
    const [watchImage, watchIsActive] = useWatch({
        control: form.control,
        name: ["image", "isActive"],
    });

    const onChangeImage = (image: { file: File | null; url: string }) => {
        form.setValue("image", image);
    };

    // 3. Keep form contents matching the current selection item target
    useEffect(() => {
        if (cuisine) {
            form.reset({
                name: cuisine.name,
                image: { file: null, url: cuisine.imageUrl || "" },
                isActive: cuisine.isActive,
            });
        }
    }, [cuisine, form]);

    // 4. Form Action Request Execution
    const onSubmit = async (data: FormData) => {
        if (!cuisine) return;

        const toastId = toast.loading(t("Saving cuisine changes..."));
        setIsLoading(true);

        const payload = {
            name: data.name,
            isActive: data.isActive,
        };

        const result = await updateCuisine(cuisine._id, payload, data.image?.file);

        if (result?.success) {
            toast.success(result.message || t("Cuisine updated successfully!"), { id: toastId });
            router.refresh();
            onClose();
        } else {
            toast.error(result?.message || t("Failed to update cuisine"), { id: toastId });
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[60vw] p-0 overflow-y-scroll h-[90vh] border-none shadow-xl">
                {/* Brand Identity Header Matching Create Layout */}
                <div className="bg-linear-to-r from-[#DC3173] to-[#E95A9E] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">
                            {t("edit_cuisine_settings")}
                        </DialogTitle>
                        <DialogDescription className="text-pink-100 mt-2">
                            {t("modify_properties_for_this_item")}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Main Form Context Body Wrapper */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
                        <div className="space-y-4">
                            {/* Name Input Field */}
                            <FormField
                                control={form.control}
                                name="name"
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
                            />

                            {/* Image Upload Component Field */}
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

                            {/* Toggle Activation Switch Field */}
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-3 shadow-xs">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                {t("visibility_status")}
                                            </FormLabel>
                                            <div className="text-xs text-muted-foreground">
                                                {watchIsActive ? t("active_status") : t("inactive_status")}
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Action Control Trigger Row */}
                        <DialogFooter className="pt-4 gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={onClose}>
                                {t("cancel")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="min-w-30 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#DC3173] hover:bg-[#DC3173]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC3173] transition-all"
                            >
                                {isLoading ? (
                                    <LoaderIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                    t("save_changes")
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}