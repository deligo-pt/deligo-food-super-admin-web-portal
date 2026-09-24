"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Percent, TrendingUp, Loader2, Layers, Tag, Gift } from "lucide-react";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import {
    deleteProduct,
    getAllProducts,
    permanentDeleteProduct
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
import { useRouter } from "next/navigation";

interface IProps {
    productsData: { data: TProduct[]; meta?: TMeta };
    businessTypeSlug: string;
    productCategories: TProductCategoryResponse[];
    vendorId: string;
}

export default function ProductsSection({
    productsData,
    businessTypeSlug,
    productCategories,
    vendorId,
}: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    // Infinite scroll state
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
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Filter out optimistically deleted products
    const visibleProducts = useMemo(
        () =>
            products.filter((product) => {
                const productId = (product._id || product.productId) as string;
                return !deletedProductIds.includes(productId);
            }),
        [products, deletedProductIds]
    );

    // Group by category (show ALL categories)
    const groupedProducts = useMemo(() => {
        const groups: Record<
            string,
            { category: TProductCategoryResponse | null; products: TProduct[] }
        > = {};

        productCategories.forEach((cat) => {
            groups[cat._id] = { category: cat, products: [] };
        });

        visibleProducts.forEach((product) => {
            const categoryId = product.category?._id;
            if (categoryId && groups[categoryId]) {
                groups[categoryId].products.push(product);
            } else {
                if (!groups["uncategorized"]) {
                    groups["uncategorized"] = { category: null, products: [] };
                }
                groups["uncategorized"].products.push(product);
            }
        });

        return Object.values(groups);
    }, [visibleProducts, productCategories]);

    const effectiveActiveCategoryId =
        activeCategoryId || groupedProducts[0]?.category?._id || "uncategorized";

    const getCategoryName = (category: TProductCategoryResponse | null) => {
        if (!category) return t("uncategorized") || "Uncategorized";
        return category.name?.en || category.name?.pt || "Unnamed";
    };

    // Load more products
    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;

            // Must match exactly what the server page uses
            const query = new URLSearchParams({
                page: String(nextPage),
                limit: "3",              // same limit as the first page (for testing)
                vendorId: vendorId,      // this is now the correct _id
            }).toString();

            const result = await getAllProducts(query);

            // handle both possible response shapes
            const newProducts: TProduct[] = result?.data || result?.data?.data || [];
            const newMeta: TMeta | undefined = result?.meta || result?.data?.meta;

            if (newProducts.length > 0) {
                setProducts((prev) => {
                    const existingIds = new Set(
                        prev.map((p) => (p._id || p.productId) as string)
                    );
                    const filtered = newProducts.filter(
                        (p) => !existingIds.has((p._id || p.productId) as string)
                    );
                    return [...prev, ...filtered];
                });

                if (newMeta) {
                    setMeta(newMeta);
                    setPage(nextPage);
                    setHasMore(nextPage < (newMeta.totalPage || 1));
                } else {
                    // fallback if meta is missing
                    setPage(nextPage);
                    setHasMore(newProducts.length >= 3);
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
    }, [isLoadingMore, hasMore, page, vendorId]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const target = loadMoreRef.current;
        const root = scrollContainerRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasMore && !isLoadingMore) {
                    loadMore();
                }
            },
            {
                root: root || null,        // null = viewport (also works)
                rootMargin: "300px",
                threshold: 0,
            }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [loadMore, hasMore, isLoadingMore]);

    // Delete / Edit handlers (unchanged)
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
            toast.error(result.message || "Product deletion failed", { id: toastId });
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
            toast.error(result.message || "Product deletion failed", { id: toastId });
        }
    };

    const scrollToCategory = (id: string) => {
        setActiveCategoryId(id);
        const target = sectionRefs.current[id];
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="w-full flex flex-col h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] overflow-hidden">
            {/* Header */}
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
                                <Plus className="w-4 h-4 mr-2 text-[#DC3173]" />
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
                                <Percent className="w-4 h-4 mr-2 text-[#DC3173]" />
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
                                <TrendingUp className="w-4 h-4 mr-2 text-[#DC3173]" />
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
                                <Tag className="w-4 h-4 mr-2 text-[#DC3173]" />
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
                                <Layers className="w-4 h-4 mr-2 text-[#DC3173]" />
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
                                <Gift className="w-4 h-4 mr-2 text-[#DC3173]" />
                                {t("created_offers") || "Created Offers"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />

            {/* Main content */}
            <div className="flex flex-1 min-h-0 gap-2 overflow-hidden">
                {/* LEFT SIDEBAR */}
                <div className="hidden lg:flex flex-col w-64 shrink-0 h-full">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full max-h-full overflow-hidden">
                        <div className="p-4 border-b border-gray-50 shrink-0">
                            <h3 className="text-sm font-semibold text-gray-800">
                                {t("product_categories") || "Product categories"}
                            </h3>
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
                                                className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${isActive
                                                    ? "bg-[#DC3173]/15 text-[#DC3173]"
                                                    : "bg-gray-100 text-gray-500"
                                                    }`}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT – infinite scroll container */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 min-w-0 h-full overflow-y-auto space-y-10 pr-1 no-scrollbar"
                >
                    {groupedProducts.some((g) => g.products.length > 0) ? (
                        <>
                            {groupedProducts
                                .filter((group) => group.products.length > 0)
                                .map((group) => {
                                    const id = group.category?._id || "uncategorized";

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
                                                        {group.products.length}{" "}
                                                        {group.products.length === 1
                                                            ? t("item") || "item"
                                                            : t("items") || "items"}
                                                    </span>
                                                </div>

                                                <motion.div
                                                    layout
                                                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                                                >
                                                    <AnimatePresence mode="popLayout">
                                                        {group.products.map((product) => (
                                                            <ProductCard
                                                                key={product._id}
                                                                product={product}
                                                                onDelete={openDeleteDialog}
                                                                onEdit={onEditClick}
                                                            />
                                                        ))}
                                                    </AnimatePresence>
                                                </motion.div>
                                            </div>
                                        </div>
                                    );
                                })}

                            {/* Infinite scroll trigger + loader */}
                            <div
                                ref={loadMoreRef}
                                className="flex justify-center items-center py-8"
                            >
                                {isLoadingMore && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="h-5 w-5 animate-spin text-[#DC3173]" />
                                        Loading more products...
                                    </div>
                                )}

                                {!hasMore && products.length > 0 && (
                                    <p className="text-sm text-gray-400">
                                        You’ve reached the end
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
                    selectedProduct?.type === ""
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
            />
        </div>
    );
}