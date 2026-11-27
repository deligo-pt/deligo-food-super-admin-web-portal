"use client";

/**
 * Import Items → Preview (plan.md §12): every product the vendor is about to
 * import, read-only and with ALL its fields — the grid shows only the ones
 * that decide whether a row imports. A text written in one language says
 * "Translated when you import" (nothing is translated just by looking);
 * "Translate now" fills them in the grid so the vendor can check them first.
 * Problems are listed on the product, and "Edit" jumps to its row.
 */

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { countText, fillVars } from "@/utils/bulkErrors";
import { displayCurrency } from "@/utils/currency";
import {
  type TSheetProduct,
  type TSheetProductErrors,
  cheapestOption,
  fileRowsOf,
  optionCount,
  parseSheetNumber,
} from "@/utils/productSheet";
import { AlertCircle, CheckCircle2, Image as ImageIcon, Languages, LoaderCircle, Pencil } from "lucide-react";
import { useMemo, useState } from "react";

type TT = (key: string) => string;

/** Products shown per step; "Show more" adds the next ones (files can hold 5,000 rows). */
const PAGE = 40;

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  t: TT;
  lang: string;
  isRestaurant: boolean;
  products: TSheetProduct[];
  errors: Map<string, TSheetProductErrors>;
  /** Texts written in one language (empty side), counted before Import translates them. */
  untranslated: number;
  /** Running "Translate now": batches done / total. */
  translating: { done: number; total: number } | null;
  onTranslate: () => void;
  /** Closes the preview and shows the product's row in the grid. */
  onEdit: (clientId: string) => void;
  /** Category name as the vendor sees it (their language). */
  categoryLabel: (category: string) => string;
}

/** Editor path → the label of the field it belongs to, for the problem list. */
function fieldLabel(path: string, t: TT): string {
  const m = /^v(\d+)(?:\.o(\d+))?/.exec(path);
  if (m) {
    const group = Number(m[1]) + 1;
    return m[2] !== undefined
      ? fillVars(t("sheet_preview_option_n"), { group, option: Number(m[2]) + 1 })
      : fillVars(t("sheet_preview_group_n"), { group });
  }
  const key: Record<string, string> = {
    nameEn: "sheet_col_name_en",
    namePt: "sheet_col_name_pt",
    category: "sheet_col_category",
    taxRate: "sheet_col_vat",
    price: "sheet_col_price",
    discount: "sheet_col_discount",
    stockQuantity: "sheet_col_stock",
    imageUrl: "sheet_col_image_url",
    descriptionEn: "sheet_col_description_en",
    descriptionPt: "sheet_col_description_pt",
    sdrContainerCount: "sheet_col_sdr",
  };
  return key[path] ? t(key[path]) : path;
}

