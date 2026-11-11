// src/components/Dashboard/Vendors/AddVendor/WeeklyScheduleEditor.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TClockPeriod, TWeeklyDaySchedule } from "@/types/user.type";
import {
    DEFAULT_PERIOD,
    MAX_PERIODS_PER_DAY,
    fromMinutes,
    normalizeSchedule,
    toMinutes,
} from "@/utils/weeklySchedule";
import { Clock, Copy, Moon, Plus, X } from "lucide-react";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

type TScheduleForm = { weeklySchedule: TWeeklyDaySchedule[] };
type TScheduleError = {
    message?: string;
    root?: { message?: string };
    [dayIndex: number]:
        | {
              day?: { message?: string };
              periods?: {
                  message?: string;
                  root?: { message?: string };
                  [periodIndex: number]:
                      | { open?: { message?: string }; close?: { message?: string } }
                      | undefined;
              };
          }
        | undefined;
};

interface IProps {
    t: (key: string) => string;
    disabled?: boolean;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const canAddPeriod = (periods: TClockPeriod[]) => {
    if (periods.length >= MAX_PERIODS_PER_DAY) return false;
    const last = periods[periods.length - 1];
    if (!last) return true;
    if (!TIME_RE.test(last.open) || !TIME_RE.test(last.close)) return false; // 24:00 / empty: no room
    const lastOpen = toMinutes(last.open);
    const lastClose = toMinutes(last.close);
    return lastClose > lastOpen && lastClose < 23 * 60 + 57;
};

export default function WeeklyScheduleEditor({ t, disabled = false }: IProps) {
    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext<TScheduleForm>();

    const watched = useWatch({ control, name: "weeklySchedule" });
    const schedule = useMemo(() => normalizeSchedule(watched), [watched]);

    const scheduleErrors = errors.weeklySchedule as TScheduleError | undefined;
    const rootMessage: string | undefined =
        scheduleErrors?.message ?? scheduleErrors?.root?.message;

    const commit = (next: TWeeklyDaySchedule[]) =>
        setValue("weeklySchedule", next, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });

    const updateDay = (dayIdx: number, periods: TClockPeriod[]) =>
        commit(schedule.map((d, i) => (i === dayIdx ? { ...d, periods } : d)));

    const updatePeriod = (dayIdx: number, pIdx: number, patch: Partial<TClockPeriod>) =>
        updateDay(
            dayIdx,
            schedule[dayIdx].periods.map((p, i) => (i === pIdx ? { ...p, ...patch } : p)),
        );

    const toggleDay = (dayIdx: number) =>
        updateDay(dayIdx, schedule[dayIdx].periods.length ? [] : [{ ...DEFAULT_PERIOD }]);

    const addPeriod = (dayIdx: number) => {
        const periods = schedule[dayIdx].periods;
        if (!canAddPeriod(periods)) return;
        if (periods.length === 0) return updateDay(dayIdx, [{ ...DEFAULT_PERIOD }]);

        const lastClose = toMinutes(periods[periods.length - 1].close);
        const open = Math.max(lastClose, Math.min(lastClose + 60, 22 * 60));
        const close = Math.min(open + 120, 23 * 60 + 59);
        updateDay(dayIdx, [...periods, { open: fromMinutes(open), close: fromMinutes(close) }]);
    };

    const removePeriod = (dayIdx: number, pIdx: number) =>
        updateDay(
            dayIdx,
            schedule[dayIdx].periods.filter((_, i) => i !== pIdx),
        );

    const copyToAll = (dayIdx: number) =>
        commit(
            schedule.map((d) => ({
                ...d,
                periods: schedule[dayIdx].periods.map((p) => ({ ...p })),
            })),
        );

    const dayLabel = (day: string) => t(day.toLowerCase()) || day;

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-[#DC3173]" />
                <p>
                    {t("weekly_schedule_hint") ||
                        "Set the opening hours for each day. Add up to 4 periods per day (for example lunch and dinner). Times use the store's local time."}
                </p>
            </div>

            {rootMessage && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {rootMessage}
                </p>
            )}

