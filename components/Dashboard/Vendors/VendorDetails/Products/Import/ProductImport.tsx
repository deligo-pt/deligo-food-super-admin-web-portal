"use client";

/**
 * Admin: Import products for one vendor
 * (PRODUCT_BULK_AND_IMPORT_FRONTEND_GUIDE §3, plan.md A3 + §9.5).
 *
 * Copy of the vendor panel's ProductImport (Import v2), for the vendor the
 * admin opened: the file is written in ONE language (picked here), read in
 * the browser, every product gets the defaults (Active, SDR off), the other
 * language is translated, and everything opens in the editor for review.
 * Only the editor's Import sends a file — for this vendor (`vendorId` = its
 * profile `_id`); restaurant rules and the category / VAT lists are that
 * vendor's. The running job's id is kept per admin + vendor in localStorage,
 * so a reload picks it up again.
 */

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { uploadProductImportReq } from "@/services/dashboard/product/product-bulk.service";
import type { TImportOnDuplicate } from "@/types/product-bulk.type";
import { bulkErrorText, bulkRequestErrorText, countText, fillVars } from "@/utils/bulkErrors";
import { cn } from "@/lib/utils";
import { Download, FileSpreadsheet, Languages, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import ImportJobPanel from "./ImportJobPanel";
import SheetEditor, { type TSheetCategory, type TSheetLoad } from "./SheetEditor";
import { useVendorTopbarTitle } from "@/hooks/useVendorTopbarTitle";
import { MAX_SHEET_ROWS, readSimpleSheet, simpleTemplateCsv, type TSheetLang } from "@/utils/productSheet";
import { translateSheet } from "@/utils/sheetTranslate";
import { requestTranslations } from "@/utils/translation/requestTranslations";
import { downloadText, forgetJob, readSavedJob, saveJob } from "./importStorage";

const MAX_BYTES = 10 * 1024 * 1024;

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

/** The problem with a chosen file, checked before it is read; `null` if fine. */
function checkFile(file: File, t: (key: string) => string): string | null {
  const ext = file.name.toLowerCase().split(".").pop();
  if (ext !== "csv" && ext !== "xlsx") return bulkErrorText(t, "IMPORT_FILE_UNSUPPORTED_TYPE");
  if (file.size > MAX_BYTES) return bulkErrorText(t, "IMPORT_FILE_TOO_LARGE");
  if (file.size === 0) return bulkErrorText(t, "IMPORT_FILE_INVALID_CONTENT");
  return null;
}

/** Reading → translating (batches done / total), shown while a file is prepared. */
type TPreparing = { stage: "reading" } | { stage: "translating"; done: number; total: number };

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
  /** The language the vendor's file is written in; the other one is translated. */
  const [fileLang, setFileLang] = useState<TSheetLang>(lang === "pt" ? "pt" : "en");
  // Own radio group per copy: the admin layout renders the page twice (one
  // copy hidden), and two groups with one name untick each other.
  const fileLangName = `importFileLang-${useId()}`;
  const [onDuplicate, setOnDuplicate] = useState<TImportOnDuplicate>("SKIP");
  const [preparing, setPreparing] = useState<TPreparing | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const numberLocale = lang === "pt" ? "pt-PT" : "en-GB";

  // A job started earlier (this tab, another tab, before a reload) comes back.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from localStorage after mount
    setJobId(readSavedJob(vendorKey));
    setCheckedSaved(true);
  }, [vendorKey]);

  // Leaving the page stops a translation that is still running.
  useEffect(() => () => abortRef.current?.abort(), []);

  const pickFile = (picked: File | null | undefined) => {
    if (!picked) return;
    const problem = checkFile(picked, t);
    setFile(problem ? null : picked);
    setFileError(problem);
  };

  const clearFile = () => {
    setFile(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const downloadTemplate = () => {
    const category = categories[0] && (fileLang === "pt" ? categories[0].namePt || categories[0].nameEn : categories[0].nameEn || categories[0].namePt);
    const csv = simpleTemplateCsv({ lang: fileLang, isRestaurant, category, taxRate: taxRates[0] });
    downloadText(csv, fileLang === "pt" ? "modelo-importacao-produtos.csv" : "product-import-template.csv");
  };

  /**
   * Initial import: read the file, fill the defaults, translate the other
   * language, then open everything in the editor. Nothing is sent to the
   * server here. Used by this tab and by the editor's "Open file".
   */
  const prepareFile = async (picked: File): Promise<boolean> => {
    const problem = checkFile(picked, t);
    if (problem) {
      toast.error(problem);
      return false;
    }
    if (preparing) return false;
    const controller = new AbortController();
    abortRef.current = controller;
    setPreparing({ stage: "reading" });
    try {
      const sheet = await readSimpleSheet(picked, fileLang, { isRestaurant });
      if (sheet.missingColumns.length) {
        toast.error(fillVars(t("import_file_missing_columns"), { columns: sheet.missingColumns.join(", ") }));
        return false;
      }
      if (!sheet.products.length) {
        toast.error(t("sheet_file_empty"));
        return false;
      }
      if (sheet.rowCount > MAX_SHEET_ROWS) {
        toast.error(fillVars(t("sheet_too_many_rows"), { max: MAX_SHEET_ROWS.toLocaleString(numberLocale) }));
        return false;
      }

      const result = await translateSheet(sheet.products, fileLang, requestTranslations, {
        signal: controller.signal,
        onProgress: (done, total) => setPreparing({ stage: "translating", done, total }),
      });

      setEditorLoad({ id: Date.now(), kind: "review", from: fileLang, ...result });
      setMode("editor");
      toast.success(countText(t, "import_ready", result.products.length));
      return true;
    } catch (error) {
      if (controller.signal.aborted) toast.info(t("import_prepare_cancelled"));
      else {
        console.error("Reading the import file failed:", error);
        toast.error(t("sheet_file_unreadable"));
      }
      return false;
    } finally {
      abortRef.current = null;
      setPreparing(null);
    }
  };

  const readChosenFile = async () => {
    if (!file) return;
    if (await prepareFile(file)) clearFile();
  };

  /**
   * Final import: uploads the file the editor generates for this vendor and
   * switches to its progress. Resolves true when the import started.
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

  const startOver = () => {
    forgetJob(vendorKey);
    setJobId(null);
  };

  const languagePicker = (
    <fieldset>
      <legend className="mb-2 flex items-center gap-1.5 text-sm text-gray-600">
        <Languages className="h-4 w-4 text-[#DC3173]" aria-hidden />
        {t("import_file_lang_label")}
      </legend>
      <div className="flex flex-wrap gap-2">
        {(["en", "pt"] as const).map((value) => (
          <label
            key={value}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
              fileLang === value ? "border-[#DC3173] bg-[#DC3173]/5 text-[#B02458]" : "border-gray-200 text-gray-700 hover:bg-gray-50",
            )}
          >
            <input
              type="radio"
              name={fileLangName}
              value={value}
              checked={fileLang === value}
              disabled={!!preparing}
              onChange={() => setFileLang(value)}
              className="accent-[#DC3173]"
            />
            {t(value === "en" ? "import_lang_en" : "import_lang_pt")}
          </label>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        {fillVars(t("import_file_lang_hint"), { other: t(fileLang === "en" ? "import_lang_pt" : "import_lang_en") })}
      </p>
    </fieldset>
  );

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
            setEditorLoad({ id: Date.now(), kind: "failed", rows });
            setMode("editor");
            startOver();
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Two ways in, the same review and import behind both. */}
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

          {preparing && (
            <div className="flex flex-col gap-3 rounded-xl border border-[#DC3173]/25 bg-[#DC3173]/5 p-4 sm:flex-row sm:items-center sm:justify-between" role="status">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-[#DC3173]" aria-hidden />
                  {preparing.stage === "reading"
                    ? t("import_reading_file")
                    : fillVars(t("import_translating"), {
                        lang: t(fileLang === "en" ? "import_lang_pt" : "import_lang_en"),
                        done: preparing.done,
                        total: preparing.total,
                      })}
                </p>
                {preparing.stage === "translating" && preparing.total > 0 && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#DC3173] transition-[width]"
                      style={{ width: `${Math.round((preparing.done / preparing.total) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {t("import_prepare_cancel")}
              </button>
            </div>
          )}

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
              openFile={prepareFile}
              opening={!!preparing}
              fileLang={fileLang}
              setFileLang={setFileLang}
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
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  {t("import_download_template")}
                </button>
              </Step>
              <Step n={2}>{t("import_step_required")}</Step>
              <Step n={3}>{t("import_step_category")}</Step>
              <Step n={4}>{t("import_step_variations")}</Step>
              <Step n={5}>{t("import_step_review")}</Step>
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

          {/* Your file */}
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">{t("import_upload_title")}</h2>

            <div className="mb-4">{languagePicker}</div>

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                dragOver ? "border-[#DC3173] bg-[#DC3173]/10" : "border-[#DC3173]/30 bg-[#DC3173]/5 hover:bg-[#DC3173]/10",
              )}
            >
              <FileSpreadsheet className="mb-2 h-7 w-7 text-[#DC3173]" aria-hidden />
              <span className="font-medium text-[#B02458]">{t("import_drop_here")}</span>
              <span className="mt-1 text-sm text-gray-500">{t("import_drop_hint")}</span>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                onChange={(e) => pickFile(e.target.files?.[0])}
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

            <button
              type="button"
              onClick={readChosenFile}
              disabled={!file || !!preparing}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#DC3173] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B02458] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {preparing ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Languages className="h-4 w-4" aria-hidden />}
              {t("import_read_file")}
            </button>
            <p className="mt-2 text-xs text-gray-500">{t("import_read_file_hint")}</p>
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
