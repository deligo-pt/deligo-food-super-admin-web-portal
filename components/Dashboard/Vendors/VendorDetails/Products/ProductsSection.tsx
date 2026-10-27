"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Loader2,
  CheckSquare,
  X,
  Copy,
} from "lucide-react";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import {
  deleteProduct,
  getAllProducts,
  permanentDeleteProduct,
} from "@/services/dashboard/product/product.service";
import { TMeta } from "@/types";
import { TProductCategoryResponse } from "@/types/category.type";
import { TProduct } from "@/types/product.type";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import EditProductDialog from "./EditProductDialog";
import DeleteProductDialog from "./DeleteProductDialog";
import ProductCard from "@/components/AllProducts/ProductCard";
import { useRouter, useSearchParams } from "next/navigation";
import AllFilters from "@/components/Filtering/AllFilters";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import {
  copyProductsToSubVendors,
  getAllBranches,
} from "@/services/dashboard/vendor/vendor.service";
import { queryStringFormatter } from "@/utils/formatter";
import CopyToBranchModal from "./CopyToBranchModal";

interface IProps {
  productsData: { data: TProduct[]; meta?: TMeta };
  businessTypeSlug: string;
  productCategories: TProductCategoryResponse[];
  vendorMongoId: string;
  vendorId: string;
}

const sortFields = ["alphaNameAZ", "alphaNameZA"] as SortOptionKey[];

type Branch = {
  _id?: string;
  userId?: string;
  businessDetails?: {
    businessName?: string;
  };
  name?: string;
};

