import { z } from "zod";

/** 21:8 — e.g. 2100×800, 2625×1000 */
const EXPECTED_RATIO = 21 / 8; // 2.625
const RATIO_TOLERANCE = 0.05;

const checkImageRatio = (
  file: File,
  expectedRatio: number = EXPECTED_RATIO,
): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const ratio = img.width / img.height;
        resolve(Math.abs(ratio - expectedRatio) < RATIO_TOLERANCE);
      };
      img.onerror = () => resolve(false);
    };
    reader.onerror = () => resolve(false);
  });
};

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

    url: z
      .string()
      .url("Invalid URL format")
      .max(255)
      .or(z.literal(""))
      .optional(),

    targetZoneIds: z.array(z.string().optional()).optional(),

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
  })
  .superRefine(async (data, ctx) => {
    if (data.sponsorBanner.file instanceof File) {
      const isCorrectRatio = await checkImageRatio(
        data.sponsorBanner.file,
        EXPECTED_RATIO,
      );

      if (!isCorrectRatio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Image must have a 21:8 aspect ratio (e.g. 2100×800 or 2625×1000)",
          path: ["sponsorBanner"],
        });
      }
    }
  });