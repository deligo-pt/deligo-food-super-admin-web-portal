'use client';

import TitleHeader from '@/components/TitleHeader/TitleHeader';
import { TProductCategoryResponse } from '@/types/category.type';
import { TProduct } from '@/types/product.type';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Percent } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { applyIncreaseDecrease } from '@/services/dashboard/product/product.service';

type Props = {
    products: TProduct[];
    productCategries: TProductCategoryResponse[];
};

const UpdateDiscount = ({ products, productCategries }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();

    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [percentage, setPercentage] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Group products by category
    const groupedProducts = useMemo(() => {
        const groups: Record<
            string,
            { category: TProductCategoryResponse | null; products: TProduct[] }
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

    const getLocalizedName = (name: { en?: string; pt?: string } | string) => {
        if (typeof name === 'string') return name;
        return name?.en || name?.pt || 'Unnamed';
    };

    const getProductKey = (product: TProduct) => product.productId || product._id;

    // Toggle a single product
    const toggleProduct = (product: TProduct) => {
        const key = getProductKey(product);
        if (!key) return;

        setSelectedProductIds((prev) =>
            prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
        );
    };

    // Toggle all products under a category
    const toggleCategory = (catProducts: TProduct[]) => {
        const ids = catProducts
            .map(getProductKey)
            .filter((id): id is string => Boolean(id));
        const allSelected = ids.every((id) => selectedProductIds.includes(id));

        if (allSelected) {
            // Deselect all in this category
            setSelectedProductIds((prev) => prev.filter((id) => !ids.includes(id)));
        } else {
            // Select all in this category
            setSelectedProductIds((prev) => Array.from(new Set([...prev, ...ids])));
        }
    };

    // Category is considered "selected" if at least one product under it is selected
    const isCategorySelected = (catProducts: TProduct[]) => {
        return catProducts.some((p) => {
            const key = getProductKey(p);
            return Boolean(key && selectedProductIds.includes(key));
        });
    };

    // All products under category are selected
    const isCategoryFullySelected = (catProducts: TProduct[]) => {
        if (catProducts.length === 0) return false;
        return catProducts.every((p) => {
            const key = getProductKey(p);
            return Boolean(key && selectedProductIds.includes(key));
        });
    };

    // Calculate discounted price
    const getDiscountedPrice = (price: number) => {
        const pct = Number(percentage);
        if (isNaN(pct) || pct <= 0) return null;
        const discounted = price * (1 - pct / 100);
        return Math.max(0, Number(discounted.toFixed(2)));
    };

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
            type: 'DECREASE' as const,
            percentage: numericPercentage,
            productIds: selectedProductIds,
        };

        setIsUpdating(true);
        try {
            const result = await applyIncreaseDecrease(payload);
            if (result.success) {
                toast.success(result?.message || "Decrease applied successfully!", { id: toastId });

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
                toast.error(result.message || "Decrease applied failed", {
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

    return (
        <div className="space-y-6">
            <TitleHeader
                title={t('apply_price_decrease')}
                subtitle={t('decrease_any_products_if_you_want')}
                onBackClick={() => router.back()}
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
            {groupedProducts.length === 0 ? (
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
                            <section
                                key={category?._id || 'uncategorized'}
                                className="space-y-2"
                            >
                                {/* Category header */}
                                <div
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all cursor-pointer',
                                        categorySelected
                                            ? 'border-[#DC3173]/50 bg-[#DC3173]/5'
                                            : 'border-border/90 bg-muted/20 hover:bg-muted/30'
                                    )}
                                    onClick={() => toggleCategory(catProducts)}
                                >
                                    <Checkbox
                                        checked={categorySelected}
                                        className={cn(
                                            'data-[state=checked]:bg-[#DC3173] data-[state=checked]:border-[#DC3173]',
                                            categorySelected &&
                                            !fullySelected &&
                                            'opacity-70'
                                        )}
                                        onCheckedChange={() => toggleCategory(catProducts)}
                                        onClick={(e) => e.stopPropagation()}
                                    />

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold tracking-tight">
                                            {category
                                                ? getLocalizedName(category.name)
                                                : t('uncategorized')}
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground">
                                            {catProducts.length} {t('product')}
                                            {catProducts.length !== 1 ? 's' : ''}
                                            {categorySelected && !fullySelected && (
                                                <span className="ml-1.5 text-[#DC3173]">
                                                    · {t("partial")}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <Badge
                                        variant="secondary"
                                        className="font-normal shrink-0 text-[11px] h-5"
                                    >
                                        {catProducts.length}
                                    </Badge>
                                </div>

                                {/* Products - compact + variations support */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 ml-10">
                                    {catProducts?.map((product) => {
                                        const productKey = getProductKey(product);
                                        const isSelected = selectedProductIds.includes(productKey as string);

                                        const originalPrice = product.pricing.price;
                                        const currency = product.pricing.currency;
                                        const discounted = isSelected
                                            ? getDiscountedPrice(originalPrice)
                                            : null;

                                        const hasVariations =
                                            Array.isArray(product.variations) &&
                                            product.variations.length > 0;

                                        return (
                                            <div
                                                key={product._id}
                                                className={cn(
                                                    'rounded-md border transition-all',
                                                    isSelected
                                                        ? 'border-[#DC3173]/40 bg-[#DC3173]/5'
                                                        : 'border-[#DC3173]/50 hover:bg-muted/20'
                                                )}
                                            >
                                                {/* Main product row */}
                                                <div
                                                    className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer"
                                                    onClick={() => toggleProduct(product)}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleProduct(product)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-3.5 w-3.5 data-[state=checked]:bg-[#DC3173] data-[state=checked]:border-[#DC3173]"
                                                    />

                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-[13px] leading-tight line-clamp-1">
                                                            {getLocalizedName(product.name)}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[11px] mt-0.5">
                                                            <span className="text-muted-foreground">
                                                                {currency} {originalPrice}
                                                            </span>

                                                            {discounted !== null && (
                                                                <>
                                                                    <span className="text-muted-foreground">→</span>
                                                                    <span className="font-semibold text-[#DC3173]">
                                                                        {currency} {discounted}
                                                                    </span>
                                                                    <span className="text-[#DC3173] text-[10px]">
                                                                        (−{percentage}%)
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Variations (if any) */}
                                                {hasVariations && (
                                                    <div className="border-t border-dashed border-[#DC3173]/20 px-2.5 pb-2 pt-1.5 space-y-1.5">
                                                        {product.variations.map((variation, vIdx) => (
                                                            <div key={vIdx} className="space-y-1">
                                                                {/* Variation group name */}
                                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide pl-5">
                                                                    {getLocalizedName(variation.name)}
                                                                </p>

                                                                {/* Options */}
                                                                <div className="space-y-1">
                                                                    {variation.options?.map((option, oIdx) => {
                                                                        const optionPrice = option.price;
                                                                        const optionDiscounted = isSelected
                                                                            ? getDiscountedPrice(optionPrice)
                                                                            : null;

                                                                        return (
                                                                            <div
                                                                                key={oIdx}
                                                                                className="flex items-center gap-2 pl-5 text-[11px]"
                                                                            >
                                                                                <span className="text-muted-foreground/70">{oIdx + 1}</span>
                                                                                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-1.5">
                                                                                    <span className="font-medium text-foreground/90 line-clamp-1">
                                                                                        {getLocalizedName(option.label)}
                                                                                    </span>

                                                                                    <span className="text-muted-foreground">
                                                                                        {currency} {optionPrice}
                                                                                    </span>

                                                                                    {optionDiscounted !== null && (
                                                                                        <>
                                                                                            <span className="text-muted-foreground">→</span>
                                                                                            <span className="font-semibold text-[#DC3173]">
                                                                                                {currency} {optionDiscounted}
                                                                                            </span>
                                                                                            <span className="text-[#DC3173] text-[10px]">
                                                                                                (−{percentage}%)
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
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
                </div>
            )}
        </div>
    );
};

export default UpdateDiscount;