import { TAdmin } from "./admin.type";
import { TVendor } from "./user.type";

// BOGO is kept only so old offers still render. New offers use BUY_AND_REWARD.
export type TOfferType = "PERCENT" | "FLAT" | "BUY_AND_REWARD" | "BOGO";

type TLocalized = { en?: string; pt?: string };

/** The API may return a plain id or a populated document */
export type TOfferProductRef = string | { _id: string; name?: TLocalized };

export type TOfferEligibility = {
  type: "FIRST_ORDER";
  scope: "GLOBAL" | "VENDOR";
  requireVerifiedPhone?: boolean;
  maxRestores?: number;
};

export type TBuyAndReward = {
  buy: {
    scope: "SPECIFIC_PRODUCTS";
    productIds?: TOfferProductRef[];
    categoryIds?: string[];
    quantity: number;
  };
  reward: {
    type: "SAME_PRODUCT" | "FIXED_PRODUCT" | "CUSTOMER_CHOICE";
    quantity: number;
    productId?: TOfferProductRef;
    variationSku?: string;
    options?: { productId: TOfferProductRef; variationSku?: string }[];
  };
};

export type TOffer = {
  _id: string;
  title: TLocalized;
  description?: TLocalized;
  // Offer type
  offerType: TOfferType;
  // Discount values
  discountValue?: number;
  maxDiscountAmount?: number;

  // Which products a PERCENT / FLAT offer applies to
  scopeType?: "ALL_PRODUCTS" | "SPECIFIC_PRODUCTS";
  scopeProducts?: TOfferProductRef[];
  // PERCENT / FLAT: let the offer stack on already-discounted products (backend default: false)
  allowDiscountedProducts?: boolean;

  // BUY_AND_REWARD
  buyAndReward?: TBuyAndReward;

  // Legacy BOGO fields
  bogo?: {
    buyQty: number;
    getQty: number;
    productId: string;
  };

  // First-order offers (set by the backend, scope can't change after creation)
  eligibility?: TOfferEligibility;

  // Validity period
  validFrom: Date;
  expiresAt: Date;

  // Eligibility
  vendorId?: Partial<TVendor>;
  adminId?: Partial<TAdmin>;
  targetVendorId?: string;
  minOrderAmount?: number;

  // Auto apply or manual code (optional)
  isAutoApply: boolean;
  code?: string; // if offer requires a code (optional)

  applicableProducts?: unknown[];

  // Usage control
  maxUsageCount?: number;
  usageCount?: number;
  userUsageLimit?: number;

  isGlobal: boolean;

  // Status
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};

type TOfferAnalyticsStats = {
  totalOffers: number;
  activeOffers: number;
  totalRedemptions: number;
  revenueImpact: number;
};

type TUsageOverTime = {
  time: string;
  redemptions: number;
}[];

type TOfferTypeUsage = {
  name: TOfferType;
  usage: number;
}[];

type TTopOffers = {
  name: string;
  usage: number;
}[];

export type TOfferAnalytics = {
  stats: TOfferAnalyticsStats;
  usageOverTime: TUsageOverTime;
  offerTypeUsage: TOfferTypeUsage;
  topOffers: TTopOffers;
};