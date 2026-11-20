"use client";

/**
 * One import job: progress while it runs, then the result and the rows that
 * failed (PRODUCT_BULK_AND_IMPORT_FRONTEND_GUIDE §3.3–3.5).
 *
 * Polls every 2.5 s until a final status. A 429 or a network blip doesn't stop
 * it (it waits and asks again); a 404 means the job is gone (expired), and the
 * page goes back to the upload form.
 *
 * Admin copy of the vendor panel's panel: "Go to Food Items" goes to the
 * chosen vendor's list, and "Fix in the editor" only shows once the editor
 * is there (`onFixInEditor`).
 */

import {
  getImportErrorsCsvReq,
  getImportErrorsReq,
  getImportJobReq,
} from "@/services/dashboard/product/product-bulk.service";
import type { TImportJob, TImportRowError, TImportStatus } from "@/types/product-bulk.type";
import type { TMeta } from "@/types";
import {
  IMPORT_FINAL_STATUSES,
  bulkErrorText,
  bulkRequestErrorText,
  countText,
  fillVars,
} from "@/utils/bulkErrors";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  LoaderCircle,
  RotateCcw,
  XCircle,
  PencilLine,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { explainImportRow } from "@/utils/productSheet";
import { downloadText } from "./importStorage";
import { invalidateProductsCache } from "@/hooks/use-progressive-products";

const POLL_MS = 2500;
const ERRORS_PER_PAGE = 20;

const STATUS_STYLE: Record<TImportStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PROCESSING: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-700",
  COMPLETED_WITH_ERRORS: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELED: "bg-gray-100 text-gray-700",
};

interface IProps {
  jobId: string;
  t: (key: string) => string;
  isRestaurant: boolean;
  /** The job no longer exists (404). */
  onGone: () => void;
  /** "Import another file". */
  onStartOver: () => void;
  /** Loads the failed products into the editor; no button without it. */
  onFixInEditor?: (rows: TImportRowError[]) => void;
  /** The vendor's Food Items page. */
  itemsHref: string;
}

