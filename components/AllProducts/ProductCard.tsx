"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TProduct } from "@/types/product.type";
import { motion } from "framer-motion";
import { Clock, ShoppingBag, Star, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IProps {
  product: TProduct;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onDelete }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    DELETED: "bg-red-100 text-red-800",
  };

  const availabilityColors = {
    "In Stock": "bg-green-100 text-green-800",
    "Out of Stock": "bg-red-100 text-red-800",
    Limited: "bg-yellow-100 text-yellow-800",
  };

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
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            width={500}
            height={500}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {product.meta.isFeatured && (
          <div className="absolute top-2 right-2 bg-[#DC3173] text-white text-xs font-bold px-2 py-1 rounded-md">
            {t("featured")}
          </div>
        )}
        <div
          className={`absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-md ${statusColors[product.isDeleted ? "DELETED" : product.meta.status]
            }`}
        >
          {product.isDeleted ? "DELETED" : product.meta.status}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {product.name}
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
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Tag className="h-4 w-4 mr-1" />
          <span>{product.category}</span>
          {product.brand && (
            <span className="ml-2 text-gray-400">| {product.brand}</span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-lg font-bold text-[#DC3173]">
              {product.pricing.currency}{" "}
              {new Intl.NumberFormat("de-DE", {
                minimumFractionDigits: 2,
              }).format(product.pricing.finalPrice)}
            </span>
            {product?.pricing?.discount ? (
              <span className="text-xs line-through text-gray-400 ml-2">
                {product.pricing.currency} {product?.pricing?.price?.toFixed(2)}
              </span>
            ) : (
              ""
            )}
          </div>
          <div
            className={`text-xs px-2 py-1 rounded-full ${availabilityColors[product.stock.availabilityStatus]
              }`}
          >
            {product.stock.availabilityStatus}
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
            {product.vendorId?.businessDetails?.businessName}
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={() =>
                router.push("/admin/all-products/" + product.productId)
              }
              className="text-xs px-3 py-1 rounded-md border border-[#DC3173] text-[#DC3173] hover:bg-[#DC3173] hover:text-white transition-colors"
            >
              {t("view")}
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={() => onDelete(product.productId)}
              className="text-xs px-3 py-1 rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              {t("delete")}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