export default function ProductsSection({
  productsData,
  businessTypeSlug,
  productCategories,
  vendorMongoId,
  vendorId,
}: IProps) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const sortOptions = getSortOptions(t, sortFields);
  const searchParams = useSearchParams();

  // ── products / pagination ──────────────────────────────────────
  const [products, setProducts] = useState<TProduct[]>(productsData.data || []);
  const [meta, setMeta] = useState<TMeta | undefined>(productsData.meta);
  const [page, setPage] = useState(productsData.meta?.page || 1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(
    (productsData.meta?.page || 1) < (productsData.meta?.totalPage || 1)
  );
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string | null;
    action: "edit" | "delete" | null;
    product?: TProduct | null;
    type?: string;
  }>({ id: null, action: null });

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isClickScrolling = useRef(false);

  // ── selection mode ─────────────────────────────────────────────
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectAllLoading, setIsSelectAllLoading] = useState(false);
  const [selectAllMode, setSelectAllMode] = useState(false);

  // ── copy modal ─────────────────────────────────────────────────
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // ── helpers ────────────────────────────────────────────────────
  const getId = (p: TProduct) => String(p.productId);

  const currentSort =
    searchParams.get("sort") ||
    searchParams.get("sortBy") ||
    searchParams.get("sortOption") ||
    "";

  const getProductName = (product: TProduct) => {
    const name = product.name;
    if (!name) return "";
    if (typeof name === "object") {
      return (
        (name as Record<string, string>)[lang] ||
        (name as Record<string, string>).en ||
        (name as Record<string, string>).pt ||
        ""
      );
    }
    return String(name);
  };

  const visibleProducts = useMemo(() => {
    let list = products.filter((product) => {
      const productId = getId(product);
      return !deletedProductIds.includes(productId);
    });

    if (currentSort === "name" || currentSort === "-name") {
      const direction = currentSort === "name" ? 1 : -1;
      list = [...list].sort((a, b) => {
        const nameA = getProductName(a);
        const nameB = getProductName(b);
        return (
          nameA.localeCompare(nameB, lang, {
            sensitivity: "base",
            numeric: true,
          }) * direction
        );
      });
    }
    return list;
  }, [products, deletedProductIds, currentSort, lang]);

  // ── group by category ──────────────────────────────────────────
  const groupedProducts = useMemo(() => {
    const groups: Record<
      string,
      { category: TProductCategoryResponse | null; products: TProduct[] }
    > = {};

    productCategories.forEach((cat) => {
      groups[cat._id] = { category: cat, products: [] };
    });
    groups["uncategorized"] = { category: null, products: [] };

    const getAllCategoryIds = (product: TProduct): string[] => {
      const ids = new Set<string>();
      if (product.category?._id) ids.add(String(product.category._id));
      const extra = product.additionalCategories || [];
      if (Array.isArray(extra)) {
        extra.forEach((cat) => {
          const id = typeof cat === "string" ? cat : cat?._id;
          if (id) ids.add(String(id));
        });
      }
      return Array.from(ids);
    };

    visibleProducts.forEach((product) => {
      const categoryIds = getAllCategoryIds(product);
      if (categoryIds.length === 0) {
        groups["uncategorized"].products.push(product);
        return;
      }
      let placed = false;
      categoryIds.forEach((catId) => {
        if (groups[catId]) {
          const exists = groups[catId].products.some(
            (p) => getId(p) === getId(product)
          );
          if (!exists) {
            groups[catId].products.push(product);
            placed = true;
          }
        }
      });
      if (!placed) {
        const exists = groups["uncategorized"].products.some(
          (p) => getId(p) === getId(product)
        );
        if (!exists) groups["uncategorized"].products.push(product);
      }
    });

    // keep empty uncategorized only while still loading
    if (groups["uncategorized"].products.length === 0 && !hasMore) {
      delete groups["uncategorized"];
    }

    let result = Object.values(groups);

    if (currentSort === "name" || currentSort === "-name") {
      const direction = currentSort === "name" ? 1 : -1;
      result = [...result].sort((a, b) => {
        const nameA = a.category
          ? a.category.name?.[lang] ||
          a.category.name?.en ||
          a.category.name?.pt ||
          ""
          : t("uncategorized") || "Uncategorized";
        const nameB = b.category
          ? b.category.name?.[lang] ||
          b.category.name?.en ||
          b.category.name?.pt ||
          ""
          : t("uncategorized") || "Uncategorized";
        return (
          nameA.localeCompare(nameB, lang, {
            sensitivity: "base",
            numeric: true,
          }) * direction
        );
      });
    }
    return result;
  }, [visibleProducts, productCategories, currentSort, lang, t, hasMore]);

  const effectiveActiveCategoryId =
    activeCategoryId ||
    groupedProducts[0]?.category?._id ||
    "uncategorized";

  const getCategoryName = (category: TProductCategoryResponse | null) => {
    if (!category) return t("uncategorized") || "Uncategorized";
    return category.name?.[lang] || "Unnamed";
  };

  // ── progressive auto-load ──────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return false;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPage));
      params.set("limit", "30");
      params.set("vendorId", vendorMongoId);

      if (
        !params.get("sortBy") &&
        !params.get("sort") &&
        !params.get("sortOption")
      ) {
        params.set("sortBy", "name");
      }

      const result = await getAllProducts(params.toString());
      const newProducts: TProduct[] = Array.isArray(result?.data)
        ? result.data
        : result?.data?.data || [];
      const newMeta: TMeta | undefined = result?.meta || result?.data?.meta;

      if (newProducts.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => getId(p)));
          const filtered = newProducts.filter(
            (p) => !existingIds.has(getId(p))
          );
          return [...prev, ...filtered];
        });
        setPage(nextPage);

        if (newMeta) {
          setMeta(newMeta);
          setHasMore(nextPage < (newMeta.totalPage || 1));
        } else {
          setHasMore(newProducts.length >= 30);
        }
        return true;
      } else {
        setHasMore(false);
        return false;
      }
    } catch (err) {
      console.error("Load more error:", err);
      toast.error("Failed to load more products");
      return false;
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, vendorMongoId, searchParams]);

  // Auto-fetch next page every 1200ms until everything is loaded
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const timer = setTimeout(() => {
      loadMore();
    }, 1200);

    return () => clearTimeout(timer);
  }, [hasMore, isLoadingMore, page, loadMore]);

  // Reset when server data / filters change
  useEffect(() => {
    setProducts(productsData.data || []);
    setMeta(productsData.meta);
    setPage(productsData.meta?.page || 1);
    setHasMore(
      (productsData.meta?.page || 1) < (productsData.meta?.totalPage || 1)
    );
    setDeletedProductIds([]);
  }, [productsData]);

  // Default sortBy = name (ascending)
  useEffect(() => {
    const sort =
      searchParams.get("sort") ||
      searchParams.get("sortBy") ||
      searchParams.get("sortOption");

    if (!sort) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sortBy", "name");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  // ── selection helpers ──────────────────────────────────────────
  const enterSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedIds(new Set());
    setSelectAllMode(false);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    setSelectAllMode(false);
  };

  const toggleProduct = (id: string) => {
    setSelectAllMode(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllMode(false);
  };

  const selectAllProducts = async () => {
    setIsSelectAllLoading(true);
    try {
      const allIds = new Set<string>();
      let currentPage = 1;
      let totalPages = 1;

      do {
        const params = new URLSearchParams();
        params.set("vendorId", vendorMongoId);
        params.set("page", String(currentPage));
        params.set("limit", "100");
        params.set("sortBy", "name");

        const result = await getAllProducts(params.toString());
        const list: TProduct[] = Array.isArray(result?.data)
          ? result.data
          : result?.data?.data || [];
        const newMeta: TMeta | undefined = result?.meta || result?.data?.meta;

        list.forEach((p) => allIds.add(getId(p)));
        totalPages = newMeta?.totalPage || 1;
        currentPage++;
      } while (currentPage <= totalPages);

      setSelectedIds(allIds);
      setSelectAllMode(true);
      toast.success(`${allIds.size} products selected`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to select all products");
    } finally {
      setIsSelectAllLoading(false);
    }
  };

  // ── copy modal ─────────────────────────────────────────────────
  const openCopyModal = async () => {
    if (selectedIds.size === 0) return;
    setIsCopyModalOpen(true);
    setSelectedBranchIds(new Set());
    setIsLoadingBranches(true);
    try {
      const query = queryStringFormatter({
        status: ["APPROVED", "SUBMITTED"],
      });
      const res = await getAllBranches(vendorId, query);
      const list: Branch[] = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];
      setBranches(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load branches");
      setBranches([]);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const toggleBranch = (id: string) => {
    setSelectedBranchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = async () => {
    if (selectedBranchIds.size === 0) {
      toast.error("Please select at least one branch");
      return;
    }

    setIsCopying(true);
    const toastId = toast.loading("Copying products...");

    try {
      const payload: {
        sourceVendorId: string;
        productIds?: string[];
        targetSubVendorIds?: string[];
        copyAllProducts?: boolean;
        copyToAllTargetSubVendors?: boolean;
      } = {
        sourceVendorId: vendorMongoId,
      };

      if (selectAllMode) {
        payload.copyAllProducts = true;
      } else {
        payload.productIds = Array.from(selectedIds);
      }

      if (selectedBranchIds.size === branches.length && branches.length > 0) {
        payload.copyToAllTargetSubVendors = true;
      } else {
        payload.targetSubVendorIds = Array.from(selectedBranchIds);
      }

      const result = await copyProductsToSubVendors(payload);

      if (result?.success !== false) {
        toast.success(result?.message || "Products copied successfully", {
          id: toastId,
        });
        setIsCopyModalOpen(false);
        exitSelectionMode();
      } else {
        toast.error(result?.message || "Copy failed", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Copy failed", { id: toastId });
    } finally {
      setIsCopying(false);
    }
  };

  // ── delete / edit ──────────────────────────────────────────────
  const openDeleteDialog = (id: string, type: string) =>
    setSelectedProduct({ id, action: "delete", type });

  const onEditClick = (product: TProduct) =>
    setSelectedProduct({
      id: product._id as string,
      action: "edit",
      product,
    });

  const handleDeleteProduct = async () => {
    const toastId = toast.loading("Deleting product...");
    if (selectedProduct.id && selectedProduct.action === "delete") {
      const result = await deleteProduct(selectedProduct.id);
      if (result.success) {
        setDeletedProductIds((prev) =>
          prev.includes(selectedProduct.id as string)
            ? prev
            : [...prev, selectedProduct.id as string]
        );
        toast.success("Product deleted successfully", { id: toastId });
        setSelectedProduct({ id: null, action: null, type: undefined });
        return;
      }
      toast.error(result.message || "Product deletion failed", {
        id: toastId,
      });
    }
  };

  const handlePermanentDeleteProduct = async () => {
    const toastId = toast.loading("Deleting product...");
    if (selectedProduct.id && selectedProduct.action === "delete") {
      const result = await permanentDeleteProduct(selectedProduct.id);
      if (result.success) {
        setDeletedProductIds((prev) =>
          prev.includes(selectedProduct.id as string)
            ? prev
            : [...prev, selectedProduct.id as string]
        );
        toast.success("Product deleted successfully", { id: toastId });
        setSelectedProduct({ id: null, action: null, type: undefined });
        return;
      }
      toast.error(result.message || "Product deletion failed", {
        id: toastId,
      });
    }
  };

  const handleProductUpdated = (updatedProduct: TProduct) => {
    setProducts((prev) =>
      prev.map((p) =>
        getId(p) === getId(updatedProduct) ? { ...p, ...updatedProduct } : p
      )
    );
  };

  // ── scroll spy ─────────────────────────────────────────────────
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace("category-", "");
          setActiveCategoryId(id);
        }
      },
      {
        root: container,
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [groupedProducts]);

  const scrollToCategory = (id: string) => {
    setActiveCategoryId(id);
    const target = sectionRefs.current[id];
    if (!target || !scrollContainerRef.current) return;
    isClickScrolling.current = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  const totalProducts = meta?.total ?? products.length;

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] overflow-hidden">
      <TitleHeader
        title={t("food_items")}
        subtitle={t("manage_your_restaurants_food_delivery_items")}
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
                  router.push(`/admin/vendor/${vendorId}/add-product`)
                }
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
              >
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
                {t("increase_prices") || "Increase Price"}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/admin/vendor/${vendorId}/products/offers/create-new`
                  )
                }
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
              >
                {t("create_new_offer") || "Create New Offer"}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-gray-100" />

              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/vendor/${vendorId}/products/categories`)
                }
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
              >
                {t("product_categories") || "Product Categories"}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/vendor/${vendorId}/products/add-ons`)
                }
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
              >
                {t("add_ons") || "Add-ons"}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/admin/vendor/${vendorId}/products/variation-management`
                  )
                }
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
              >
                {t("variation_management") || "Variation Management"}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/vendor/${vendorId}/products/offers`)
                }
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
              >
                {t("created_offers") || "Created Offers"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <AllFilters sortOptions={sortOptions} />

      {/* Selection toolbar */}
      <div className="flex items-center justify-between gap-3 px-1 py-2">
        {isSelectionMode ? (
          <>
            <div className="flex items-center gap-2 text-sm text-[#DC3173] font-medium">
              <span className="bg-[#DC3173]/10 px-3 py-1 rounded-full">
                {selectedIds.size} {t("selected") || "selected"}
              </span>
              <span className="text-gray-400 text-xs">
                / {totalProducts} {t("products") || "products"}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllProducts}
                disabled={isSelectAllLoading}
                className="border-gray-200"
              >
                {isSelectAllLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <CheckSquare className="w-4 h-4 mr-1.5" />
                )}
                {t("all_products") || "All products"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                disabled={selectedIds.size === 0}
                className="border-gray-200"
              >
                {t("clear") || "Clear"}
              </Button>

              <Button
                size="sm"
                onClick={openCopyModal}
                disabled={selectedIds.size === 0}
                className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white"
              >
                <Copy className="w-4 h-4 mr-1.5" />
                {t("copy_to_branch") || "Copy to Branch"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={exitSelectionMode}
                className="border-gray-200 text-gray-600"
              >
                <X className="w-4 h-4 mr-1" />
                {t("cancel") || "Cancel"}
              </Button>
            </div>
          </>
        ) : (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {totalProducts} {t("products") || "products"}
              {hasMore && (
                <Loader2 className="inline w-3.5 h-3.5 ml-1.5 animate-spin text-[#DC3173]" />
              )}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={enterSelectionMode}
              className="border-gray-200"
            >
              <CheckSquare className="w-4 h-4 mr-1.5" />
              {t("select") || "Select"}
            </Button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 gap-2 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 h-full">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full max-h-full overflow-hidden">
            <div className="p-4 border-b border-gray-50 shrink-0 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                {t("product_categories") || "Product categories"}
              </h3>
              {isLoadingMore && (
                <div className="flex items-center gap-1.5 text-xs text-[#DC3173]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
              {groupedProducts.length === 0 ? (
                <p className="text-sm text-gray-400 px-2 py-4 text-center">
                  {t("no_categories") || "No categories"}
                </p>
              ) : (
                groupedProducts.map((group) => {
                  const id = group.category?._id || "uncategorized";
                  const isActive = effectiveActiveCategoryId === id;
                  const count = group.products.length;
                  const showSpinner = hasMore && count === 0;

                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setActiveCategoryId(id);
                        scrollToCategory(id);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                          ? "bg-[#DC3173]/10 text-[#DC3173]"
                          : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <span className="truncate uppercase tracking-wide">
                        {getCategoryName(group.category)}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full shrink-0 min-w-7 text-center ${isActive
                            ? "bg-[#DC3173]/15 text-[#DC3173]"
                            : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {showSpinner ? (
                          <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                        ) : (
                          count
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-w-0 h-full overflow-y-auto space-y-10 pr-1
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
            hover:scrollbar-thumb-gray-400"
        >
          {groupedProducts.some((g) => g.products.length > 0) || hasMore ? (
            <>
              {groupedProducts
                .filter((group) => group.products.length > 0 || hasMore)
                .map((group) => {
                  const id = group.category?._id || "uncategorized";
                  const count = group.products.length;

                  return (
                    <div
                      key={id}
                      id={`category-${id}`}
                      ref={(el) => {
                        sectionRefs.current[id] = el;
                      }}
                      className="rounded-xl"
                    >
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                            {getCategoryName(group.category)}
                          </h2>
                          <span className="text-sm text-gray-500">
                            {hasMore && count === 0 ? (
                              <Loader2 className="h-4 w-4 animate-spin inline text-[#DC3173]" />
                            ) : (
                              <>
                                {count}{" "}
                                {count === 1
                                  ? t("item") || "item"
                                  : t("items") || "items"}
                              </>
                            )}
                          </span>
                        </div>

                        {count > 0 ? (
                          <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-5"
                          >
                            <AnimatePresence mode="popLayout">
                              {group.products.map((product) => {
                                const pid = getId(product);
                                return (
                                  <ProductCard
                                    key={pid}
                                    product={product}
                                    onDelete={openDeleteDialog}
                                    onEdit={onEditClick}
                                    isSelectionMode={isSelectionMode}
                                    isSelected={selectedIds.has(pid)}
                                    onToggleSelect={() => toggleProduct(pid)}
                                  />
                                );
                              })}
                            </AnimatePresence>
                          </motion.div>
                        ) : (
                          hasMore && (
                            <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
                              <Loader2 className="h-4 w-4 animate-spin text-[#DC3173]" />
                              Loading...
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* Bottom status */}
              <div className="flex justify-center items-center py-8">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin text-[#DC3173]" />
                    {t("loading_more") || "Loading more"}...
                  </div>
                )}
                {!hasMore && products.length > 0 && (
                  <p className="text-sm text-gray-400">
                    {t("you_have_reached_the_end") ||
                      "You’ve reached the end"}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center h-full">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                {t("no_items_found")}
              </h3>
              <p className="text-gray-500 max-w-md">
                {t("no_items_match_current_filters")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <DeleteProductDialog
        open={!!selectedProduct.id && selectedProduct.action === "delete"}
        onOpenChange={() =>
          setSelectedProduct({ id: null, action: null, product: null })
        }
        onConfirm={
          selectedProduct?.type === "soft"
            ? handleDeleteProduct
            : handlePermanentDeleteProduct
        }
        t={t}
      />

      <EditProductDialog
        open={!!selectedProduct.id && selectedProduct.action === "edit"}
        onOpenChange={() =>
          setSelectedProduct({ id: null, action: null, product: null })
        }
        prevData={selectedProduct?.product as TProduct}
        businessTypeSlug={businessTypeSlug}
        onSuccess={handleProductUpdated}
        vendorMongoId={vendorMongoId}
      />

      <CopyToBranchModal
        open={isCopyModalOpen}
        onOpenChange={setIsCopyModalOpen}
        branches={branches}
        selectedBranchIds={selectedBranchIds}
        onToggleBranch={toggleBranch}
        onSelectAllBranches={() => {
          const allIds = new Set(
            branches.map((b) => b.userId || b._id || "").filter(Boolean)
          );
          setSelectedBranchIds(allIds);
        }}
        onClearAllBranches={() => setSelectedBranchIds(new Set())}
        onCopy={handleCopy}
        isLoadingBranches={isLoadingBranches}
        isCopying={isCopying}
        t={t}
      />
    </div>
  );
}

// "use client";

// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import { ChevronDown, Loader2 } from "lucide-react";
// import TitleHeader from "@/components/TitleHeader/TitleHeader";
// import { useTranslation } from "@/hooks/use-translation";
// import {
//     deleteProduct,
//     getAllProducts,
//     permanentDeleteProduct
// } from "@/services/dashboard/product/product.service";
// import { TMeta } from "@/types";
// import { TProductCategoryResponse } from "@/types/category.type";
// import { TProduct } from "@/types/product.type";
// import { AnimatePresence, motion } from "framer-motion";
// import { Search } from "lucide-react";
// import { useMemo, useState, useRef, useEffect, useCallback } from "react";
// import { toast } from "sonner";
// import EditProductDialog from "./EditProductDialog";
// import DeleteProductDialog from "./DeleteProductDialog";
// import ProductCard from "@/components/AllProducts/ProductCard";
// import { useRouter, useSearchParams } from "next/navigation";
// import AllFilters from "@/components/Filtering/AllFilters";
// import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";

// interface IProps {
//     productsData: { data: TProduct[]; meta?: TMeta };
//     businessTypeSlug: string;
//     productCategories: TProductCategoryResponse[];
//     vendorMongoId: string;
//     vendorId: string;
// }
// const sortFields = ["alphaNameAZ", "alphaNameZA"] as SortOptionKey[];

// export default function ProductsSection({
//     productsData,
//     businessTypeSlug,
//     productCategories,
//     vendorMongoId,
//     vendorId,
// }: IProps) {
//     const { t, lang } = useTranslation();
//     const router = useRouter();
//     const sortOptions = getSortOptions(t, sortFields);

//     // Infinite scroll state
//     const [products, setProducts] = useState<TProduct[]>(productsData.data || []);
//     const [meta, setMeta] = useState<TMeta | undefined>(productsData.meta);
//     const [page, setPage] = useState(productsData.meta?.page || 1);
//     const [isLoadingMore, setIsLoadingMore] = useState(false);
//     const [hasMore, setHasMore] = useState(
//         (productsData.meta?.page || 1) < (productsData.meta?.totalPage || 1)
//     );

//     const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);
//     const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
//     const [selectedProduct, setSelectedProduct] = useState<{
//         id: string | null;
//         action: "edit" | "delete" | null;
//         product?: TProduct | null;
//         type?: string;
//     }>({ id: null, action: null });

//     const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
//     const scrollContainerRef = useRef<HTMLDivElement | null>(null);
//     const loadMoreRef = useRef<HTMLDivElement | null>(null);
//     const searchParams = useSearchParams();
//     const isClickScrolling = useRef(false); // prevent spy from fighting with click

//     // --- Frontend alphabetical sort (temporary until backend supports PT) ---
//     const currentSort =
//         searchParams.get("sort") ||
//         searchParams.get("sortBy") ||
//         searchParams.get("sortOption") ||
//         "";

//     const getProductName = (product: TProduct) => {
//         const name = product.name;
//         if (!name) return "";
//         // prefer current language, fallback to the other, then empty
//         if (typeof name === "object") {
//             return (name as Record<string, string>)[lang]
//                 || (name as Record<string, string>).en
//                 || (name as Record<string, string>).pt
//                 || "";
//         }
//         return String(name);
//     };

//     const visibleProducts = useMemo(() => {
//         let list = products.filter((product) => {
//             const productId = (product._id || product.productId) as string;
//             return !deletedProductIds.includes(productId);
//         });

//         // Frontend sort by name in current language
//         if (currentSort === "name" || currentSort === "-name") {
//             const direction = currentSort === "name" ? 1 : -1;
//             list = [...list].sort((a, b) => {
//                 const nameA = getProductName(a);
//                 const nameB = getProductName(b);
//                 return nameA.localeCompare(nameB, lang, {
//                     sensitivity: "base",
//                     numeric: true,
//                 }) * direction;
//             });
//         }

//         return list;
//     }, [products, deletedProductIds, currentSort, lang]);

//     // Group by category (main + additional categories)
//     // A product will appear in EVERY category it belongs to
//     const groupedProducts = useMemo(() => {
//         const groups: Record<
//             string,
//             { category: TProductCategoryResponse | null; products: TProduct[] }
//         > = {};

//         // Initialize all known categories
//         productCategories.forEach((cat) => {
//             groups[cat._id] = { category: cat, products: [] };
//         });

//         // Always have a single uncategorized bucket
//         groups["uncategorized"] = { category: null, products: [] };

//         // Helper: collect ALL category IDs a product belongs to
//         const getAllCategoryIds = (product: TProduct): string[] => {
//             const ids = new Set<string>();

//             // Main category
//             if (product.category?._id) {
//                 ids.add(String(product.category._id));
//             }

//             // Additional categories
//             const extra = product.additionalCategories || [];

//             if (Array.isArray(extra)) {
//                 extra.forEach((cat) => {
//                     // cat can be full object or just id
//                     const id = typeof cat === "string" ? cat : cat?._id;
//                     if (id) ids.add(String(id));
//                 });
//             }

//             return Array.from(ids);
//         };

//         // Place each product into ALL its categories
//         visibleProducts.forEach((product) => {
//             const categoryIds = getAllCategoryIds(product);

//             if (categoryIds.length === 0) {
//                 // Truly uncategorized
//                 groups["uncategorized"].products.push(product);
//                 return;
//             }

//             let placedInAtLeastOneKnownCategory = false;

//             categoryIds.forEach((catId) => {
//                 if (groups[catId]) {
//                     // Avoid duplicate inside the same category
//                     const alreadyExists = groups[catId].products.some(
//                         (p) =>
//                             String(p._id || p.productId) ===
//                             String(product._id || product.productId)
//                     );
//                     if (!alreadyExists) {
//                         groups[catId].products.push(product);
//                         placedInAtLeastOneKnownCategory = true;
//                     }
//                 }
//             });

//             // If none of the category IDs exist in the known list → put in uncategorized
//             if (!placedInAtLeastOneKnownCategory) {
//                 const alreadyExists = groups["uncategorized"].products.some(
//                     (p) =>
//                         String(p._id || p.productId) ===
//                         String(product._id || product.productId)
//                 );
//                 if (!alreadyExists) {
//                     groups["uncategorized"].products.push(product);
//                 }
//             }
//         });

//         // Remove empty uncategorized if not needed
//         if (groups["uncategorized"].products.length === 0) {
//             delete groups["uncategorized"];
//         }

//         let result = Object.values(groups);

//         // Frontend sort categories by name
//         if (currentSort === "name" || currentSort === "-name") {
//             const direction = currentSort === "name" ? 1 : -1;

//             result = [...result].sort((a, b) => {
//                 const nameA = a.category
//                     ? a.category.name?.[lang] ||
//                     a.category.name?.en ||
//                     a.category.name?.pt ||
//                     ""
//                     : t("uncategorized") || "Uncategorized";
//                 const nameB = b.category
//                     ? b.category.name?.[lang] ||
//                     b.category.name?.en ||
//                     b.category.name?.pt ||
//                     ""
//                     : t("uncategorized") || "Uncategorized";

//                 return (
//                     nameA.localeCompare(nameB, lang, {
//                         sensitivity: "base",
//                         numeric: true,
//                     }) * direction
//                 );
//             });
//         }

//         return result;
//     }, [visibleProducts, productCategories, currentSort, lang, t]);

//     // Filter out optimistically deleted products
//     // const visibleProducts = useMemo(
//     //     () =>
//     //         products.filter((product) => {
//     //             const productId = (product._id || product.productId) as string;
//     //             return !deletedProductIds.includes(productId);
//     //         }),
//     //     [products, deletedProductIds]
//     // );

//     // Group by category (show ALL categories)
//     // const groupedProducts = useMemo(() => {
//     //     const groups: Record<
//     //         string,
//     //         { category: TProductCategoryResponse | null; products: TProduct[] }
//     //     > = {};

//     //     productCategories.forEach((cat) => {
//     //         groups[cat._id] = { category: cat, products: [] };
//     //     });

//     //     visibleProducts.forEach((product) => {
//     //         const categoryId = product.category?._id;
//     //         if (categoryId && groups[categoryId]) {
//     //             groups[categoryId].products.push(product);
//     //         } else {
//     //             if (!groups["uncategorized"]) {
//     //                 groups["uncategorized"] = { category: null, products: [] };
//     //             }
//     //             groups["uncategorized"].products.push(product);
//     //         }
//     //     });

//     //     return Object.values(groups);
//     // }, [visibleProducts, productCategories]);

//     const effectiveActiveCategoryId =
//         activeCategoryId || groupedProducts[0]?.category?._id || "uncategorized";

//     const getCategoryName = (category: TProductCategoryResponse | null) => {
//         if (!category) return t("uncategorized") || "Uncategorized";
//         return category.name?.[lang] || "Unnamed";
//     };

//     // Load more products
//     const loadMore = useCallback(async () => {
//         if (isLoadingMore || !hasMore) return;

//         setIsLoadingMore(true);
//         try {
//             const nextPage = page + 1;

//             // Keep the same filters/sort that the server used
//             const params = new URLSearchParams(searchParams.toString());
//             params.set("page", String(nextPage));
//             params.set("limit", "30");
//             params.set("vendorId", vendorMongoId);

//             const result = await getAllProducts(params.toString());

//             // Match the same shape you use in page.tsx
//             const newProducts: TProduct[] = Array.isArray(result?.data)
//                 ? result.data
//                 : result?.data?.data || [];

//             const newMeta: TMeta | undefined = result?.meta || result?.data?.meta;

//             if (newProducts.length > 0) {
//                 setProducts((prev) => {
//                     const existingIds = new Set(
//                         prev.map((p) => String(p._id || p.productId))
//                     );
//                     const filtered = newProducts.filter(
//                         (p) => !existingIds.has(String(p._id || p.productId))
//                     );
//                     return [...prev, ...filtered];
//                 });

//                 setPage(nextPage);

//                 if (newMeta) {
//                     setMeta(newMeta);
//                     setHasMore(nextPage < (newMeta.totalPage || 1));
//                 } else {
//                     // fallback: if we got a full page, assume there may be more
//                     setHasMore(newProducts.length >= 5);
//                 }
//             } else {
//                 setHasMore(false);
//             }
//         } catch (err) {
//             console.error("Load more error:", err);
//             toast.error("Failed to load more products");
//         } finally {
//             setIsLoadingMore(false);
//         }
//     }, [isLoadingMore, hasMore, page, vendorMongoId, searchParams]);

//     // Intersection Observer for infinite scroll
//     useEffect(() => {
//         const target = loadMoreRef.current;
//         const root = scrollContainerRef.current;
//         if (!target) return;

//         const observer = new IntersectionObserver(
//             (entries) => {
//                 const [entry] = entries;
//                 if (entry.isIntersecting && hasMore && !isLoadingMore) {
//                     loadMore();
//                 }
//             },
//             {
//                 root: root || null,
//                 rootMargin: "300px",
//                 threshold: 0,
//             }
//         );

//         observer.observe(target);
//         return () => observer.disconnect();
//     }, [loadMore, hasMore, isLoadingMore]);

//     // Delete / Edit handlers (unchanged)
//     const openDeleteDialog = (id: string, type: string) =>
//         setSelectedProduct({ id, action: "delete", type });

//     const onEditClick = (product: TProduct) =>
//         setSelectedProduct({
//             id: product._id as string,
//             action: "edit",
//             product,
//         });

//     const handleDeleteProduct = async () => {
//         const toastId = toast.loading("Deleting product...");
//         if (selectedProduct.id && selectedProduct.action === "delete") {
//             const result = await deleteProduct(selectedProduct.id);
//             if (result.success) {
//                 setDeletedProductIds((prev) =>
//                     prev.includes(selectedProduct.id as string)
//                         ? prev
//                         : [...prev, selectedProduct.id as string]
//                 );
//                 toast.success("Product deleted successfully", { id: toastId });
//                 setSelectedProduct({ id: null, action: null, type: undefined });
//                 return;
//             }
//             toast.error(result.message || "Product deletion failed", { id: toastId });
//         }
//     };

//     const handlePermanentDeleteProduct = async () => {
//         const toastId = toast.loading("Deleting product...");
//         if (selectedProduct.id && selectedProduct.action === "delete") {
//             const result = await permanentDeleteProduct(selectedProduct.id);
//             if (result.success) {
//                 setDeletedProductIds((prev) =>
//                     prev.includes(selectedProduct.id as string)
//                         ? prev
//                         : [...prev, selectedProduct.id as string]
//                 );
//                 toast.success("Product deleted successfully", { id: toastId });
//                 setSelectedProduct({ id: null, action: null, type: undefined });
//                 return;
//             }
//             toast.error(result.message || "Product deletion failed", { id: toastId });
//         }
//     };

//     const handleProductUpdated = (updatedProduct: TProduct) => {
//         setProducts((prev) =>
//             prev.map((p) =>
//                 (p._id || p.productId) === (updatedProduct._id || updatedProduct.productId)
//                     ? { ...p, ...updatedProduct }
//                     : p
//             )
//         );
//     };

//     useEffect(() => {
//         setProducts(productsData.data || []);
//         setMeta(productsData.meta);
//         setPage(productsData.meta?.page || 1);
//         setHasMore(
//             (productsData.meta?.page || 1) < (productsData.meta?.totalPage || 1)
//         );
//         setDeletedProductIds([]);
//     }, [productsData]);

//     /
//     // SCROLL SPY – automatically highlight the category
//     // that is currently in view while scrolling
//     /

//     useEffect(() => {
//         const container = scrollContainerRef.current;
//         if (!container) return;

//         const observer = new IntersectionObserver(
//             (entries) => {
//                 // Ignore while we are programmatically scrolling from a click
//                 if (isClickScrolling.current) return;

//                 // Find the section that is most visible
//                 const visible = entries
//                     .filter((entry) => entry.isIntersecting)
//                     .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

//                 if (visible.length > 0) {
//                     const id = visible[0].target.id.replace("category-", "");
//                     setActiveCategoryId(id);
//                 }
//             },
//             {
//                 root: container,           // observe inside the products scroll container
//                 rootMargin: "-20% 0px -60% 0px", // trigger when section is near the top
//                 threshold: [0, 0.1, 0.25, 0.5],
//             }
//         );

//         // Observe every category section
//         Object.values(sectionRefs.current).forEach((el) => {
//             if (el) observer.observe(el);
//         });

//         return () => observer.disconnect();
//     }, [groupedProducts]);

//     const scrollToCategory = (id: string) => {
//         setActiveCategoryId(id);
//         const target = sectionRefs.current[id];
//         if (!target || !scrollContainerRef.current) return;

//         isClickScrolling.current = true;

//         target.scrollIntoView({ behavior: "smooth", block: "start" });

//         // Re-enable spy after the smooth scroll finishes
//         setTimeout(() => {
//             isClickScrolling.current = false;
//         }, 800);
//     };

//     return (
//         <div className="w-full flex flex-col h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] overflow-hidden">
//             {/* Header */}
//             <TitleHeader
//                 title={t("food_items")}
//                 subtitle={t("manage_your_restaurants_food_delivery_items")}
//                 onBackClick={() => router.back()}
//                 extraComponent={
//                     <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                             <Button className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white flex items-center gap-2">
//                                 {t("actions") || "Actions"}
//                                 <ChevronDown className="w-4 h-4" />
//                             </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent
//                             align="end"
//                             className="w-48 bg-white shadow-lg border rounded-lg p-1"
//                         >
//                             <DropdownMenuItem
//                                 onClick={() =>
//                                     router.push(`/admin/vendor/${vendorId}/add-product`)
//                                 }
//                                 className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
//                             >
//                                 {/* <Plus className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
//                                 {t("add_product") || "Add Product"}
//                             </DropdownMenuItem>

//                             <DropdownMenuItem
//                                 onClick={() =>
//                                     router.push(
//                                         `/admin/vendor/${vendorId}/products/update-discount`
//                                     )
//                                 }
//                                 className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
//                             >
//                                 {/* <Percent className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
//                                 {t("update_discounts") || "Update Discount"}
//                             </DropdownMenuItem>

//                             <DropdownMenuItem
//                                 onClick={() =>
//                                     router.push(
//                                         `/admin/vendor/${vendorId}/products/increase-price`
//                                     )
//                                 }
//                                 className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
//                             >
//                                 {/* <TrendingUp className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
//                                 {t("increase_prices") || "Increase Price"}
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator className="my-1 border-gray-100" />

//                             {/* Newly added sections */}
//                             <DropdownMenuItem
//                                 onClick={() =>
//                                     router.push(
//                                         `/admin/vendor/${vendorId}/products/categories`
//                                     )
//                                 }
//                                 className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
//                             >
//                                 {/* <Tag className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
//                                 {t("product_categories") || "Product Categories"}
//                             </DropdownMenuItem>

//                             <DropdownMenuItem
//                                 onClick={() =>
//                                     router.push(
//                                         `/admin/vendor/${vendorId}/products/add-ons`
//                                     )
//                                 }
//                                 className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
//                             >
//                                 {/* <Layers className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
//                                 {t("add_ons") || "Add-ons"}
//                             </DropdownMenuItem>

//                             <DropdownMenuItem
//                                 onClick={() =>
//                                     router.push(
//                                         `/admin/vendor/${vendorId}/products/variation-management`
//                                     )
//                                 }
//                                 className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
//                             >
//                                 {/* <Layers className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
//                                 {t("variation_management") || "Variation Management"}
//                             </DropdownMenuItem>

//                             <DropdownMenuItem
//                                 onClick={() =>
//                                     router.push(
//                                         `/admin/vendor/${vendorId}/products/offers`
//                                     )
//                                 }
//                                 className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
//                             >
//                                 {/* <Gift className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
//                                 {t("created_offers") || "Created Offers"}
//                             </DropdownMenuItem>
//                         </DropdownMenuContent>
//                     </DropdownMenu>
//                 }
//             />

//             <AllFilters sortOptions={sortOptions} />

//             {/* Main content */}
//             <div className="flex flex-1 min-h-0 gap-2 overflow-hidden">
//                 {/* LEFT SIDEBAR */}
//                 <div className="hidden lg:flex flex-col w-64 shrink-0 h-full">
//                     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full max-h-full overflow-hidden">

//                         {/* Header with loading indicator */}
//                         <div className="p-4 border-b border-gray-50 shrink-0 flex items-center justify-between">
//                             <h3 className="text-sm font-semibold text-gray-800">
//                                 {t("product_categories") || "Product categories"}
//                             </h3>

//                             {/* Spinner when loading more products */}
//                             {isLoadingMore && (
//                                 <div className="flex items-center gap-1.5 text-xs text-[#DC3173]">
//                                     <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                                     <span className="hidden sm:inline">Loading...</span>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
//                             {groupedProducts.length === 0 ? (
//                                 <p className="text-sm text-gray-400 px-2 py-4 text-center">
//                                     {t("no_categories") || "No categories"}
//                                 </p>
//                             ) : (
//                                 groupedProducts.map((group) => {
//                                     const id = group.category?._id || "uncategorized";
//                                     const isActive = effectiveActiveCategoryId === id;
//                                     const count = group.products.length;

//                                     return (
//                                         <button
//                                             key={id}
//                                             onClick={() => {
//                                                 setActiveCategoryId(id);
//                                                 scrollToCategory(id);
//                                             }}
//                                             className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
//                                                 ? "bg-[#DC3173]/10 text-[#DC3173]"
//                                                 : "text-gray-600 hover:bg-gray-50"
//                                                 }`}
//                                         >
//                                             <span className="truncate uppercase tracking-wide">
//                                                 {getCategoryName(group.category)}
//                                             </span>

