import z from "zod";

export const globalSettingsSchema = z
  .object({
    // Delivery pricing
    deliveryChargePerKm: z
      .number("Delivery charge per km is required")
      .nonnegative("Delivery charge must be a positive number"),
    baseDeliveryCharge: z
      .number("Base delivery charge is required")
      .nonnegative("Base delivery charge must be a positive number"),
    minDeliveryCharge: z
      .number("Minimum delivery charge is required")
      .nonnegative("Minimum delivery charge must be a positive number"),
    maxDeliveryCharge: z
      .number("Maximum delivery charge must be a number")
      .nonnegative("Maximum delivery charge must be a positive number")
      .optional(),
    freeDeliveryAbove: z
      .number("Free delivery above must be a number")
      .nonnegative("Free delivery above must be a positive number")
      .optional(),
    maxDeliveryDistanceKm: z
      .number("Maximum delivery distance must be a number")
      .positive("Maximum delivery distance must be greater than 0")
      .optional(),

    // Platform commission
    platformCommissionPercent: z
      .number("Platform commission is required")
      .min(0, "Platform commission cannot be less than 0")
      .max(100, "Platform commission cannot exceed 100"),
    deliveryPartnerCommissionPercent: z
      .number("Delivery partner commission must be a number")
      .min(0, "Delivery partner commission cannot be less than 0")
      .max(100, "Delivery partner commission cannot exceed 100")
      .optional(),
    vendorVatPercent: z
      .number("Vendor VAT percent must be a number")
      .min(0, "VAT percent cannot be less than 0")
      .max(100, "VAT percent cannot exceed 100")
      .optional(),

    // Order rules
    minOrderAmount: z
      .number("Minimum order amount must be a number")
      .nonnegative("Minimum order amount must be a positive number")
      .optional(),
    maxOrderAmount: z
      .number("Maximum order amount must be a number")
      .nonnegative("Maximum order amount must be a positive number")
      .optional(),
    maxItemsPerOrder: z
      .number("Maximum items per order must be a number")
      .int("Maximum items per order must be an integer")
      .positive("Maximum items per order must be at least 1 item")
      .optional(),

    // Cancellation & refund
    cancelTimeLimitMinutes: z
      .number("Cancel time limit in minutes must be a number")
      .int("Cancel time limit in minutes must be an integer")
      .nonnegative("Cancel time limit in minutes cannot be negative")
      .optional(),
    refundProcessingDays: z
      .number("Refund processing days must be a number")
      .int("Refund processing days must be an integer")
      .nonnegative("Refund processing days cannot be negative")
      .optional(),

    // Offers & coupons
    isCouponEnabled: z.boolean("Coupon status is required"),
    isOfferEnabled: z.boolean("Offer status is required"),
    maxDiscountPercent: z
      .number("Maximum discount percent must be a number")
      .min(0, "Maximum discount percent cannot be less than 0")
      .max(100, "Maximum discount percent cannot exceed 100")
      .optional(),

    // Order lifecycle automation
    autoCancelUnacceptedOrderMinutes: z
      .number("Auto cancel minutes must be a number")
      .int("Auto cancel minutes must be an integer")
      .nonnegative("Auto cancel minutes cannot be negative")
      .optional(),
    autoMarkDeliveredAfterMinutes: z
      .number("Auto mark delivered minutes must be a number")
      .int("Auto mark delivered minutes must be an integer")
      .nonnegative("Auto mark delivered minutes cannot be negative")
      .optional(),

    // OTP & security
    orderOtpEnabled: z.boolean("OTP status is required"),
    otpLength: z
      .number("OTP length must be a number")
      .int("OTP length must be an integer")
      .min(4, "OTP should be at least 4 digits")
      .max(8, "OTP should be at most 8 digits")
      .optional(),
    otpExpiryMinutes: z
      .number("Expiry must be a number")
      .int("Expiry must be an integer")
      .positive("Expiry must be at least 1 minute")
      .optional(),

    // Platform state
    isPlatformLive: z.boolean("Platform live status is required"),
    maintenanceMessage: z.string().optional(),
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
