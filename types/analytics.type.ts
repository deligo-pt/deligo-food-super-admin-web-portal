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
  userId: string;
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
  rating: {
    average: number;
  };
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

type TWeeklyTrend = {
  day: string;
  total: number;
};

type TTOpSellingItem = {
  id: string;
  name: string;
  sold: number;
};

export type TSalesAnalytics = {
  totalSales: string;
  bestPerformingDay: string;
  slowestDay: string;
  weeklyTrend: TWeeklyTrend[];
  topSellingItems: TTOpSellingItem[];
};

type TDemographic = {
  name: string;
  value: number;
};

type TCustomerValueSegment = {
  segment: string;
  avgOrder: string;
};

type TOrderHeatmap = {
  day: number;
  hour: number;
  orderCount: number;
};

export type TCustomerInsights = {
  summaryCards: {
    totalCustomers: {
      value: number;
      subValue: string;
    };
    returningCustomers: {
      value: number;
      subValue: string;
    };
    topCity: {
      value: string;
      subValue: string;
    };
    retentionRate: {
      value: string;
      subValue: string;
    };
  };
  demographics: TDemographic[];
  customerValue: TCustomerValueSegment[];
  heatmap: TOrderHeatmap[];
};
