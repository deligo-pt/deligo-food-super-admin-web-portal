import z from "zod";

export const payoutSettingsSchema = z.object({
  autoGenerate: z.boolean("Auto generate is required"),
  payoutDays: z
    .array(
      z.enum(
        [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        "Payout day must be one of the following: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday",
      ),
      "Payout days is required",
    )
    .min(1, "At least one payout day is required"),
  minPayoutAmount: z
    .number("Minimum payout amount must be a number")
    .positive("Minimum payout amount must be at least 1"),
  payoutWindowDays: z
    .number("Payout window days must be a number")
    .positive("Payout window days must be at least 1"),
});
