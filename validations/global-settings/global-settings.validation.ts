import z from "zod";

export const globalSettingsSchema = z.object({
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
    .number()
    .nonnegative("Maximum delivery charge must be a positive number")
    .optional(),
  freeDeliveryAbove: z
    .number()
    .nonnegative("Free delivery above must be a positive number")
    .optional(),
  maxDeliveryDistanceKm: z
    .number()
    .positive("Max delivery distance must be greater than 0")
    .optional(),

  // Platform commission
  platformCommissionPercent: z
    .number("Platform commission is required")
    .min(0, "Platform commission cannot be less than 0")
    .max(100, "Platform commission cannot exceed 100"),
  deliveryPartnerCommissionPercent: z
    .number()
    .min(0, "Delivery partner commission cannot be less than 0")
    .max(100, "Delivery partner commission cannot exceed 100")
    .optional(),
  vendorVatPercent: z
    .number()
    .min(0, "VAT percent cannot be less than 0")
    .max(100, "VAT percent cannot exceed 100")
    .optional(),

  // Order rules
  minOrderAmount: z
    .number()
    .nonnegative("Minimum order amount must be a positive number")
    .optional(),
  maxOrderAmount: z
    .number()
    .nonnegative("Maximum order amount must be a positive number")
    .optional(),
  maxItemsPerOrder: z
    .number()
    .int("Max items per order must be an integer")
    .positive("Max items per order must be at least 1 item")
    .optional(),

  // Cancellation & refund
  cancelTimeLimitMinutes: z
    .number()
    .int("Cancel time limit in minutes must be an integer")
    .nonnegative("Cancel time limit in minutes cannot be negative")
    .optional(),
  refundProcessingDays: z
    .number()
    .int("Refund processing days must be an integer")
    .nonnegative("Refund processing days cannot be negative")
    .optional(),

  // Offers & coupons
  isCouponEnabled: z.boolean("Coupon status is required"),
  isOfferEnabled: z.boolean("Offer status is required"),
  maxDiscountPercent: z
    .number()
    .min(0, "Max discount percent cannot be less than 0")
    .max(100, "Max discount percent cannot exceed 100")
    .optional(),

  // Order lifecycle automation
  autoCancelUnacceptedOrderMinutes: z.number().int().nonnegative().optional(),
  autoMarkDeliveredAfterMinutes: z.number().int().nonnegative().optional(),

  // OTP & security
  orderOtpEnabled: z.boolean("OTP status is required"),
  otpLength: z
    .number()
    .int("OTP length must be an integer")
    .min(4, "OTP should be at least 4 digits")
    .max(8, "OTP should be at most 8 digits")
    .optional(),
  otpExpiryMinutes: z
    .number()
    .int("Expiry must be an integer")
    .positive("Expiry must be at least 1 minute")
    .optional(),

  // Platform state
  isPlatformLive: z.boolean("Platform live status is required"),
  maintenanceMessage: z
    .string()
    .min(5, "Message must be at least 5 characters long")
    .optional(),
});
