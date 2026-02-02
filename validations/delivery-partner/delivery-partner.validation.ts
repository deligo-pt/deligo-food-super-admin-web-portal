import parsePhoneNumberFromString, {
  isValidPhoneNumber,
} from "libphonenumber-js";
import { z } from "zod";

export const deliveryPartnerValidation = z
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

    dateOfBirth: z
      .string()
      .refine((value) => {
        return Date.parse(value);
      }, "Invalid date format")
      .nonempty("Date of birth is required"),

    gender: z.enum(["MALE", "FEMALE", "OTHER"], "Gender is required"),

    nationality: z
      .string()
      .nonempty("Nationality is required")
      .min(2, "Nationality must be at least 2 characters")
      .max(50, "Nationality must be at most 50 characters"),

    nifNumber: z
      .string()
      .min(9, "NIF number must be at least 9 characters")
      .nonempty("NIF number is required"),

    citizenCardNumber: z
      .string()
      .min(5, "Citizen card number must be at least 5 characters")
      .nonempty("Citizen card number is required"),

    passportNumber: z
      .string()
      .min(5, "Passport number must be at least 5 characters")
      .optional(),

    idExpiryDate: z
      .string()
      .refine((value) => {
        return Date.parse(value);
      }, "Invalid date format")
      .nonempty("ID expiry date is required"),

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
      .nonempty("Postal code is required")
      .min(1, "Postal code must be at least 1 characters")
      .max(10, "Postal code must be at most 10 characters"),

    country: z
      .string()
      .nonempty("Country is required")
      .min(2, "Country must be at least 2 characters")
      .max(50, "Country must be at most 50 characters"),

    vehicleType: z.enum(
      ["BICYCLE", "E-BIKE", "SCOOTER", "MOTORBIKE", "CAR"],
      "Vehicle type is required",
    ),

    brand: z
      .string()
      .min(2, "Brand must be at least 2 character")
      .max(50, "Brand must be at most 50 characters")
      .optional(),

    model: z
      .string()
      .min(2, "Brand must be at least 2 character")
      .max(50, "Brand must be at most 50 characters")
      .optional(),

    licensePlate: z
      .string()
      .min(2, "Brand must be at least 2 character")
      .max(50, "Brand must be at most 50 characters")
      .optional(),

    drivingLicenseNumber: z
      .string()
      .min(2, "Brand must be at least 2 character")
      .max(50, "Brand must be at most 50 characters")
      .optional(),

    drivingLicenseExpiry: z
      .string()
      .refine((value) => {
        return Date.parse(value);
      }, "Invalid date format")
      .optional(),

    insurancePolicyNumber: z
      .string()
      .min(2, "Brand must be at least 2 character")
      .max(50, "Brand must be at most 50 characters")
      .optional(),

    insuranceExpiry: z.string().refine((value) => {
      return Date.parse(value);
    }, "Invalid date format"),

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

    preferredZones: z.array(z.string(), "Preferred zones are required"),

    preferredHours: z.array(z.string(), "Preferred hours are required"),

    isothermalBag: z.boolean("Isothermal bag is required"),

    helmet: z.boolean("Helmet is required"),

    powerBank: z.boolean("Power bank is required"),

    workedWithOtherPlatform: z.boolean(
      "Worked with other platform is required",
    ),

    otherPlatformName: z.string().optional(),

    residencePermitType: z
      .string()
      .min(2, "Residence permit type must be at least 2 characters")
      .max(50, "Residence permit type must be at most 50 characters")
      .nonempty("Residence permit type is required"),

    residencePermitNumber: z
      .string()
      .min(2, "ARC / título de residência number must be at least 2 characters")
      .max(
        50,
        "ARC / título de residência number must be at most 50 characters",
      )
      .nonempty("ARC / título de residência number is required"),

    residencePermitExpiry: z
      .string()
      .refine((value) => {
        return Date.parse(value);
      }, "Invalid date format")
      .nonempty("Date of birth is required"),

    haveCriminalRecordCertificate: z.boolean(
      "Criminal record certificate is required",
    ),

    issueDate: z.string().optional(),
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
    },
  )
  .refine((data) => {
    if (
      data.vehicleType === "CAR" ||
      data.vehicleType === "SCOOTER" ||
      data.vehicleType === "MOTORBIKE"
    ) {
      return (
        data.licensePlate !== "" &&
        data.drivingLicenseNumber !== "" &&
        data.drivingLicenseExpiry !== "" &&
        data.insurancePolicyNumber !== "" &&
        data.insuranceExpiry !== ""
      );
    }
    return true;
  }, "License plate, driving license number, driving license expiry, insurance policy number and insurance expiry is required if vehicle type is car, scooter or bike")
  .transform((data) => {
    const full = data.prefixPhoneNumber + data.phoneNumber;
    const phone = parsePhoneNumberFromString(full);
    return {
      ...data,
      phoneNumber: `+${phone?.countryCallingCode}${phone?.nationalNumber}`,
    };
  })
  .refine(
    (data) => {
      if (data.workedWithOtherPlatform && !data.otherPlatformName) {
        return false;
      }
      return true;
    },
    {
      message: "Other platform name is required",
      path: ["otherPlatformName"],
    },
  )
  .refine(
    (data) => {
      if (data.haveCriminalRecordCertificate) {
        return !!data.issueDate;
      }
      return true;
    },
    {
      message: "Issue date is required",
      path: ["issueDate"],
    },
  )
  .refine(
    (data) => {
      if (data.issueDate) {
        return Date.parse(data.issueDate);
      }

      return true;
    },
    {
      message: "Invalid issue date format",
      path: ["issueDate"],
    },
  );
