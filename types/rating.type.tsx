import { TOrder } from "@/types/order.type";
import { TProduct } from "@/types/product.type";
import { TCustomer } from "@/types/user.type";

export type TRatingType = "DELIVERY_PARTNER" | "PRODUCT" | "VENDOR";

export type TSubRatings = {
  foodQuality?: number;
  packaging?: number;
  deliverySpeed?: number;
  riderBehavior?: number;
};

export type TRatingSentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export type TRating = {
  _id: string;
  ratingType: TRatingType;
  rating: number;
  sentiment?: TRatingSentiment;
  review?: string;

  reviewerId: TCustomer;

  targetId: TProduct;

  orderId: TOrder;
  productId?: TProduct;

  subRatings?: TSubRatings;

  tags?: string[];

  createdAt: Date;
  updatedAt: Date;
};
