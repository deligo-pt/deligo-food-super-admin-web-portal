export type TProduct = {
  _id?: string;
  productId: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  isDeleted: boolean;
  isApproved: boolean;
  remarks?: string;

  category: string;
  subCategory?: string;
  brand?: string;

  pricing: {
    price: number;
    discount?: number;
    tax?: number;
    finalPrice: number;
    currency: string;
  };

  stock: {
    quantity: number;
    unit: string;
    availabilityStatus: "In Stock" | "Out of Stock" | "Limited";
  };

  images: string[];

  vendorId: {
    _id: string;
    businessDetails: {
      businessName: string;
      businessType: string;
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
