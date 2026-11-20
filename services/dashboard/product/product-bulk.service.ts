"use server";

/**
 * Product bulk create, file import and bulk soft delete for admins
 * (PRODUCT_BULK_AND_IMPORT_FRONTEND_GUIDE). Copied from the vendor panel;
 * the admin always acts for one vendor: create and import send that
 * vendor's profile `_id` (24-hex) as `vendorId`, bulk delete takes none.
 * Limits count per signed-in admin: 5 uploads / hour, 60 create + delete
 * calls / 10 min.
 *
 * These calls don't use `catchAsync`: the screens need the HTTP status
 * (201 / 207 / 202 / 400 / 409 / 429 mean different things), the result body
 * on a 400 (a full failure still lists every failed item) and the
 * `Retry-After` header on a 429. Every call returns a `TBulkResponse`.
 */

import { serverRequest } from "@/lib/serverFetch";
import type {
  TAdminBulkCreateRequest,
  TBulkCreateResult,
  TBulkDeleteResult,
  TBulkMode,
  TBulkProductItem,
  TImportJob,
  TImportRowError,
  TImportUploadResult,
} from "@/types/product-bulk.type";
import type { TMeta } from "@/types";
import { updateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export type TBulkResponse<T> = {
  /** 2xx, including 207 (some items failed). */
  ok: boolean;
  /** HTTP status; 0 when the server could not be reached. */
  status: number;
  /** `data` of the body: the result on 2xx, and on a 400 that carries one. */
  data: T | null;
  /** Stable error code; branch on this, never on `message`. */
  errorKey: string | null;
  /** Localized display text from the server. */
  message: string;
  /** `errorSources` of a failed request (`path` `""` when none). */
  errorSources: { path: string; message: string }[];
  /** Seconds to wait, from `Retry-After` on a 429. */
  retryAfter: number | null;
  meta?: TMeta;
};

type TBody = {
  success?: boolean;
  message?: string;
  errorKey?: string;
  errorSources?: { path?: string; message?: string }[];
  data?: unknown;
  meta?: TMeta;
};

const sourcesOf = (body: TBody | null) =>
  (Array.isArray(body?.errorSources) ? body.errorSources : []).flatMap((s) =>
    typeof s?.message === "string" ? [{ path: s.path ?? "", message: s.message }] : [],
  );

const retryAfterOf = (headers: unknown): number | null => {
  const raw = (headers as Record<string, unknown> | undefined)?.["retry-after"];
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
};

/** Runs one request and turns any outcome into a `TBulkResponse`. */
const run = async <T>(request: () => Promise<TBody>): Promise<TBulkResponse<T>> => {
  try {
    const body = await request();
    return {
      ok: true,
      status: 200,
      data: (body?.data ?? null) as T | null,
      errorKey: null,
      message: body?.message ?? "",
      errorSources: [],
      retryAfter: null,
      meta: body?.meta,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (isRedirectError(error)) throw error;

    const status: number = error?.response?.status ?? 0;
    const body: TBody | null =
      error?.response?.data && typeof error.response.data === "object"
        ? error.response.data
        : null;

    console.log("Bulk request failed:", status || "no response", body?.errorKey ?? "", body?.message ?? error?.message ?? "");

    return {
      ok: false,
      status,
      data: (body?.data ?? null) as T | null,
      errorKey: body?.errorKey ?? null,
      message: body?.message || error?.message || "Something went wrong!",
      errorSources: sourcesOf(body),
      retryAfter: retryAfterOf(error?.response?.headers),
    };
  }
};

/**
 * `serverRequest` returns only the body, so a 2xx's exact status (201 vs 207,
 * 202) is read from the result instead: 207 when some items failed.
 */
const withCreateStatus = (res: TBulkResponse<TBulkCreateResult>) =>
  res.ok && res.data ? { ...res, status: res.data.failed.length ? 207 : 201 } : res;

const withDeleteStatus = (res: TBulkResponse<TBulkDeleteResult>) =>
  res.ok && res.data ? { ...res, status: res.data.failed.length ? 207 : 200 } : res;

/** Product lists and per-category counts change after a create or delete. */
// `updateTag` (server actions only) expires at once, so the very next list
// load is fresh; `revalidateTag(tag, {})` served the old list one more time.
const expireProductCaches = () => {
  updateTag("products");
  updateTag("product-category");
};

/* ---------- 1. Bulk create ---------- */

/**
 * `POST /products/admin/bulk-create`, 1–50 items, for the vendor whose
 * profile `_id` is `vendorId`. The Add product form sends one item.
 *
 * - 201: all created. 207: some failed (`data.failed`).
 * - 400 with `data.failed`: none created (every item failed, or ATOMIC).
 * - 400 without `data`: the request itself was bad (empty list, over 50…).
 */
export const adminBulkCreateProductsReq = async (
  vendorId: string,
  items: TBulkProductItem[],
  mode: TBulkMode = "PARTIAL",
) => {
  const body: TAdminBulkCreateRequest = { vendorId, mode, items };
  const res = withCreateStatus(
    await run<TBulkCreateResult>(() =>
      serverRequest.post("/products/admin/bulk-create", { data: body }),
    ),
  );
  if (res.data?.created.length) expireProductCaches();
  return res;
};

/* ---------- 2. Bulk soft delete ---------- */

/**
 * `POST /products/admin/bulk-delete`, 1–100 identifiers (`_id` or `PROD-…`,
 * mixed), any vendor's. No `vendorId` (it would be refused).
 * `deleted[]` and `failed[].productId` echo the identifiers as sent.
 */
export const adminBulkDeleteProductsReq = async (
  productIds: string[],
  mode: TBulkMode = "PARTIAL",
) => {
  const res = withDeleteStatus(
    await run<TBulkDeleteResult>(() =>
      serverRequest.post("/products/admin/bulk-delete", { data: { mode, productIds } }),
    ),
  );
  if (res.data?.deleted.length) expireProductCaches();
  return res;
};

/* ---------- 3. File import ---------- */

/** The import template as CSV text; the browser saves it as a file. */
export const getImportTemplateReq = async () => {
  return run<string>(async () => ({
    data: await serverRequest.get("/products/imports/template", { responseType: "text" }),
  }));
};

/**
 * `POST /products/imports` (202). `formData` holds `file` (CSV / XLSX, ≤ 10 MB),
 * `onDuplicate` (`SKIP` | `FAIL`) and, for admins, `vendorId` (the vendor's
 * profile `_id`; missing → 400 `IMPORT_VENDOR_ID_REQUIRED`). Counts toward
 * the admin's 5 uploads per hour, refused uploads included.
 */
export const uploadProductImportReq = async (formData: FormData) => {
  if (!formData.get("vendorId")) {
    // Checked here so a missing vendor never spends one of the 5 uploads.
    return {
      ok: false,
      status: 400,
      data: null,
      errorKey: "IMPORT_VENDOR_ID_REQUIRED",
      message: "",
      errorSources: [],
      retryAfter: null,
    } satisfies TBulkResponse<TImportUploadResult>;
  }
  const res = await run<TImportUploadResult>(() =>
    serverRequest.post("/products/imports", { data: formData }),
  );
  return res.ok ? { ...res, status: 202 } : res;
};

/** `GET /products/imports/:jobId`; poll every 2–3 s until a final status. */
export const getImportJobReq = async (jobId: string) => {
  const res = await run<TImportJob>(() =>
    serverRequest.get(`/products/imports/${encodeURIComponent(jobId)}`),
  );
  if (res.data && ["COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED"].includes(res.data.status)) {
    // Whatever the import created is now on the vendor's product lists.
    if (res.data.successCount > 0) expireProductCaches();
  }
  return res;
};

/** `GET /products/imports/:jobId/errors`, paged (limit ≤ 100). */
export const getImportErrorsReq = async (jobId: string, page = 1, limit = 20) => {
  return run<TImportRowError[]>(() =>
    serverRequest.get(`/products/imports/${encodeURIComponent(jobId)}/errors`, {
      params: { page, limit },
    }),
  );
};

/** Failed rows as CSV text (template columns + `error_*`), ready to fix and re-upload. */
export const getImportErrorsCsvReq = async (jobId: string) => {
  return run<string>(async () => ({
    data: await serverRequest.get(
      `/products/imports/${encodeURIComponent(jobId)}/errors.csv`,
      { responseType: "text" },
    ),
  }));
};
