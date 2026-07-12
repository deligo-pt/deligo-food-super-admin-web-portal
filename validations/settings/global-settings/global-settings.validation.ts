import z from "zod";

export const globalSettingsSchema = z
  .object({
    // Delivery pricing
    deliveryChargePerKm: z
      .number("Delivery charge per km must be a number")
      .nonnegative("Delivery charge must be at least 0"),
    baseDeliveryCharge: z
      .number("Base delivery charge must be a number")
      .nonnegative("Base delivery charge must be at least 0"),
    deliveryVatRate: z
      .number("Delivery VAT rate must be a number")
      .min(0, "Delivery VAT rate must be at least 0")
      .max(100, "Delivery VAT rate cannot be more than 100"),

    // Platform commission
    platformCommissionPercent: z
      .number("Platform commission must be a number")
      .min(0, "Platform commission must be at least 0")
      .max(100, "Platform commission cannot be more than 100"),
    platformVatRate: z
      .number("Platform VAT rate must be a number")
      .min(0, "Platform VAT rate must be at least 0")
      .max(100, "Platform VAT rate cannot be more than 100"),
    fleetManagerCommissionPercent: z
      .number("Fleet manager commission must be a number")
      .min(0, "Fleet manager commission must be at least 0")
      .max(100, "Fleet manager commission cannot be more than 100"),
    serviceCharge: z
      .number("Service charge must be a number")
      .nonnegative("Service charge must be at least 0"),

    // Order rules
    customerNearestVendorRadiusKm: z
      .number("Customer nearest vendor radius must be a number")
      .positive("Customer nearest vendor radius must be greater than 0"),

    // Cancellation & automation
    cancelTimeLimitMinutes: z
      .number("Cancel time limit in minutes must be a number")
      .nonnegative("Cancel time limit in minutes must be at least 0"),

    // ingredients order and delivery charges
    deliveryChargeInsideLisbon: z
      .number("Delivery charge inside lisbon must be a number")
      .nonnegative("Delivery charge inside lisbon must be at least 0"),
    deliveryChargeOutsideLisbon: z
      .number("Delivery charge outside lisbon must be a number")
      .nonnegative("Delivery charge outside lisbon must be at least 0"),

  })
// .refine(
//   (data) => {
//     if (data.orderOtpEnabled && data.otpLength === undefined) {
//       return false;
//     }
//     return true;
//   },
//   {
//     message: "OTP length is required",
//     path: ["otpLength"],
//   }
// )
// .refine(
//   (data) => {
//     if (data.orderOtpEnabled && data.otpExpiryMinutes === undefined) {
//       return false;
//     }
//     return true;
//   },
//   {
//     message: "OTP expiry is required",
//     path: ["otpExpiryMinutes"],
//   }
// )
// .refine(
//   (data) => {
//     if (data.orderOtpEnabled && data.otpLength !== undefined) {
//       if (data.otpLength < 4 || data.otpLength > 8) {
//         return false;
//       }
//       return true;
//     }
//     return true;
//   },
//   {
//     message: "OTP length must be between 4 and 8",
//     path: ["otpLength"],
//   }
// )
// .refine(
//   (data) => {
//     if (data.orderOtpEnabled && data.otpExpiryMinutes !== undefined) {
//       if (data.otpExpiryMinutes < 1) {
//         return false;
//       }
//       return true;
//     }
//     return true;
//   },
//   {
//     message: "OTP expiry must be at least 1 minute",
//     path: ["otpExpiryMinutes"],
//   }
// );
