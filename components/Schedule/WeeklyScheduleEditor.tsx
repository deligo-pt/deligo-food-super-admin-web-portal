"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import type { TClockPeriod, TWeekday, TWeeklyDaySchedule } from "@/types/user.type";
import {
  dayKey,
  dayOpenMinutes,
  isOvernight,
  MAX_PERIODS_PER_DAY,
  normalizeWeek,
  suggestNextPeriod,
  WEEK,
} from "@/utils/weeklySchedule";
import { AlertCircle, CalendarDays, ChevronDown, Copy, Moon, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface IProps {
  /** The week, Monday first (see `normalizeWeek`). */
  value: TWeeklyDaySchedule[];
  onChange: (week: TWeeklyDaySchedule[]) => void;
  /**
   * Errors keyed by the backend's relative path (`"0.periods.1.open"`,
   * `"4.periods"`, `""` for the whole week). Values are translation keys
   * (client rules, `scheduleErrorMap`) or server text; both go through `t()`,
   * which returns unknown text unchanged.
   */
  errors?: Record<string, string>;
  disabled?: boolean;
}

const WEEKDAYS: readonly TWeekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DEFAULT_PERIOD: TClockPeriod = { open: "09:00", close: "21:00" };

/**
 * 48 px on a phone (finger-sized), 44 px once the card is wide. Up to 28 rem the
 * browser's clock icon is hidden so "07:00 AM" fits next to the 🌙 / ✕ buttons;
 * tapping the box still opens the phone's own time picker.
 */
const timeBox =
  "h-12 w-full min-w-0 rounded-xl border bg-white px-3 text-base @max-[28rem]:px-2.5 @max-[28rem]:text-[15px] @max-[28rem]:[&::-webkit-calendar-picker-indicator]:hidden tabular-nums text-gray-900 outline-none transition-colors focus-visible:border-[#DC3173] focus-visible:ring-2 focus-visible:ring-[#DC3173]/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 @xl:h-11 @xl:text-sm";

/** 🌙 / ✕: square, as tall as a time box, beside the times. */
const sideButton =
  "inline-flex h-12 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors @xl:h-11";

/**
 * Where each part of a time slot sits. Narrow card (under 21 rem, e.g. the
 * registration form on a small phone): Opens + ✕ on row 1, Closes + 🌙 on
 * row 2. From 21 rem: one row, Opens – Closes 🌙 ✕.
 */
const ONE_ROW = "@min-[21rem]:col-start-auto @min-[21rem]:row-start-auto";

/** Footer buttons: equal halves on a phone (stacked on a 320 px one), natural width once wide. */
const footerButton =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors @xl:flex-none";

/** "15 h 30 min", "8 h", "45 min": read the same in EN and PT. */
function hoursLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/**
 * Per-day opening hours editor (FRONTEND_VENDOR_SCHEDULE_GUIDE): up to 4 time
 * slots a day, a past-midnight last slot, "open until midnight" as `24:00`.
 * Controlled and display-only: validation is the caller's (`scheduleErrorMap`
 * for live client errors, `scheduleFieldErrors` for the server's), so the same
 * editor serves Add Vendor, Edit Vendor and Add Branch. A copy of the vendor
 * panel's editor, so admins and stores see the same thing.
 *
 * Laid out by its own width (container queries), not the screen's, so the
 * narrow registration card gets the phone layout too:
 * - narrow: day + switch on one line, Opens – Closes side by side, the
 *   midnight / remove options under them, then 2 equal footer buttons;
 * - `@xl` (36 rem) and up: one row per day.
 */
export default function WeeklyScheduleEditor({ value, onChange, errors = {}, disabled = false }: IProps) {
  const { t } = useTranslation();
  const week = normalizeWeek(value);
  const [copyMenuDay, setCopyMenuDay] = useState<TWeekday | null>(null);

  // A day switched off keeps its slots here, so switching it back on
  // restores them instead of a default.
  const remembered = useRef<Partial<Record<TWeekday, TClockPeriod[]>>>({});

  const setDay = (index: number, periods: TClockPeriod[]) =>
    onChange(week.map((d, i) => (i === index ? { ...d, periods } : d)));

  const setPeriod = (dayIndex: number, periodIndex: number, patch: Partial<TClockPeriod>) =>
    setDay(
      dayIndex,
      week[dayIndex].periods.map((p, i) => (i === periodIndex ? { ...p, ...patch } : p)),
    );

  const toggleDay = (index: number, open: boolean) => {
    const day = week[index];
    if (!open) {
      remembered.current[day.day] = day.periods;
      setDay(index, []);
      return;
    }
    const firstOpen = week.find((d) => d.periods.length)?.periods;
    const restore = remembered.current[day.day] ?? firstOpen ?? [DEFAULT_PERIOD];
    setDay(index, restore.map((p) => ({ ...p })));
  };

  const copyFrom = (index: number, targets: readonly TWeekday[]) => {
    const source = week[index].periods;
    onChange(
      week.map((d) =>
        targets.includes(d.day) && d.day !== week[index].day
          ? { ...d, periods: source.map((p) => ({ ...p })) }
          : d,
      ),
    );
    setCopyMenuDay(null);
    toast.success(t("schedule_copy_done"));
  };

  const weekError = errors[""];

  return (
    <div className="@container space-y-3">
      {weekError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {t(weekError)}
        </p>
      )}

      {week.map((day, d) => {
        const isOpen = day.periods.length > 0;
        const dayError = errors[`${d}.periods`];
        const next = suggestNextPeriod(day.periods);
        const canAdd = !disabled && day.periods.length < MAX_PERIODS_PER_DAY && !!next;
        const dayName = t(dayKey(day.day));
        const hasDayErrors = !!dayError || Object.keys(errors).some((k) => k.startsWith(`${d}.`));
        const switchId = `day-${day.day}`;

        return (
          <section
            key={day.day}
            aria-label={dayName}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 rounded-2xl border p-4 transition-colors @max-[20rem]:p-3",
              "@xl:grid-cols-[9rem_auto_minmax(0,1fr)] @xl:items-start @xl:gap-x-6 @xl:p-5",
              hasDayErrors
                ? "border-red-300 bg-white"
                : isOpen
                  ? "border-gray-200 bg-white"
                  : "border-gray-200 bg-gray-50",
            )}
          >
            {/* Day name and its status */}
            <label htmlFor={switchId} className="min-w-0 cursor-pointer select-none @xl:pt-2.5">
              <span className="block font-semibold text-gray-900">{dayName}</span>
              <span
                className={cn(
                  "mt-0.5 block text-sm",
                  isOpen ? "font-medium text-[#DC3173]" : "text-gray-500",
                )}
              >
                {isOpen
                  ? t("schedule_hours_total").replace("{hours}", hoursLabel(dayOpenMinutes(day.periods)))
                  : t("schedule_closed")}
              </span>
            </label>

            {/* Open / closed switch: 48 × 28 px, right-aligned on a phone. The
                admin Switch sizes itself with data-size rules, so the size
                classes here are marked important to win over them. */}
            <Switch
              id={switchId}
              checked={isOpen}
              disabled={disabled}
              onCheckedChange={(checked) => toggleDay(d, checked)}
              aria-label={`${dayName}: ${isOpen ? t("schedule_open") : t("schedule_closed")}`}
              className="h-7! w-12! justify-self-end data-[state=checked]:bg-[#DC3173] @xl:mt-2 @xl:justify-self-start [&>span]:size-6!"
            />

            {/* Time slots, footer and day error: full width on a phone */}
            {(isOpen || dayError) && (
              <div className="col-span-2 min-w-0 space-y-3 @xl:col-span-1">
                {isOpen && (
                  <ol className="space-y-3">
                    {day.periods.map((period, p) => {
                      const base = `${d}.periods.${p}`;
                      const openError = errors[`${base}.open`];
                      const closeError = errors[`${base}.close`];
                      const untilMidnight = period.close === "24:00";
                      const overnight = isOvernight(period);
                      const slotLabel = `${dayName} · ${p + 1}`;

                      return (
                        <li key={p} className={cn(p > 0 && "border-t border-gray-100 pt-3")}>
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2 gap-y-3 @min-[21rem]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_auto] @min-[21rem]:gap-x-1.5 @xl:grid-cols-[minmax(0,10rem)_auto_minmax(0,10rem)_auto_auto] @xl:justify-start @xl:gap-x-3">
                            <label className={cn("col-start-1 row-start-1 block min-w-0", ONE_ROW)}>
                              <span className="mb-1 block text-xs font-medium text-gray-500">{t("schedule_opens")}</span>
                              <input
                                type="time"
                                step={60}
                                required
                                aria-label={`${slotLabel} ${t("schedule_opens")}`}
                                aria-invalid={!!openError}
                                disabled={disabled}
                                value={period.open}
                                onChange={(e) => setPeriod(d, p, { open: e.target.value })}
                                className={cn(timeBox, openError ? "border-red-400" : "border-gray-300")}
                              />
                            </label>

                            <span aria-hidden className="hidden h-12 items-center text-gray-400 @min-[21rem]:flex @xl:h-11">
                              –
                            </span>

                            <label className={cn("col-start-1 row-start-2 block min-w-0", ONE_ROW)}>
                              <span className="mb-1 block text-xs font-medium text-gray-500">{t("schedule_closes")}</span>
                              {/* A time input can't hold 24:00: the moon button stands for it. */}
                              {untilMidnight ? (
                                <span
                                  aria-label={`${slotLabel} ${t("schedule_closes")}`}
                                  className={cn(timeBox, "flex items-center gap-2 border-indigo-200 bg-indigo-50 text-indigo-800")}
                                >
                                  <Moon className="h-4 w-4 shrink-0" />
                                  24:00
                                </span>
                              ) : (
                                <input
                                  type="time"
                                  step={60}
                                  required
                                  aria-label={`${slotLabel} ${t("schedule_closes")}`}
                                  aria-invalid={!!closeError}
                                  disabled={disabled}
                                  value={period.close}
                                  onChange={(e) => setPeriod(d, p, { close: e.target.value })}
                                  className={cn(timeBox, closeError ? "border-red-400" : "border-gray-300")}
                                />
                              )}
                            </label>

                            {/* Read-only (locked): no greyed-out buttons; the purple
                                24:00 box already shows "until midnight". */}
                            {!disabled && (
                              <>
                                <button
                                  type="button"
                                  aria-pressed={untilMidnight}
                                  title={t("schedule_until_midnight")}
                                  aria-label={`${t("schedule_until_midnight")} (${slotLabel})`}
                                  onClick={() => setPeriod(d, p, { close: untilMidnight ? "23:00" : "24:00" })}
                                  className={cn(
                                    sideButton,
                                    "col-start-2 row-start-2",
                                    ONE_ROW,
                                    untilMidnight
                                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                      : "border-gray-200 bg-white text-gray-500 hover:border-indigo-200 hover:text-indigo-700",
                                  )}
                                >
                                  <Moon className="h-5 w-5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDay(d, day.periods.filter((_, i) => i !== p))}
                                  aria-label={`${t("schedule_remove_shift")} (${slotLabel})`}
                                  title={t("schedule_remove_shift")}
                                  className={cn(
                                    sideButton,
                                    "col-start-2 row-start-1",
                                    ONE_ROW,
                                    "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
                                  )}
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>

                          {overnight && (
                            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                              <Moon className="h-3.5 w-3.5" />
                              {t("schedule_ends_next_day")}
                            </p>
                          )}

                          {(openError || closeError) && (
                            <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                              {t(openError || closeError)}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}

                {dayError && (
                  <p role="alert" className="flex items-start gap-1.5 text-sm font-medium text-red-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {t(dayError)}
                  </p>
                )}

                {/* Footer: add a slot, copy this day's hours */}
                {isOpen && !disabled && (
                  <div className="flex gap-2 border-t border-gray-100 pt-3 @max-[20rem]:flex-col @xl:border-0 @xl:pt-0">
                    {canAdd && (
                      <button
                        type="button"
                        onClick={() => next && setDay(d, [...day.periods, next])}
                        className={cn(footerButton, "border border-dashed border-pink-300 text-[#DC3173] hover:bg-pink-50")}
                      >
                        <Plus className="h-4 w-4" />
                        {t("schedule_add_shift")}
                      </button>
                    )}

                    <Popover
                      open={copyMenuDay === day.day}
                      onOpenChange={(open) => setCopyMenuDay(open ? day.day : null)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(footerButton, "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50")}
                        >
                          <Copy className="h-4 w-4" />
                          {t("schedule_copy_to")}
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-60 rounded-xl bg-white p-1.5">
                        <div role="menu" aria-label={t("schedule_copy_to")}>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => copyFrom(d, WEEKDAYS)}
                            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-gray-800 hover:bg-pink-50 hover:text-[#DC3173]"
                          >
                            <CalendarDays className="h-4 w-4 shrink-0" />
                            {t("schedule_copy_weekdays_range")}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => copyFrom(d, WEEK)}
                            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-gray-800 hover:bg-pink-50 hover:text-[#DC3173]"
                          >
                            <Copy className="h-4 w-4 shrink-0" />
                            {t("schedule_copy_all_7")}
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
