import { TAddonGroup } from "./add-ons.type";

export interface TOfferApplied {
  rewardSnapshot?: Record<string, unknown>;
  promoId: string;
  title: string;
  promoType: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount?: number | null;
}

export interface TOrder {
  _id: string;
  orderId: string;
  customerId: {
    _id: string;
    userId: string;
    role: string;
    name: {
      firstName: string;
      lastName: string;
    };
    profilePhoto: string;
    contactNumber?: string;
    NIF: string;
    currentSessionLocation: {
      type: string;
      coordinates: number[];
      geoAccuracy?: number;
      isMocked: boolean;
      lastLocationUpdate: string;
    };
  };
  vendorId: {
    _id: string;
    userId: string;
    role: string;
    name: {
      firstName: string;
      lastName: string;
    };
    contactNumber: string;
    businessDetails: {
      businessName: string;
      openingHours: string;
      closingHours: string;
      closingDays: string[];
      businessType: {
        _id: string;
        name: {
          en: string;
          pt: string;
        };
      };
    };
    documents: {
      storePhoto: string[];
    };
  };
  deliveryPartnerId: {
    _id: string;
    userId: string;
    role: string;
    name: {
      firstName: string;
      lastName: string;
    };
    contactNumber: string;
    profilePhoto: string;
    currentSessionLocation: {
      coordinates: number[];
      lastLocationUpdate: string;
      type: string;
      geoAccuracy: number;
    };
  } | null;
  deliveryPartnerCancelReason: string | null;
  fulfillmentType: string;
  emailThreadMessageId: string | null;
  items: Array<{
    productId: string;
    vendorId: string;
    name: string;
    image: string;
    hasVariations: boolean;
    variationSku: string;
    isPromoRewardLine: boolean;
    addons: TAddonGroup[];
    productPricing: {
      originalPrice: number;
      productDiscountAmount: number;
      discountType: string;
      priceAfterProductDiscount: number;
      promoDiscountAmount: number;
      unitPrice: number;
      lineTotal: number;
      taxRate: number;
      taxAmount: number;
    };
    itemSummary: {
      quantity: number;
      totalTaxAmount: number;
      totalPromoDiscount: number;
      totalProductDiscount: number;
      grandTotal: number;
    };
    commission: {
      deliGoCommissionRate: number;
      deliGoCommissionAmount: number;
      deliGoCommissionVatRate: number;
      deliGoCommissionVatAmount: number;
    };
    vendor: {
      vendorEarningsWithoutTax: number;
      payableTax: number;
      vendorNetEarnings: number;
    };
  }>;
  totalItems: number;
  totalQuantity: number;
  orderCalculation: {
    totalOriginalPrice: number;
    totalProductDiscount: number;
    totalOfferDiscount: number;
    totalTaxAmount: number;
    itemsSubtotal: number;
    serviceCharge: number;
    serviceChargeVatRate: number;
    serviceChargeVatAmount: number;
    smallOrderFee?: number;
    smallOrderFeeTax?: number;
    smallOrderFeeTaxRate?: number;
  };
  delivery: {
    charge: number;
    vatRate: number;
    vatAmount: number;
    totalDeliveryCharge: number;
    distance: number;
    estimatedTime: number;
    estimatedTotalMinutes?: number;
    notes: string;
  };
  payoutSummary: {
    grandTotal: number;
    deliGoCommission: {
      rate: number;
      amount: number;
      vatAmount: number;
      totalDeduction: number;
      earnedServiceCharge: number;
      serviceChargeVatAmount: number;
      earnedSmallOrderFee?: number;
      smallOrderFeeTax?: number;
      deliveryVatAmount?: number;
      totalPlatformNetRevenue: number;
      totalPlatformPayableTax: number;
      totalPlatformGrossHolding: number;
    };
    fleet: {
      rate: number;
      fee: number;
    };
    vendor: {
      earningsWithoutTax: number;
      payableTax: number;
      vendorNetPayout: number;
    };
    rider: {
      earningsWithoutTax?: number;
      payableTax?: number;
      riderNetPayout?: number;
      riderNetEarnings?: number;
    };
  };
  offer: {
    isApplied: boolean;
    offerApplied: TOfferApplied | null;
  } | null;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  checkoutSummaryId?: string;
  isPaid: boolean;
  orderStatus: string;
  orderType?: "SCHEDULED" | "ASAP";
  scheduledFor?: {
    start: string;
    end: string;
  } | null;
  scheduledReleaseAt?: string | null;
  releasedAt?: string | null;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    updatedBy?: string;
    note: string | null;
  }>;
  refundStatus: string;
  remarks: string;
  vendorInstructions: string;
  dispatchPartnerPool:
  | {
    _id: string;
    name: {
      en: string;
      pt: string;
    };
    userId: string;
  }[]
  | [];
  dispatchRejectedPartnerPool:
  | {
    _id: string;
    name: {
      en: string;
      pt: string;
    };
    userId: string;
  }[]
  | [];
  dispatchEscalatedAt: string | null;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    longitude: number;
    latitude: number;
    geoAccuracy: number;
    detailedAddress: string;
  };
  preparationTime: number;
  autoAcceptDeadlineAt: string | null;
  estimatedReadyAt: string | null;
  foodReadyAt: string | null;
  vendorRespondedAt: string | null;
  needMoreTimeCount: number;
  ratingStatus: {
    isProductRated: boolean;
    isDeliveryRated: boolean;
  };
  isRated: boolean;
  payoutMetadata?: {
    vendor: {
      isSettled: boolean;
      payoutId: string | null;
    };
    rider: {
      isSettled: boolean;
      payoutId: string | null;
      payoutModel?: string;
    };
    fleet: {
      isSettled: boolean;
      payoutId: string | null;
    };
  };
  invoiceSync: {
    isSynced: boolean;
    invoiceNo?: string;
    atcud?: string;
    signature?: string;
    syncedAt: string | null;
    syncError: string | null;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  pickupAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    longitude: number;
    latitude: number;
    geoAccuracy: number;
    detailedAddress: string;
  };
  dispatchExpiresAt?: string | null;
  deliveryOtp?: {
    generatedAt: string;
    verifiedAt: string | null;
    verifiedBy: string | null;
    attempts: number;
  };
  cancelReason?: string | null;
}