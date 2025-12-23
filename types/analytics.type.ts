import { ORDER_STATUS } from "@/consts/order.const";

export type TPopularCategory = {
  _id: string;
  name: string;
  percentage: number;
};

export type TRecentOrder = {
  _id: string;
  orderId: string;
  orderStatus: keyof typeof ORDER_STATUS;
  customerId: {
    name: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: Date;
};

export type TTopRatedDeliveryPartner = {
  _id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  rating: number;
  completedDeliveries: number;
};

export type TTopRatedItems = {
  _id: string;
  name: string;
  rating: number;
  images: string[];
  totalOrders: number;
};

export type TAnalytics = {
  counts: {
    customers: number;
    vendors: number;
    deliveryPartners: number;
    fleetManagers: number;
    totalProducts: number;
  };

  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };

  popularCategories: TPopularCategory[];
  recentOrders: TRecentOrder[];
  topRatedDeliveryPartners: TTopRatedDeliveryPartner[];
  topRatedItems: TTopRatedItems[];
};
