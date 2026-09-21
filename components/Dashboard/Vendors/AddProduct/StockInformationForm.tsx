/* eslint-disable @typescript-eslint/no-explicit-any */
import {
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
import { cn } from "@/lib/utils";
import { useTranslation } from '@/hooks/use-translation';
import { motion } from 'framer-motion';

interface IProps {
    form: any;
    watchVariations: any;
}

const StockInformationForm = ({ form, watchVariations }: IProps) => {
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
                {t("stock_information")}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {watchVariations.length === 0 && (
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem className="gap-1">
                                <FormLabel
                                    htmlFor="quantity"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    {t("quantity")}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        min={0}
                                        value={String(field.value)}
                                        onChange={(e) =>
                                            field.onChange(Number(e.target.value))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field, fieldState }) => (
                        <FormItem className="gap-1">
                            <FormLabel
                                htmlFor="unit"
                                className="block text-sm font-medium text-gray-700"
                            >
                                {t("unit")}
                            </FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10",
                                            fieldState.invalid
                                                ? "border-destructive"
                                                : "border-gray-300",
                                        )}
                                    >
                                        <SelectValue placeholder="Select a unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kg">
                                            {t("kilogram")}
                                        </SelectItem>
                                        <SelectItem value="g">{t("gram")}</SelectItem>
                                        <SelectItem value="l">
                                            {t("liter")}
                                        </SelectItem>
                                        <SelectItem value="ml">
                                            {t("milliliter")}
                                        </SelectItem>
                                        <SelectItem value="pcs">
                                            {t("pieces")}
                                        </SelectItem>
                                        <SelectItem value="others">
                                            {t("others")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="availabilityStatus"
                    render={({ field, fieldState }) => (
                        <FormItem className="gap-1">
                            <FormLabel
                                htmlFor="availabilityStatus"
                                className="block text-sm font-medium text-gray-700"
                            >
                                {t("availability_status")}
                            </FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10",
                                            fieldState.invalid
                                                ? "border-destructive"
                                                : "border-gray-300",
                                        )}
                                    >
                                        <SelectValue placeholder="Select a unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="In Stock">
                                            {t("in_stock")}
                                        </SelectItem>
                                        <SelectItem value="Out of Stock">
                                            {t("out_of_stock")}
                                        </SelectItem>
                                        <SelectItem value="Limited">
                                            {t("limited")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </motion.div>
    );
};

export default StockInformationForm;