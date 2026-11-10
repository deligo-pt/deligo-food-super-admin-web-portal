/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldValues, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

/** Form fields the server may point at through errorSources[].path */
const FORM_FIELDS = new Set([
    "title",
    "description",
    "discountValue",
    "maxDiscountAmount",
    "minOrderAmount",
    "code",
    "scopeProducts",
    "validFrom",
    "expiresAt",
    "userUsageLimit",
    "isActive",
]);

const ERROR_KEYS: Record<string, { message: string; field?: string }> = {
    ACTIVE_FIRST_ORDER_OFFER_EXISTS: {
        message:
            "A global first-order offer is already active. Deactivate it first, then try again.",
        field: "isActive",
    },
    ACTIVE_FIRST_ORDER_VENDOR_OFFER_EXISTS: {
        message:
            "This store already has an active first-order offer. Deactivate it first, then try again.",
        field: "isActive",
    },
    FIRST_ORDER_OFFER_SCOPE_IMMUTABLE: {
        message:
            "The scope of a first-order offer can't be changed. Deactivate this offer and create a new one.",
    },
    FIRST_ORDER_OFFER_ADMIN_ONLY: {
        message: "Only admins can create or change a global first-order offer.",
    },
    OFFER_LOCKED_BY_ADMIN: {
        message: "This offer was created by an admin and can't be edited by the vendor.",
    },
};

/** The key can sit in different places depending on your response wrapper */
export const getOfferErrorKey = (result: any): string | undefined =>
    result?.errorKey ??
    result?.data?.errorKey ??
    result?.data?.errorSources?.[0]?.errorKey;

/**
 * Turns a failed offer request into field errors and one toast.
 * Reuse it in the create forms too.
 */
export function applyOfferServerError<T extends FieldValues>(
    result: any,
    setError: UseFormSetError<T>,
    toastId?: string | number,
) {
    const known = ERROR_KEYS[getOfferErrorKey(result) ?? ""];
    if (known) {
        if (known.field) {
            setError(known.field as any, { type: "server", message: known.message });
        }
        toast.error(known.message, { id: toastId });
        return;
    }

    const sources: { path?: string; message: string }[] =
        result?.data?.errorSources ?? [];
    let highlighted = 0;

    sources.forEach((s) => {
        const root = s.path?.split(".")[0];
        if (root && FORM_FIELDS.has(root)) {
            setError(s.path as any, { type: "server", message: s.message });
            highlighted++;
        }
    });

    const message = highlighted
        ? "Fix the highlighted fields and try again."
        : sources.length
            ? sources.map((s) => s.message).join(". ")
            : result?.message || "Request failed";

    toast.error(message, { id: toastId });
}

/** Message for a known first-order 409 / error key, or undefined if the key isn't one we know */
export const getKnownOfferError = (result: any): string | undefined =>
    ERROR_KEYS[getOfferErrorKey(result) ?? ""]?.message;