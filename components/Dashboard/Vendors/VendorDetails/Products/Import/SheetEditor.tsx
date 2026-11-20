"use client";

/**
 * Import Items, mode 2: build the product list in the browser
 * (PRODUCT_BULK_AND_IMPORT_FRONTEND_GUIDE §5.2, plan.md P4).
 *
 * One table row per product, a details panel under it for the rest
 * (description, image, sizes and options). Category and VAT are picked from
 * the vendor's own lists. Problems show on the cell as soon as a product is
 * touched, and on every product when Import is pressed. On submit the grid
 * becomes the same CSV file mode 1 uploads, so the server checks duplicates
 * and the progress / result screen is shared.
 */

import { cn } from "@/lib/utils";
import type { TImportOnDuplicate, TImportRowError } from "@/types/product-bulk.type";
import { bulkErrorText, countText, fillVars } from "@/utils/bulkErrors";
import { displayCurrency } from "@/utils/currency";
import {
  MAX_SHEET_ROWS,
  type TSheetOption,
  type TSheetProduct,
  type TSheetProductErrors,
  type TSheetVariation,
  cheapestOption,
  emptyOption,
  emptyProduct,
  emptyVariation,
  fileRowsOf,
  groupCsvRowsToNestedState,
  isBlankProduct,
  optionCount,
  parseSheetNumber,
  pasteIntoSheet,
  explainImportRow,
  productFromImportError,
  productsToCsv,
  readSheetFile,
  validateSheet,
} from "@/utils/productSheet";
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FolderOpen,
  History,
  CheckCircle2,
  Lightbulb,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { clearDraft, readDraft, saveDraft, type TSheetDraft } from "./importStorage";

export type TSheetCategory = { nameEn: string; namePt: string };

/** Failed rows of a finished import, to load into the grid ("Fix in the editor"). */
export type TSheetLoad = { id: number; rows: TImportRowError[] };

type TT = (key: string) => string;
type TUpdate = (clientId: string, change: (p: TSheetProduct) => TSheetProduct) => void;

interface IProps {
  t: TT;
  lang: string;
  isRestaurant: boolean;
  categories: TSheetCategory[];
  taxRates: number[];
  onDuplicate: TImportOnDuplicate;
  setOnDuplicate: (value: TImportOnDuplicate) => void;
  /** Uploads the generated file; resolves true when the import started. */
  submitFile: (file: File) => Promise<boolean>;
  /** Draft storage key part (per vendor). */
  vendorKey: string;
  load: TSheetLoad | null;
}

const inputClass =
  "h-9 w-full min-w-0 rounded-md border bg-white px-2 text-sm outline-none transition-colors focus:border-[#DC3173] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

