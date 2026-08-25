import { z } from "zod";

export const addVendorBranchValidation = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        phoneNumber: z.string().min(8, "Phone number is required"),

        branchName: z
            .string()
            .min(2, "Branch name must be at least 2 characters")
            .max(50)
            .nonempty("Branch name is required"),

        businessName: z.string().optional(),
        businessType: z.string().optional(),
        restaurantCuisineType: z.array(z.string()).optional(),
        NIF: z.string().optional(),

        openingHours: z.string().nonempty("Opening hours is required"),
        closingHours: z.string().nonempty("Closing hours is required"),
        closingDays: z.array(z.string()).max(7).optional(),

        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        postalCode: z.string().min(1, "Postal code is required"),
        country: z.string().min(1, "Country is required"),
        latitude: z.number(),
        longitude: z.number(),

        accountHolderName: z.string().min(1, "Account holder name is required"),
        iban: z.string().min(1, "IBAN is required"),
    })
    .refine(
        (data) => {
            const [openH, openM] = data.openingHours.split(":").map(Number);
            const [closeH, closeM] = data.closingHours.split(":").map(Number);
            let diff = (closeH * 60 + closeM - (openH * 60 + openM)) / 60;
            if (diff < 0) diff += 24;
            return diff >= 6;
        },
        {
            message: "Business must be open at least 6 hours",
            path: ["closingHours"],
        }
    );