import parsePhoneNumberFromString from "libphonenumber-js";
import { z } from "zod";

// ---- Vehicle-specific schema (as provided) ----

const optionalString = z
  .string()
  .min(2, "Must be at least 2 characters")
  .optional()
  .or(z.literal(""));

const baseVehicleFields = {
  brand: optionalString,
  model: optionalString,
};

const motorVehicleFields = {
  licensePlate: z.string().min(2, "License plate is required"),
  drivingLicenseNumber: z.string().min(2, "Driving license number is required"),
  drivingLicenseExpiry: z.string().refine(
    (v) => !isNaN(Date.parse(v)),
    "Invalid date"
  ),
  insurancePolicyNumber: z.string().min(2, "Insurance policy number is required"),
  insuranceExpiry: z.string().refine(
    (v) => !isNaN(Date.parse(v)),
    "Invalid date"
  ),
};

export const vehicleInfoValidation = z.discriminatedUnion("vehicleType", [
  z.object({
    ...baseVehicleFields,
    vehicleType: z.literal("BICYCLE"),
  }),

  z.object({
    ...baseVehicleFields,
    vehicleType: z.literal("E-BIKE"),
  }),

  z.object({
    ...baseVehicleFields,
    ...motorVehicleFields,
    vehicleType: z.literal("SCOOTER"),
  }),

  z.object({
    ...baseVehicleFields,
    ...motorVehicleFields,
    vehicleType: z.literal("MOTORBIKE"),
  }),

  z.object({
    ...baseVehicleFields,
    ...motorVehicleFields,
    vehicleType: z.literal("CAR"),
  }),
]);

// ---- Everything else, unrelated to vehicle fields ----

const deliveryPartnerBaseValidation = z.object({
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

  phoneNumber: z.string()
    .min(10, "Phone number is required")
    .refine((val) => {
      try {
        const phone = parsePhoneNumberFromString(val);
        return phone?.isValid() ?? false;
      } catch {
        return false;
      }
    }, "Invalid phone number for the selected country"),

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

  // passportNumber: z
  //   .string()
  //   .min(5, "Passport number must be at least 5 characters")
  //   .optional(),

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

  latitude: z.number({ error: "Latitude is required" }),

  longitude: z.number({ error: "Logitude is required" }),

  // bankName: z
  //   .string()
  //   .min(2, "Bank name must be at least 2 characters")
  //   .max(50, "Bank name must be at most 50 characters")
  //   .nonempty("Bank name is required"),

  accountHolderName: z
    .string()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name must be at most 100 characters")
    .nonempty("Account holder name is required"),

  iban: z
    .string()
    .min(15, "IBAN must be at least 15 characters")
    .max(34, "IBAN must be at most 34 characters"),

  // swiftCode: z
  //   .string()
  //   .min(8, "SWIFT code must be at least 8 characters")
  //   .max(11, "SWIFT code must be at most 11 characters"),

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
    .string().optional(),

  residencePermitNumber: z
    .string().optional(),

  residencePermitExpiry: z
    .string().optional(),

  haveCriminalRecordCertificate: z.boolean(
    "Criminal record certificate is required",
  ),

  issueDate: z.string().optional(),

  expiryDate: z.string().optional(),
});

// ---- Merge base + vehicle union, then apply cross-field refinements ----

export const deliveryPartnerValidation = z
  .intersection(deliveryPartnerBaseValidation, vehicleInfoValidation)
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
  )
  .refine(
    (data) => {
      if (data.haveCriminalRecordCertificate) {
        return !!data.expiryDate;
      }
      return true;
    },
    {
      message: "Expiry date is required",
      path: ["expiryDate"],
    },
  )
  .refine(
    (data) => {
      if (data.expiryDate) {
        return Date.parse(data.expiryDate);
      }
      return true;
    },
    {
      message: "Invalid expiry date format",
      path: ["expiryDate"],
    },
  );