export default function SheetEditor({
  t,
  lang,
  isRestaurant,
  categories,
  taxRates,
  onDuplicate,
  setOnDuplicate,
  submitFile,
  vendorKey,
  load,
}: IProps) {
  const [products, setProducts] = useState<TSheetProduct[]>(() => [emptyProduct()]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [opening, setOpening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  /** An unfinished list from an earlier visit, offered until resumed or discarded. */
  const [draft, setDraft] = useState<TSheetDraft<TSheetProduct> | null>(null);
  const [draftChecked, setDraftChecked] = useState(false);
  const draftWarned = useRef(false);
  /** The load request already put in the grid (effects can run twice). */
  const handledLoad = useRef<number | null>(null);
  // The grid scrolls sideways on a narrow screen; the details panel takes the
  // visible width instead, so its fields are never cut off.
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new ResizeObserver(() => grid.style.setProperty("--sheet-visible-width", `${grid.clientWidth}px`));
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  const ctx = useMemo(
    () => ({
      categoryNames: new Set(categories.flatMap((c) => [c.nameEn, c.namePt]).filter(Boolean).map((n) => n.trim().toLowerCase())),
      taxRates: new Set(taxRates),
      isRestaurant,
    }),
    [categories, taxRates, isRestaurant],
  );

  const filled = useMemo(() => products.filter((p) => !isBlankProduct(p)), [products]);
  const errors = useMemo(() => validateSheet(filled, ctx), [filled, ctx]);
  const fileRows = useMemo(() => filled.reduce((n, p) => n + fileRowsOf(p), 0), [filled]);

  const update = useCallback<TUpdate>((clientId, change) => {
    setProducts((prev) => prev.map((p) => (p.clientId === clientId ? { ...change(p), serverError: undefined, serverFixes: undefined } : p)));
    setTouched((prev) => (prev.has(clientId) ? prev : new Set(prev).add(clientId)));
  }, []);

  /* ----- draft: offered on open, saved while editing, cleared after an import starts ----- */

  useEffect(() => {
    // With failed products to fix, the unfinished list is merged in below instead.
    if (!load || handledLoad.current === load.id) setDraft(load ? null : readDraft<TSheetProduct>(vendorKey));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from localStorage after mount
    setDraftChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorKey]);

  useEffect(() => {
    // Not before the offer is answered, or the old draft would be overwritten.
    if (!draftChecked || draft) return;
    const timer = window.setTimeout(() => {
      if (!filled.length) clearDraft(vendorKey);
      else if (!saveDraft(vendorKey, filled) && !draftWarned.current) {
        draftWarned.current = true;
        toast.error(t("sheet_draft_not_saved"));
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [filled, draft, draftChecked, vendorKey, t]);

  // Saved at once when the editor closes (an import started from the other
  // tab, leaving the page), so the last half second of typing isn't lost.
  const pendingSave = useRef<TSheetProduct[] | null>(null);
  useEffect(() => {
    pendingSave.current = draftChecked && !draft ? filled : null;
  }, [filled, draft, draftChecked]);
  useEffect(
    () => () => {
      const latest = pendingSave.current;
      if (latest?.length) saveDraft(vendorKey, latest);
    },
    [vendorKey],
  );

  const resumeDraft = () => {
    if (!draft) return;
    const loaded = draft.products.map((p) => ({ ...emptyProduct(), ...p }));
    setProducts((prev) => [...prev.filter((p) => !isBlankProduct(p)), ...loaded]);
    setTouched((prev) => new Set([...prev, ...loaded.map((p) => p.clientId)]));
    setDraft(null);
  };

  const discardDraft = () => {
    clearDraft(vendorKey);
    setDraft(null);
  };

  /* ----- Fix in the editor: the failed products, each with its reason ----- */

  useEffect(() => {
    if (!load || handledLoad.current === load.id) return;
    handledLoad.current = load.id;
    const loaded = load.rows.flatMap((row) => {
      const product = productFromImportError(row);
      if (!product) return [];
      // A general code ("some fields are invalid") says little: add the
      // server's detail, which names the field.
      const ours = bulkErrorText(t, row.code, row.message);
      const detail = row.message && row.message !== ours && GENERAL_CODES.has(row.code) ? ` ${row.message}` : "";
      return [{ ...product, serverError: ours + detail, serverFixes: explainImportRow(row, isRestaurant) }];
    });
    if (!loaded.length) return;
    // Added after an unfinished list (in the grid, or saved as a draft while
    // the import ran), never in place of it.
    const unfinished = (readDraft<TSheetProduct>(vendorKey)?.products ?? []).map((p) => ({ ...emptyProduct(), ...p }));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- failed rows arrive once per import (load.id)
    setProducts((prev) => {
      const kept = [...prev.filter((p) => !isBlankProduct(p)), ...unfinished];
      const ids = new Set(kept.map((p) => p.clientId));
      return [...kept.filter((p, i) => kept.findIndex((q) => q.clientId === p.clientId) === i), ...loaded.filter((p) => !ids.has(p.clientId))];
    });
    setDraft(null);
    setTouched((prev) => new Set([...prev, ...loaded.map((p) => p.clientId)]));
    setExpanded((prev) => new Set([...prev, ...loaded.filter((p) => p.variations.length).map((p) => p.clientId)]));
    setShowAll(true);
    window.setTimeout(() => document.getElementById(`sheet-row-${loaded[0].clientId}`)?.scrollIntoView({ block: "center" }), 50);
    toast.success(countText(t, "sheet_fix_loaded", loaded.length));
    // A new load request only; `t` changes with the language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load?.id]);

  /* ----- paste a block copied from Excel / Google Sheets ----- */

  const onPaste = (e: React.ClipboardEvent<HTMLTableSectionElement>) => {
    const target = e.target as HTMLElement;
    const column = target.dataset.col;
    const clientId = target.closest<HTMLElement>("tr[data-id]")?.dataset.id;
    const text = e.clipboardData.getData("text/plain");
    // One plain value is an ordinary paste into the box.
    if (!column || !clientId || !/[\t\n]/.test(text.replace(/\r?\n$/, ""))) return;
    e.preventDefault();
    const result = pasteIntoSheet(products, { clientId, column }, text, isRestaurant);
    if (!result.changed.length) return;
    setProducts(result.products.map((p) => (result.changed.includes(p.clientId) ? { ...p, serverError: undefined, serverFixes: undefined } : p)));
    setTouched((prev) => new Set([...prev, ...result.changed]));
    toast.success(countText(t, "sheet_pasted", result.changed.length));
  };

  const toggle = useCallback((clientId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  }, []);

  const remove = useCallback((clientId: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.clientId !== clientId);
      return next.length ? next : [emptyProduct()];
    });
  }, []);

  const addProduct = () => {
    const product = emptyProduct();
    setProducts((prev) => [...prev, product]);
    window.setTimeout(() => document.getElementById(`sheet-${product.clientId}-nameEn`)?.focus(), 0);
  };

  const openFile = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      toast.error(t("bulk_err_IMPORT_FILE_UNSUPPORTED_TYPE"));
      return;
    }
    setOpening(true);
    try {
      const loaded = groupCsvRowsToNestedState(await readSheetFile(file));
      if (!loaded.length) {
        toast.error(t("sheet_file_empty"));
        return;
      }
      // Added after what is already there; an untouched blank grid is replaced.
      setProducts((prev) => [...prev.filter((p) => !isBlankProduct(p)), ...loaded]);
      setTouched((prev) => new Set([...prev, ...loaded.map((p) => p.clientId)]));
      toast.success(countText(t, "sheet_file_loaded", loaded.length));
    } catch {
      toast.error(t("sheet_file_unreadable"));
    } finally {
      setOpening(false);
    }
  };

  const clearAll = () => {
    if (filled.length && !window.confirm(t("sheet_clear_confirm"))) return;
    setProducts([emptyProduct()]);
    setExpanded(new Set());
    setTouched(new Set());
    setShowAll(false);
  };

  const submit = async () => {
    if (!filled.length) {
      toast.error(t("sheet_nothing_to_import"));
      return;
    }
    if (errors.size) {
      setShowAll(true);
      // Open the details of products whose problem is in there.
      const inside = filled.filter((p) => {
        const e = errors.get(p.clientId);
        return e && Object.keys(e).some((k) => DETAIL_FIELDS.has(k) || k.startsWith("v"));
      });
      if (inside.length) setExpanded((prev) => new Set([...prev, ...inside.map((p) => p.clientId)]));
      toast.error(countText(t, "sheet_fix_errors", errors.size));
      const first = filled.find((p) => errors.has(p.clientId));
      if (first) document.getElementById(`sheet-row-${first.clientId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (fileRows > MAX_SHEET_ROWS) {
      toast.error(fillVars(t("sheet_too_many_rows"), { max: MAX_SHEET_ROWS.toLocaleString(lang === "pt" ? "pt-PT" : "en-GB") }));
      return;
    }
    setSubmitting(true);
    const { csv } = productsToCsv(filled, { isRestaurant });
    const started = await submitFile(new File([csv], "products.csv", { type: "text/csv" }));
    setSubmitting(false);
    if (started) {
      pendingSave.current = null;
      clearDraft(vendorKey);
      setProducts([emptyProduct()]);
      setExpanded(new Set());
      setTouched(new Set());
      setShowAll(false);
    }
  };

  const columns = isRestaurant ? 8 : 9;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      {draft && (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[#DC3173]/25 bg-[#DC3173]/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-gray-700">
            <History className="mt-0.5 h-4 w-4 shrink-0 text-[#DC3173]" aria-hidden />
            <span>
              {countText(t, "sheet_draft_found", draft.products.length, {
                date: new Date(draft.savedAt).toLocaleString(lang === "pt" ? "pt-PT" : "en-GB", { dateStyle: "medium", timeStyle: "short" }),
              })}
            </span>
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              {t("sheet_draft_discard")}
            </button>
            <button
              type="button"
              onClick={resumeDraft}
              className="rounded-lg bg-[#DC3173] px-3 py-2 text-sm font-medium text-white hover:bg-[#B02458]"
            >
              {t("sheet_draft_resume")}
            </button>
          </div>
        </div>
      )}
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={opening}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            {opening ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <FolderOpen className="h-4 w-4" aria-hidden />}
            {t("sheet_open_file")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            onChange={(e) => void openFile(e.target.files?.[0])}
          />
          {filled.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <X className="h-4 w-4" aria-hidden />
              {t("sheet_clear")}
            </button>
          )}
        </div>
        <p className={cn("text-sm", fileRows > MAX_SHEET_ROWS ? "font-medium text-red-600" : "text-gray-500")}>
          {countText(t, "sheet_counter", filled.length, {
            rows: fileRows.toLocaleString(lang === "pt" ? "pt-PT" : "en-GB"),
            max: MAX_SHEET_ROWS.toLocaleString(lang === "pt" ? "pt-PT" : "en-GB"),
          })}
        </p>
      </div>

      <p className="mb-3 flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <Lightbulb className="mt-px h-3.5 w-3.5 shrink-0 text-[#DC3173]" aria-hidden />
        {t("sheet_paste_hint")}
      </p>

      {/* Grid: scrolls sideways inside the card on a narrow screen. */}
      <div ref={gridRef} className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="w-10 px-2 py-2" />
              <th className="px-2 py-2">{t("sheet_col_name_en")}<Req /></th>
              <th className="px-2 py-2">{t("sheet_col_name_pt")}<Req /></th>
              <th className="w-44 px-2 py-2">{t("sheet_col_category")}<Req /></th>
              <th className="w-28 px-2 py-2">{t("sheet_col_vat")}<Req /></th>
              <th className="w-28 px-2 py-2">{t("sheet_col_price")}</th>
              <th className="w-24 px-2 py-2">{t("sheet_col_discount")}</th>
              {!isRestaurant && <th className="w-24 px-2 py-2">{t("sheet_col_stock")}</th>}
              <th className="w-44 px-2 py-2">{t("sheet_col_status")}</th>
            </tr>
          </thead>
          <tbody onPaste={onPaste}>
            {products.map((product) => (
              <SheetRow
                key={product.clientId}
                product={product}
                errors={errors.get(product.clientId)}
                showErrors={showAll || touched.has(product.clientId)}
                showRequired={showAll}
                expanded={expanded.has(product.clientId)}
                columns={columns}
                t={t}
                lang={lang}
                isRestaurant={isRestaurant}
                categories={categories}
                taxRates={taxRates}
                update={update}
                toggle={toggle}
                remove={remove}
              />
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addProduct}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#DC3173]/40 py-2.5 text-sm font-medium text-[#DC3173] transition-colors hover:bg-[#DC3173]/5"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {t("sheet_add_product")}
      </button>
      <p className="mt-2 text-xs text-gray-500">
        <span className="text-[#DC3173]">*</span> {t("sheet_required_legend")}
      </p>

      {/* Footer */}
      <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          {isRestaurant && <p className="text-sm text-gray-500">{t("sheet_restaurant_note")}</p>}
          <fieldset>
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
                    name="sheetOnDuplicate"
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
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={submitting || !filled.length}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#DC3173] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B02458] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
          {submitting ? t("import_uploading") : filled.length ? countText(t, "sheet_import_n", filled.length) : t("sheet_import")}
        </button>
      </div>
    </section>
  );
}

/** Error codes too general to stand alone: the server's message is added. */
const GENERAL_CODES = new Set(["BULK_PRODUCT_ITEM_VALIDATION_FAILED", "VALIDATION_ERROR", "IMPORT_ROW_INVALID"]);

/** Problems about an empty field: not shown while the vendor is still filling the row in. */
const WAITS_FOR_SUBMIT = new Set(["sheet_err_required", "sheet_err_price_required", "sheet_err_options_required"]);

/** Product fields that live in the details panel, not the row. */
const DETAIL_FIELDS = new Set(["descriptionEn", "descriptionPt", "brand", "imageUrl", "sdrContainerCount", "stockUnit"]);

/* ---------- one product ---------- */

interface IRowProps {
  product: TSheetProduct;
  errors: TSheetProductErrors | undefined;
  showErrors: boolean;
  /** "Required" on empty fields: only after Import was pressed, not while typing. */
  showRequired: boolean;
  expanded: boolean;
  columns: number;
  t: TT;
  lang: string;
  isRestaurant: boolean;
  categories: TSheetCategory[];
  taxRates: number[];
  update: TUpdate;
  toggle: (clientId: string) => void;
  remove: (clientId: string) => void;
}

const SheetRow = memo(function SheetRow({
  product: p,
  errors,
  showErrors,
  showRequired,
  expanded,
  columns,
  t,
  lang,
  isRestaurant,
  categories,
  taxRates,
  update,
  toggle,
  remove,
}: IRowProps) {
  const err = (path: string) => {
    const code = showErrors ? errors?.[path] : undefined;
    return code && !showRequired && WAITS_FOR_SUBMIT.has(code) ? undefined : code;
  };
  const set = (field: keyof TSheetProduct) => (value: string) => update(p.clientId, (cur) => ({ ...cur, [field]: value }));
  const hasOptions = optionCount(p) > 0;
  const cheapest = cheapestOption(p);
  const detailProblems =
    showErrors && errors ? Object.keys(errors).filter((k) => (DETAIL_FIELDS.has(k) || k.startsWith("v")) && err(k)).length : 0;

  // Category: the select's value is the vendor's own name when the typed or
  // loaded one matches (any case, EN or PT); otherwise it is kept as typed.
  const matched = categories.find((c) =>
    [c.nameEn, c.namePt].some((n) => n && n.trim().toLowerCase() === p.category.trim().toLowerCase()),
  );
  const categoryValue = matched ? matched.nameEn || matched.namePt : p.category;
  const rate = parseSheetNumber(p.taxRate);
  const taxValue = !Number.isNaN(rate) && taxRates.includes(rate) ? String(rate) : p.taxRate;

  return (
    <>
      {p.serverError && (
        <tr data-id={p.clientId} className="border-t border-gray-100">
          <td colSpan={columns} className="px-2 pt-2">
            <div className="sticky left-0 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs" style={{ width: "min(100%, var(--sheet-visible-width, 100%))" }}>
              <p className="flex items-start gap-2 font-medium text-red-700">
                <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{fillVars(t("sheet_server_error"), { reason: p.serverError })}</span>
              </p>
              {p.serverFixes?.length ? (
                <ul className="mt-1.5 space-y-1 pl-5 text-gray-700">
                  {p.serverFixes.map((key) => (
                    <li key={key} className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-green-600" aria-hidden />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-1.5 pl-5 text-gray-600">
                {errors
                  ? t("sheet_server_fix_marked")
                  : p.serverFixes?.length
                    ? t("sheet_server_fixed_retry")
                    : t("sheet_server_unknown")}
              </p>
            </div>
          </td>
        </tr>
      )}
      <tr id={`sheet-row-${p.clientId}`} data-id={p.clientId} className={cn("align-top", !p.serverError && "border-t border-gray-100", expanded && "bg-[#DC3173]/[0.03]")}>
        <td className="px-2 py-2">
          <button
            type="button"
            onClick={() => toggle(p.clientId)}
            aria-expanded={expanded}
            aria-label={t("sheet_details")}
            className={cn(
              "relative flex h-9 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100",
              detailProblems > 0 && "text-red-600",
            )}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {detailProblems > 0 && <span className="absolute right-0 top-1 h-2 w-2 rounded-full bg-red-500" />}
          </button>
        </td>
        <Cell error={err("nameEn")} t={t}>
          <input id={`sheet-${p.clientId}-nameEn`} data-col="nameEn" value={p.nameEn} onChange={(e) => set("nameEn")(e.target.value)} placeholder={t("sheet_ph_name_en")} className={cellClass(err("nameEn"))} />
        </Cell>
        <Cell error={err("namePt")} t={t}>
          <input data-col="namePt" value={p.namePt} onChange={(e) => set("namePt")(e.target.value)} placeholder={t("sheet_ph_name_pt")} className={cellClass(err("namePt"))} />
        </Cell>
        <Cell error={err("category")} t={t}>
          <select value={categoryValue} onChange={(e) => set("category")(e.target.value)} className={cellClass(err("category"))}>
            <option value="">{t("sheet_choose")}</option>
            {categories.map((c) => (
              <option key={c.nameEn || c.namePt} value={c.nameEn || c.namePt}>
                {(lang === "pt" ? c.namePt || c.nameEn : c.nameEn || c.namePt) ?? ""}
              </option>
            ))}
            {!matched && p.category.trim() && <option value={p.category}>{p.category}</option>}
          </select>
        </Cell>
        <Cell error={err("taxRate")} t={t}>
          <select value={taxValue} onChange={(e) => set("taxRate")(e.target.value)} className={cellClass(err("taxRate"))}>
            <option value="">{t("sheet_choose")}</option>
            {taxRates.map((r) => (
              <option key={r} value={String(r)}>
                {r}%
              </option>
            ))}
            {taxValue && !taxRates.map(String).includes(taxValue) && <option value={taxValue}>{taxValue}</option>}
          </select>
        </Cell>
        <Cell error={hasOptions ? undefined : err("price")} t={t}>
          {hasOptions ? (
            <button
              type="button"
              onClick={() => !expanded && toggle(p.clientId)}
              className="flex h-9 w-full items-center rounded-md border border-dashed border-gray-200 bg-gray-50 px-2 text-left text-xs text-gray-500"
              title={t("sheet_price_from_options")}
            >
              {cheapest !== null
                ? fillVars(t("sheet_price_from"), { price: `${cheapest.toFixed(2).replace(".", ",")} ${displayCurrency("EUR")}` })
                : t("sheet_price_options")}
            </button>
          ) : (
            <input data-col="price" inputMode="decimal" value={p.price} onChange={(e) => set("price")(e.target.value)} placeholder="0,00" className={cellClass(err("price"))} />
          )}
        </Cell>
        <Cell error={err("discount")} t={t}>
          <input
            data-col="discount"
            inputMode="decimal"
            value={p.discount}
            onChange={(e) => set("discount")(e.target.value)}
            placeholder={p.discountType === "FLAT" ? "€" : "%"}
            className={cellClass(err("discount"))}
          />
        </Cell>
        {!isRestaurant && (
          <Cell error={hasOptions ? undefined : err("stockQuantity")} t={t}>
            <input
              data-col="stockQuantity"
              inputMode="numeric"
              value={hasOptions ? "" : p.stockQuantity}
              onChange={(e) => set("stockQuantity")(e.target.value)}
              disabled={hasOptions}
              title={hasOptions ? t("sheet_stock_from_options") : undefined}
              placeholder={hasOptions ? "Σ" : "0"}
              className={cellClass(err("stockQuantity"))}
            />
          </Cell>
        )}
        <td className="px-2 py-2">
          <div className="flex items-center gap-1">
            <select value={p.status || "ACTIVE"} onChange={(e) => set("status")(e.target.value)} className={cellClass()}>
              <option value="ACTIVE">{t("sheet_status_active")}</option>
              <option value="INACTIVE">{t("sheet_status_inactive")}</option>
            </select>
            <button
              type="button"
              onClick={() => remove(p.clientId)}
              aria-label={t("sheet_remove_product")}
              title={t("sheet_remove_product")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#DC3173]/[0.03]">
          <td colSpan={columns} className="pb-4 pt-1">
            <div className="sticky left-0 px-2" style={{ width: "min(100%, var(--sheet-visible-width, 100%))" }}>
                <ProductDetails product={p} err={err} t={t} isRestaurant={isRestaurant} update={update} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

const cellClass = (error?: string) =>
  cn(inputClass, error ? "border-red-400 bg-red-50/50" : "border-gray-300");

/** Marks a required column. */
function Req() {
  return (
    <span className="ml-0.5 text-[#DC3173]" aria-hidden>
      *
    </span>
  );
}

function Cell({ error, t, children }: { error?: string; t: TT; children: React.ReactNode }) {
  return (
    <td className="px-2 py-2">
      {children}
      {error && <p className="mt-1 text-xs leading-tight text-red-600">{t(error)}</p>}
    </td>
  );
}

/* ---------- details: description, image, sizes and options ---------- */

function ProductDetails({
  product: p,
  err,
  t,
  isRestaurant,
  update,
}: {
  product: TSheetProduct;
  err: (path: string) => string | undefined;
  t: TT;
  isRestaurant: boolean;
  update: TUpdate;
}) {
  const set = (field: keyof TSheetProduct, value: string) => update(p.clientId, (cur) => ({ ...cur, [field]: value }));
  const setVariations = (change: (variations: TSheetVariation[]) => TSheetVariation[]) =>
    update(p.clientId, (cur) => ({ ...cur, variations: change(cur.variations) }));
  const setVariation = (vi: number, patch: Partial<TSheetVariation>) =>
    setVariations((vs) => vs.map((v, i) => (i === vi ? { ...v, ...patch } : v)));
  const setOption = (vi: number, oi: number, patch: Partial<TSheetOption>) =>
    setVariations((vs) =>
      vs.map((v, i) => (i === vi ? { ...v, options: v.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) } : v)),
    );

  return (
    <div className="space-y-4 rounded-lg border border-[#DC3173]/15 bg-white p-4">
      {/* More about the product */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={t("sheet_col_description_en")} error={err("descriptionEn")} t={t}>
          <input value={p.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className={cellClass()} />
        </Field>
        <Field label={t("sheet_col_description_pt")} error={err("descriptionPt")} t={t}>
          <input value={p.descriptionPt} onChange={(e) => set("descriptionPt", e.target.value)} className={cellClass()} />
        </Field>
        <Field label={t("sheet_col_image_url")} error={err("imageUrl")} t={t}>
          <input value={p.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://" className={cellClass(err("imageUrl"))} />
        </Field>
        <Field label={t("sheet_col_brand")} t={t}>
          <input value={p.brand} onChange={(e) => set("brand", e.target.value)} className={cellClass()} />
        </Field>
        <Field label={t("sheet_col_discount_type")} t={t}>
          <select value={p.discountType || "PERCENTAGE"} onChange={(e) => set("discountType", e.target.value)} className={cellClass()}>
            <option value="PERCENTAGE">{t("sheet_discount_percentage")}</option>
            <option value="FLAT">{t("sheet_discount_flat")}</option>
          </select>
        </Field>
        <Field label={t("sheet_col_sdr")} error={err("sdrContainerCount")} t={t}>
          <div className="flex gap-2">
            <select value={p.sdrApplicable === "true" ? "true" : "false"} onChange={(e) => set("sdrApplicable", e.target.value)} className={cellClass()}>
              <option value="false">{t("sheet_no")}</option>
              <option value="true">{t("sheet_yes")}</option>
            </select>
            {p.sdrApplicable === "true" && (
              <input
                inputMode="numeric"
                value={p.sdrContainerCount}
                onChange={(e) => set("sdrContainerCount", e.target.value)}
                placeholder={t("sheet_ph_containers")}
                aria-label={t("sheet_ph_containers")}
                className={cn(cellClass(err("sdrContainerCount")), "w-24")}
              />
            )}
          </div>
        </Field>
        {!isRestaurant && (
          <Field label={t("sheet_col_stock_unit")} t={t}>
            <input value={p.stockUnit} onChange={(e) => set("stockUnit", e.target.value)} placeholder="unit" className={cellClass()} />
          </Field>
        )}
      </div>

      {/* Sizes and options */}
      <div>
        <p className="mb-1 text-sm font-semibold text-gray-800">{t("sheet_variations_title")}</p>
        <p className="mb-3 text-xs text-gray-500">{t("sheet_variations_hint")}</p>

        <div className="space-y-3">
          {p.variations.map((v, vi) => (
            <div key={vi} className="rounded-lg border border-gray-200 p-3">
              <div className="grid items-start gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Field label={t("sheet_variation_name_en")} error={err(`v${vi}.nameEn`)} t={t}>
                  <input value={v.nameEn} onChange={(e) => setVariation(vi, { nameEn: e.target.value })} placeholder={t("sheet_ph_variation_en")} className={cellClass(err(`v${vi}.nameEn`))} />
                </Field>
                <Field label={t("sheet_variation_name_pt")} error={err(`v${vi}.namePt`)} t={t}>
                  <input value={v.namePt} onChange={(e) => setVariation(vi, { namePt: e.target.value })} placeholder={t("sheet_ph_variation_pt")} className={cellClass(err(`v${vi}.namePt`))} />
                </Field>
                <button
                  type="button"
                  onClick={() => setVariations((vs) => vs.filter((_, i) => i !== vi))}
                  className="mt-6 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  {t("sheet_remove_variation")}
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {v.options.map((o, oi) => {
                  const at = `v${vi}.o${oi}`;
                  return (
                    <div key={oi} className={cn("grid items-start gap-2", isRestaurant ? "sm:grid-cols-[1fr_1fr_8rem_auto]" : "sm:grid-cols-[1fr_1fr_8rem_6rem_auto]")}>
                      <Field label={oi === 0 ? t("sheet_option_label_en") : undefined} error={err(`${at}.labelEn`)} t={t}>
                        <input value={o.labelEn} onChange={(e) => setOption(vi, oi, { labelEn: e.target.value })} placeholder={t("sheet_ph_option_en")} className={cellClass(err(`${at}.labelEn`))} />
                      </Field>
                      <Field label={oi === 0 ? t("sheet_option_label_pt") : undefined} error={err(`${at}.labelPt`)} t={t}>
                        <input value={o.labelPt} onChange={(e) => setOption(vi, oi, { labelPt: e.target.value })} placeholder={t("sheet_ph_option_pt")} className={cellClass(err(`${at}.labelPt`))} />
                      </Field>
                      <Field label={oi === 0 ? t("sheet_option_price") : undefined} error={err(`${at}.price`)} t={t}>
                        <input inputMode="decimal" value={o.price} onChange={(e) => setOption(vi, oi, { price: e.target.value })} placeholder="0,00" className={cellClass(err(`${at}.price`))} />
                      </Field>
                      {!isRestaurant && (
                        <Field label={oi === 0 ? t("sheet_option_stock") : undefined} error={err(`${at}.stock`)} t={t}>
                          <input inputMode="numeric" value={o.stock} onChange={(e) => setOption(vi, oi, { stock: e.target.value })} placeholder="0" className={cellClass(err(`${at}.stock`))} />
                        </Field>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setVariations((vs) =>
                            vs
                              .map((x, i) => (i === vi ? { ...x, options: x.options.filter((_, j) => j !== oi) } : x))
                              .filter((x) => x.options.length > 0),
                          )
                        }
                        aria-label={t("sheet_remove_option")}
                        title={t("sheet_remove_option")}
                        className={cn("flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600", oi === 0 && "sm:mt-6")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                {err(`v${vi}`) && <p className="text-xs text-red-600">{t(err(`v${vi}`)!)}</p>}
                <button
                  type="button"
                  onClick={() => setVariations((vs) => vs.map((x, i) => (i === vi ? { ...x, options: [...x.options, emptyOption()] } : x)))}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#DC3173] hover:text-[#B02458]"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  {t("sheet_add_option")}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setVariations((vs) => [...vs, emptyVariation()])}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#DC3173]/40 px-3 py-2 text-sm font-medium text-[#DC3173] hover:bg-[#DC3173]/5"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("sheet_add_variation")}
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, t, children }: { label?: string; error?: string; t: TT; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      {label && <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>}
      {children}
      {error && <span className="mt-1 block text-xs leading-tight text-red-600">{t(error)}</span>}
    </label>
  );
}
