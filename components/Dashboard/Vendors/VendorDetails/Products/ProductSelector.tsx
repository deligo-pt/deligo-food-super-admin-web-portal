/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { TProduct } from "@/types/product.type";
import { TProductCategoryResponse } from "@/types/category.type";
import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface ProductSelectorProps {
    products: TProduct[];
    categories?: TProductCategoryResponse[];
    lang: string;
    selectionMode?: "multi" | "single";
    selectedIds: string[];
    onToggle: (productId: string) => void;
    /** kept for API compat – category select-all is disabled */
    onToggleCategory?: (categoryId: string, selectAll: boolean) => void;
    className?: string;
    height?: string;
    /** infinite scroll */
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
}

type Group = {
    categoryId: string;
    categoryName: string;
    products: TProduct[];
};

const pickName = (name: any, lang: string): string => {
    if (!name) return "";
    if (typeof name === "string") return name;
    return name[lang] || name.en || name.pt || "";
};

export function ProductSelector({
    products,
    categories = [],
    lang,
    selectedIds,
    onToggle,
    className,
    height = "h-72",
    hasMore = false,
    loadingMore = false,
    onLoadMore,
}: ProductSelectorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const [query, setQuery] = useState("");

    const visibleProducts = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return products;
        return products.filter((p) =>
            pickName(p.name, lang).toLowerCase().includes(q),
        );
    }, [products, query, lang]);

    const productsByCategory = useMemo<Group[]>(() => {
        const map = new Map<string, Group>();

        visibleProducts.forEach((p) => {
            const cat = (p as any).category;
            const catId: string = cat?._id || "uncategorized";

            if (!map.has(catId)) {
                map.set(catId, {
                    categoryId: catId,
                    categoryName:
                        catId === "uncategorized"
                            ? "Uncategorized"
                            : pickName(cat?.name, lang) || "Uncategorized",
                    products: [],
                });
            }
            map.get(catId)!.products.push(p);
        });


        const ordered: Group[] = [];
        categories.forEach((c) => {
            const g = map.get(c._id);
            if (g) {
                g.categoryName = pickName(c.name, lang) || g.categoryName;
                ordered.push(g);
                map.delete(c._id);
            }
        });

        const rest = Array.from(map.values()).sort((a, b) => {
            if (a.categoryId === "uncategorized") return 1;
            if (b.categoryId === "uncategorized") return -1;
            return a.categoryName.localeCompare(b.categoryName);
        });

        return [...ordered, ...rest];
    }, [visibleProducts, categories, lang]);

    useEffect(() => {
        if (!hasMore || loadingMore || !onLoadMore) return;
        const root = containerRef.current;
        const target = sentinelRef.current;
        if (!root || !target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) onLoadMore();
            },
            { root, rootMargin: "300px" },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, onLoadMore, products.length]);

    return (
        <div className={cn("space-y-2", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="h-10 pl-9"
                />
            </div>

            <div
                ref={containerRef}
                className={cn("border border-gray-200 rounded-xl overflow-y-auto bg-white", height)}
            >
                {productsByCategory.length === 0 && !loadingMore && (
                    <p className="text-sm text-muted-foreground text-center py-10">
                        No products found
                    </p>
                )}

                {productsByCategory.map(
                    ({ categoryId, categoryName, products: catProducts }) => (
                        <div
                            key={categoryId}
                            className="border-b border-gray-100 last:border-b-0"
                        >
                            {/* Category label only – no select-all checkbox */}
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                                <span className="font-semibold text-[13px] text-gray-800 tracking-wide uppercase">
                                    {categoryName}
                                </span>
                                <span className="text-xs text-gray-400 ml-auto tabular-nums">
                                    {catProducts.length} item
                                    {catProducts.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <div className="ml-6 py-1 pr-2">
                                {catProducts.map((product) => {
                                    const pid = product._id as string;
                                    const isChecked = selectedSet.has(pid);

                                    return (
                                        <label
                                            key={pid}
                                            className={cn(
                                                "flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer select-none transition-colors",
                                                isChecked ? "bg-[#DC3173]/8" : "hover:bg-gray-50",
                                            )}
                                        >
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={() => onToggle(pid)}
                                                className="data-[state=checked]:bg-[#DC3173] data-[state=checked]:border-[#DC3173]"
                                            />
                                            <span
                                                className={cn(
                                                    "text-sm",
                                                    isChecked
                                                        ? "text-gray-900 font-medium"
                                                        : "text-gray-700",
                                                )}
                                            >
                                                {pickName(product.name, lang) || "—"}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ),
                )}

                {/* Sentinel for infinite scroll + subtle loader */}
                <div ref={sentinelRef} className="flex h-8 items-center justify-center">
                    {loadingMore && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                </div>
            </div>
        </div>
    );
}