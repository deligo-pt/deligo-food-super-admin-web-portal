/**
 * Import v2 (plan §9): fills the other language of every product read from a
 * one-language file — names, descriptions, variation names, option labels.
 *
 * Works in batches because `/api/translate` takes at most 50 texts and
 * 20,000 characters per request, and 30 requests a minute per vendor. A text
 * that appears many times ("Large", "Size") is sent once.
 *
 * Never throws (except when cancelled): what could not be translated comes
 * back in `missing`, keyed like the editor's error paths (`namePt`,
 * `v0.o1.labelEn`), so the review can mark those cells.
 *
 * No React, no network, no `@/` value imports: the request goes through
 * `send`, so `pnpm verify:sheet-import` runs it under bare Node.
 */

import type { TSheetLang, TSheetProduct } from "@/utils/productSheet";
import type { DeepLLang, TranslationReply, TranslationRequest } from "@/utils/translation/requestTranslations";
import type { TranslationErrorCode } from "@/types/translation.type";

/** Limits of `/api/translate` (src/app/api/translate/route.ts). */
export const TRANSLATE_MAX_TEXTS = 50;
export const TRANSLATE_MAX_TEXT_LENGTH = 5000;
export const TRANSLATE_MAX_TOTAL_LENGTH = 20000;
/** The route counts requests per minute; after a 429, wait this long once per batch. */
export const TRANSLATE_RATE_WAIT_MS = 61_000;
const MAX_RATE_RETRIES = 2;

/** What `/api/translate/detect` answers: each text with its detected language, in both languages. */
export type TDetectReply =
  | { ok: true; results: { from: string; en: string; pt: string }[] }
  | { ok: false; code: TranslationErrorCode };

/** A cell the review must ask about: `field` is an editor path such as `namePt`. */
export type TSheetMissing = { clientId: string; field: string };

export type TSheetTranslation = {
  products: TSheetProduct[];
  missing: TSheetMissing[];
  /** Why some texts were not translated; null when everything was. */
  error: TranslationErrorCode | null;
  /** Cells filled with a translation. */
  translated: number;
  /** Different texts sent to the translator (after removing repeats). */
  sent: number;
};

export type TSheetTranslateOptions = {
  /** Called before the first batch and after each one. */
  onProgress?: (done: number, total: number) => void;
  /** Cancels between batches; the promise then rejects with an AbortError. */
  signal?: AbortSignal;
  /** Waiting after a 429; replaced in tests. */
  wait?: (ms: number, signal?: AbortSignal) => Promise<void>;
  /**
   * The converter for texts typed in the grid (`product.detect`): their
   * language is not known, so it is detected. Without it they are
   * translated from the side they sit in.
   */
  detect?: (texts: string[]) => Promise<TDetectReply>;
};

const other = (lang: TSheetLang): TSheetLang => (lang === "en" ? "pt" : "en");
const suffix = (lang: TSheetLang) => (lang === "en" ? "En" : "Pt");

/** Stops after these: no later batch could succeed. */
const FATAL: TranslationErrorCode[] = ["QUOTA_EXCEEDED", "UNAUTHORIZED"];

type TTextCell = {
  /** Editor path without the language: `name`, `v0.name`, `v0.o1.label`. */
  base: string;
  en: string;
  pt: string;
  set: (lang: TSheetLang, value: string) => void;
};

/** Every two-language text of one product, with a setter into `p` (already a copy). */
function textCells(p: TSheetProduct): TTextCell[] {
  const cells: TTextCell[] = [
    { base: "name", en: p.nameEn, pt: p.namePt, set: (l, v) => { if (l === "en") p.nameEn = v; else p.namePt = v; } },
    {
      base: "description",
      en: p.descriptionEn,
      pt: p.descriptionPt,
      set: (l, v) => { if (l === "en") p.descriptionEn = v; else p.descriptionPt = v; },
    },
  ];
  p.variations.forEach((v, vi) => {
    cells.push({ base: `v${vi}.name`, en: v.nameEn, pt: v.namePt, set: (l, val) => { if (l === "en") v.nameEn = val; else v.namePt = val; } });
    v.options.forEach((o, oi) => {
      cells.push({
        base: `v${vi}.o${oi}.label`,
        en: o.labelEn,
        pt: o.labelPt,
        set: (l, val) => { if (l === "en") o.labelEn = val; else o.labelPt = val; },
      });
    });
  });
  return cells;
}

const defaultWait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });

/** Splits texts into requests the route accepts. Texts must each be ≤ the per-text limit. */
export function batchTexts(texts: string[]): string[][] {
  const batches: string[][] = [];
  let current: string[] = [];
  let length = 0;
  for (const text of texts) {
    if (current.length && (current.length >= TRANSLATE_MAX_TEXTS || length + text.length > TRANSLATE_MAX_TOTAL_LENGTH)) {
      batches.push(current);
      current = [];
      length = 0;
    }
    current.push(text);
    length += text.length;
  }
  if (current.length) batches.push(current);
  return batches;
}

/**
 * Fills the empty language of every text that has the other one. Texts the
 * vendor already wrote in both languages are left alone and not sent.
 * `lang` is the language the file was written in; a cell filled only in the
 * other language (an old full-template file) is translated the other way.
 */
