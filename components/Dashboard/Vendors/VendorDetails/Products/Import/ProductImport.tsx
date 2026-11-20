"use client";

/**
 * Admin: Import products for one vendor
 * (PRODUCT_BULK_AND_IMPORT_FRONTEND_GUIDE §3, plan.md A3).
 *
 * Copy of the vendor panel's ProductImport, for the vendor the admin opened:
 * the upload carries `vendorId` (the vendor's profile `_id`), restaurant rules
 * and the category / VAT lists are that vendor's, and the running job's id is
 * kept per admin + vendor in localStorage, so a reload picks it up again.
 * Two ways in, the same import behind both: upload a file, or build / fix
 * the list in the browser (SheetEditor, A4).
 */

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import {
  getImportTemplateReq,
  uploadProductImportReq,
} from "@/services/dashboard/product/product-bulk.service";
import type { TImportOnDuplicate } from "@/types/product-bulk.type";
import { bulkErrorText, bulkRequestErrorText, fillVars } from "@/utils/bulkErrors";
import { cn } from "@/lib/utils";
import { Download, FileSpreadsheet, LoaderCircle, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ImportJobPanel from "./ImportJobPanel";
import SheetEditor, { type TSheetCategory, type TSheetLoad } from "./SheetEditor";
import { useVendorTopbarTitle } from "@/hooks/useVendorTopbarTitle";
import { cleanImportFile, type TFileCleanup } from "@/utils/productSheet";
import { downloadText, forgetJob, readSavedJob, saveJob } from "./importStorage";

const MAX_BYTES = 10 * 1024 * 1024;
const REQUIRED_COLUMNS = ["name_en", "name_pt", "category", "tax_rate"];

interface IProps {
  /** `<adminId>:<vendorUserId>`, so a saved job is only resumed by the same admin for the same vendor. */
  vendorKey: string;
  /** The vendor's profile `_id`, sent as the upload's `vendorId`. */
  vendorMongoId: string;
  /** The vendor's user id (`V-…`), for links back to its pages. */
  vendorUserId: string;
  vendorName: string;
  isRestaurant: boolean;
  categories: TSheetCategory[];
  taxRates: number[];
}

/** The problem with a chosen file, checked before it is uploaded; `null` if fine. */
async function checkFile(file: File, t: (key: string) => string): Promise<string | null> {
  const ext = file.name.toLowerCase().split(".").pop();
  if (ext !== "csv" && ext !== "xlsx") return bulkErrorText(t, "IMPORT_FILE_UNSUPPORTED_TYPE");
  if (file.size > MAX_BYTES) return bulkErrorText(t, "IMPORT_FILE_TOO_LARGE");
  if (file.size === 0) return bulkErrorText(t, "IMPORT_FILE_INVALID_CONTENT");
  if (ext === "csv") {
    // The header row only; the server checks everything else.
    const head = await file.slice(0, 64 * 1024).text();
    const columns = (head.replace(/^﻿/, "").split(/\r?\n/)[0] ?? "")
      .split(/[,;]/)
      .map((c) => c.trim().replace(/^"|"$/g, "").toLowerCase());
    const missing = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
    if (missing.length) return fillVars(t("import_file_missing_columns"), { columns: missing.join(", ") });
  }
  return null;
}

export default function ProductImport({
  vendorKey,
  vendorMongoId,
  vendorUserId,
  vendorName,
  isRestaurant,
  categories,
  taxRates,
}: IProps) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const itemsHref = `/admin/vendor/${vendorUserId}/manage-products`;
  useVendorTopbarTitle(vendorName);
  const [mode, setMode] = useState<"file" | "editor">("file");
  const [editorLoad, setEditorLoad] = useState<TSheetLoad | null>(null);
  const categoryNames = categories.map((c) => (lang === "pt" ? c.namePt || c.nameEn : c.nameEn || c.namePt));
  const [jobId, setJobId] = useState<string | null>(null);
  const [checkedSaved, setCheckedSaved] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [onDuplicate, setOnDuplicate] = useState<TImportOnDuplicate>("SKIP");
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // A job started earlier (this tab, another tab, before a reload) comes back.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from localStorage after mount
    setJobId(readSavedJob(vendorKey));
    setCheckedSaved(true);
  }, [vendorKey]);

  const pickFile = async (picked: File | null | undefined) => {
    if (!picked) return;
    const problem = await checkFile(picked, t);
    setFile(problem ? null : picked);
    setFileError(problem);
  };

  const clearFile = () => {
    setFile(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const downloadTemplate = async () => {
    setDownloading(true);
    const res = await getImportTemplateReq();
    setDownloading(false);
    if (res.ok && typeof res.data === "string") {
      downloadText(res.data, "product-import-template.csv");
    } else {
      toast.error(bulkRequestErrorText(t, res));
    }
  };

  /**
   * Uploads a file for this vendor (the admin's own, or the one the editor
   * generates) and switches to its progress. Resolves true when it started.
   */
  const uploadFile = async (upload: File): Promise<boolean> => {
    const form = new FormData();
    form.append("file", upload);
    form.append("onDuplicate", onDuplicate);
    form.append("vendorId", vendorMongoId);
    const res = await uploadProductImportReq(form);

    if (res.ok && res.data?.jobId) {
      setEditorLoad(null);
      saveJob(vendorKey, res.data.jobId);
      setJobId(res.data.jobId);
      return true;
    }
    if (res.errorKey === "IMPORT_ALREADY_IN_PROGRESS") {
      // Ours, if we know it: show its progress instead of an error.
      const saved = readSavedJob(vendorKey);
      if (saved) {
        toast.error(t("bulk_err_IMPORT_ALREADY_IN_PROGRESS"));
        setJobId(saved);
        return false;
      }
      toast.error(t("import_already_running_elsewhere"));
      return false;
    }
    toast.error(bulkRequestErrorText(t, res));
    return false;
  };

  const startImport = async () => {
    if (!file || uploading) return;
    setUploading(true);
    // Cells the backend refuses but that mean nothing (SDR count with SDR
    // off, a restaurant's stock) are dropped here, as the editor does.
    let toSend = file;
    let cleanup: TFileCleanup | null = null;
    try {
      const cleaned = await cleanImportFile(file, isRestaurant);
      if (cleaned) ({ file: toSend, cleanup } = cleaned);
    } catch {
      /* unreadable here: send it as it is, the server reports what's wrong */
    }
    const started = await uploadFile(toSend);
    if (started && cleanup) {
      const parts = [
        cleanup.sdrCounts ? fillVars(t("import_cleaned_sdr"), { count: cleanup.sdrCounts }) : "",
        cleanup.stocks ? fillVars(t("import_cleaned_stock"), { count: cleanup.stocks }) : "",
      ].filter(Boolean);
      toast.info(t("import_cleaned_title"), { description: parts.join(" "), duration: 8000 });
    }
    setUploading(false);
    if (started) clearFile();
  };

  const startOver = () => {
    forgetJob(vendorKey);
    setJobId(null);
  };

  return (
    <div className="space-y-6">
      <TitleHeader
        title={fillVars(t("import_items"), { vendor: vendorName })}
        subtitle={t("import_subtitle")}
        onBackClick={() => router.push(itemsHref)}
      />

      {!checkedSaved ? (
        <div className="flex justify-center py-16">
          <LoaderCircle className="h-6 w-6 animate-spin text-[#DC3173]" aria-hidden />
        </div>
      ) : jobId ? (
        <ImportJobPanel
          jobId={jobId}
          t={t}
          isRestaurant={isRestaurant}
          onGone={startOver}
          onStartOver={startOver}
          itemsHref={itemsHref}
          onFixInEditor={(rows) => {
            setEditorLoad({ id: Date.now(), rows });
            setMode("editor");
            startOver();
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Two ways in, the same import behind both. */}
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1" role="tablist">
            {(["file", "editor"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  mode === value ? "bg-[#DC3173] text-white" : "text-gray-600 hover:bg-gray-50",
                )}
              >
                {t(value === "file" ? "import_tab_file" : "import_tab_editor")}
              </button>
            ))}
          </div>

          {/* Kept mounted while hidden, so switching tabs keeps the grid. */}
          <div className={mode === "editor" ? "" : "hidden"}>
            <SheetEditor
              t={t}
              lang={lang}
              isRestaurant={isRestaurant}
              categories={categories}
              taxRates={taxRates}
              onDuplicate={onDuplicate}
              setOnDuplicate={setOnDuplicate}
              submitFile={uploadFile}
              vendorKey={vendorKey}
              load={editorLoad}
            />
          </div>

        <div className={cn("grid gap-6 lg:grid-cols-2", mode === "file" ? "" : "hidden")}>
          {/* How it works */}
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">{t("import_how_title")}</h2>
            <ol className="space-y-3 text-sm text-gray-700">
              <Step n={1}>
                <p>{t("import_step_template")}</p>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  disabled={downloading}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  {downloading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Download className="h-4 w-4" aria-hidden />
                  )}
                  {t("import_download_template")}
                </button>
              </Step>
              <Step n={2}>{t("import_step_required")}</Step>
              <Step n={3}>{t("import_step_category")}</Step>
              <Step n={4}>{t("import_step_variations")}</Step>
              {isRestaurant && <Step n={5}>{t("import_step_restaurant")}</Step>}
            </ol>

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-sm">
              <div>
                <p className="mb-1.5 text-gray-500">{t("import_your_categories")}</p>
                {categoryNames.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {categoryNames.map((name) => (
                      <span key={name} className="rounded-full bg-[#DC3173]/10 px-2.5 py-0.5 text-xs font-medium text-[#DC3173]">
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-amber-700">{t("import_no_categories")}</p>
                )}
              </div>
              <div>
                <p className="mb-1.5 text-gray-500">{t("import_your_tax_rates")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {taxRates.map((rate) => (
                    <span key={rate} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                      {rate}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Upload */}
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">{t("import_upload_title")}</h2>

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                void pickFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                dragOver ? "border-[#DC3173] bg-[#DC3173]/10" : "border-[#DC3173]/30 bg-[#DC3173]/5 hover:bg-[#DC3173]/10",
              )}
            >
              <Upload className="mb-2 h-7 w-7 text-[#DC3173]" aria-hidden />
              <span className="font-medium text-[#B02458]">{t("import_drop_here")}</span>
              <span className="mt-1 text-sm text-gray-500">{t("import_drop_hint")}</span>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                onChange={(e) => void pickFile(e.target.files?.[0])}
              />
            </label>

            {fileError && <p className="mt-3 text-sm text-red-600">{fileError}</p>}

            {file && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 shrink-0 text-[#DC3173]" aria-hidden />
                  <span className="truncate font-medium text-gray-800">{file.name}</span>
                  <span className="shrink-0 text-gray-500">· {Math.max(1, Math.round(file.size / 1024))} KB</span>
                </span>
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label={t("import_remove_file")}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm text-gray-600">{t("import_duplicates_label")}</legend>
              <div className="flex flex-wrap gap-2">
                {(["SKIP", "FAIL"] as const).map((value) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                      onDuplicate === value
                        ? "border-[#DC3173] bg-[#DC3173]/5 text-[#B02458]"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    <input
                      type="radio"
                      name="onDuplicate"
                      value={value}
                      checked={onDuplicate === value}
                      onChange={() => setOnDuplicate(value)}
                      className="accent-[#DC3173]"
                    />
                    {t(value === "SKIP" ? "import_dup_skip" : "import_dup_fail")}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={startImport}
              disabled={!file || uploading}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#DC3173] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B02458] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
              {uploading ? t("import_uploading") : t("import_start")}
            </button>
          </section>
        </div>
        </div>
      )}
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DC3173]/10 text-xs font-semibold text-[#DC3173]">
        {n}
      </span>
      <div className="pt-0.5">{children}</div>
    </li>
  );
}
