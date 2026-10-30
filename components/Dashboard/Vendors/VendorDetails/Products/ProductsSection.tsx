"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, CheckSquare, X, Copy } from "lucide-react";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import {
  useProgressiveProducts,
  invalidateProductsCache,
} from "@/hooks/use-progressive-products";
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
import { useMemo, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import EditProductDialog from "./EditProductDialog";
import DeleteProductDialog from "./DeleteProductDialog";
import ProductStatusTabs from "./ProductStatusTabs";
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
  /** filters the server applied for page 1 (no page / limit / vendorId) */
  baseQuery: string;
  /** totals for the All / Active / Inactive tabs */
  statusCounts: { all: number; active: number; inactive: number; sdr: number };
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
  baseQuery,
  statusCounts,
  businessTypeSlug,
  productCategories,
  vendorMongoId,
  vendorId,
}: IProps) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const sortOptions = getSortOptions(t, sortFields);
  const searchParams = useSearchParams();

  // ── products (progressive + cached) ────────────────────────────
  const { products, setProducts, meta, hasMore, hasError, retry } =
    useProgressiveProducts({
      initial: productsData,
      baseQuery,
      vendorMongoId,
    });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    activeCategoryId || groupedProducts[0]?.category?._id || "uncategorized";

  const getCategoryName = (category: TProductCategoryResponse | null) => {
    if (!category) return t("uncategorized") || "Uncategorized";
    return category.name?.[lang] || "Unnamed";
  };

  // Reset deleted ids when fresh server data arrives
  useEffect(() => {
    setDeletedProductIds([]);
  }, [productsData]);

  // Default sortBy=name & meta.status=ACTIVE when URL has no tab selected.
  // (SDR is its own tab, so don't add a status when sdr.applicable is present.)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    const hasSort =
      params.get("sortBy") || params.get("sort") || params.get("sortOption");
    if (!hasSort) {
      params.set("sortBy", "name");
      changed = true;
    }

    if (!params.get("meta.status") && !params.get("sdr.applicable")) {
      params.set("meta.status", "ACTIVE");
      changed = true;
    }

    if (changed) {
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
    // Everything already loaded → instant, no network
    if (!hasMore && !hasError) {
      setSelectedIds(new Set(visibleProducts.map(getId)));
      setSelectAllMode(true);
      toast.success(`${visibleProducts.length} products selected`);
      return;
    }

    // Fallback: still loading or a page failed → fetch ids from the server
    setIsSelectAllLoading(true);
    try {
      const allIds = new Set<string>();
      let currentPage = 1;
      let totalPages = 1;

      do {
        const params = new URLSearchParams(searchParams.toString());

        // SDR tab → only sdr.applicable; All tab → no status; else status
        if (params.get("sdr.applicable") === "true") {
          params.delete("meta.status");
        } else {
          const status = params.get("meta.status") || "ACTIVE";
          if (status === "ALL") params.delete("meta.status");
          else params.set("meta.status", status);
        }

        params.set("vendorId", vendorMongoId);
        params.set("page", String(currentPage));
        params.set("limit", "100");
        if (!params.get("sortBy")) params.set("sortBy", "name");

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
        invalidateProductsCache();
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
        invalidateProductsCache();
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
    invalidateProductsCache();
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

      {/* Tabs: All / Active / Inactive / SDR Products */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <ProductStatusTabs counts={statusCounts} />
        {/* Selection toolbar */}
        <div className="flex items-center justify-between gap-3 px-1">
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
                  <>
                    <span className="ml-1.5 text-xs text-gray-400">
                      {products.length}/{totalProducts}
                    </span>
                    <Loader2 className="inline w-3.5 h-3.5 ml-1.5 animate-spin text-[#DC3173]" />
                  </>
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
      </div>

      <AllFilters sortOptions={sortOptions} />


      {/* Main content */}
      <div className="flex flex-1 min-h-0 gap-2 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 h-full">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full max-h-full overflow-hidden">
            <div className="p-4 border-b border-gray-50 shrink-0 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                {t("product_categories") || "Product categories"}
              </h3>
              {hasMore && (
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="h-40 rounded-2xl bg-gray-100 animate-pulse"
                                />
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* Bottom status */}
              <div className="flex justify-center items-center py-8">
                {hasMore && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin text-[#DC3173]" />
                    {t("loading_more") || "Loading more"}...
                  </div>
                )}
                {hasError && (
                  <Button variant="outline" size="sm" onClick={retry}>
                    {t("retry_loading_products")}
                  </Button>
                )}
                {!hasMore && !hasError && products.length > 0 && (
                  <p className="text-sm text-gray-400">
                    {t("you_have_reached_the_end") || "You've reached the end"}
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