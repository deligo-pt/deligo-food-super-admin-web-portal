"use client";

import DeleteProductDialog from "@/components/AllProducts/DeleteProductDialog";
import ProductCard from "@/components/AllProducts/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
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
import { deleteData, fetchData } from "@/utils/requests";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const sortOptions = {
  "-createdAt": "Newest First",
  createdAt: "Oldest First",
  name: "Name (A-Z)",
  "-name": "Name (Z-A)",
  "-pricing.finalPrice": "Price (High to Low)",
  "pricing.finalPrice": "Price (Low to High)",
  "-rating.average": "Highest Rated",
  "rating.average": "Lowest Rated",
};

export default function Products() {
  const router = useRouter();
  const [productsResult, setProductsResult] = useState<{
    data: TProduct[];
    meta?: TMeta;
  }>({ data: [] });
  const [queryParams, setQueryParams] = useState<TProductsQueryParams>({
    limit: 10,
    page: 1,
    searchTerm: "",
    sortBy: "-createdAt",
    "stock.availabilityStatus": "",
    category: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    "stock.availabilityStatus": "",
    category: "",
  });
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string | null;
    action: "edit" | "delete" | null;
    product?: TProduct | null;
  }>({ id: null, action: null });

  async function getProducts(queries?: TProductsQueryParams) {
    try {
      let params: Partial<TProductsQueryParams> = {};

      console.log(queries);
      if (queries) {
        queries = Object.fromEntries(
          Object.entries(queries).filter((q) => !!q?.[1])
        );
        console.log(queries);
      } else {
        params = Object.fromEntries(
          Object.entries(queryParams).filter((q) => !!q?.[1])
        );
      }

      const result = (await fetchData("/products", {
        params,
        headers: {
          authorization: getCookie("accessToken"),
        },
      })) as unknown as TResponse<TProduct[]>;

      if (result.success) {
        console.log(result.data);

        setProductsResult({
          data: result.data,
          meta: result.meta,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleSearch = (value: string) => {
    setQueryParams((prevQuery) => ({ ...prevQuery, searchTerm: value }));
    getProducts({
      ...queryParams,
      searchTerm: value,
    });
  };

  const handleSort = (value: string) => {
    setQueryParams((prevQuery) => ({ ...prevQuery, sortBy: value }));
    getProducts({
      ...queryParams,
      sortBy: value,
    });
  };

  const handleAddFilter = () => {
    if (activeFilters["stock.availabilityStatus"].length > 0) {
      setQueryParams((prevQuery) => ({
        ...prevQuery,
        status: queryParams["stock.availabilityStatus"],
      }));
    }
    if (activeFilters.category.length > 0) {
      setQueryParams((prevQuery) => ({
        ...prevQuery,
        category: queryParams.category,
      }));
    }
    getProducts({
      ...queryParams,
      "stock.availabilityStatus": queryParams["stock.availabilityStatus"],
      category: queryParams.category,
    });
    setShowFilters(false);
  };

  const removeFilter = (key: "stock.availabilityStatus" | "category") => {
    setActiveFilters((prevFilters) => ({
      ...prevFilters,
      [key]: "",
    }));
    setQueryParams((prevQuery) => ({
      ...prevQuery,
      [key]: "",
    }));
    getProducts({
      ...queryParams,
      [key]: "",
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      "stock.availabilityStatus": "",
      category: "",
    });
    setQueryParams((prevQuery) => ({
      ...prevQuery,
      "stock.availabilityStatus": "",
      category: "",
    }));
    getProducts({
      ...queryParams,
      "stock.availabilityStatus": "",
      category: "",
    });
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
          await getProducts(queryParams);
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

  useEffect(() => {
    (() => getProducts())();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              value={queryParams.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="w-full lg:w-48">
              <Select
                value={queryParams.sortBy}
                onValueChange={(value) => handleSort(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sortOptions).map(([key, option]) => (
                    <SelectItem key={key} value={key}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {activeFilters["stock.availabilityStatus"].length > 0 && (
              <Badge
                variant="outline"
                className="text-[#DC3173] border-[#DC3173]"
              >
                {activeFilters["stock.availabilityStatus"]}
                <X
                  className="ml-2 h-4 w-4"
                  onClick={() => removeFilter("stock.availabilityStatus")}
                />
              </Badge>
            )}
            {activeFilters.category.length > 0 && (
              <Badge
                variant="outline"
                className="text-[#DC3173] border-[#DC3173]"
              >
                {activeFilters.category}
                <X
                  className="ml-2 h-4 w-4"
                  onClick={() => removeFilter("category")}
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
                      value={queryParams["stock.availabilityStatus"]}
                      onValueChange={(value) =>
                        setActiveFilters((prevFilters) => ({
                          ...prevFilters,
                          "stock.availabilityStatus": value,
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
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <Select
                      value={queryParams.category}
                      onValueChange={(value) =>
                        setActiveFilters((prevFilters) => ({
                          ...prevFilters,
                          isEmailVerified: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="not-verified">
                          Not Verified
                        </SelectItem>
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

      {productsResult.data?.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            {((productsResult.meta?.page || 1) - 1) *
              (productsResult.meta?.limit || 10) +
              1}
            -
            {(productsResult.meta?.page || 1) *
              (productsResult.meta?.limit || 10)}{" "}
            of {productsResult.meta?.total || 0} items
          </p>
        </div>
      )}

      {productsResult?.data?.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {productsResult?.data?.map((product) => (
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
            No delivery items match your current filters. Try adjusting your
            search or filters to find what you&lsquo;re looking for.
          </p>
          <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </motion.div>
      )}
      {/* Pagination */}
      {productsResult?.data?.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination />
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
