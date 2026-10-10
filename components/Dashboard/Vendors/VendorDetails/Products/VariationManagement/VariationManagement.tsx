"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AllFilters from "@/components/Filtering/AllFilters";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { getAllProducts } from "@/services/dashboard/product/product.service";
import { TMeta } from "@/types";
import { TProduct } from "@/types/product.type";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, Loader2, ChevronDown, Package, Tag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ProductVariationCard from "./ProductVariationCard";

interface IProps {
  productsData: { data: TProduct[]; meta?: TMeta };
  businessTypeSlug: string;
  vendorMongoId: string;
  vendorId: string;
}

const PAGE_LIMIT = 30; // change to 20 / 30 later

export default function VariationManagement({
  productsData,
  businessTypeSlug,
  vendorMongoId,
  vendorId,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<TProduct[]>(productsData.data || []);
  const [page, setPage] = useState(productsData.meta?.page || 1);
  const [hasMore, setHasMore] = useState(
    (productsData.meta?.page || 1) < (productsData.meta?.totalPage || 1)
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(productsData.meta?.total || 0);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);

  // Sync when server data changes (filters / sort)
  useEffect(() => {
    setProducts(productsData.data || []);
    setPage(productsData.meta?.page || 1);
    setHasMore(
      (productsData.meta?.page || 1) < (productsData.meta?.totalPage || 1)
    );
    setTotalCount(productsData.meta?.total || 0);
  }, [productsData]);

  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
    { label: t("name_a_to_z"), value: "name" },
    { label: t("name_z_to_a"), value: "-name" },
    { label: t("price_high_to_low"), value: "-pricing.finalPrice" },
    { label: t("price_low_to_high"), value: "pricing.finalPrice" },
    { label: t("highest_rated"), value: "-rating.average" },
    { label: t("lowest_rated"), value: "rating.average" },
  ];

  const filterOptions = [
    {
      label: t("availability_status"),
      key: "status",
      placeholder: "Select a status",
      type: "select",
      items: [
        { label: t("in_stock"), value: t("in_stock") },
        { label: t("out_of_stock"), value: t("out_of_stock") },
        { label: t("limited"), value: t("limited") },
      ],
    },
  ];

  const totalVariations = useMemo(
    () =>
      products.reduce((sum, p) => sum + (p?.variations?.length || 0), 0),
    [products]
  );

  const totalOptions = useMemo(
    () =>
      products.reduce((sum, p) => {
        const variationsList = p?.variations || [];
        const productOptionsCount = variationsList.reduce(
          (s, v) => s + (v?.options?.length || 0),
          0
        );
        return sum + productOptionsCount;
      }, 0),
    [products]
  );

  // Load next page
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPage));
      params.set("limit", String(PAGE_LIMIT));
      params.set("vendorId", vendorMongoId);

      const result = await getAllProducts(params.toString());

      const newProducts: TProduct[] = Array.isArray(result?.data)
        ? result.data
        : result?.data?.data || [];

      const newMeta: TMeta | undefined = result?.meta || result?.data?.meta;

      if (newProducts.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => String(p._id)));
          const filtered = newProducts.filter(
            (p) => !existingIds.has(String(p._id))
          );
          return [...prev, ...filtered];
        });

        setPage(nextPage);

        if (newMeta) {
          setTotalCount(newMeta.total || totalCount);
          setHasMore(nextPage < (newMeta.totalPage || 1));
        } else {
          setHasMore(newProducts.length >= PAGE_LIMIT);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load more error:", err);
      toast.error("Failed to load more products");
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    hasMore,
    page,
    vendorMongoId,
    searchParams,
    totalCount,
  ]);

  // Intersection Observer
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: "300px",
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);

  return (
    <div ref={scrollRootRef} className="min-h-screen bg-pink-50/50 pb-20">
      <div className="max-w-full">
        <TitleHeader
          title={t("variation_management")}
          subtitle={t("add_edit_manage_product_variation")}
          onBackClick={() => router.back()}
          extraComponent={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white flex items-center gap-2">
                  {t("actions") || "Actions"}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white shadow-lg border rounded-lg p-1"
              >
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/vendor/${vendorId}/manage-products`)
                  }
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  {t("manage_products") || "Manage Product"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/vendor/${vendorId}/add-product`)
                  }
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  {/* <Plus className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
                  {t("add_product") || "Add Product"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/admin/vendor/${vendorId}/products/update-discount`
                    )
                  }
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  {/* <Percent className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
                  {t("update_discounts") || "Update Discount"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/admin/vendor/${vendorId}/products/increase-price`
                    )
                  }
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  {/* <TrendingUp className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
                  {t("increase_prices") || "Increase Price"}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 border-gray-100" />

                {/* Newly added sections */}
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/admin/vendor/${vendorId}/products/categories`
                    )
                  }
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  {/* <Tag className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
                  {t("product_categories") || "Product Categories"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/admin/vendor/${vendorId}/products/add-ons`
                    )
                  }
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  {/* <Layers className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
                  {t("add_ons") || "Add-ons"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/admin/vendor/${vendorId}/products/offers`
                    )
                  }
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  {/* <Gift className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
                  {t("created_offers") || "Created Offers"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />

        <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-6 mb-8 px-5 py-3.5 bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Package size={16} className="text-[#DC3173]" />
            <span className="text-sm text-gray-500">{t("products")}:</span>
            <span className="text-sm font-bold text-gray-900">
              {totalCount}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-blue-400" />
            <span className="text-sm text-gray-500">{t("variations")}:</span>
            <span className="text-sm font-bold text-gray-900">
              {totalVariations}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-green-400" />
            <span className="text-sm text-gray-500">{t("options")}:</span>
            <span className="text-sm font-bold text-gray-900">
              {totalOptions}
            </span>
          </div>
        </motion.div>

        {/* Product List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
              >
                <ProductVariationCard
                  product={product}
                  businessTypeSlug={
                    businessTypeSlug as "store" | "restaurant"
                  }
                  t={t}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Infinite scroll trigger */}
          <div
            ref={loadMoreRef}
            className="flex justify-center items-center py-8"
          >
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#DC3173]" />
                {t("loading_more") || "Loading more..."}
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <p className="text-sm text-gray-400">
                {t("you_have_reached_the_end") || "You've reached the end"}
              </p>
            )}
          </div>

          {totalCount === 0 && !isLoadingMore && (
            <div className="text-center py-16">
              <div className="inline-flex p-4 bg-white rounded-full text-[#DC3173] mb-3 shadow-sm">
                <Package size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {t("no_products_found")}
              </h3>
              <p className="text-gray-500 mt-1">
                {t("try_adjusting_your_search_or_filter")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}