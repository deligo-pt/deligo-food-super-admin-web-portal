export type TGlobalSettings = {
  _id?: string;

  // Delivery Pricing
  delivery: {
    baseCharge: number;
    chargePerKm: number;
    minCharge: number;
    maxCharge: number;
    freeAbove: number;
    maxDistanceKm: number;
    vatRate: number;
  };

  // Commission & VAT
  commission: {
    platformPercent: number;
    platformVatRate: number;
    fleetManagerPercent: number;
    deliveryPartnerPercent: number;
    vendorVatPercent: number;
    serviceCharge: number;
  };

  // Order Rules & Automation
  order: {
    minAmount: number;
    maxAmount: number;
    maxItemsPerOrder: number;
    nearestVendorRadiusKm: number;
    autoCancelUnacceptedMinutes: number;
    autoMarkDeliveredMinutes: number;
    cancelTimeLimitMinutes: number;
  };

  // Loyalty & Rewards
  rewards: {
    customerPointsPerEuro: number;
    riderPointsPerDelivery: number;
    referralPoints: number;
    newRiderWelcomeBonus: number;
    pointsExpiryDays: number;
    customerReferralMilestones: {
      friendsRequired: number;
      rewardType: "CASHBACK" | "FREE_MEAL" | "FREE_DELIVERY" | "CREDIT";
      rewardValue: number;
      minOrderAmountPerFriend: number;
    }[];
  };

  // Security & System State
  system: {
    isPlatformLive: boolean;
    maintenanceMessage: string;
    isOfferEnabled: boolean;
    maxDiscountPercent: number;
    refundProcessingDays: number;
    otp: {
      enabled: boolean;
      length?: number;
      expiryMinutes: number;
    };
  };

  // ingredients order and delivery charges
  ingredientsOrder: {
    deliveryChargeInsideLisbon: number;
    deliveryChargeOutsideLisbon: number;
    vatRate: number;
  };

  payout: {
    autoGenerate: boolean;
    payoutDays: (
      | "Sunday"
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
    )[];
    minPayoutAmount: number;
    payoutWindowDays: number;
  };

  // Meta
  meta: {
    updatedBy: unknown;
  };

  createdAt: Date;
  updatedAt: Date;
};
