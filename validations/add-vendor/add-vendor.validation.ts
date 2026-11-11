// src/validations/add-vendor/add-vendor.validation.ts
import parsePhoneNumberFromString from "libphonenumber-js";
import { z } from "zod";
import {
  MAX_PERIODS_PER_DAY,
  WEEK_DAYS,
  toMinutes,
} from "@/utils/weeklySchedule";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const isValidClose = (v: string) => v === "24:00" || TIME_RE.test(v);

const clockPeriodSchema = z.object({
  open: z
    .string()
    .min(1, "Opening time is required")
    .regex(TIME_RE, "Use a valid time (HH:mm)"),
  close: z
    .string()
    .min(1, "Closing time is required")
    .refine((v) => v === "" || isValidClose(v), "Use a valid time (HH:mm) or 24:00"),
});

/**
 * weeklySchedule rules from the backend guide:
 *  - each weekday at most once, 4 periods max per day
 *  - open != close
 *  - chronological, non-overlapping (touching is allowed)
 *  - a period that ends after midnight (close < open) must be the last of its day
 *    and must end no later than the first opening of the next weekday
 */
export const weeklyScheduleSchema = z
  .array(
    z.object({
      day: z.enum(WEEK_DAYS),
      periods: z
        .array(clockPeriodSchema)
        .max(MAX_PERIODS_PER_DAY, `At most ${MAX_PERIODS_PER_DAY} periods per day`),
    }),
  )
  .min(1, "Weekly schedule is required")
  .max(7, "Weekly schedule can have at most 7 days")
  .superRefine((schedule, ctx) => {
    const seen = new Set<string>();

    schedule.forEach((entry, dayIdx) => {
      if (seen.has(entry.day)) {
        ctx.addIssue({
          code: "custom",
          path: [dayIdx, "day"],
          message: `${entry.day} appears more than once`,
        });
      }
      seen.add(entry.day);

      entry.periods.forEach((period, pIdx) => {
        // format problems are already reported by the field-level rules
        if (!TIME_RE.test(period.open) || !isValidClose(period.close)) return;

        const open = toMinutes(period.open);
        const close = toMinutes(period.close);
        const isLast = pIdx === entry.periods.length - 1;

        if (open === close) {
          ctx.addIssue({
            code: "custom",
            path: [dayIdx, "periods", pIdx, "close"],
            message: "Opening and closing time must be different",
          });
          return;
        }

        const pastMidnight = close < open;

        if (pastMidnight && !isLast) {
          ctx.addIssue({
            code: "custom",
            path: [dayIdx, "periods", pIdx, "close"],
            message: "A period that ends after midnight must be the last one of the day",
          });
        }

        if (pIdx > 0) {
          const prev = entry.periods[pIdx - 1];
          if (TIME_RE.test(prev.open) && isValidClose(prev.close)) {
            const prevOpen = toMinutes(prev.open);
            const prevClose = toMinutes(prev.close);
            if (prevClose > prevOpen && open < prevClose) {
              ctx.addIssue({
                code: "custom",
                path: [dayIdx, "periods", pIdx, "open"],
                message:
                  "Periods must be in order and must not overlap: open after the previous period closes",
              });
            }
          }
        }

        if (pastMidnight && isLast) {
          const nextDay = WEEK_DAYS[(WEEK_DAYS.indexOf(entry.day) + 1) % 7];
          const nextFirst = schedule.find((d) => d.day === nextDay)?.periods?.[0];
          if (nextFirst && TIME_RE.test(nextFirst.open) && close > toMinutes(nextFirst.open)) {
            ctx.addIssue({
              code: "custom",
              path: [dayIdx, "periods", pIdx, "close"],
              message: `Must end by ${nextFirst.open}, when ${nextDay} opens`,
            });
          }
        }
      });
    });

    if (!schedule.some((d) => d.periods.length > 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Add at least one opening period",
      });
    }
  });

export const addVendorValidation = (isSubVendor = false) => z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters long")
      .max(30, "First name must be at most 30 characters long")
      .nonempty("First name is required"),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters long")
      .max(30, "Last name must be at most 30 characters long")
      .nonempty("Last name is required"),

    phoneNumber: z.string()
      .min(10, "Phone number is required")
      .refine((val) => {
        try {
          const phone = parsePhoneNumberFromString(val);
          return phone?.isValid() ?? false;
        } catch {
          return false;
        }
      }, "Invalid phone number for the selected country"),

    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters long")
      .max(50, "Business name must be at most 50 characters long")
      .nonempty("Business name is required"),

    companyLegalName: z
      .string()
      .min(2, "Company legal name must be at least 2 characters long")
      .max(50, "Company legal name must be at most 50 characters long")
      .nonempty("Company legal name is required"),

    businessType: z
      .string()
      .min(2, "Business type must be at least 2 characters long")
      .max(50, "Business type must be at most 50 characters long")
      .nonempty("Business type is required"),

    restaurantCuisineType: z.array(z.string()).optional(),

    NIF: z
      .string()
      .min(2, "NIF must be at least 2 characters long")
      .max(50, "NIF must be at most 50 characters long")
      .nonempty("NIF is required"),

    branchName: isSubVendor
      ? z
        .string()
        .min(2, "Branch name must be at least 2 characters long")
        .max(50, "Branch name must be at most 50 characters long")
        .nonempty("Branch name is required")
      : z.string().optional(),

    branches: z
      .string()
      .nonempty("Number of branches is required")
      .refine(
        (val) => !isNaN(parseInt(val)),
        "Number of branches must be a number",
      ),

    // Replaces openingHours / closingHours / closingDays (deprecated, read-only)
    weeklySchedule: weeklyScheduleSchema,

    street: z
      .string()
      .nonempty("Street Address is required")
      .min(5, "Street Address must be at least 5 characters")
      .max(100, "Street Address must be at most 100 characters"),

    city: z
      .string()
      .nonempty("City is required")
      .min(2, "City must be at least 2 characters")
      .max(50, "City must be at most 50 characters"),

    postalCode: z
      .string()
      .nonempty("Postal Code is required")
      .min(4, "Postal Code must be at least 4 characters")
      .max(10, "Postal Code must be at most 10 characters"),

    country: z
      .string()
      .nonempty("Country is required")
      .min(2, "Country must be at least 2 characters")
      .max(50, "Country must be at most 50 characters"),

    latitude: z.number({ error: "Latitude is required" }),

    longitude: z.number({ error: "Logitude is required" }),

    accountHolderName: z
      .string()
      .min(2, "Account holder name must be at least 2 characters")
      .max(100, "Account holder name must be at most 100 characters")
      .nonempty("Account holder name is required"),

    iban: z
      .string()
      .min(15, "IBAN must be at least 15 characters")
      .max(34, "IBAN must be at most 34 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.businessType === "restaurant") {
      if (
        !data.restaurantCuisineType ||
        !Array.isArray(data.restaurantCuisineType) ||
        data.restaurantCuisineType.length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["restaurantCuisineType"],
          message: "Restaurant cuisine type is required",
        });
      }
    }
  });