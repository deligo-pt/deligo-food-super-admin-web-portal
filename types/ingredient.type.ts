import { TVendor } from "@/types/user.type";

export type TIngredient = {
  _id: string;
  ingredientId: string;

  name: string;
  category: string;
  description?: string;

  price: number;
  stock: number;
  minOrder?: number;

  image: string;

  createdAt: string;
  updatedAt: string;
};

type TOrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED";
type TPaymentStatus = "PROCESSING" | "PAID";
type TPaymentMethod =
  | "CARD"
  | "MB_WAY"
  | "APPLE_PAY"
  | "PAYPAL"
  | "GOOGLE_PAY"
  | "OTHER";

export type TIngredientOrder = {
  _id: string;
  orderId: string;
  transactionId: string;

  grandTotal: number;
  isPaid: boolean;
  orderDetails: {
    ingredient: TIngredient;
    totalAmount: number;
    totalQuantity: number;
  };

  vendor: Partial<TVendor>;

  orderStatus: TOrderStatus;
  paymentMethod: TPaymentMethod;
  paymentStatus: TPaymentStatus;

  delivery: { charge: number; distance: number; estimatedTime: number };

  timeline?: {
    status: string;
    date: string;
    completed: boolean;
  }[];

  createdAt: string;
  updatedAt: string;
};
