"use client";

import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/store/store";
import { TProduct } from "@/types/product.type";
import { motion } from "framer-motion";
import { Clock, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IProps {
  product: TProduct;
  onDelete: (id: string, type: string) => void;
  onEdit?: (product: TProduct) => void;
}

export default function ProductCard({ product, onDelete, onEdit }: IProps) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const router = useRouter();
  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    DELETED: "bg-red-100 text-red-800",
  };

  const availabilityColors = {
    "In Stock": "bg-green-100 text-green-800",
    "Out of Stock": "bg-red-100 text-red-800",
    "Limited": "bg-yellow-100 text-yellow-800",
  };

  // VAT helpers (supports common field names)
  const taxPercentage = product.pricing?.taxRate ?? null;
  const taxAmount = product.pricing?.taxAmount ?? null;

  const hasTax =
    (taxAmount !== null && taxAmount !== undefined);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 20px rgba(220, 49, 115, 0.15)",
        transition: {
          duration: 0.2,
        },
      }}
    >
      <div className="relative h-48 flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product?.name?.[lang] as string}
            className="w-full h-full object-fill"
            width={500}
            height={500}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {/* {product.meta.isFeatured && (
          <div className="absolute top-2 right-2 bg-[#DC3173] text-white text-xs font-bold px-2 py-1 rounded-md">
            Featured
          </div>
        )} */}
        <div
          className={`absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-md ${statusColors[
            product.isDeleted ? "DELETED" : product.meta.status
          ]
            }`}
        >
          {product.isDeleted ? "DELETED" : product.meta.status}
        </div>
        {product?.pricing?.discount && <div
          className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-md bg-[#DC3173] text-white`}
        >
          {product.pricing?.discount} % OFF
        </div>}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {product.name?.[lang]}
          </h3>
          <div className="flex items-center">
            <Star
              className="h-4 w-4 text-yellow-400 mr-1"
              fill="currentColor"
            />
            <span className="text-sm font-medium">
              {product.rating ? product.rating.average.toFixed(1) : "N/A"}
            </span>
          </div>
        </div>

        {product.description?.[lang] && <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description?.[lang]}
        </p>}

        {/* Price + VAT section */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className="text-lg font-bold text-[#DC3173]">
                {product.pricing.currency}{" "}
                {new Intl.NumberFormat("de-DE", {
                  minimumFractionDigits: 2,
                }).format(product.pricing.finalPrice)}
              </span>

              {product?.pricing?.discount ? (
                <span className="text-xs line-through text-gray-400">
                  {product.pricing.currency}{" "}
                  {new Intl.NumberFormat("de-DE", {
                    minimumFractionDigits: 2,
                  }).format(product.pricing.price)}
                </span>
              ) : null}

              {/* VAT inline */}
              {hasTax && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 ml-1">
                  <span className="text-gray-400">•</span>
                  <span className="font-medium text-gray-600">{t("inc_vat")}</span>

                  {taxPercentage !== null && taxPercentage !== undefined && (
                    <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                      {taxPercentage}%
                    </span>
                  )}

                  {taxAmount !== null && taxAmount !== undefined && (
                    <span>
                      ({product.pricing.currency}{" "}
                      {new Intl.NumberFormat("de-DE", {
                        minimumFractionDigits: 2,
                      }).format(taxAmount)}
                      )
                    </span>
                  )}
                </span>
              )}
            </div>

            {product.stock?.availabilityStatus && (
              <div
                className={`text-xs px-2 py-1 rounded-full ${availabilityColors[product.stock.availabilityStatus]
                  }`}
              >
                {product.stock.availabilityStatus}
              </div>
            )}
          </div>
        </div>

        {product.deliveryInfo && (
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <Clock className="h-3 w-3 mr-1" />
            <span>{product.deliveryInfo.deliveryType}</span>
            {product.deliveryInfo.estimatedTime && (
              <span className="ml-1">
                • {product.deliveryInfo.estimatedTime}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {product.vendorId?.vendorName}
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                router.push(`/vendor/all-items/${product.productId}`)
              }
              className="text-xs px-3 py-1 rounded-md border border-[#DC3173] text-[#DC3173] hover:bg-[#DC3173] hover:text-white transition-colors"
            >
              {t("view")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit?.(product)}
              className="text-xs px-3 py-1 rounded-md border border-[#DC3173] text-[#DC3173] hover:bg-[#DC3173] hover:text-white transition-colors"
            >
              {t("edit")}
            </motion.button>
            {!product?.isDeleted ? <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(product.productId, "soft")}
              className="text-xs px-3 py-1 rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              {t("delete")}
            </motion.button> :
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(product.productId, "permanent")}
                className="text-xs px-3 py-1 rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                {t("permanent_delete")}
              </motion.button>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
