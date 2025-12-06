import parsePhoneNumberFromString, {
  isValidPhoneNumber,
} from "libphonenumber-js";
import { z } from "zod";

export const addFleetManagerValidation = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters long")
      .max(30, "First name must be at most 30 characters long")
      .nonempty("First name is required"),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters long")
      .max(30, "Last name must be at most 30 characters long")
      .nonempty("Last name is required"),

    prefixPhoneNumber: z.string(),

    phoneNumber: z
      .string()
      .nonempty("Phone number is required")
      .nonempty("Phone number is required"),

    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters long")
      .max(50, "Business name must be at most 50 characters long")
      .nonempty("Business name is required"),

    businessLicenseNumber: z
      .string()
      .min(2, "Business license number must be at least 2 characters long")
      .max(50, "Business license number must be at most 50 characters long")
      .nonempty("Business license number is required"),

    street: z
      .string()
      .nonempty("Street Address is required")
      .min(5, "Street Address must be at least 5 characters")
      .max(100, "Street Address must be at most 100 characters"),

    city: z
      .string()
      .nonempty("City is required")
      .min(2, "City must be at least 2 characters")
      .max(50, "City must be at most 50 characters"),

    postalCode: z
      .string()
      .nonempty("Postal Code is required")
      .min(4, "Postal Code must be at least 4 characters")
      .max(10, "Postal Code must be at most 10 characters"),

    country: z
      .string()
      .nonempty("Country is required")
      .min(2, "Country must be at least 2 characters")
      .max(50, "Country must be at most 50 characters"),

    bankName: z
      .string()
      .min(2, "Bank name must be at least 2 characters")
      .max(50, "Bank name must be at most 50 characters")
      .nonempty("Bank name is required"),

    accountHolderName: z
      .string()
      .min(2, "Account holder name must be at least 2 characters")
      .max(100, "Account holder name must be at most 100 characters")
      .nonempty("Account holder name is required"),

    iban: z
      .string()
      .min(15, "IBAN must be at least 15 characters")
      .max(34, "IBAN must be at most 34 characters"),

    swiftCode: z
      .string()
      .min(8, "SWIFT code must be at least 8 characters")
      .max(11, "SWIFT code must be at most 11 characters"),
  })
  .refine(
    (data) => {
      const full = data.prefixPhoneNumber + data.phoneNumber;
      const result = isValidPhoneNumber(full);

      return result;
    },
    {
      message: "Invalid phone number for the selected country",
      path: ["phoneNumber"],
    }
  )
  .transform((data) => {
    const full = data.prefixPhoneNumber + data.phoneNumber;
    const phone = parsePhoneNumberFromString(full);
    return {
      ...data,
      phoneNumber: `+${phone?.countryCallingCode}${phone?.nationalNumber}`,
    };
  });
