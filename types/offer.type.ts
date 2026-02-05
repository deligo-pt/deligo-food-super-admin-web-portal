export type TOffer = {
  _id: string;
  title: string;
  description?: string;
  // Offer type
  offerType: "PERCENT" | "FLAT" | "FREE_DELIVERY" | "BOGO";
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
  vendorId?: string | null; // null = global offer
  minOrderAmount?: number;

  // Auto apply or manual code (optional)
  isAutoApply: boolean;
  code?: string; // if offer requires a code (optional)

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