//                                             <span
//                                                 className={`text-xs px-2 py-0.5 rounded-full shrink-0 min-w-7 text-center ${isActive
//                                                     ? "bg-[#DC3173]/15 text-[#DC3173]"
//                                                     : "bg-gray-100 text-gray-500"
//                                                     }`}
//                                             >
//                                                 {/* Show spinner instead of count while loading more */}
//                                                 {isLoadingMore ? (
//                                                     <Loader2 className="h-3 w-3 animate-spin mx-auto" />
//                                                 ) : (
//                                                     count
//                                                 )}
//                                             </span>
//                                         </button>
//                                     );
//                                 })
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* RIGHT CONTENT – infinite scroll container */}
//                 {/* RIGHT CONTENT */}
//                 <div
//                     ref={scrollContainerRef}
//                     className="flex-1 min-w-0 h-full overflow-y-auto space-y-10 pr-1
//              scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
//              hover:scrollbar-thumb-gray-400"
//                 >
//                     {groupedProducts.some((g) => g.products.length > 0) ? (
//                         <>
//                             {groupedProducts
//                                 .filter((group) => group.products.length > 0)
//                                 .map((group) => {
//                                     const id = group.category?._id || "uncategorized";

//                                     return (
//                                         <div
//                                             key={id}
//                                             id={`category-${id}`}
//                                             ref={(el) => {
//                                                 sectionRefs.current[id] = el;
//                                             }}
//                                             className="rounded-xl"
//                                         >
//                                             <div className="p-2">
//                                                 <div className="flex items-center justify-between mb-4">
//                                                     <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
//                                                         {getCategoryName(group.category)}
//                                                     </h2>
//                                                     <span className="text-sm text-gray-500">
//                                                         {group.products.length}{" "}
//                                                         {group.products.length === 1
//                                                             ? t("item") || "item"
//                                                             : t("items") || "items"}
//                                                     </span>
//                                                 </div>

