"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TMeta } from "@/types";
import { TProduct } from "@/types/product.type";

const PAGE_LIMIT = 30;
const CONCURRENCY = 4;
const CACHE_TTL_MS = 2 * 60 * 1000;

type CacheEntry = { products: TProduct[]; meta?: TMeta; ts: number };
const cache = new Map<string, CacheEntry>();

/** Call after any create / edit / delete so the next load is fresh */
export const invalidateProductsCache = () => cache.clear();

const getId = (p: TProduct) => String(p.productId);

const extractList = (json: any): TProduct[] =>
    Array.isArray(json?.data) ? json.data : json?.data?.data || [];

interface Args {
    initial: { data: TProduct[]; meta?: TMeta };
    /** query string the SERVER used for page 1 (without page/limit/vendorId) */
    baseQuery: string;
    vendorMongoId: string;
}

export function useProgressiveProducts({
    initial,
    baseQuery,
    vendorMongoId,
}: Args) {
    const [products, setProducts] = useState<TProduct[]>(initial.data || []);
    const [meta, setMeta] = useState<TMeta | undefined>(initial.meta);
    const [hasMore, setHasMore] = useState(false); // true while remaining pages load
    const [hasError, setHasError] = useState(false);
    const [retryTick, setRetryTick] = useState(0);

    const cacheKey = `${vendorMongoId}|${baseQuery}`;

    useEffect(() => {
        const first = initial.data || [];
        const initialPage = initial.meta?.page || 1;
        const totalPage = initial.meta?.totalPage || 1;

        setHasError(false);

        // 1) cache hit → instant, no network
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
            setProducts(cached.products);
            setMeta(cached.meta);
            setHasMore(false);
            return;
        }

        // 2) show server-rendered first page immediately
        setProducts(first);
        setMeta(initial.meta);

        if (totalPage <= 1) {
            cache.set(cacheKey, { products: first, meta: initial.meta, ts: Date.now() });
            setHasMore(false);
            return;
        }

        // 3) load the remaining pages in parallel
        const ctrl = new AbortController();
        const results = new Map<number, TProduct[]>([[initialPage, first]]);
        const pages = Array.from({ length: totalPage }, (_, i) => i + 1).filter(
            (p) => p !== initialPage
        );
        let cursor = 0;
        let failed = false;
        setHasMore(true);

        const merged = () => {
            const seen = new Set<string>();
            const out: TProduct[] = [];
            [...results.keys()]
                .sort((a, b) => a - b)
                .forEach((k) =>
                    results.get(k)!.forEach((p) => {
                        const id = getId(p);
                        if (!seen.has(id)) {
                            seen.add(id);
                            out.push(p);
                        }
                    })
                );
            return out;
        };

        const fetchPage = async (page: number, retries = 1): Promise<TProduct[]> => {
            const params = new URLSearchParams(baseQuery);
            params.set("vendorId", vendorMongoId);
            params.set("limit", String(PAGE_LIMIT));
            params.set("page", String(page));
            try {
                const res = await fetch(`/api/products?${params.toString()}`, {
                    signal: ctrl.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return extractList(await res.json());
            } catch (err) {
                if (ctrl.signal.aborted || retries <= 0) throw err;
                return fetchPage(page, retries - 1);
            }
        };

        const worker = async () => {
            while (!ctrl.signal.aborted && !failed && cursor < pages.length) {
                const page = pages[cursor++];
                try {
                    results.set(page, await fetchPage(page));
                    if (!ctrl.signal.aborted) setProducts(merged()); // progressive render
                } catch {
                    if (!ctrl.signal.aborted) failed = true;
                }
            }
        };

        (async () => {
            await Promise.all(
                Array.from({ length: Math.min(CONCURRENCY, pages.length) }, worker)
            );
            if (ctrl.signal.aborted) return; // filter changed → ignore
            setHasMore(false);
            if (failed) {
                setHasError(true);
                toast.error("Failed to load some products");
                return;
            }
            cache.set(cacheKey, {
                products: merged(),
                meta: initial.meta,
                ts: Date.now(),
            });
        })();

        return () => ctrl.abort();
    }, [initial, cacheKey, vendorMongoId, retryTick]);

    return {
        products,
        setProducts,
        meta,
        hasMore,
        hasError,
        retry: () => setRetryTick((t) => t + 1),
    };
}