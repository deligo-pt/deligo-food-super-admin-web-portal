/**
 * The running import's id, kept per admin + vendor in localStorage so the
 * vendor's Import products page finds it again after a reload (plan.md AD5:
 * `vendorKey` is `<adminId>:<vendorUserId>`). Storage can be
 * missing or blocked (private window): every access is guarded, and the
 * page still works without it — the job just isn't resumed.
 */

const keyFor = (vendorKey: string) => `admin-product-import-job:v1:${vendorKey}`;

export function readSavedJob(vendorKey: string): string | null {
  try {
    const raw = window.localStorage.getItem(keyFor(vendorKey));
    const saved = raw ? (JSON.parse(raw) as { jobId?: unknown }) : null;
    return typeof saved?.jobId === "string" ? saved.jobId : null;
  } catch {
    return null;
  }
}

export function saveJob(vendorKey: string, jobId: string) {
  try {
    window.localStorage.setItem(keyFor(vendorKey), JSON.stringify({ jobId, startedAt: Date.now() }));
  } catch {
    /* not resumable after a reload; fine */
  }
}

export function forgetJob(vendorKey: string) {
  try {
    window.localStorage.removeItem(keyFor(vendorKey));
  } catch {
    /* nothing to forget */
  }
}

/* ---------- the editor's unfinished list ---------- */

const draftKey = (vendorKey: string) => `admin-product-sheet-draft:v1:${vendorKey}`;

/**
 * `review`: what the editor knew about a file it read for review (Import v2:
 * which cells still need a translation), so a reload keeps those marks.
 */
export type TSheetDraft<T, R = unknown> = { savedAt: number; products: T[]; review?: R | null };

export function readDraft<T, R = unknown>(vendorKey: string): TSheetDraft<T, R> | null {
  try {
    const raw = window.localStorage.getItem(draftKey(vendorKey));
    const draft = raw ? (JSON.parse(raw) as TSheetDraft<T, R>) : null;
    return draft && Array.isArray(draft.products) && draft.products.length ? draft : null;
  } catch {
    return null;
  }
}

/** Saves the list; returns false when storage is full or blocked. */
export function saveDraft<T, R = unknown>(vendorKey: string, products: T[], review: R | null = null): boolean {
  try {
    window.localStorage.setItem(draftKey(vendorKey), JSON.stringify({ savedAt: Date.now(), products, review }));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(vendorKey: string) {
  try {
    window.localStorage.removeItem(draftKey(vendorKey));
  } catch {
    /* nothing saved */
  }
}

/** Saves text as a file (template, failed rows). */
export function downloadText(text: string, fileName: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
