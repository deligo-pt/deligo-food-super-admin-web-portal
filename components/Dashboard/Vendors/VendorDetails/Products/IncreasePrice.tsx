'use client';

import TitleHeader from '@/components/TitleHeader/TitleHeader';
import { TProductCategory } from '@/types/category.type';
import { TProduct } from '@/types/product.type';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Loader2, Package, Percent } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { applyIncreaseDecrease, getAllProducts } from '@/services/dashboard/product/product.service';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryStringFormatter } from '@/utils/formatter';
import { TMeta } from '@/types';

type Props = {
    products: TProduct[];
    productCategries: TProductCategory[];
    vendorId: string;
    vendorMongoId?: string;
    initialMeta?: TMeta;
};

const PAGE_LIMIT = 10;

const IncreasePrice = ({
    products: initialProducts,
    productCategries,
    vendorId,
    vendorMongoId,
    initialMeta,
}: Props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [, startTransition] = useTransition();

    // Infinite-scroll state
    const [products, setProducts] = useState<TProduct[]>(initialProducts);
    const [page, setPage] = useState(initialMeta?.page ?? 1);
    const [hasMore, setHasMore] = useState(() => {
        if (initialMeta?.totalPage !== undefined) return (initialMeta.page ?? 1) < initialMeta.totalPage;
        return initialProducts.length >= PAGE_LIMIT;
    });
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [percentage, setPercentage] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Fetch next page
    const fetchMoreProducts = useCallback(async () => {
        if (isLoadingMore || !hasMore || !vendorMongoId) return;

        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const query = {
                "meta.status": "ACTIVE",
                vendorId: vendorMongoId,
                page: nextPage,
                limit: PAGE_LIMIT,
            };
            const queryString = queryStringFormatter(query);
            const res = await getAllProducts(queryString);

            const newProducts: TProduct[] = res?.data ?? [];
            const meta = res?.meta;

            if (newProducts.length === 0) {
                setHasMore(false);
                return;
            }

            setProducts((prev) => {
                const existingKeys = new Set(
                    prev.map((p) => p.productId || p._id).filter(Boolean)
                );
                const unique = newProducts.filter((p) => {
                    const key = p.productId || p._id;
                    return key && !existingKeys.has(key);
                });
                return [...prev, ...unique];
            });

            setPage(nextPage);

            if (meta?.totalPage !== undefined) {
                setHasMore(nextPage < meta.totalPage);
            } else {
                setHasMore(newProducts.length >= PAGE_LIMIT);
            }
        } catch (err) {
            console.error('Failed to load more products', err);
            toast.error(t('failed_to_load_more') || 'Failed to load more products');
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, vendorMongoId, page, t]);

    // IntersectionObserver
    useEffect(() => {
        const node = loadMoreRef.current;
        if (!node || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
                    fetchMoreProducts();
                }
            },
            {
                root: null,
                rootMargin: '200px',
                threshold: 0,
            }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, fetchMoreProducts]);

    // Groupin
    const groupedProducts = useMemo(() => {
        const groups: Record<
            string,
            { category: TProductCategory | null; products: TProduct[] }
        > = {};

        productCategries.forEach((cat) => {
            groups[cat._id] = { category: cat, products: [] };
        });

        products.forEach((product) => {
            const catId = product.category?._id;
            if (catId && groups[catId]) {
                groups[catId].products.push(product);
            } else {
                const fallbackKey = 'uncategorized';
                if (!groups[fallbackKey]) {
                    groups[fallbackKey] = { category: null, products: [] };
                }
                groups[fallbackKey].products.push(product);
            }
        });

        return Object.values(groups).filter((g) => g.products.length > 0);
    }, [products, productCategries]);

    // Helpers
    const getLocalizedName = (name: { en?: string; pt?: string } | string) => {
        if (typeof name === 'string') return name;
        return name?.en || name?.pt || 'Unnamed';
    };

    const getProductKey = (product: TProduct): string | undefined =>
        product.productId || product._id;

    const toggleProduct = (product: TProduct) => {
        const key = getProductKey(product);
        if (!key) return;
        setSelectedProductIds((prev) =>
            prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
        );
    };

    const toggleCategory = (catProducts: TProduct[]) => {
        const ids = catProducts
            .map(getProductKey)
            .filter((id): id is string => Boolean(id));
        if (ids.length === 0) return;
        const allSelected = ids.every((id) => selectedProductIds.includes(id));

        if (allSelected) {
            setSelectedProductIds((prev) => prev.filter((id) => !ids.includes(id)));
        } else {
            setSelectedProductIds((prev) => Array.from(new Set([...prev, ...ids])));
        }
    };

    const isCategorySelected = (catProducts: TProduct[]) => {
        return catProducts.some((p) => {
            const key = getProductKey(p);
            return key !== undefined && selectedProductIds.includes(key);
        });
    };

    const isCategoryFullySelected = (catProducts: TProduct[]) => {
        if (catProducts.length === 0) return false;
        return catProducts.every((p) => {
            const key = getProductKey(p);
            return key !== undefined && selectedProductIds.includes(key);
        });
    };

    const getIncreasedPrice = (price: number) => {
        const pct = Number(percentage);
        if (isNaN(pct) || pct <= 0) return null;
        const increased = price * (1 + pct / 100);
        return Math.max(0, Number(increased.toFixed(2)));
    };

    // handleApply – left completely unchanged
    const handleApply = async () => {
        const numericPercentage = Number(percentage);

        if (isNaN(numericPercentage) || numericPercentage <= 0) {
            toast.error('Please enter a valid percentage greater than 0');
            return;
        }
        if (numericPercentage > 100) {
            toast.error('Percentage cannot exceed 100');
            return;
        }
        if (selectedProductIds.length === 0) {
            toast.error('Please select at least one product');
            return;
        }

        const toastId = toast.loading("Applying...");

        const payload = {
            type: 'INCREASE' as const,
            percentage: numericPercentage,
            productIds: selectedProductIds,
        };

        setIsUpdating(true);
        try {
            const result = await applyIncreaseDecrease(payload);
            if (result.success) {
                toast.success(result?.message || "Increase applied successfully!", { id: toastId });

                startTransition(() => {
                    router.refresh();
                })
                setPercentage('');
                setSelectedProductIds([]);
                return;
            }

            if (result?.data?.errorSources) {
                result?.data?.errorSources?.map((err: { path: string, message: string }) => (
                    toast.error(err?.message, { id: toastId })
                ));
                return;
            } else {
                toast.error(result.message || "Increase applied failed", {
                    id: toastId,
                });
            }

            setPercentage('');
            setSelectedProductIds([]);
            router.refresh();
        } finally {
            setIsUpdating(false);
        }
    };

    // Sync local products when server props update (e.g. after router.refresh())
    useEffect(() => {
        setProducts(initialProducts);
        setPage(initialMeta?.page ?? 1);
        setHasMore(() => {
            if (initialMeta?.totalPage !== undefined) {
                return (initialMeta.page ?? 1) < initialMeta.totalPage;
            }
            return initialProducts.length >= PAGE_LIMIT;
        });
    }, [initialProducts, initialMeta]);

    // Visible checkbox: solid border + white fill when unchecked, brand pink when checked
    const checkboxClass =
        "h-4 w-4 shrink-0 rounded-[4px] border-2 border-gray-400 bg-white shadow-sm " +
        "data-[state=checked]:border-[#DC3173] data-[state=checked]:bg-[#DC3173] data-[state=checked]:text-white";

    const getProductImage = (p: TProduct) => p.image || p.images?.[0];

    function ProductThumb({ product }: { product: TProduct }) {
        const [failed, setFailed] = useState(false);
        const src = getProductImage(product);

        return (
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center">
                {src && !failed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={src}
                        alt=""
                        loading="lazy"
                        onError={() => setFailed(true)}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <Package size={16} className="text-gray-300" />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <TitleHeader
                title={t('apply_price_increase')}
                subtitle={t('update_the_base_price_your_products')}
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
                                    router.push(`/admin/vendor/${vendorId}/add-product`)
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("add_product") || "Add Product"}
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
                                    router.push(
                                        `/admin/vendor/${vendorId}/products/categories`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
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
                                {/* <Layers className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
                                {t("variation_management") || "Variation Management"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorId}/products/offers`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("created_offers") || "Created Offers"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />

            {/* Control bar */}
            <Card className="border-border/60 sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        {selectedProductIds.length > 0 ? (
                            <span>
                                {selectedProductIds.length} {t("product")}
                                {selectedProductIds.length > 1 ? 's' : ''} {t("selected")}
                            </span>
                        ) : (
                            <span>{t("select_categories_or_individual")}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-32">
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                step="any"
                                value={percentage}
                                onChange={(e) => setPercentage(e.target.value)}
                                placeholder="0"
                                className="h-10 pr-8"
                            />
                            <Percent className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>

                        <Button
                            onClick={handleApply}
                            disabled={
                                isUpdating ||
                                selectedProductIds.length === 0 ||
                                !percentage
                            }
                            className="h-10 gap-2 bg-[#DC3173] hover:bg-[#DC3173]/90 text-white min-w-32.5"
                        >
                            {isUpdating
                                ? `${t('saving')}...`
                                : `${t('apply') || 'Apply'} (${selectedProductIds.length})`}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Product list */}
            {groupedProducts.length === 0 && !isLoadingMore ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Package className="h-12 w-12 mb-3 opacity-40" />
                    <p>{t('no_products_found')}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedProducts.map(({ category, products: catProducts }) => {
                        const categorySelected = isCategorySelected(catProducts);
                        const fullySelected = isCategoryFullySelected(catProducts);

                        return (
                            <section key={category?._id || 'uncategorized'} className="space-y-2">
                                {/* Category header */}
                                <div
                                    className={cn(
                                        'flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors cursor-pointer',
                                        categorySelected
                                            ? 'border-[#DC3173]/50 bg-[#DC3173]/5'
                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100/70'
                                    )}
                                    onClick={() => toggleCategory(catProducts)}
                                >
                                    <Checkbox
                                        checked={categorySelected}
                                        onCheckedChange={() => toggleCategory(catProducts)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={checkboxClass}
                                    />

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold tracking-tight truncate">
                                            {category ? getLocalizedName(category.name) : t('uncategorized')}
                                        </h3>
                                        {categorySelected && !fullySelected && (
                                            <p className="text-[11px] text-[#DC3173]">{t('partial')}</p>
                                        )}
                                    </div>

                                    <Badge variant="secondary" className="font-normal shrink-0 text-[11px] h-5">
                                        {catProducts.length} {t('product')}
                                        {catProducts.length !== 1 ? 's' : ''}
                                    </Badge>
                                </div>

                                {/* Products grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 pl-2 sm:pl-6">
                                    {catProducts.map((product) => {
                                        const productKey = getProductKey(product);
                                        const isSelected = selectedProductIds.includes(productKey as string);

                                        const originalPrice = product.pricing.price;
                                        const currency = product.pricing.currency;
                                        const increased = isSelected ? getIncreasedPrice(originalPrice) : null;

                                        const hasVariations =
                                            Array.isArray(product.variations) && product.variations.length > 0;

                                        return (
                                            <div
                                                key={product._id}
                                                className={cn(
                                                    'rounded-lg border bg-white transition-all',
                                                    isSelected
                                                        ? 'border-[#DC3173] bg-[#DC3173]/5 ring-1 ring-[#DC3173]/25'
                                                        : 'border-gray-200 hover:border-[#DC3173]/50'
                                                )}
                                            >
                                                <div
                                                    className="flex items-center gap-2 p-1.5 pr-2 cursor-pointer"
                                                    onClick={() => toggleProduct(product)}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleProduct(product)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={checkboxClass}
                                                    />

                                                    <ProductThumb product={product} />

                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-[13px] leading-tight line-clamp-1">
                                                            {getLocalizedName(product.name)}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] mt-0.5">
                                                            <span className={cn('text-muted-foreground', increased !== null && 'line-through')}>
                                                                {currency} {originalPrice}
                                                            </span>

                                                            {increased !== null && (
                                                                <>
                                                                    <span className="font-semibold text-[#DC3173]">
                                                                        {currency} {increased}
                                                                    </span>
                                                                    <span className="text-[#DC3173] text-[10px]">
                                                                        (+{percentage}%)
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {hasVariations && (
                                                    <div className="border-t border-dashed border-[#DC3173]/25 px-2 py-1.5 space-y-1">
                                                        {product.variations.map((variation, vIdx) => (
                                                            <div key={vIdx}>
                                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                                                    {getLocalizedName(variation.name)}
                                                                </p>

                                                                {variation.options?.map((option, oIdx) => {
                                                                    const optionPrice = option.price;
                                                                    const optionIncreased = isSelected
                                                                        ? getIncreasedPrice(optionPrice)
                                                                        : null;

                                                                    return (
                                                                        <div
                                                                            key={oIdx}
                                                                            className="flex items-center gap-1.5 pl-2 text-[11px] leading-5"
                                                                        >
                                                                            <span className="text-muted-foreground/60">└</span>
                                                                            <span className="font-medium text-foreground/90 line-clamp-1">
                                                                                {getLocalizedName(option.label)}
                                                                            </span>
                                                                            <span
                                                                                className={cn(
                                                                                    'text-muted-foreground',
                                                                                    optionIncreased !== null && 'line-through'
                                                                                )}
                                                                            >
                                                                                {currency} {optionPrice}
                                                                            </span>
                                                                            {optionIncreased !== null && (
                                                                                <span className="font-semibold text-[#DC3173]">
                                                                                    {currency} {optionIncreased}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}

                    {/* Infinite-scroll sentinel */}
                    <div ref={loadMoreRef} className="py-6 flex justify-center">
                        {isLoadingMore && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('loading_more') || 'Loading more products…'}
                            </div>
                        )}
                        {!hasMore && products.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {t('no_more_products') || 'No more products'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncreasePrice;