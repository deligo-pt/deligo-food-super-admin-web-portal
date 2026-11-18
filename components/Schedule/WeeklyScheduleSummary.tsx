"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import type { TWeeklyDaySchedule } from "@/types/user.type";
import { dayShortKey, groupDays, initialWeek } from "@/utils/weeklySchedule";

interface IProps {
  /** `businessDetails` of the store (vendor record or an order's vendor). */
  details?: {
    weeklySchedule?: TWeeklyDaySchedule[];
    openingHours?: string;
    closingHours?: string;
    closingDays?: string[];
  } | null;
  className?: string;
}

/**
 * A store's opening hours, grouped by runs of days with the same shifts:
 * "Mon – Thu  12:00–16:00, 19:00–23:00", "Fri  Closed".
 *
 * Read from `weeklySchedule` when the store has one. Otherwise it is built
 * from the legacy `openingHours` / `closingHours` / `closingDays` the same way
 * the editor prefills (guide §7), so both formats read alike. The legacy
 * fields are never shown on their own for a store with a schedule: they are a
 * lossy summary (lunch + dinner reads as 12:00–23:00).
 */
export default function WeeklyScheduleSummary({ details, className }: IProps) {
  const { t } = useTranslation();
  const groups = groupDays(initialWeek(details));

  return (
    <dl className={cn("divide-y divide-gray-100", className)}>
      {groups.map((g) => {
        const days =
          g.from === g.to
            ? t(dayShortKey(g.from))
            : `${t(dayShortKey(g.from))} – ${t(dayShortKey(g.to))}`;
        const closed = g.periods.length === 0;
        return (
          <div key={g.from} className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-1.5">
            <dt className="w-24 shrink-0 text-sm text-gray-500">{days}</dt>
            <dd
              className={cn(
                "min-w-0 text-sm font-medium tabular-nums",
                closed ? "text-gray-400" : "text-gray-900",
              )}
            >
              {closed
                ? t("schedule_closed")
                : g.periods.map((p, i) => (
                    <span key={i} className="whitespace-nowrap">
                      {p.open}–{p.close}
                      {i < g.periods.length - 1 ? ", " : ""}
                    </span>
                  ))}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
