"use client";

import { Button } from "@/components/ui/button";
import { TProduct } from "@/types/product.type";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  BellRing,
  ChevronDown,
  ChevronUp,
  Layers,
  RefreshCw,
  ShoppingBag,
  Store,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ProductAlertCard({ product }: { product: TProduct }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getProductAlertLevel = (
    product: TProduct,
  ): "Critical" | "Low" | "Normal" => {
    if (product.stock.hasVariations) {
      const allOptions = product.variations.flatMap((v) => v.options);
      if (allOptions.some((o) => o.stockQuantity === 0 || o.isOutOfStock))
        return "Critical";
      if (allOptions.some((o) => o.stockQuantity <= 10)) return "Low";
      return "Normal";
    } else {
      if (
        product.stock.quantity === 0 ||
        product.stock.availabilityStatus === "Out of Stock"
      )
        return "Critical";
      if (
        product.stock.quantity <= 10 ||
        product.stock.availabilityStatus === "Limited"
      )
        return "Low";
      return "Normal";
    }
  };

  const alertBadge = (level: "Critical" | "Low" | "Normal") => {
    if (level === "Critical") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          <AlertCircle size={12} /> Critical (0 Stock)
        </span>
      );
    }
    if (level === "Low") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
          <AlertTriangle size={12} /> Low Stock (≤10)
        </span>
      );
    }
    return null;
  };

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Image */}
        <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-3xl shrink-0 border border-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              width={64}
              height={64}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {product.name}
            </h3>
            {alertBadge(getProductAlertLevel(product))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
              {product.category.name}
            </span>
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <Store size={12} />{" "}
              {product.vendorId.businessDetails.businessName}
            </span>
          </div>

          {/* Stock Display (No Variations) */}
          {!product.stock.hasVariations && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 font-medium">Current Stock</span>
                <span
                  className={`font-bold ${product.stock.quantity === 0 ? "text-red-600" : "text-amber-600"}`}
                >
                  {product.stock.quantity} {product.stock.unit}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${product.stock.quantity === 0 ? "bg-red-500" : "bg-amber-500"}`}
                  style={{
                    width: `${Math.min((product.stock.quantity / 10) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Variations Toggle */}
          {product.stock.hasVariations && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#DC3173] hover:text-[#DC3173]/80 transition-colors"
            >
              <Layers size={16} />
              View Variation Stock
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Variations Section */}
      <AnimatePresence>
        {isExpanded && product.stock.hasVariations && (
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
            className="border-t border-gray-100 bg-gray-50/50"
          >
            <div className="p-5 space-y-4">
              {product.variations.map((variation, vIdx) => (
                <div
                  key={vIdx}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    {variation.name}
                  </h4>
                  <div className="space-y-2">
                    {variation.options.map((option, oIdx) => {
                      const isCritical =
                        option.stockQuantity === 0 || option.isOutOfStock;
                      const isLow =
                        option.stockQuantity > 0 && option.stockQuantity <= 10;
                      return (
                        <div
                          key={oIdx}
                          className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-700">
                              {option.label}
                            </span>
                            <span className="text-xs font-mono text-gray-400">
                              {option.sku}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`font-bold ${isCritical ? "text-red-600" : isLow ? "text-amber-600" : "text-green-600"}`}
                            >
                              {option.stockQuantity} in stock
                            </span>
                            {isCritical && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-gray-100 p-4 bg-gray-50/30 flex items-center justify-between">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <RefreshCw size={12} /> Last updated:{" "}
          {format(product.updatedAt, "do MMM yyyy")}
        </span>
        <div>
          <Button className="bg-[#DC3173] text-white hover:bg-[#DC3173]/90 transition-colors shadow-sm shadow-[#DC3173]/20 flex items-center gap-2">
            <BellRing size={14} /> Notify Vendor
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
