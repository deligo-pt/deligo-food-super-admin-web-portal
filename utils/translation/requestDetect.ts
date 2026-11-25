import type { TDetectReply } from "@/utils/sheetTranslate";

/**
 * One call to `/api/translate/detect` (the import grid's converter): each
 * text's language is detected and both languages come back. Never throws.
 */
export async function requestDetect(texts: string[]): Promise<TDetectReply> {
  try {
    const response = await fetch("/api/translate/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) return { ok: false, code: result?.code ?? "UNAVAILABLE" };
    return { ok: true, results: result.results };
  } catch {
    return { ok: false, code: "UNAVAILABLE" };
  }
}
