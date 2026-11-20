/**
 * Product bulk create, CSV / XLSX import and bulk soft delete
 * (PRODUCT_BULK_AND_IMPORT_FRONTEND_GUIDE, Appendix A).
 *
 * Copied from the vendor panel (same backend). Admin routes take the
 * vendor's profile `_id` (24-hex, not `V-…`) as `vendorId`.
 *
 * Shapes checked against the live test API on 19 Nov 2026: bulk create 207
 * and ATOMIC 400, import 202 → COMPLETED_WITH_ERRORS, row errors, bulk delete
 * 207 with mixed `_id` / `PROD-` identifiers.
 */

export type TLocalizedText = { en: string; pt: string };

/** `PARTIAL` (default): save what is valid. `ATOMIC`: all or nothing. */
export type TBulkMode = "PARTIAL" | "ATOMIC";

/* ---------- 1. Bulk create: POST /products/bulk-create ---------- */

export type TBulkVariationOption = {
  /** Each language at least 2 characters. */
  label: TLocalizedText;
  /** Full price of this option (not a surcharge), `>= 0`. */
  price: number;
  sku?: string;
  /** Never above 0 for restaurants (`VARIATION_STOCK_NOT_ALLOWED_FOR_RESTAURANTS`). */
  stockQuantity?: number;
  isOutOfStock?: boolean;
};

export type TBulkVariation = {
  name: TLocalizedText;
  /** At least one. */
  options: TBulkVariationOption[];
};

/** One product; the single "Add item" form sends exactly one of these. */
export type TBulkProductItem = {
  name: TLocalizedText;
  description?: TLocalizedText;
  /** ProductCategory `_id`, the vendor's own and active. */
  category: string;
  /** Up to 5 ids. */
  additionalCategories?: string[];
  brand?: string;
  /** A URL; leave it out for the admin's default picture. */
  image?: string;
  pricing: {
    /** Required (> 0) without variation options; ignored with them. */
    price?: number;
    /** 0–100, default 0. */
    discount?: number;
    discountType?: "PERCENTAGE" | "FLAT";
    /** Tax `_id`. */
    taxId: string;
    currency?: string;
  };
  /** Leave the key out (not `[]`) when the product has no variations. */
  variations?: TBulkVariation[];
  addonGroups?: string[];
  /** Restaurants: leave it out (`STOCK_MANAGEMENT_NOT_ALLOWED_FOR_RESTAURANTS`). */
  stock?: {
    quantity: number;
    unit?: string;
    availabilityStatus?: "In Stock" | "Out of Stock" | "Limited";
  };
  sdr?: { applicable: boolean; containerCount?: number };
  meta?: {
    isFeatured?: boolean;
    isAvailableForPreOrder?: boolean;
    status?: "ACTIVE" | "INACTIVE";
    origin?: string;
  };
};

export type TBulkCreatedItem = {
  /** Position in the `items` array that was sent (0-based). */
  index: number;
  _id: string;
  /** `PROD-XXXXXX` */
  productId: string;
  sku: string;
  name: TLocalizedText;
};

export type TBulkFieldError = { path: string; message: string };

export type TBulkFailedItem = {
  index: number;
  name?: Partial<TLocalizedText>;
  code: TBulkCreateFailureCode | string;
  /** Localized display text. Branch on `code`. */
  message: string;
  /** Field-level problems; `path` is inside the item (`pricing.price`, `name.en`…). */
  errors?: TBulkFieldError[];
};

export type TBulkCreateResult = {
  summary: { total: number; created: number; failed: number };
  created: TBulkCreatedItem[];
  failed: TBulkFailedItem[];
};

/** `POST /products/admin/bulk-create` */
export type TAdminBulkCreateRequest = {
  /** The vendor's profile `_id` (24-hex). Unknown → 404 `NOT_FOUND_MESSAGE`. */
  vendorId: string;
  mode?: TBulkMode;
  /** 1–50. */
  items: TBulkProductItem[];
};

/* ---------- 2. File import: /products/imports ---------- */

export type TImportOnDuplicate = "SKIP" | "FAIL";

export type TImportStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "COMPLETED_WITH_ERRORS"
  | "FAILED"
  | "CANCELED";

