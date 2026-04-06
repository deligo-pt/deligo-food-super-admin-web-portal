import { TOrder } from "@/types/order.type";

export type TSalesSummary = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  growthRate: number;
};

export type TOrdersOverTime = {
  label: string;
  orders: number;
  revenue: number;
};

export type TOrderStatusDistribution = {
  completed: number;
  cancelled: number;
};

export type TPaymentSplit = {
  method: TOrder["paymentMethod"];
  count: number;
  revenue: number;
};

export type TRevenueByLocation = {
  location: string;
  revenue: number;
};

export type TRevenueByVendor = {
  vendorId: string;
  vendorName: string;
  revenue: number;
};

export type TSalesAnalytics = {
  summary: TSalesSummary;

  daily: TOrdersOverTime[];
  weekly: TOrdersOverTime[];
  monthly: TOrdersOverTime[];

  statusDistribution: TOrderStatusDistribution;
  paymentSplit: TPaymentSplit[];

  revenueByLocation: TRevenueByLocation[];
  revenueByVendor: TRevenueByVendor[];
};
