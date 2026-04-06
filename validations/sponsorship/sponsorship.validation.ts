import { z } from "zod";

const checkImageRatio = (
  file: File,
  expectedRatio: number,
): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const ratio = img.width / img.height;
        resolve(Math.abs(ratio - expectedRatio) < 0.05);
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
      const isCorrectRatio = await checkImageRatio(data.sponsorBanner.file, 2); // 2 for 2:1 ratio

      if (!isCorrectRatio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Image must have a 2:1 aspect ratio (e.g., 1920x960)",
          path: ["sponsorBanner"],
        });
      }
    }
  });
