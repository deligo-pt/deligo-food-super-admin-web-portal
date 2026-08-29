type LocalizedString = {
  en: string;
  pt: string
};

export type TVariations = {
  name: LocalizedString;
  options: {
    label: LocalizedString;
    price: number;
    stockQuantity: number;
    sku: string;
    isOutOfStock: boolean;
    totalAddedQuantity: number;
  }[];
};

export type TProduct = {
  _id?: string;
  productId: string;
  sku: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString;
  isDeleted: boolean;
  isApproved: boolean;
  remarks?: string;

  category: {
    _id: string;
    name: LocalizedString;
  };
  additionalCategories?: {
    _id: string;
    name: LocalizedString;
  }[];
  subCategory?: string;
  brand?: string;

  pricing: {
    price: number;
    discount?: number;
    tax?: number;
    finalPrice: number;
    currency: string;
  };

  variations: TVariations[];
  addonGroups: string[];

  stock: {
    quantity: number;
    unit: string;
    availabilityStatus: "In Stock" | "Out of Stock" | "Limited";
    hasVariations: boolean;
  };

  images: string[];

  vendorId: {
    _id: string;
    businessDetails: {
      businessName: string;
      businessType: {
        name: LocalizedString;
        slug: string;
      };
    };
    businessLocation: {
      latitude: number;
      longitude: number;
    };
    documents: {
      storePhoto: string;
    };
  };

  tags?: string[];

  deliveryInfo?: {
    deliveryType: "Instant" | "Scheduled" | "Pickup";
    estimatedTime?: string;
    deliveryCharge?: number;
    freeDeliveryAbove?: number;
  };

  attributes?: Record<string, string | number | boolean | string[] | null>;

  rating?: {
    average: number;
    totalReviews: number;
  };

  meta: {
    isFeatured?: boolean;
    isAvailableForPreOrder?: boolean;
    status: "ACTIVE" | "INACTIVE";
    origin?: string;
    createdAt: Date;
    updatedAt: Date;
  };

  createdAt: Date;
  updatedAt: Date;
};

export type TProductsQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  searchTerm?: string;
  "stock.availabilityStatus"?: string;
  status?: string;
  category?: string;
};

export type TRestrictedItem = {
  _id: string;
  name: string;
  reason: string;

  category:
  | "TOBACCO"
  | "ALCOHOL"
  | "ADULT_CONTENT"
  | "DANGEROUS_GOODS"
  | "OTHER";

  createdAt: string;
  updatedAt: string;
};