export async function translateSheet(
  products: TSheetProduct[],
  lang: TSheetLang,
  send: (request: TranslationRequest) => Promise<TranslationReply>,
  { onProgress, signal, wait = defaultWait, detect }: TSheetTranslateOptions = {},
): Promise<TSheetTranslation> {
  const result: TSheetProduct[] = structuredClone(products);

  type TFrom = TSheetLang | "auto";
  type TJob = { product: TSheetProduct; cell: TTextCell; from: TFrom; text: string };
  const jobs: TJob[] = [];
  for (const p of result) {
    for (const cell of textCells(p)) {
      const en = cell.en.trim();
      const pt = cell.pt.trim();
      if (!!en === !!pt) continue; // both written, or both empty
      const side: TSheetLang = (lang === "en" ? en : pt) ? lang : other(lang);
      jobs.push({ product: p, cell, from: p.detect && detect ? "auto" : side, text: side === "en" ? en : pt });
    }
  }

  // One request list per direction (or detection), each text once.
  const unique: Record<TFrom, string[]> = { en: [], pt: [], auto: [] };
  const seen: Record<TFrom, Set<string>> = { en: new Set(), pt: new Set(), auto: new Set() };
  for (const job of jobs) {
    if (job.text.length > TRANSLATE_MAX_TEXT_LENGTH || seen[job.from].has(job.text)) continue;
    seen[job.from].add(job.text);
    unique[job.from].push(job.text);
  }

  const plan = (["en", "pt", "auto"] as const).flatMap((from) => batchTexts(unique[from]).map((texts) => ({ from, texts })));
  const done: Record<TSheetLang, Map<string, string>> = { en: new Map(), pt: new Map() };
  const detected = new Map<string, { from: string; en: string; pt: string }>();
  let error: TranslationErrorCode | null = jobs.some((j) => j.text.length > TRANSLATE_MAX_TEXT_LENGTH)
    ? "INVALID_REQUEST"
    : null;
  let stopped = false;

  onProgress?.(0, plan.length);
  for (const [index, batch] of plan.entries()) {
    signal?.throwIfAborted();
    if (!stopped) {
      const { from } = batch;
      const call = async (): Promise<TranslationReply | TDetectReply> => {
        if (from === "auto") return detect!(batch.texts);
        const request: TranslationRequest = {
          texts: batch.texts,
          sourceLang: from.toUpperCase() as DeepLLang,
          targetLang: other(from).toUpperCase() as DeepLLang,
        };
        return send(request);
      };

      let reply: TranslationReply | TDetectReply;
      for (let attempt = 0; ; attempt++) {
        try {
          reply = await call();
        } catch {
          reply = { ok: false, code: "UNAVAILABLE" };
        }
        if (reply.ok || reply.code !== "RATE_LIMITED" || attempt >= MAX_RATE_RETRIES) break;
        await wait(TRANSLATE_RATE_WAIT_MS, signal);
      }

      if (reply.ok && from === "auto" && "results" in reply && reply.results?.length === batch.texts.length) {
        batch.texts.forEach((text, i) => {
          const r = (reply as { results: { from: string; en: string; pt: string }[] }).results[i];
          if (r?.en?.trim() && r?.pt?.trim()) detected.set(text, { from: r.from, en: r.en.trim(), pt: r.pt.trim() });
        });
      } else if (reply.ok && from !== "auto" && "translations" in reply && Array.isArray(reply.translations) && reply.translations.length === batch.texts.length) {
        batch.texts.forEach((text, i) => {
          const translated = (reply as { translations: string[] }).translations[i]?.trim();
          if (translated) done[from].set(text, translated);
        });
      } else {
        const code = reply.ok ? "UNAVAILABLE" : reply.code;
        error ??= code;
        if (FATAL.includes(code)) stopped = true;
      }
    }
    onProgress?.(index + 1, plan.length);
  }

  const missing: TSheetMissing[] = [];
  const unfinished = new Set<TSheetProduct>();
  let translated = 0;
  for (const job of jobs) {
    const empty: TSheetLang = job.cell.en.trim() ? "pt" : "en";
    if (job.from === "auto") {
      const found = detected.get(job.text);
      if (found) {
        job.cell.set("en", found.en);
        job.cell.set("pt", found.pt);
        // The grid shows a product in the language its name was written in.
        if (job.cell.base === "name" && (found.from === "en" || found.from === "pt")) job.product.lang = found.from;
        translated++;
        continue;
      }
    } else {
      const text = done[job.from].get(job.text);
      if (text) {
        job.cell.set(other(job.from), text);
        translated++;
        continue;
      }
    }
    unfinished.add(job.product);
    missing.push({ clientId: job.product.clientId, field: `${job.cell.base}${suffix(empty)}` });
  }
  // Fully converted: nothing left to detect.
  for (const job of jobs) if (job.from === "auto" && !unfinished.has(job.product)) delete job.product.detect;

  return {
    products: result,
    missing,
    error: missing.length ? error ?? "UNAVAILABLE" : null,
    translated,
    sent: unique.en.length + unique.pt.length + unique.auto.length,
  };
}