export default function ImportJobPanel({ jobId, t, isRestaurant, onGone, onStartOver, onFixInEditor, itemsHref }: IProps) {
  const [loadingFailed, setLoadingFailed] = useState(false);

  /** Every failed row (all pages), duplicates that were skipped left out. */
  const fixInEditor = async () => {
    setLoadingFailed(true);
    const failed: TImportRowError[] = [];
    for (let page = 1, pages = 1; page <= pages; page++) {
      const res = await getImportErrorsReq(jobId, page, 100);
      if (!res.ok || !res.data) {
        setLoadingFailed(false);
        toast.error(bulkRequestErrorText(t, res));
        return;
      }
      failed.push(...res.data.filter((row) => !isSkipped(row.code)));
      pages = res.meta?.totalPage ?? 1;
    }
    setLoadingFailed(false);
    if (!failed.length) {
      toast.error(t("import_fix_nothing"));
      return;
    }
    onFixInEditor?.(failed);
  };
  const [job, setJob] = useState<TImportJob | null>(null);

  // Poll until a final status.
  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;

    const tick = async () => {
      const res = await getImportJobReq(jobId);
      if (stopped) return;
      if (res.status === 404) {
        toast.error(bulkErrorText(t, "IMPORT_JOB_NOT_FOUND"));
        onGone();
        return;
      }
      if (res.ok && res.data) {
        setJob(res.data);
        if (IMPORT_FINAL_STATUSES.has(res.data.status)) {
          // The Food Items list keeps loaded pages in memory for 2 min; drop
          // them so "Go to Food Items" shows the new products.
          if (res.data.successCount > 0) invalidateProductsCache();
          return;
        }
      }
      // Rate-limited: wait as long as asked; otherwise the normal beat.
      const wait = res.status === 429 && res.retryAfter ? res.retryAfter * 1000 : POLL_MS;
      timer = window.setTimeout(tick, wait);
    };

    void tick();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
    // `t` / `onGone` change identity on every render; the job id is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  if (!job) {
    return (
      <section className="flex items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white p-10 text-gray-600 shadow-sm">
        <LoaderCircle className="h-5 w-5 animate-spin text-[#DC3173]" aria-hidden />
        {t("import_loading_job")}
      </section>
    );
  }

  const final = IMPORT_FINAL_STATUSES.has(job.status);
  const counted = job.totalRows > 0;
  const percent = counted ? Math.min(100, Math.round((job.processedRows / job.totalRows) * 100)) : 0;
  const needsAttention = job.failureCount + job.skippedCount;

  const title = !final
    ? fillVars(t("import_running_title"), { file: job.originalName })
    : job.status === "FAILED"
      ? t("import_failed_title")
      : job.status === "CANCELED"
        ? t("import_canceled_title")
        : job.failureCount > 0
          ? countText(t, "import_done_errors_title", job.failureCount)
          : countText(t, "import_done_title", job.successCount);

  const Icon = !final
    ? LoaderCircle
    : job.status === "COMPLETED" && job.failureCount === 0
      ? CheckCircle2
      : job.status === "FAILED"
        ? XCircle
        : AlertTriangle;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="flex min-w-0 items-center gap-2 text-lg font-semibold text-gray-800">
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                !final && "animate-spin text-[#DC3173]",
                final && Icon === CheckCircle2 && "text-green-600",
                final && Icon === XCircle && "text-red-600",
                final && Icon === AlertTriangle && "text-amber-500",
              )}
              aria-hidden
            />
            <span className="break-words">{title}</span>
          </h2>
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", STATUS_STYLE[job.status])}>
            {t(`import_status_${job.status}`)}
          </span>
        </div>
        {final && <p className="mt-1 text-sm text-gray-500">{job.originalName}</p>}

        {!final && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>
                {counted
                  ? fillVars(t("import_rows_progress"), { done: job.processedRows, total: job.totalRows })
                  : t("import_counting")}
              </span>
              {counted && <span>{percent}%</span>}
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className={cn("h-full rounded-full bg-[#DC3173] transition-all", !counted && "w-1/3 animate-pulse")}
                style={counted ? { width: `${percent}%` } : undefined}
              />
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Counter label={t("import_created")} value={job.successCount} className="text-green-700" />
          <Counter label={t("import_failed")} value={job.failureCount} className="text-red-700" />
          <Counter label={t("import_skipped")} value={job.skippedCount} className="text-amber-700" />
        </div>

        {!final && <p className="mt-5 text-sm text-gray-500">{t("import_leave_note")}</p>}

        {job.status === "FAILED" && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p>{job.failureReason || t("bulk_err_UNKNOWN")}</p>
            {job.successCount > 0 && <p className="mt-1">{t("import_failed_kept")}</p>}
          </div>
        )}

        {final && (
          <div className="mt-5 flex flex-wrap gap-2">
            {job.failureCount > 0 && onFixInEditor && (
              <button
                type="button"
                onClick={fixInEditor}
                disabled={loadingFailed}
                className="inline-flex items-center gap-2 rounded-lg border border-[#DC3173] bg-white px-4 py-2 text-sm font-medium text-[#DC3173] transition-colors hover:bg-[#DC3173]/5 disabled:opacity-60"
              >
                {loadingFailed ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <PencilLine className="h-4 w-4" aria-hidden />}
                {countText(t, "import_fix_in_editor", job.failureCount)}
              </button>
            )}
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {t("import_another")}
            </button>
            <Link
              href={itemsHref}
              className="inline-flex items-center gap-2 rounded-lg bg-[#DC3173] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B02458]"
            >
              {t("import_go_all_items")}
            </Link>
          </div>
        )}
      </section>

      {final && needsAttention > 0 && <ImportErrors jobId={job._id} t={t} isRestaurant={isRestaurant} />}
    </div>
  );
}

function Counter({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={cn("text-2xl font-bold", className)}>{value}</p>
    </div>
  );
}

