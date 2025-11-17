"use client";

import DeleteProductDialog from "@/components/AllProducts/DeleteProductDialog";
import ProductCard from "@/components/AllProducts/ProductCard";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import SearchFilter from "@/components/Filtering/SearchFilter";
import SelectFilter from "@/components/Filtering/SelectFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TMeta, TResponse } from "@/types";
import { TProduct, TProductsQueryParams } from "@/types/product.type";
import { getCookie } from "@/utils/cookies";
import { deleteData } from "@/utils/requests";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name" },
  { label: "Name (Z-A)", value: "-name" },
  { label: "Price (High to Low)", value: "-pricing.finalPrice" },
  { label: "Price (low to High)", value: "pricing.finalPrice" },
  { label: "Highest Rated", value: "-rating.average" },
  { label: "lowest Rated", value: "rating.average" },
];

export default function Products({
  initialData,
}: {
  initialData: { data: TProduct[]; meta?: TMeta };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prevFilters, setPrevFilters] = useState<TProductsQueryParams>({
    status: searchParams?.get("status") || "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: searchParams?.get("status") || "",
  });
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string | null;
    action: "edit" | "delete" | null;
    product?: TProduct | null;
  }>({ id: null, action: null });

  const handleAddFilter = () => {
    if (activeFilters?.status?.length > 0) {
      setPrevFilters((prevQuery) => ({
        ...prevQuery,
        status: activeFilters.status,
      }));
      const params = new URLSearchParams(searchParams.toString());
      params.set("status", activeFilters.status);
      router.push(`?${params.toString()}`);
    }
    setShowFilters(false);
  };

  const removeFilter = (key: "status") => {
    setActiveFilters((prevFilters) => ({
      ...prevFilters,
      [key]: "",
    }));
    setPrevFilters((prevQuery) => ({
      ...prevQuery,
      [key]: "",
    }));
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setActiveFilters({
      status: "",
    });
    setPrevFilters((prevQuery) => ({
      ...prevQuery,
      status: "",
    }));
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
      try {
        const result = (await deleteData(
          `/products/soft-delete/${selectedProduct.id}`,
          {
            headers: {
              authorization: getCookie("accessToken"),
            },
          }
        )) as unknown as TResponse<null>;

        if (result.success) {
          toast.success("Product deleted successfully", { id: toastId });
          // await getProducts(queryParams);
          setSelectedProduct({ id: null, action: null });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Deleting product failed",
          { id: toastId }
        );
        console.log(error);
      }
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="bg-linear-to-r from-[#DC3173] to-[#FF6CAB] p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Food Items
            </h1>
            <p className="text-pink-100 mt-1">
              Manage your restaurant&lsquo;s food delivery catalog
            </p>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start md:items-center justify-between">
          <SearchFilter paramName="searchTerm" placeholder="Searching..." />
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="w-full lg:w-48">
              <SelectFilter
                paramName="sortBy"
                options={sortOptions}
                placeholder="Sort By"
              />
            </div>
            <Button
              variant="outline"
              className={`flex items-center ${
                showFilters ||
                Object.entries(activeFilters)?.filter(
                  (filter) => filter[1] !== ""
                )?.length > 0
                  ? "border-[#DC3173] text-[#DC3173]"
                  : ""
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters{" "}
              {Object.entries(activeFilters)?.filter(
                (filter) => filter[1] !== ""
              )?.length || ""}
            </Button>
          </div>
        </div>
        {Object.entries(activeFilters)?.filter((filter) => filter[1] !== "")
          ?.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeFilters["status"].length > 0 && (
              <Badge
                variant="outline"
                className="text-[#DC3173] border-[#DC3173]"
              >
                {activeFilters["status"]}
                <X
                  className="ml-2 h-4 w-4"
                  onClick={() => removeFilter("status")}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-sm text-[#DC3173] hover:text-[#DC3173] hover:bg-pink-50"
            >
              <RefreshCcw className="h-3 w-3 mr-1" /> Clear All
            </Button>
          </div>
        )}

        <AnimatePresence>
          {showFilters && (
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
                duration: 0.2,
              }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Availability Status
                    </label>
                    <Select
                      value={prevFilters.status}
                      onValueChange={(value) =>
                        setActiveFilters((prevFilters) => ({
                          ...prevFilters,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        {["In Stock", "Out of Stock", "Limited"].map(
                          (status) => (
                            <SelectItem key={status} value={status || "a"}>
                              {status}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    className="mr-2"
                    onClick={() => setShowFilters(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddFilter}>Apply Filters</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {initialData.data?.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            {((initialData.meta?.page || 1) - 1) *
              (initialData.meta?.limit || 10) +
              1}
            -{(initialData.meta?.page || 1) * (initialData.meta?.limit || 10)}{" "}
            of {initialData.meta?.total || 0} items
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
          <h3 className="text-xl font-medium mb-2">No items found</h3>
          <p className="text-gray-500 max-w-md">
            No items match your current filters. Try adjusting your search or
            filters to find what you&lsquo;re looking for.
          </p>
          <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </motion.div>
      )}
      {/* Pagination */}
      {initialData?.data?.length > 0 && (
        <div className="mt-8">
          <PaginationComponent
            totalPages={initialData.meta?.totalPage || 1}
            itemsNoArray={[10, 20, 50, 100]}
          />
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