            {schedule.map((day, dayIdx) => {
                const isOpen = day.periods.length > 0;
                const dayError: string | undefined =
                    scheduleErrors?.[dayIdx]?.periods?.message ??
                    scheduleErrors?.[dayIdx]?.periods?.root?.message ??
                    scheduleErrors?.[dayIdx]?.day?.message;

                return (
                    <div
                        key={day.day}
                        className={cn(
                            "rounded-xl border p-3 sm:p-4 transition-colors",
                            isOpen ? "border-[#DC3173]/30 bg-white" : "border-slate-200 bg-slate-50/60",
                        )}
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                            {/* Day + open/closed switch */}
                            <div className="flex items-center justify-between gap-3 sm:w-48 shrink-0">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{dayLabel(day.day)}</p>
                                    <p className={cn("text-xs", isOpen ? "text-emerald-600" : "text-slate-400")}>
                                        {isOpen ? t("open") || "Open" : t("closed") || "Closed"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isOpen}
                                    aria-label={dayLabel(day.day)}
                                    disabled={disabled}
                                    onClick={() => toggleDay(dayIdx)}
                                    className={cn(
                                        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
                                        isOpen ? "bg-[#DC3173]" : "bg-slate-300",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                                            isOpen ? "translate-x-5" : "translate-x-0.5",
                                        )}
                                    />
                                </button>
                            </div>

                            {/* Periods */}
                            <div className="flex-1 min-w-0 space-y-2">
                                {isOpen ? (
                                    day.periods.map((period, pIdx) => {
                                        const openErr: string | undefined =
                                            scheduleErrors?.[dayIdx]?.periods?.[pIdx]?.open?.message;
                                        const closeErr: string | undefined =
                                            scheduleErrors?.[dayIdx]?.periods?.[pIdx]?.close?.message;
                                        const isMidnight = period.close === "24:00";
                                        const endsNextDay =
                                            TIME_RE.test(period.open) &&
                                            TIME_RE.test(period.close) &&
                                            toMinutes(period.close) < toMinutes(period.open);

                                        return (
                                            <div key={pIdx} className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Input
                                                        type="time"
                                                        step={60}
                                                        value={period.open}
                                                        disabled={disabled}
                                                        aria-invalid={!!openErr}
                                                        className={cn("w-32", openErr && "border-red-500")}
                                                        onChange={(e) => updatePeriod(dayIdx, pIdx, { open: e.target.value })}
                                                    />
                                                    <span className="text-slate-400">–</span>

                                                    {isMidnight ? (
                                                        <Input value="24:00" readOnly disabled className="w-32" />
                                                    ) : (
                                                        <Input
                                                            type="time"
                                                            step={60}
                                                            value={period.close}
                                                            disabled={disabled}
                                                            aria-invalid={!!closeErr}
                                                            className={cn("w-32", closeErr && "border-red-500")}
                                                            onChange={(e) =>
                                                                updatePeriod(dayIdx, pIdx, { close: e.target.value })
                                                            }
                                                        />
                                                    )}

                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant={isMidnight ? "default" : "outline"}
                                                        disabled={disabled}
                                                        title={t("until_midnight") || "Until midnight (24:00)"}
                                                        className={cn(
                                                            "h-9 w-9",
                                                            isMidnight && "bg-[#DC3173] hover:bg-[#c22b65] text-white",
                                                        )}
                                                        onClick={() =>
                                                            updatePeriod(dayIdx, pIdx, {
                                                                close: isMidnight ? "23:59" : "24:00",
                                                            })
                                                        }
                                                    >
                                                        <Moon className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={disabled}
                                                        title={t("remove") || "Remove"}
                                                        className="h-9 w-9 text-slate-400 hover:text-red-500"
                                                        onClick={() => removePeriod(dayIdx, pIdx)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>

                                                    {endsNextDay && (
                                                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                                                            {t("ends_next_day") || "ends next day"}
                                                        </span>
                                                    )}
                                                </div>
                                                {openErr && <p className="text-xs text-red-500">{openErr}</p>}
                                                {closeErr && <p className="text-xs text-red-500">{closeErr}</p>}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-slate-400 py-1.5">
                                        {t("closed_all_day") || "Closed all day"}
                                    </p>
                                )}

                                {dayError && <p className="text-xs text-red-500">{dayError}</p>}

                                {isOpen && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            disabled={disabled || !canAddPeriod(day.periods)}
                                            onClick={() => addPeriod(dayIdx)}
                                            className="h-8 text-xs"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            {t("add_period") || "Add period"}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            disabled={disabled}
                                            onClick={() => copyToAll(dayIdx)}
                                            className="h-8 text-xs text-slate-500 hover:text-[#DC3173]"
                                        >
                                            <Copy className="w-3.5 h-3.5 mr-1" />
                                            {t("copy_to_all_days") || "Copy to all days"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}