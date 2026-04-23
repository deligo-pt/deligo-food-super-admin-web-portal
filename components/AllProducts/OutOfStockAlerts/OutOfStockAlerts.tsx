"use client";

import ProductAlertCard from "@/components/AllProducts/OutOfStockAlerts/ProductAlertCard";
import AllFilters from "@/components/Filtering/AllFilters";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TProduct } from "@/types/product.type";
import { AnimatePresence } from "framer-motion";
import { PackageX } from "lucide-react";

interface IProps {
  productsData: { data: TProduct[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function OutOfStockAlerts({ productsData }: IProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <TitleHeader
        title="Out of Stock Alerts"
        subtitle="Monitor products and variations that require immediate restocking"
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {productsData.data.map((product) => (
            <ProductAlertCard key={product._id} product={product} />
          ))}
        </AnimatePresence>

        {productsData.meta?.total === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="inline-flex p-4 bg-green-50 rounded-full text-green-500 mb-3">
              <PackageX size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              All caught up!
            </h3>
            <p className="text-gray-500">
              No products match your current alert filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