/** The rows that didn't become products, 20 at a time, and their CSV. */
function ImportErrors({ jobId, t, isRestaurant }: { jobId: string; t: (key: string) => string; isRestaurant: boolean }) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<TImportRowError[] | null>(null);
  const [meta, setMeta] = useState<TMeta | undefined>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let stopped = false;
    void getImportErrorsReq(jobId, page, ERRORS_PER_PAGE).then((res) => {
      if (stopped) return;
      if (res.ok && res.data) {
        setRows(res.data);
        setMeta(res.meta);
        setLoadFailed(false);
      } else {
        setLoadFailed(true);
      }
    });
    return () => {
      stopped = true;
    };
  }, [jobId, page]);

  const downloadCsv = async () => {
    setDownloading(true);
    const res = await getImportErrorsCsvReq(jobId);
    setDownloading(false);
    if (res.ok && typeof res.data === "string") downloadText(res.data, `import-failed-rows-${jobId}.csv`);
    else toast.error(bulkRequestErrorText(t, res));
  };

  const totalPages = meta?.totalPage ?? 1;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{t("import_rows_title")}</h3>
          <p className="text-sm text-gray-500">{t("import_rows_hint")}</p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-lg border border-[#DC3173]/30 bg-white px-4 py-2 text-sm font-medium text-[#DC3173] transition-colors hover:bg-[#DC3173]/5 disabled:opacity-60"
        >
          {downloading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
          {t("import_download_failed_rows")}
        </button>
      </div>

      {loadFailed ? (
        <p className="text-sm text-red-600">{t("import_rows_load_failed")}</p>
      ) : !rows ? (
        <div className="flex justify-center py-6">
          <LoaderCircle className="h-5 w-5 animate-spin text-[#DC3173]" aria-hidden />
        </div>
      ) : (
        <>
          {/* A table on wide screens, cards on a phone. */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
                  <th className="px-3 py-2 font-medium">{t("import_col_row")}</th>
                  <th className="px-3 py-2 font-medium">{t("import_col_product")}</th>
                  <th className="px-3 py-2 font-medium">{t("import_col_result")}</th>
                  <th className="px-3 py-2 font-medium">{t("import_col_problem")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id} className="border-b border-gray-100 align-top">
                    <td className="px-3 py-2 text-gray-600">{row.rowNumber}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{row.name || "—"}</td>
                    <td className="px-3 py-2">
                      <ResultPill code={row.code} t={t} />
                    </td>
                    <td className="px-3 py-2">
                      <Problem row={row} t={t} isRestaurant={isRestaurant} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-2 md:hidden">
            {rows.map((row) => (
              <li key={row._id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-800">{row.name || "—"}</p>
                  <span className="shrink-0 text-xs text-gray-500">
                    {t("import_col_row")} {row.rowNumber}
                  </span>
                </div>
                <div className="mt-1.5">
                  <ResultPill code={row.code} t={t} />
                </div>
                <div className="mt-1.5">
                  <Problem row={row} t={t} isRestaurant={isRestaurant} />
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 text-sm text-gray-600">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label={t("previous")}
                className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label={t("next")}
                className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

const isSkipped = (code: string) => code === "IMPORT_DUPLICATE_PRODUCT_SKIPPED";

function ResultPill({ code, t }: { code: string; t: (key: string) => string }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isSkipped(code) ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700",
      )}
    >
      {t(isSkipped(code) ? "import_result_skipped" : "import_result_failed")}
    </span>
  );
}

/**
 * Our wording for the code (in the language being read), and the server's
 * own message under it when it says more — it names the value at fault
 * ("Category 'Fish' was not found…") in the language of the upload.
 */
function Problem({ row, t, isRestaurant }: { row: TImportRowError; t: (key: string) => string; isRestaurant: boolean }) {
  const ours = bulkErrorText(t, row.code, row.message);
  // The server only says "some fields are invalid" for these: name the cell.
  const causes = isSkipped(row.code) || !row.raw ? [] : explainImportRow(row, isRestaurant);
  return (
    <>
      <p className={isSkipped(row.code) ? "text-amber-800" : "text-red-700"}>{ours}</p>
      {row.message && row.message !== ours && <p className="mt-0.5 text-xs text-gray-500">{row.message}</p>}
      {causes.map((key) => (
        <p key={key} className="mt-1 text-xs font-medium text-gray-700">
          {t(key === "sheet_fix_sdr_count_removed" ? "import_cause_sdr" : "import_cause_stock")}
        </p>
      ))}
    </>
  );
}
