import parsePhoneNumberFromString, {
  isValidPhoneNumber,
} from "libphonenumber-js";
import { z } from "zod";

const personalDetailsValidation = z
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

const businessDetailsValidation = z
  .object({
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters long")
      .max(50, "Business name must be at most 50 characters long")
      .nonempty("Business name is required"),

    businessType: z
      .string()
      .min(2, "Business type must be at least 2 characters long")
      .max(50, "Business type must be at most 50 characters long")
      .nonempty("Business type is required"),

    businessLicenseNumber: z
      .string()
      .min(2, "Business license number must be at least 2 characters long")
      .max(50, "Business license number must be at most 50 characters long")
      .nonempty("Business license number is required"),

    NIF: z
      .string()
      .min(2, "NIF must be at least 2 characters long")
      .max(50, "NIF must be at most 50 characters long")
      .nonempty("NIF is required"),

    branches: z
      .string()
      .nonempty("Number of branches is required")
      .refine(
        (val) => !isNaN(parseInt(val)),
        "Number of branches must be a number"
      ),

    openingHours: z.string().nonempty("Opening hours is required"),

    closingHours: z.string().nonempty("Closing hours is required"),

    closingDays: z
      .array(z.string())
      .min(1, "At least one closing day is required")
      .max(7, "Closing days must be at most 7")
      .nonempty("Closing days is required"),
  })
  .refine(
    (data) => {
      const [openH, openM] = data.openingHours.split(":").map(Number);
      const [closeH, closeM] = data.closingHours.split(":").map(Number);

      const openTotal = openH * 60 + openM;
      const closeTotal = closeH * 60 + closeM;

      let diff = (closeTotal - openTotal) / 60;
      if (diff < 0) diff += 24;

      return diff >= 6;
    },
    {
      message: "Business must be open at least 6 hours",
      path: ["closingHours"],
    }
  );

const businessLocationValidation = z.object({
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
});

const bankDetailsValidation = z.object({
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
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractObject = (schema: any) => {
  while (schema._def?.innerType) {
    schema = schema._def.innerType;
  }
  return schema;
};

export const addVendorValidation = z.object({}).extend({
  ...extractObject(personalDetailsValidation).shape,
  ...extractObject(businessDetailsValidation).shape,
  ...extractObject(businessLocationValidation).shape,
  ...extractObject(bankDetailsValidation).shape,
});