export default function SheetPreview({
  open,
  onOpenChange,
  t,
  lang,
  isRestaurant,
  products,
  errors,
  untranslated,
  translating,
  onTranslate,
  onEdit,
  categoryLabel,
}: IProps) {
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const locale = lang === "pt" ? "pt-PT" : "en-GB";
  const rows = useMemo(() => products.reduce((n, p) => n + fileRowsOf(p), 0), [products]);
  // The filter switches itself off once nothing is left to fix.
  const problemsOnly = onlyProblems && errors.size > 0;
  const list = problemsOnly ? products.filter((p) => errors.has(p.clientId)) : products;
  const money = (value: string | number) => {
    const n = typeof value === "number" ? value : parseSheetNumber(value);
    return Number.isNaN(n) ? String(value) : `${n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${displayCurrency("EUR")}`;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setShown(PAGE);
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-4xl" data-testid="sheet-preview">
        <DialogHeader className="border-b border-gray-100 p-5 pr-12">
          <DialogTitle>{t("sheet_preview_title")}</DialogTitle>
          <DialogDescription>
            {countText(t, "sheet_preview_summary", products.length, { rows: rows.toLocaleString(locale) })}
          </DialogDescription>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {errors.size > 0 ? (
              <button
                type="button"
                onClick={() => setOnlyProblems((v) => !v)}
                aria-pressed={problemsOnly}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium",
                  problemsOnly ? "border-red-300 bg-red-50 text-red-700" : "border-red-200 text-red-700 hover:bg-red-50",
                )}
              >
                <AlertCircle className="h-4 w-4" aria-hidden />
                {countText(t, "sheet_preview_problems", errors.size)}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {t("sheet_preview_ready")}
              </span>
            )}
            {untranslated > 0 && (
              <span className="inline-flex flex-wrap items-center gap-2 rounded-full bg-[#DC3173]/5 px-3 py-1 text-[#B02458]">
                <Languages className="h-4 w-4" aria-hidden />
                {countText(t, "sheet_preview_untranslated", untranslated)}
                <button
                  type="button"
                  onClick={onTranslate}
                  disabled={!!translating}
                  className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline disabled:opacity-60"
                >
                  {translating && <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                  {translating
                    ? fillVars(t("sheet_preview_translating"), { done: translating.done, total: translating.total })
                    : t("sheet_preview_translate_now")}
                </button>
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/60 p-4">
          {list.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">{t("sheet_preview_empty")}</p>
          ) : (
            <ol className="space-y-3">
              {list.slice(0, shown).map((p) => (
                <PreviewCard
                  key={p.clientId}
                  product={p}
                  number={products.indexOf(p) + 1}
                  problems={errors.get(p.clientId)}
                  t={t}
                  isRestaurant={isRestaurant}
                  money={money}
                  categoryLabel={categoryLabel}
                  onEdit={() => onEdit(p.clientId)}
                />
              ))}
            </ol>
          )}
          {list.length > shown && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE)}
              className="mt-3 w-full rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {fillVars(t("sheet_preview_more"), {
                shown: Math.min(shown, list.length).toLocaleString(locale),
                total: list.length.toLocaleString(locale),
              })}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewCard({
  product: p,
  number,
  problems,
  t,
  isRestaurant,
  money,
  categoryLabel,
  onEdit,
}: {
  product: TSheetProduct;
  number: number;
  problems: TSheetProductErrors | undefined;
  t: TT;
  isRestaurant: boolean;
  money: (value: string | number) => string;
  categoryLabel: (category: string) => string;
  onEdit: () => void;
}) {
  const hasOptions = optionCount(p) > 0;
  const cheapest = cheapestOption(p);
  const problemList = problems ? Object.entries(problems) : [];
  const [imageFailed, setImageFailed] = useState(false);
  const discount = p.discount.trim()
    ? p.discountType === "FLAT"
      ? `− ${money(p.discount)}`
      : `− ${p.discount.trim()}%`
    : "";

  return (
    <li
      className={cn("rounded-xl border bg-white p-4", problemList.length ? "border-red-200" : "border-gray-200")}
      data-testid="preview-product"
    >
      <div className="flex gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
          {p.imageUrl.trim() && !imageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element -- any vendor URL; next/image needs known hosts
            <img src={p.imageUrl.trim()} alt="" className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
          ) : (
            <ImageIcon className="h-6 w-6" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-400">#{number}</p>
              <TwoLang en={p.nameEn} pt={p.namePt} t={t} strong />
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              {t("sheet_preview_edit")}
            </button>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            <Item label={t("sheet_col_category")} value={p.category.trim() ? categoryLabel(p.category) : ""} t={t} />
            <Item label={t("sheet_col_vat")} value={p.taxRate.trim() ? `${p.taxRate.trim()}%` : ""} t={t} />
            <Item
              label={t("sheet_col_price")}
              value={
                hasOptions
                  ? cheapest !== null
                    ? fillVars(t("sheet_price_from"), { price: money(cheapest) })
                    : ""
                  : p.price.trim()
                    ? money(p.price)
                    : ""
              }
              t={t}
            />
            <Item label={t("sheet_col_discount")} value={discount} t={t} />
            <Item
              label={t("sheet_col_sdr")}
              value={
                p.sdrApplicable === "true"
                  ? `${t("sheet_yes")}${p.sdrContainerCount.trim() ? ` · ${p.sdrContainerCount.trim()}` : ""}`
                  : t("sheet_no")
              }
              t={t}
            />
            <Item label={t("sheet_col_brand")} value={p.brand.trim()} t={t} />
            {!isRestaurant && !hasOptions && (
              <Item
                label={t("sheet_col_stock")}
                value={p.stockQuantity.trim() ? `${p.stockQuantity.trim()} ${p.stockUnit.trim()}`.trim() : ""}
                t={t}
              />
            )}
          </dl>

          {(p.descriptionEn.trim() || p.descriptionPt.trim()) && (
            <div className="mt-3 text-sm">
              <p className="text-xs text-gray-500">{t("sheet_preview_description")}</p>
              <TwoLang en={p.descriptionEn} pt={p.descriptionPt} t={t} />
            </div>
          )}

          {hasOptions && (
            <div className="mt-3 space-y-2">
              {p.variations.map((v, vi) => (
                <div key={vi} className="rounded-lg bg-gray-50 p-2.5 text-sm">
                  <TwoLang en={v.nameEn} pt={v.namePt} t={t} strong />
                  <ul className="mt-1.5 space-y-1">
                    {v.options.map((o, oi) => (
                      <li key={oi} className="flex items-start justify-between gap-3">
                        <TwoLang en={o.labelEn} pt={o.labelPt} t={t} inline />
                        <span className="shrink-0 tabular-nums text-gray-700">
                          {o.price.trim() ? money(o.price) : "—"}
                          {!isRestaurant && o.stock.trim() ? <span className="text-gray-400"> · {o.stock.trim()}</span> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {problemList.length > 0 && (
            <ul className="mt-3 space-y-1 rounded-lg bg-red-50 p-2.5 text-xs text-red-700" data-testid="preview-problems">
              {problemList.map(([path, code]) => (
                <li key={path} className="flex items-start gap-1.5">
                  <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>
                    <span className="font-medium">{fieldLabel(path, t)}:</span> {t(code)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * One text. Written in both languages: EN and PT. Written once (typed in
 * the grid in any language, or read from a file): the text as written, and
 * a note that Import adds the other language.
 */
function TwoLang({ en, pt, t, strong, inline }: { en: string; pt: string; t: TT; strong?: boolean; inline?: boolean }) {
  const text = (value: string) => (
    <span className={cn("min-w-0 break-words", strong ? "font-semibold text-gray-900" : "text-gray-700")}>{value.trim()}</span>
  );
  const one = en.trim() ? (pt.trim() ? null : en) : pt.trim() ? pt : "";
  if (one === "") return <span className="text-gray-400">—</span>;
  if (one !== null) {
    return (
      <span className={cn("flex min-w-0 flex-wrap items-baseline gap-x-2", inline && "inline-flex")}>
        {text(one)}
        <span className="text-xs italic text-[#B02458]/80" data-auto-translate>
          {t("sheet_preview_auto")}
        </span>
      </span>
    );
  }
  const side = (code: "EN" | "PT", value: string) => (
    <span className={cn("flex min-w-0 items-baseline gap-1.5", inline && "inline-flex")}>
      <span className="shrink-0 rounded bg-gray-100 px-1 text-[10px] font-semibold text-gray-500">{code}</span>
      {text(value)}
    </span>
  );
  return (
    <div className={cn("flex flex-col gap-0.5", inline && "flex-row flex-wrap gap-x-3")}>
      {side("EN", en)}
      {side("PT", pt)}
    </div>
  );
}

function Item({ label, value, t }: { label: string; value: string; t: TT }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className={cn("truncate", value ? "text-gray-800" : "text-gray-400")}>{value || t("sheet_preview_none")}</dd>
    </div>
  );
}
