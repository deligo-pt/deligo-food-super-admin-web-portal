import { TVendor } from "@/types/user.type";

export type TTax = {
  _id: string;
  taxRate: number;
};

export type TIngredient = {
  _id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  tax?: TTax;
  unit: "kg" | "g" | "litre" | "ml" | "piece" | "packet" | "box";
  stock: number;
  totalAddedQuantity?: number;
  lowStockAlert?: number;
  shelfLifeDays?: number;
  minOrder?: number;
  image: string;
  status: "available" | "unavailable" | string;
  isDeleted: boolean;
  bulkDiscount?: {
    minQty: number;
    discountPrice: number;
  }[];
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

// Sub-types matching the incoming API payload layout
export type TDeliveryAddress = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  longitude: number;
  latitude: number;
  geoAccuracy: number;
};

export type TDeliveryDetails = {
  charge: number;
  vatRate: number;
  vatAmount: number;
  totalDeliveryCharge: number;
};

export type TOrderCalculation = {
  totalOriginalPrice: number;
  totalProductDiscount: number;
  taxableAmount: number;
  totalTaxAmount: number;
};

export type TOrderStatusHistory = {
  shippedAt?: string;
  deliveredAt?: string;
};

export type TBulkDiscount = {
  minQty: number;
  discountPrice: number;
};

export type TPopulatedIngredient = {
  _id: string;
  name: string;
  category: string;
  description: string;
  sku: string;
  price: number;
  tax: string;
  unit: string;
  stock: number;
  totalAddedQuantity: number;
  lowStockAlert: number;
  minOrder: number;
  image: string;
  status: "available" | "unavailable";
  shelfLifeDays: number;
  bulkDiscount: TBulkDiscount[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TIngredientOrderDetail = {
  ingredientId: TPopulatedIngredient;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
};

// Main Response Type
export type TIngredientOrder = {
  _id: string;
  orderId: string;
  transactionId: string;
  adminId: string;
  vendorId: TVendor;

  grandTotal: number;
  isDeleted: boolean;

  deliveryAddress: TDeliveryAddress;
  delivery: TDeliveryDetails;
  orderCalculation: TOrderCalculation;
  statusHistory: TOrderStatusHistory;
  orderDetails: TIngredientOrderDetail[];

  orderStatus: TOrderStatus;
  paymentMethod: TPaymentMethod;
  paymentStatus: TPaymentStatus;

  createdAt: string;
  updatedAt: string;
  __v: number;
};
