/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
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
import { TAddonGroup } from '@/types/add-ons.type';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/store';
import { TVariations } from '@/types/product.type';
import { useTranslation } from '@/hooks/use-translation';

interface IProps {
    form: any;
    addonGroupsData: TAddonGroup[];
    businessTypeSlug: string;
    watchVariations: any;
    watchAddons: any;
    selectedLanguage: "en" | "pt";
}

const AddOnsAndVariants = ({ form, addonGroupsData, businessTypeSlug, watchVariations, watchAddons, selectedLanguage }: IProps) => {
    const { lang } = useStore();
    const { t } = useTranslation();
    const [variationName, setVariationName] = useState({
        en: "",
        pt: "",
    });

    const [options, setOptions] = useState<
        {
            label: {
                en: string;
                pt: string;
            };
            price: number;
            stockQuantity?: number;
        }[]
    >([]);

    const [option, setOption] = useState({
        label: {
            en: "",
            pt: "",
        },
        price: "",
        ...(businessTypeSlug !== "restaurant"
            ? { stockQuantity: 0 }
            : {}),
    });

    const addAddon = (id: string) => {
        if (!form?.getValues("addonGroups")?.includes(id)) {
            const newAddonGroups = [...form?.getValues("addonGroups"), id];
            form.setValue("addonGroups", newAddonGroups);
        }
    };

    const removeAddon = (idToRemove: string) => {
        const newAddonGroups = form
            ?.getValues("addonGroups")
            ?.filter((id: string) => id !== idToRemove);
        form.setValue("addonGroups", newAddonGroups);
    };

    const addOption = () => {
        const currentLabel =
            option.label[selectedLanguage as "en" | "pt"];

        if (
            currentLabel &&
            option.price
        ) {
            if (!options.find(
                (opt) =>
                    opt.label[selectedLanguage as "en" | "pt"] ===
                    option.label[selectedLanguage as "en" | "pt"]
            )) {
                setOptions((prev) => [
                    ...prev,
                    {
                        label: {
                            en: option.label.en,
                            pt: option.label.pt,
                        },
                        price: Number(option.price),
                        ...(businessTypeSlug !== "restaurant"
                            ? {
                                stockQuantity:
                                    option.stockQuantity,
                            }
                            : {}),
                    },
                ]);
                setOption({
                    label: {
                        en: "",
                        pt: "",
                    },
                    price: "",
                    ...(businessTypeSlug !== "restaurant"
                        ? { stockQuantity: 0 }
                        : {}),
                });
            }
        } else {
            toast.error("Option label and price are required");
        }
    };

    const removeOption = (optionToRemove: string) => {
        setOptions(
            (prev) => prev.filter((opt) => opt.label[selectedLanguage] !== optionToRemove) || [],
        );
    };

    const addVariation = () => {
        if (variationName[selectedLanguage] && options.length > 0) {
            if (!form.getValues("variations").find((v: TVariations) => v.name[selectedLanguage] ===
                variationName[selectedLanguage])) {
                form.setValue("variations", [
                    ...form.getValues("variations"),
                    {
                        name: {
                            en: variationName.en,
                            pt: variationName.pt,
                        },
                        options,
                    },
                ]);
                setVariationName({
                    en: "",
                    pt: "",
                });
                setOptions([]);
            }
        } else {
            toast.error("Variation name and options are required");
        }
    };

    const removeVariation = (nameToRemove: string) => {
        form.setValue(
            "variations",
            form.getValues("variations").filter((v: TVariations) =>
                v.name[selectedLanguage] !==
                nameToRemove),
        );
    };

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
                {t("add_ons_and_variants")}
            </h2>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("add_ons")}
                </label>
                {watchAddons?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1">
                        {watchAddons?.map((id: string) => (
                            <motion.div
                                key={id}
                                initial={{
                                    scale: 0,
                                }}
                                animate={{
                                    scale: 1,
                                }}
                                className="flex items-center bg-[#DC3173] bg-opacity-10 text-white px-3 py-1 rounded-full"
                            >
                                <span>
                                    {
                                        addonGroupsData?.find(
                                            (group) => group._id === id,
                                        )?.title?.[lang]
                                    }
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeAddon(id)}
                                    className="ml-2 text-white hover:text-[#CCC]"
                                >
                                    <XIcon className="h-4 w-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
                <FormField
                    control={form.control}
                    name="addonGroups"
                    render={({ fieldState }) => (
                        <FormItem className="gap-1">
                            <FormControl>
                                <Select onValueChange={(val) => addAddon(val)}>
                                    <SelectTrigger
                                        className={cn(
                                            "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-[#DC3173] outline-none h-10",
                                            fieldState.invalid
                                                ? "border-destructive"
                                                : "border-gray-300",
                                        )}
                                    >
                                        <SelectValue placeholder={t("choose_add_on")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {addonGroupsData?.map((group) => (
                                            <SelectItem
                                                key={group._id}
                                                value={group._id}
                                            >
                                                {group.title?.[lang]}
                                            </SelectItem>
                                        ))}
                                        {addonGroupsData?.length === 0 && (
                                            <p className='italic text-sm text-gray-500 text-center'>{t("no_add_ons_found")}</p>
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-2 ">
                <label className="block mb-1">{t("variations")}</label>
                <div>
                    {watchVariations?.length > 0 &&
                        watchVariations?.map((variation: TVariations, i: number) => (
                            <div
                                key={i}
                                className="relative p-4 border rounded-md bg-gray-50 mb-4"
                            >
                                <div>
                                    {t("name")}: {variation.name?.[selectedLanguage]}
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {t("options")}:{" "}
                                    {variation.options?.map((option, i2) => (
                                        <div
                                            key={i2}
                                            className="flex items-center bg-[#DC3173] bg-opacity-10 text-white px-3 py-1 rounded-full"
                                        >
                                            <span>{option.label?.[selectedLanguage]}</span>
                                            <span className="ml-2">
                                                (€{option.price})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeVariation(variation?.name?.[lang] as string)}
                                    className="ml-2 hover:text-[#333] absolute top-1 right-1"
                                >
                                    <XIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                </div>
                <div className="border rounded-md p-4 bg-gray-50 space-y-2">
                    <Label className="text-gray-700 mb-1">
                        {t("name")}
                    </Label>
                    <Input
                        value={
                            variationName[selectedLanguage]
                        }
                        onChange={(e) =>
                            setVariationName((prev) => ({
                                ...prev,
                                [selectedLanguage]:
                                    e.target.value,
                            }))
                        }
                    />
                    <Label className="text-gray-700">{t("options")}</Label>
                    {options?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-1">
                            {options?.map((option) => (
                                <div
                                    key={option.label.en}
                                    className="flex items-center bg-[#DC3173] bg-opacity-10 text-white px-3 py-1 rounded-full"
                                >
                                    <span>{option.label.en}</span>
                                    <span className="ml-2">(€{option.price})</span>
                                    <button
                                        type="button"
                                        onClick={() => removeOption(option.label.en)}
                                        className="ml-2 text-white hover:text-[#CCC]"
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="border border-dashed rounded-md p-4 bg-gray-100 space-y-2">
                        <div>
                            <Label className="text-gray-700 mb-1">
                                {t("label")}
                            </Label>
                            <Input
                                value={
                                    option.label[selectedLanguage]
                                }
                                onChange={(e) =>
                                    setOption({
                                        ...option,
                                        label: {
                                            ...option.label,
                                            [selectedLanguage]:
                                                e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label className="text-gray-700 mb-1">
                                {t("price")}
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                value={option.price}
                                onChange={(e) =>
                                    setOption({ ...option, price: e.target.value })
                                }
                                placeholder={t("add_an_option_price")}
                                onKeyUp={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>
                        {businessTypeSlug !== "restaurant" && (
                            <div>
                                <Label className="text-gray-700 mb-1">
                                    {t("stock_quantity")}
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={option.stockQuantity}
                                    onChange={(e) =>
                                        setOption({
                                            ...option,
                                            stockQuantity: Number(e.target.value),
                                        })
                                    }
                                    placeholder={t("add_stock_quantity")}
                                    onKeyUp={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                        )}
                        <div className="text-right">
                            <Button
                                onClick={addOption}
                                type="button"
                                size="sm"
                                className="bg-[#DC3173] hover:bg-[#DC3173]/90"
                            >
                                {t("add_option")}
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Button
                            onClick={addVariation}
                            type="button"
                            size="sm"
                            className="bg-[#DC3173] hover:bg-[#DC3173]/90"
                        >
                            {t("add_variation")}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AddOnsAndVariants;