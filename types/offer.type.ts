import { TAdmin } from "./admin.type";
import { TVendor } from "./user.type";

type TOfferType = "PERCENT" | "FLAT" | "BOGO";

export type TOffer = {
  _id: string;
  title: {
    en?: string;
    pt?: string;
  };
  description?: {
    en?: string;
    pt?: string;
  };
  // Offer type
  offerType: TOfferType;
  // Discount values
  discountValue?: number;
  maxDiscountAmount?: number;

  // BOGO fields
  bogo?: {
    buyQty: number;
    getQty: number;
    productId: string;
  };

  // Validity period
  validFrom: Date;
  expiresAt: Date;

  // Eligibility
  vendorId?: Partial<TVendor>;
  adminId?: Partial<TAdmin>;
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
