"use client";

import DeleteProductDialog from "@/components/AllProducts/DeleteProductDialog";
import ProductCard from "@/components/AllProducts/ProductCard";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { Button } from "@/components/ui/button";
import { deleteProductReq } from "@/services/dashboard/product/product";
import { TMeta } from "@/types";
import { TProduct } from "@/types/product.type";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import AllFilters from "../Filtering/AllFilters";
import { useTranslation } from "@/hooks/use-translation";


export default function Products({
  initialData,
}: {
  initialData: { data: TProduct[]; meta?: TMeta };
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string | null;
    action: "edit" | "delete" | null;
    product?: TProduct | null;
  }>({ id: null, action: null });

  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
    { label: t("name_a_z"), value: "name" },
    { label: t("name_z_a"), value: "-name" },
    { label: t("price_high_low"), value: "-pricing.finalPrice" },
    { label: t("price_low_high"), value: "pricing.finalPrice" },
    { label: t("highest_rated"), value: "-rating.average" },
    { label: t("lowest_rated"), value: "rating.average" },
  ];

  const filterOptions = [
    {
      label: t("availability_status"),
      key: "status",
      placeholder: t("select_status"),
      type: "select",
      items: [
        {
          label: t("in_stock"),
          value: "In Stock",
        },
        {
          label: t("out_of_stock"),
          value: "Out of Stock",
        },
        {
          label: t("limited"),
          value: "Limited",
        },
      ],
    },
  ];

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    router.push(`?${params.toString()}`);
  };

  const openDeleteDialog = (id: string) => {
    setSelectedProduct({ id, action: "delete" });
  };

  const handleDeleteProduct = async () => {
    const toastId = toast.loading("Deleting product...");

    if (selectedProduct.id && selectedProduct.action === "delete") {
      const result = await deleteProductReq(selectedProduct.id);

      if (result.success) {
        toast.success("Product deleted successfully", { id: toastId });
        router.refresh();
        setSelectedProduct({ id: null, action: null });
        return;
      }

      toast.error(result?.message || "Product delete failed", {
        id: toastId,
      });
      console.log(result);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-linear-to-r from-[#DC3173] to-[#FF6CAB] p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {t("food_items")}
            </h1>
            <p className="text-pink-100 mt-1">
              {t("manage_restaurant_food_delivery_catalog")}
            </p>
          </div>
        </div>
      </div>

      <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

      {initialData.data?.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            {t("showing")}{" "}
            {((initialData.meta?.page || 1) - 1) *
              (initialData.meta?.limit || 10) +
              1}
            -{" "}
            {Math.min(
              (initialData.meta?.page || 1) * (initialData.meta?.limit || 10),
              initialData.meta?.total || 0,
            )}{" "}
            {t("of")} {initialData.meta?.total || 0} {t("items")}
          </p>
        </div>
      )}

      {initialData?.data?.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {initialData?.data?.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                onDelete={openDeleteDialog}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">{t("no_items_found")}</h3>
          <p className="text-gray-500 max-w-md">
            {t("no_items_match_current_filters")}
          </p>
          <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
            {t("clear_all_filters")}
          </Button>
        </motion.div>
      )}

      {/* Pagination */}
      {!!initialData?.meta?.total && initialData?.meta?.total > 0 && (
        <div className="pb-4 my-3">
          <PaginationComponent totalPages={initialData?.meta?.totalPage || 0} />
        </div>
      )}

      <DeleteProductDialog
        open={!!selectedProduct.id && selectedProduct.action === "delete"}
        onOpenChange={() =>
          setSelectedProduct({ id: null, action: null, product: null })
        }
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
}
