import { TAddonGroup } from "./add-ons.type";

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
  };
  deliveryPartnerCancelReason: string | null;
  fulfillmentType: string;
  emailThreadMessageId: string;
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
  };
  delivery: {
    charge: number;
    vatRate: number;
    vatAmount: number;
    totalDeliveryCharge: number;
    distance: number;
    estimatedTime: number;
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
      deliveryVatAmount: number;
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
      riderNetEarnings: number;
    };
  };
  offer: {
    isApplied: boolean;
    offerApplied: unknown | null;
  };
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  isPaid: boolean;
  orderStatus: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    updatedBy?: string;
    note: string | null;
  }>;
  refundStatus: string;
  remarks: string;
  vendorInstructions: string;
  dispatchPartnerPool: string[];
  dispatchRejectedPartnerPool: string[];
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
  autoAcceptDeadlineAt: string;
  estimatedReadyAt: string;
  foodReadyAt: string;
  vendorRespondedAt: string;
  needMoreTimeCount: number;
  ratingStatus: {
    isProductRated: boolean;
    isDeliveryRated: boolean;
  };
  isRated: boolean;
  invoiceSync: {
    isSynced: boolean;
    syncedAt: string;
    syncError: string;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  pickupAddress: {
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
  dispatchExpiresAt: string;
  deliveryOtp: {
    generatedAt: string;
    verifiedAt: string;
    verifiedBy: string;
    attempts: number;
  };
};