"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TAddonGroup, TAddonOption } from "@/types/add-ons.type";
import { TOrder } from "@/types/order.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion, Variants } from "framer-motion";
import { ShoppingBagIcon } from "lucide-react";
import Image from "next/image";

interface IProps {
  items: TOrder["items"];
}

export default function OrderItemsTable({ items }: IProps) {
  const { t, lang } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
        <ShoppingBagIcon className="w-5 h-5 text-[#DC3173]" />
        <h3 className="font-semibold text-gray-900">
          {t("order_items") || "Order Items"}
        </h3>
        <span className="ml-auto text-sm text-gray-500">
          {items?.length || 0} {t("items") || "items"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">{t("product_details") || "Product"}</th>
              <th className="px-6 py-3 text-center">{t("qty") || "Qty"}</th>
              <th className="px-6 py-3 text-right">{t("pricing") || "Pricing"}</th>
              <th className="px-6 py-3 text-right">{t("commission_vendor") || "Commission / Vendor"}</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-gray-100"
          >
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <motion.tr
                  key={item.productId || index}
                  variants={rowVariants as Variants}
                  className="hover:bg-gray-50/50 transition-colors align-top"
                >
                  {/* Product Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden shrink-0 relative border border-gray-200">
                          <Image
                            src={item.image}
                            alt={item.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-gray-900">
                          {item?.name || "Unnamed Product"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {t("product_id")}: {item.productId || "N/A"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {t("vendor_id")}: {item.vendorId || "N/A"}
                        </span>
                        {item.hasVariations && (
                          <span className="text-xs text-blue-600">
                            {t("variation_sku")}: {item.variationSku || "N/A"}
                          </span>
                        )}
                        {item.isPromoRewardLine && (
                          <span className="text-xs text-purple-600 font-medium">
                            {t("promo_reward_line")}
                          </span>
                        )}

                        {/* Addons */}
                        {item.addons && item.addons.length > 0 && (
                          <div className="mt-1.5 space-y-1">
                            <div className="text-xs font-medium text-gray-600">{t("add_ons")}:</div>
                            {item.addons.map((group: TAddonGroup, gIdx: number) => (
                              <div key={gIdx} className="text-xs text-gray-500 pl-2 border-l-2 border-gray-200">
                                <div className="font-medium">{group?.title?.[lang] || `Group ${gIdx + 1}`}</div>
                                {group.options?.map((opt: TAddonOption, oIdx: number) => (
                                  <div key={oIdx} className="flex justify-between gap-2">
                                    <span>{opt.name?.[lang]}</span>
                                    <span>+€{formatPrice(opt.price || 0)}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Qty */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      x{item.itemSummary?.quantity || 1}
                    </span>
                  </td>

                  {/* Pricing */}
                  <td className="px-6 py-4 text-right text-xs space-y-0.5">
                    <div>
                      {t("original")}: €{formatPrice(item.productPricing?.originalPrice || 0)}
                    </div>
                    {item.productPricing?.productDiscountAmount > 0 && (
                      <div className="text-emerald-600">
                        {t("product_discount")}: -€{formatPrice(item.productPricing.productDiscountAmount)}
                        {item.productPricing.discountType && (
                          <span className="ml-1">({item.productPricing.discountType})</span>
                        )}
                      </div>
                    )}
                    <div>
                      {t("after_discount")}: €{formatPrice(item.productPricing?.priceAfterProductDiscount || 0)}
                    </div>
                    {item.productPricing?.promoDiscountAmount > 0 && (
                      <div className="text-emerald-600">
                        {t("promo_discount")}: -€{formatPrice(item.productPricing.promoDiscountAmount)}
                      </div>
                    )}
                    <div>{t("unit_price")}: €{formatPrice(item.productPricing?.unitPrice || 0)}</div>
                    <div>{t("line_total")}: €{formatPrice(item.productPricing?.lineTotal || 0)}</div>
                    <div className="text-gray-400">
                      {t("tax_rate")}: {item.productPricing?.taxRate ?? 0}% • {t("tax")}: €
                      {formatPrice(item.productPricing?.taxAmount || 0)}
                    </div>
                    <div className="font-semibold text-gray-900 pt-1 border-t mt-1">
                      {t("grand")}: €{formatPrice(item.itemSummary?.grandTotal || 0)}
                    </div>
                    <div className="text-gray-400">
                      {t("total_tax")}: €{formatPrice(item.itemSummary?.totalTaxAmount || 0)}
                    </div>
                    <div className="text-gray-400">
                      {t("total_promo")}: €{formatPrice(item.itemSummary?.totalPromoDiscount || 0)}
                    </div>
                    <div className="text-gray-400">
                      {t("total_product_discount")}: €
                      {formatPrice(item.itemSummary?.totalProductDiscount || 0)}
                    </div>
                  </td>

                  {/* Commission & Vendor */}
                  <td className="px-6 py-4 text-right text-xs space-y-0.5">
                    <div className="font-medium text-gray-700">{t("commission")}</div>
                    <div>
                      {t("rate")}: {item.commission?.deliGoCommissionRate ?? 0}%
                    </div>
                    <div>
                      {t("amount")}: €{formatPrice(item.commission?.deliGoCommissionAmount || 0)}
                    </div>
                    <div>
                      {t("vat_rate")}: {item.commission?.deliGoCommissionVatRate ?? 0}%
                    </div>
                    <div>
                      {t("vat_amount")}: €{formatPrice(item.commission?.deliGoCommissionVatAmount || 0)}
                    </div>

                    <div className="font-medium text-gray-700 pt-2 mt-1 border-t">{t("vendor")}</div>
                    <div>
                      {t("earnings_w_o_tax")}: €
                      {formatPrice(item.vendor?.vendorEarningsWithoutTax || 0)}
                    </div>
                    <div>
                      {t("payable_tax")}: €{formatPrice(item.vendor?.payableTax || 0)}
                    </div>
                    <div className="font-semibold">
                      {t("net_earnings")}: €{formatPrice(item.vendor?.vendorNetEarnings || 0)}
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  {t("no_items_found")}
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}