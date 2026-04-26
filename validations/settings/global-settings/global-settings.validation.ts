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
    minDeliveryCharge: z
      .number("Minimum delivery charge must be a number")
      .nonnegative("Minimum delivery charge must be at least 0"),
    maxDeliveryCharge: z
      .number("Maximum delivery charge must be a number")
      .nonnegative("Maximum delivery charge must be at least 0"),
    freeDeliveryAbove: z
      .number("Free delivery above must be a number")
      .nonnegative("Free delivery above must be at least 0"),
    maxDeliveryDistanceKm: z
      .number("Maximum delivery distance must be a number")
      .positive("Maximum delivery distance must be greater than 0"),
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
    deliveryPartnerCommissionPercent: z
      .number("Delivery partner commission must be a number")
      .min(0, "Delivery partner commission must be at least 0")
      .max(100, "Delivery partner commission cannot be more than 100"),
    vendorVatPercent: z
      .number("Vendor VAT percent must be a number")
      .min(0, "VAT percent must be at least 0")
      .max(100, "VAT percent cannot be more than 100"),

    // Order rules
    minOrderAmount: z
      .number("Minimum order amount must be a number")
      .nonnegative("Minimum order amount must be at least 0"),
    maxOrderAmount: z
      .number("Maximum order amount must be a number")
      .nonnegative("Maximum order amount must be at least 0"),
    maxItemsPerOrder: z
      .number("Maximum items per order must be a number")
      .int("Maximum items per order must be an integer")
      .positive("Maximum items per order must be at least 1 item"),
    customerNearestVendorRadiusKm: z
      .number("Customer nearest vendor radius must be a number")
      .positive("Customer nearest vendor radius must be greater than 0"),

    // Cancellation & automation
    cancelTimeLimitMinutes: z
      .number("Cancel time limit in minutes must be a number")
      .nonnegative("Cancel time limit in minutes must be at least 0"),
    autoCancelUnacceptedOrderMinutes: z
      .number("Auto cancel minutes must be a number")
      .nonnegative("Auto cancel minutes must be at least 0"),
    autoMarkDeliveredAfterMinutes: z
      .number("Auto mark delivered minutes must be a number")
      .nonnegative("Auto mark delivered minutes must be at least 0"),

    // Offers & coupons
    isOfferEnabled: z.boolean("Offer status is required"),
    maxDiscountPercent: z
      .number("Maximum discount percent must be a number")
      .min(0, "Maximum discount percent must be at least 0")
      .max(100, "Maximum discount percent cannot be more than 100"),
    refundProcessingDays: z
      .number("Refund processing days must be a number")
      .int("Refund processing days must be an integer")
      .nonnegative("Refund processing days at least 0"),

    // OTP & security
    orderOtpEnabled: z.boolean("OTP status is required"),
    otpLength: z
      .number("OTP length must be a number")
      .int("OTP length must be an integer")
      .min(4, "OTP should be at least 4 digits")
      .max(8, "OTP should be at most 8 digits"),
    otpExpiryMinutes: z
      .number("Expiry must be a number")
      .int("Expiry must be an integer")
      .positive("Expiry must be at least 1 minute"),

    // Platform state
    isPlatformLive: z.boolean("Platform live status is required"),
    maintenanceMessage: z
      .string("Maintenance message must be a string")
      .max(300, "Maintenance message cannot be more than 300 characters")
      .optional(),
  })
  .refine(
    (data) => {
      if (
        !data.isPlatformLive &&
        (data.maintenanceMessage === undefined ||
          data.maintenanceMessage === "" ||
          data.maintenanceMessage?.length < 5)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Maintenance message must be at least 5 characters long",
      path: ["maintenanceMessage"],
    },
  );
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
