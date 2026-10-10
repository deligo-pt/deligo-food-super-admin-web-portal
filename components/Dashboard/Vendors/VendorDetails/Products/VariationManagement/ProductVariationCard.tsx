"use client";


import { useStore } from "@/store/store";
import { TProduct } from "@/types/product.type";
import { translateObject } from "@/utils/translation/translationObject";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircleIcon,
  ChevronDownIcon,
  GripVerticalIcon,
  LayersIcon,
  PlusIcon,
  TagIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LocalizedType } from "@/types";
import { removeVariationReq, renameVariationReq, updateVariationPrice } from "@/services/dashboard/product/variation.service";
import AddVariationForm from "./AddVariationForm";
import VariationInlineEdit from "./VariationInlineEdit";
import VariationDeleteButton from "./VariationDeleteButton";
import AddVaritionOptionForm from "./AddVaritionOptionForm";

interface IProps {
  product: TProduct;
  businessTypeSlug: "store" | "restaurant";
  t: (key: string) => string;
}

export default function ProductVariationCard({ product, businessTypeSlug, t }: IProps) {
  const { lang } = useStore();
  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddVariation, setShowAddVariation] = useState(false);
  const [addingOptionFor, setAddingOptionFor] = useState<LocalizedType>({});

  const variationCount = product?.variations?.length || 0;
  const optionCount = (product?.variations || [])?.reduce(
    (sum, v) => sum + (v?.options?.length || 0),
    0,
  );

  const renameVariation = async (data: {
    oldName: string;
    newName?: { en: string; pt: string };
    oldLabel?: string;
    newLabel?: { en: string; pt: string };
  }) => {
    const toastId = toast.loading("Renaming variation...");
    const translated = await translateObject(data, lang);

    const result = await renameVariationReq(product.productId, translated);

    if (result.success) {
      toast.success(result.message || "Variation renamed successfully!", {
        id: toastId,
      });
      router.refresh();
      return;
    }

    toast.error(result.message || "Failed to rename variation.", {
      id: toastId,
    });
    console.log(result);
  };

  const updatePrice = async (variation: {
    newPrice: string;
    variationSku: string;
  }) => {
    const cleanPriceStr = variation.newPrice.replace(/[^0-9.]/g, "");

    const numericPrice = parseFloat(cleanPriceStr);

    const toastId = toast.loading("Updating variation price...");

    const payload = {
      newPrice: numericPrice,
      variationSku: variation.variationSku
    }

    const result = await updateVariationPrice(product.productId, payload);

    if (result.success) {
      toast.success(result.message || "Variation price updated successfully!", {
        id: toastId,
      });
      router.refresh();
      return;
    }

    toast.error(result.message || "Failed to update variation price.", {
      id: toastId,
    });
    console.log(result);
  };

  const deleteVariation = async (data: {
    name: string;
    labelToRemove?: string;
  }) => {
    const toastId = toast.loading("Deleting variation...");
    const result = await removeVariationReq(product.productId, data);

    if (result.success) {
      toast.success(result.message || "Variation deleted successfully!", {
        id: toastId,
      });
      router.refresh();
      return;
    }

    toast.error(result.message || "Failed to delete variation.", {
      id: toastId,
    });
    console.log(result);
  };

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-5 flex items-center gap-5 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
          <Image
            src={product?.image as string}
            alt={product.name?.[lang] as string}
            className="w-full h-full object-fill"
            width={300}
            height={300}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {product.name?.[lang]}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            {variationCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                <LayersIcon size={11} />
                {variationCount} {t("variation")}{variationCount !== 1 ? "s" : ""} ·{" "}
                {optionCount} {t("option")}{optionCount !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                {t("no_variations")}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {product.category.name?.[lang]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAddVariation(true);
              if (!isExpanded) setIsExpanded(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#DC3173] bg-[#DC3173]/10 rounded-lg hover:bg-[#DC3173]/30 transition-colors"
          >
            <PlusIcon size={14} />
            {t("add_variation")}
          </button>

          <motion.div
            animate={{
              rotate: isExpanded ? 180 : 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="text-gray-400"
          >
            <ChevronDownIcon size={20} />
          </motion.div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 bg-gray-50/40 p-5 space-y-4">
              {/* Add Variation Form */}
              <AnimatePresence>
                {showAddVariation && (
                  <AddVariationForm
                    productId={product.productId}
                    onCancel={() => setShowAddVariation(false)}
                    businessTypeSlug={businessTypeSlug}
                  />
                )}
              </AnimatePresence>

              {/* Variation Groups */}
              {product?.variations?.length === 0 && !showAddVariation && (
                <div className="text-center py-8">
                  <div className="inline-flex p-3 bg-white rounded-full text-gray-300 mb-3 shadow-sm">
                    <LayersIcon size={28} />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    {t("no_variations")}
                  </p>
                  {/* <p className="text-xs text-gray-400 mt-1">
                    Click &ldquo;Add Variation&rdquo; to create one
                  </p> */}
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {product?.variations?.map((variation, vIdx) => (
                  <motion.div
                    key={`${vIdx}-${variation.name}`}
                    layout
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    {/* Variation Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-[#DC3173]/10 rounded-md">
                          <TagIcon size={14} className="text-[#DC3173]" />
                        </div>
                        <VariationInlineEdit
                          title={t("variation_name")}
                          value={variation.name?.[lang] as string}
                          onSave={(newName) =>
                            renameVariation({
                              oldName: variation.name?.en as string,
                              newName: {
                                en: lang === 'en' ? newName : (variation.name?.en as string),
                                pt: lang === 'pt' ? newName : (variation.name?.pt as string),
                              },
                            })
                          }
                          className="text-sm font-bold text-gray-900"
                        />
                        <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                          {variation.options.length} {t("option")}
                          {variation.options.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setAddingOptionFor(variation.name)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#DC3173] hover:bg-[#DC3173]/10 rounded-lg transition-colors"
                        >
                          <PlusIcon size={13} />
                          {t("option_lg")}
                        </button>
                        <VariationDeleteButton
                          onConfirm={() =>
                            deleteVariation({ name: variation.name?.[lang] as string })
                          }
                          label={t("delete_variation")}
                        />
                      </div>
                    </div>

                    {/* Options List */}
                    <div className="divide-y divide-gray-50">
                      <AnimatePresence mode="popLayout">
                        {variation.options.map((option, oIdx) => (
                          <motion.div
                            key={`${oIdx}-${option.sku}`}
                            layout
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                            exit={{
                              opacity: 0,
                              x: -20,
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 group"
                          >
                            <div className="text-gray-200">
                              <GripVerticalIcon size={14} />
                            </div>

                            <VariationInlineEdit
                              title={t("option_label")}
                              value={option.label?.[lang] as string}
                              onSave={(newLabel) =>
                                renameVariation({
                                  oldName: variation.name?.en as string,
                                  oldLabel: option.label?.en,
                                  newLabel: {
                                    en: lang === 'en' ? newLabel : (option.label?.en as string),
                                    pt: lang === 'pt' ? newLabel : (option.label?.pt as string),
                                  }
                                })
                              }
                              className="text-sm font-medium text-gray-800 min-w-20"
                            />

                            <span className="text-xs text-gray-500 shrink-0">
                              <VariationInlineEdit
                                title={t("option_price")}
                                value={`€${option.price.toFixed(2)}`}
                                onSave={(newPrice) =>
                                  updatePrice({
                                    newPrice,
                                    variationSku: option?.sku,
                                  })
                                }
                                className="text-sm font-medium text-gray-800 min-w-20"
                              />
                            </span>

                            {businessTypeSlug === "store" && <span className="text-xs text-gray-500 shrink-0">
                              {t("stock")}: {option.stockQuantity}
                            </span>}

                            {(businessTypeSlug === "store" && option.isOutOfStock) && (
                              <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded shrink-0">
                                {t("out_of_stock")}
                              </span>
                            )}

                            <div className="flex-1" />

                            <VariationDeleteButton
                              onConfirm={() =>
                                deleteVariation({
                                  name: variation.name?.[lang] as string,
                                  labelToRemove: option.label?.[lang],
                                })
                              }
                              label={t("delete_option")}
                              size="xs"
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {variation.options.length === 0 && (
                        <div className="px-4 py-4 text-center">
                          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                            <AlertCircleIcon size={12} />
                            {t("no_options_add_one")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Add Option Form */}
                    <AnimatePresence>
                      {(addingOptionFor.en || addingOptionFor.pt) && (
                        <div className="px-4 pb-3">
                          <AddVaritionOptionForm
                            productId={product.productId}
                            variationName={addingOptionFor}
                            onCancel={() => setAddingOptionFor({ en: "", pt: "" })}
                            businessTypeSlug={businessTypeSlug}
                            t={t}
                          />
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
