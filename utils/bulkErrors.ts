/**
 * Friendly text for the bulk create / import / bulk delete error codes
 * (PRODUCT_BULK_AND_IMPORT_FRONTEND_GUIDE, Appendix B).
 *
 * Each code has a translation key `bulk_err_<CODE>` in `en.ts` / `pt.ts`.
 * An unknown code falls back to the server's own (already localized) message,
 * so a code the backend adds later still shows something sensible.
 *
 * Pure: safe in client and server code.
 */

type TFn = (key: string) => string;

/** Fills `{name}` placeholders in a translated string. */
export const fillVars = (text: string, vars: Record<string, string | number> = {}) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));

/**
 * Text for one error code: our translation when we have one, else the
 * server message, else a generic line.
 */
export function bulkErrorText(
  t: TFn,
  code: string | null | undefined,
  serverMessage?: string | null,
  vars?: Record<string, string | number>,
): string {
  if (code) {
    const key = `bulk_err_${code}`;
    const text = t(key);
    if (text !== key) return fillVars(text, vars);
  }
  return serverMessage || t("bulk_err_UNKNOWN");
}

/**
 * Text for a whole failed request (`TBulkResponse` with `ok: false`):
 * 429 says how long to wait, 0 is a network problem, else by `errorKey`.
 */
export function bulkRequestErrorText(
  t: TFn,
  res: { status: number; errorKey: string | null; message: string; retryAfter: number | null },
): string {
  if (res.status === 429 || res.errorKey === "RATE_LIMIT_EXCEEDED") {
    if (!res.retryAfter) return t("bulk_err_RATE_LIMIT_EXCEEDED");
    // Up to 2 minutes in seconds, longer waits in minutes ("1440 seconds" reads badly).
    return res.retryAfter < 120
      ? fillVars(t("bulk_err_RATE_LIMIT_WAIT"), { seconds: res.retryAfter })
      : fillVars(t("bulk_err_RATE_LIMIT_WAIT_MIN"), { minutes: Math.ceil(res.retryAfter / 60) });
  }
  if (res.status === 0) return t("bulk_err_NETWORK");
  return bulkErrorText(t, res.errorKey, res.message);
}

/**
 * A counted message: `<key>_one` when the count is 1 and that key exists,
 * else `<key>`; `{count}` is filled either way.
 */
export function countText(t: TFn, key: string, count: number, vars: Record<string, string | number> = {}) {
  const one = `${key}_one`;
  const text = count === 1 && t(one) !== one ? t(one) : t(key);
  return fillVars(text, { count, ...vars });
}

/** Codes that mean "already done": a product already deleted is not a failure to show. */
export const BULK_DELETE_DONE_CODES = new Set(["PRODUCT_ALREADY_DELETED"]);

/** Import job statuses after which polling stops. */
export const IMPORT_FINAL_STATUSES = new Set([
  "COMPLETED",
  "COMPLETED_WITH_ERRORS",
  "FAILED",
  "CANCELED",
]);
