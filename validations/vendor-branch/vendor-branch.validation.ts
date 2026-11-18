import { z } from "zod";
import { weeklyScheduleSchema } from "@/validations/add-vendor/add-vendor.validation";

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

        // Same weekly rules as Add / Edit Vendor (incl. 6 h a day, max 2 closed days).
        weeklySchedule: weeklyScheduleSchema,

        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        postalCode: z.string().min(1, "Postal code is required"),
        country: z.string().min(1, "Country is required"),
        latitude: z.number(),
        longitude: z.number(),

        accountHolderName: z.string().min(1, "Account holder name is required"),
        iban: z.string().min(1, "IBAN is required"),
    });
