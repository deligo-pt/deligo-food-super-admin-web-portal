/* eslint-disable @typescript-eslint/no-explicit-any */


import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/use-translation";
import { motion } from 'framer-motion';

interface IProps {
    form: any;
}

const DeligoMetadata = ({ form }: IProps) => {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            transition={{
                duration: 0.3,
            }}
            className="space-y-6"
        >
            <h2 className="text-xl font-semibold text-gray-800">
                {t("deligo_metadata_information")}
            </h2>
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-3">
                            <FormLabel
                                htmlFor="isFeatured"
                                className="text-sm text-gray-700"
                            >
                                {t("featured_product")}
                            </FormLabel>
                            <FormControl>
                                <Switch
                                    id="isFeatured"
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-[#DC3173]"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isAvailableForPreOrder"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-3">
                            <FormLabel
                                htmlFor="isAvailableForPreOrder"
                                className="text-sm text-gray-700"
                            >
                                {t("available_for_pre_order")}
                            </FormLabel>
                            <FormControl>
                                <Switch
                                    id="isAvailableForPreOrder"
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-[#DC3173]"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-3">
                            <FormLabel
                                htmlFor="isActive"
                                className="text-sm text-gray-700"
                            >
                                {t("active_status")}
                            </FormLabel>
                            <FormControl>
                                <Switch
                                    id="isActive"
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-[#DC3173]"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </motion.div>
    );
};

export default DeligoMetadata;