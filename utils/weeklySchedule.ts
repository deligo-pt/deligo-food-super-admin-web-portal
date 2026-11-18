// src/utils/weeklySchedule.ts
import type {
  FieldPath,
  FieldValues,
  UseFormSetError,
} from "react-hook-form";
import type {
  TClockPeriod,
  TWeekday,
  TWeeklyDaySchedule,
} from "@/types/user.type";

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const MAX_PERIODS_PER_DAY = 4;
export const DEFAULT_PERIOD: TClockPeriod = { open: "09:00", close: "18:00" };

type ScheduleLike =
  | ReadonlyArray<
    | {
      day?: string;
      periods?: ReadonlyArray<{ open?: string; close?: string } | undefined>;
    }
    | undefined
  >
  | null
  | undefined;

export const emptyWeeklySchedule = (): TWeeklyDaySchedule[] =>
  WEEK_DAYS.map((day) => ({ day, periods: [] }));

export const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const fromMinutes = (total: number): string => {
  if (total >= 1440) return "24:00";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** Accepts "09:00", "9:00", "09:00 AM", "11:00 PM", "24:00" -> "HH:mm" (or "" if unreadable). */
export const toHHmm = (value?: string | null): string => {
  if (!value) return "";
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return "";
  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  if (hours === 24 && minutes === "00" && !meridiem) return "24:00";
  if (hours > 23) return "";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

/** Always returns 7 entries, Monday..Sunday, plain { day, periods: [{ open, close }] } objects. */
export const normalizeSchedule = (schedule: ScheduleLike): TWeeklyDaySchedule[] =>
  WEEK_DAYS.map((day) => {
    const found = schedule?.find((d) => d?.day === day);
    return {
      day: day as TWeekday,
      periods: (found?.periods ?? [])
        .filter(Boolean)
        .map((p) => ({ open: p?.open ?? "", close: p?.close ?? "" })),
    };
  });

/** Legacy openingHours / closingHours / closingDays -> weeklySchedule (used to prefill the editor). */
export const fromLegacy = (
  details?: {
    openingHours?: string;
    closingHours?: string;
    closingDays?: string[];
  } | null
): TWeeklyDaySchedule[] => {
  const closed = new Set(details?.closingDays ?? []);
  const open = toHHmm(details?.openingHours);
  const close = toHHmm(details?.closingHours);
  // No legacy hours means "open all day"
  const period: TClockPeriod =
    open && close ? { open, close } : { open: "00:00", close: "24:00" };

  return WEEK_DAYS.map((day) => ({
    day: day as TWeekday,
    periods: closed.has(day) ? [] : [{ open: period.open, close: period.close }],
  }));
};

/** weeklySchedule when the vendor has one, otherwise converted legacy hours. */
export const getInitialSchedule = (
  details?: {
    weeklySchedule?: TWeeklyDaySchedule[];
    openingHours?: string;
    closingHours?: string;
    closingDays?: string[];
  } | null
): TWeeklyDaySchedule[] =>
  Array.isArray(details?.weeklySchedule) && details.weeklySchedule.length > 0
    ? normalizeSchedule(details.weeklySchedule)
    : fromLegacy(details);

export const hasAnyPeriod = (schedule: ScheduleLike): boolean =>
  !!schedule?.some((d) => (d?.periods?.length ?? 0) > 0);

export const formatDay = (periods: TClockPeriod[]): string =>
  periods.length ? periods.map((p) => `${p.open}–${p.close}`).join(", ") : "Closed";

/**
 * Backend validation errors look like `businessDetails.weeklySchedule.0.periods.1.open`.
 * Map them onto the form field `weeklySchedule.0.periods.1.open`. Returns true if any matched.
 */
export const mapScheduleServerErrors = (
  errorSources: { path: string; message: string }[] | undefined,
  setError: UseFormSetError<FieldValues>
): boolean => {
  let mapped = false;
  errorSources?.forEach((err) => {
    if (err?.path?.startsWith("businessDetails.weeklySchedule")) {
      setError(
        err.path.replace(/^businessDetails\./, "") as FieldPath<FieldValues>,
        {
        type: "server",
        message: err.message,
        }
      );
      mapped = true;
    }
  });
  return mapped;
};