/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TMeta } from "@/types";

type PageResult<T> = { data?: T[]; meta?: TMeta };

interface Options<T> {
    initialItems: T[];
    initialMeta?: TMeta;
    limit: number;
    fetchPage: (page: number) => Promise<PageResult<T> | undefined>;
    /** memory cache key, e.g. `products:${vendorId}` */
    cacheKey?: string;
    /** quietly keep fetching remaining pages in the background */
    autoLoadAll?: boolean;
    /** pause between background pages (ms) */
    autoLoadDelay?: number;
}

type CacheEntry = { items: any[]; page: number; hasMore: boolean; at: number };
const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;

function resolveHasMore(
    meta: any,
    page: number,
    limit: number,
    batchLength: number,
    loadedCount: number,
) {
    if (batchLength === 0) return false;

    const totalPages = meta?.totalPage ?? meta?.totalPages;
    if (typeof totalPages === "number") return page < totalPages;

    const total = meta?.total ?? meta?.totalDoc ?? meta?.totalDocs ?? meta?.totalItems;
    if (typeof total === "number") return loadedCount < total;

    return batchLength >= limit;
}

export function usePaginatedList<T extends { _id?: string }>({
    initialItems,
    initialMeta,
    limit,
    fetchPage,
    cacheKey,
    autoLoadAll = false,
    autoLoadDelay = 150,
}: Options<T>) {
    const [items, setItems] = useState<T[]>(initialItems);
    const [hasMore, setHasMore] = useState(() =>
        resolveHasMore(initialMeta, 1, limit, initialItems.length, initialItems.length),
    );
    const [loading, setLoading] = useState(false);

    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(hasMore);
    const itemsRef = useRef<T[]>(initialItems);
    const fetchRef = useRef(fetchPage);

    useEffect(() => {
        fetchRef.current = fetchPage;
    }, [fetchPage]);

    // Restore from cache after mount (not during render, to avoid hydration mismatch)
    useEffect(() => {
        if (!cacheKey) return;
        const cached = CACHE.get(cacheKey);
        if (
            cached &&
            Date.now() - cached.at < CACHE_TTL &&
            cached.items.length > itemsRef.current.length
        ) {
            itemsRef.current = cached.items as T[];
            pageRef.current = cached.page;
            hasMoreRef.current = cached.hasMore;
            setItems(cached.items as T[]);
            setHasMore(cached.hasMore);
        }
    }, [cacheKey]);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMoreRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const nextPage = pageRef.current + 1;
            const res = await fetchRef.current(nextPage);
            const batch = res?.data ?? [];
            pageRef.current = nextPage;

            const seen = new Set(itemsRef.current.map((i) => i._id));
            const merged = [
                ...itemsRef.current,
                ...batch.filter((i) => !seen.has(i._id)),
            ];
            itemsRef.current = merged;
            setItems(merged);

            const more = resolveHasMore(
                res?.meta,
                nextPage,
                limit,
                batch.length,
                merged.length,
            );
            hasMoreRef.current = more;
            setHasMore(more);

            if (cacheKey) {
                CACHE.set(cacheKey, {
                    items: merged,
                    page: nextPage,
                    hasMore: more,
                    at: Date.now(),
                });
            }
        } catch (e) {
            console.error(e);
            hasMoreRef.current = false;
            setHasMore(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [limit, cacheKey]);

    // Background prefetch of all remaining pages
    useEffect(() => {
        if (!autoLoadAll || !hasMore || loading) return;
        const id = setTimeout(loadMore, autoLoadDelay);
        return () => clearTimeout(id);
    }, [autoLoadAll, hasMore, loading, loadMore, autoLoadDelay, items.length]);

    return { items, hasMore, loading, loadMore };
}