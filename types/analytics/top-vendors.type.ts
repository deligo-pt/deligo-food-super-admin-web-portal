export type TVendorPerformance = {
  vendorId: string;
  vendorName: string;

  totalOrders: number;
  totalRevenue: number;

  averageRating: number;
  preparationTime: number;

  cancelRate: number;
  satisfactionScore: number;
};

export type TTopSellingVendor = {
  vendorId: string;
  vendorName: string;
  totalOrders: number;
  totalRevenue: number;
};

export type TVendorRatingDistribution = {
  vendorName: string;
  rating: number;
};

export type TTopVendors = {
  topSellingVendors: TTopSellingVendor[];
  vendorPerformance: TVendorPerformance[];
  ratingDistribution: TVendorRatingDistribution[];
};
