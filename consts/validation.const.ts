import z from "zod";

export function validateLocalizedField(
    value: { en?: string; pt?: string },
    lang: "en" | "pt",
    ctx: z.RefinementCtx,
    path: (string | number)[],
    message: string
) {
    if (!value[lang]?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [...path, lang],
            message,
        });
    }
}