import { z } from "zod";
import type { TWeekday } from "@/types/user.type";
import { scheduleIssues, WEEK } from "@/utils/weeklySchedule";

// Messages are translation keys (`schedule_err_*`): the editor passes them
// through `t()`. The rules themselves live in `utils/weeklySchedule.ts`
// (`scheduleIssues`), so the editor, the forms and this schema agree.

const periodSchema = z.object({
  open: z.string(),
  close: z.string(),
});

const daySchema = z.object({
  day: z.enum(WEEK as unknown as [TWeekday, ...TWeekday[]]),
  periods: z.array(periodSchema),
});

/**
 * The editor's week: all seven days, Monday first (see `normalizeWeek`).
 * Issue paths match the backend's (`<day>.periods.<i>.open`), so client and
 * server errors land on the same field.
 */
export const weeklyScheduleSchema = z
  .array(daySchema)
  .length(7, "schedule_err_week_incomplete")
  .superRefine((week, ctx) => {
    for (const issue of scheduleIssues(week)) {
      ctx.addIssue({
        code: "custom",
        message: issue.key,
        path: issue.path
          ? issue.path.split(".").map((seg) => (/^\d+$/.test(seg) ? Number(seg) : seg))
          : [],
      });
    }
  });