export type TImportUploadResult = { jobId: string; status: "PENDING" };

export type TImportJob = {
  _id: string;
  vendorId: string;
  requestedBy?: string;
  requestedByRole: string;
  originalName: string;
  fileType: "CSV" | "XLSX";
  fileSize: number;
  status: TImportStatus;
  lang: "en" | "pt";
  options: { onDuplicate: TImportOnDuplicate };
  /** File rows; 0 until the file has been counted. */
  totalRows: number;
  /** File rows. */
  processedRows: number;
  /** Products, not rows. */
  successCount: number;
  failureCount: number;
  skippedCount: number;
  lastProcessedRow: number;
  /** Only on `FAILED`; display text in the upload's language. */
  failureReason?: string;
  startedAt?: string;
  finishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  /** 0–100; meaningful only while `totalRows > 0`. */
  progress: number;
};

export type TImportRowError = {
  _id: string;
  jobId: string;
  /** File row where the product starts (header = row 1). */
  rowNumber: number;
  name?: string;
  code: TImportRowErrorCode | string;
  message: string;
  /** First row of the product, keyed by column name. */
  raw: Record<string, string>;
  /** Remaining rows of a multi-row (variation) product. */
  extraRows?: Record<string, string>[];
};

/* ---------- 3. Bulk soft delete: POST /products/admin/bulk-delete (no vendorId) ---------- */

export type TBulkDeleteFailedItem = {
  /** The identifier exactly as it was sent. */
  productId: string;
  code: TBulkDeleteFailureCode | string;
  message: string;
};

export type TBulkDeleteResult = {
  summary: { total: number; deleted: number; failed: number };
  /** Identifiers exactly as sent. */
  deleted: string[];
  failed: TBulkDeleteFailedItem[];
};

/* ---------- Error codes (Appendix B) ---------- */

export type TBulkCreateFailureCode =
  | "BULK_PRODUCT_ITEM_VALIDATION_FAILED"
  | "BULK_PRODUCT_INVALID_REFERENCE_ID"
  | "BULK_PRODUCT_DUPLICATE_NAME_IN_REQUEST"
  | "BULK_PRODUCT_DUPLICATE_VARIATION_SKU_IN_REQUEST"
  | "CATEGORY_NOT_OWNED_BY_VENDOR"
  | "CATEGORY_INACTIVE"
  | "NOT_FOUND_MESSAGE"
  | "INVALID_ADDON_GROUPS"
  | "STOCK_MANAGEMENT_NOT_ALLOWED_FOR_RESTAURANTS"
  | "VARIATION_STOCK_NOT_ALLOWED_FOR_RESTAURANTS"
  | "PRICE_REQUIRED_WHEN_NO_VARIATIONS"
  | "BULK_PRODUCT_ID_COLLISION"
  | "BULK_PRODUCT_INSERT_FAILED";

export type TImportRowErrorCode =
  | "IMPORT_CATEGORY_REQUIRED"
  | "IMPORT_CATEGORY_NOT_FOUND"
  | "IMPORT_TAX_RATE_REQUIRED"
  | "IMPORT_TAX_RATE_NOT_FOUND"
  | "IMPORT_INVALID_NUMBER"
  | "IMPORT_INVALID_BOOLEAN"
  | "IMPORT_INVALID_ENUM"
  | "IMPORT_VARIATION_FIELDS_REQUIRED"
  | "IMPORT_DUPLICATE_OPTION"
  | "IMPORT_GROUP_NOT_CONTIGUOUS"
  | "IMPORT_GROUP_CONFLICT"
  | "IMPORT_DUPLICATE_PRODUCT"
  | "IMPORT_DUPLICATE_PRODUCT_SKIPPED"
  | TBulkCreateFailureCode;

/** Admin upload without `vendorId`. */
export type TImportAdminErrorCode = "IMPORT_VENDOR_ID_REQUIRED";

export type TBulkDeleteFailureCode =
  | "PRODUCT_NOT_FOUND"
  | "COMMON_ACCESS_DENIED"
  | "PRODUCT_ALREADY_DELETED"
  | "CANNOT_DELETE_PRODUCT_WITH_ACTIVE_ORDER";
