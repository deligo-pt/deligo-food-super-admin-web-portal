import { z } from "zod";

export const sponsorshipValidation = z
  .object({
    sponsorName: z
      .string()
      .min(2, "Sponsor name must be at least 2 characters long")
      .nonempty("Sponsor name is required"),

    sponsorType: z.enum(
      ["Ads", "Offer", "Other"],
      "Sponsor type must be one of the following: Ads, Offer, or Other",
    ),

    startDate: z.date("Start date must be a valid date"),

    endDate: z.date("End date must be a valid date"),

    isActive: z
      .boolean("Active status must be a boolean")
      .default(true)
      .optional(),

    sponsorBanner: z.object(
      {
        file: z.file().nullable(),
        url: z.string().nonempty("Banner is required"),
      },
      "Banner is required",
    ),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be later than start date",
    path: ["endDate"],
  });
