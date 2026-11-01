/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/broadcast-users-client.ts
//
// Client-side loader for the role/user lists:
//  - in-memory cache (60s) → re-opening a role / clearing a search is instant
//  - in-flight de-duplication → the same request is never sent twice
//  - uses fetch() on a route handler → requests run in parallel
import type { TMeta } from "@/types";

export type TUsersResult<T = any> = { data: T[]; meta?: TMeta };

export type TUsersParams = {
    role: string;
    page?: number;
    limit?: number;
    searchTerm?: string;
    status?: string;
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, { ts: number; value: TUsersResult }>();
const inflight = new Map<string, Promise<TUsersResult>>();

const keyOf = (p: TUsersParams) =>
    [
        p.role,
        p.page ?? 1,
        p.limit ?? 10,
        (p.searchTerm ?? "").trim().toLowerCase(),
        p.status ?? "",
    ].join("|");

/** Put data we already have (e.g. from the server) into the cache */
export function seedUsers(params: TUsersParams, value: TUsersResult) {
    cache.set(keyOf(params), { ts: Date.now(), value });
}

export function invalidateUsersCache() {
    cache.clear();
}

export async function fetchUsers<T = any>(
    params: TUsersParams
): Promise<TUsersResult<T>> {
    const key = keyOf(params);

    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
        return hit.value as TUsersResult<T>;
    }

    const pending = inflight.get(key);
    if (pending) return pending as Promise<TUsersResult<T>>;

    const qs = new URLSearchParams({
        role: params.role,
        page: String(params.page ?? 1),
        limit: String(params.limit ?? 10),
    });
    if (params.searchTerm) qs.set("searchTerm", params.searchTerm);
    if (params.status) qs.set("status", params.status);

    const request = fetch(`/api/broadcast-users?${qs.toString()}`)
        .then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as TUsersResult;
            cache.set(key, { ts: Date.now(), value: json });
            return json;
        })
        .finally(() => inflight.delete(key));

    inflight.set(key, request);
    return request as Promise<TUsersResult<T>>;
}