//                                                 <motion.div
//                                                     layout
//                                                     className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-5"
//                                                 >
//                                                     <AnimatePresence mode="popLayout">
//                                                         {group.products.map((product) => (
//                                                             <ProductCard
//                                                                 key={product._id}
//                                                                 product={product}
//                                                                 onDelete={openDeleteDialog}
//                                                                 onEdit={onEditClick}
//                                                             />
//                                                         ))}
//                                                     </AnimatePresence>
//                                                 </motion.div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}

//                             {/* Infinite scroll trigger + loader */}
//                             <div
//                                 ref={loadMoreRef}
//                                 className="flex justify-center items-center py-8"
//                             >
//                                 {isLoadingMore && (
//                                     <div className="flex items-center gap-2 text-sm text-gray-500">
//                                         <Loader2 className="h-5 w-5 animate-spin text-[#DC3173]" />
//                                         Loading more products...
//                                     </div>
//                                 )}

//                                 {!hasMore && products.length > 0 && (
//                                     <p className="text-sm text-gray-400">
//                                         You’ve reached the end
//                                     </p>
//                                 )}
//                             </div>
//                         </>
//                     ) : (
//                         <div className="flex-1 flex flex-col items-center justify-center py-16 text-center h-full">
//                             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                                 <Search className="h-8 w-8 text-gray-400" />
//                             </div>
//                             <h3 className="text-xl font-medium mb-2">
//                                 {t("no_items_found")}
//                             </h3>
//                             <p className="text-gray-500 max-w-md">
//                                 {t("no_items_match_current_filters")}
//                             </p>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Dialogs */}
//             <DeleteProductDialog
//                 open={!!selectedProduct.id && selectedProduct.action === "delete"}
//                 onOpenChange={() =>
//                     setSelectedProduct({ id: null, action: null, product: null })
//                 }
//                 onConfirm={
//                     selectedProduct?.type === "soft"
//                         ? handleDeleteProduct
//                         : handlePermanentDeleteProduct
//                 }
//                 t={t}
//             />
//             <EditProductDialog
//                 open={!!selectedProduct.id && selectedProduct.action === "edit"}
//                 onOpenChange={() =>
//                     setSelectedProduct({ id: null, action: null, product: null })
//                 }
//                 prevData={selectedProduct?.product as TProduct}
//                 businessTypeSlug={businessTypeSlug}
//                 onSuccess={handleProductUpdated}
//                 vendorMongoId={vendorMongoId}
//             />
//         </div>
//     );
// }
