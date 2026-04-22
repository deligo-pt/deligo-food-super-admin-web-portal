export interface ISalesReportAnalytics {
  summary: {
    totalRevenue: number;
    completedOrders: number;
    cancelledOrders: number;
    avgOrderValue: number;
  };
  revenueCards: {
    thisWeek: number;
    thisMonth: number;
    topEarningDay: string;
  };
  charts: {
    revenueTrend: {
      date: string;
      revenue: number;
    }[];
    // earningsByDay: {
    //   date: string;
    //   revenue: number;
    // }[];
  };
}

export interface IOrderReportAnalytics {
  summary: {
    avgOrderValue: number;
    totalOrders: number;
    totalRevenue: number;
  };
  ordersByZone: {
    label: string;
    value: number;
  }[];
  ordersTrend: {
    date: string;
    orders: number;
  }[];
  revenueTrend: {
    date: string;
    revenue: number;
  }[];
}

export interface ICustomerReportAnalytics {
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    totalOrders: number;
    totalSpent: number;
  };
  customerGrowth: {
    label: string;
    value: number;
  }[];
  statusDistribution: {
    active: number;
    blocked: number;
  };
}

export interface IVendorReportAnalytics {
  stats: {
    totalVendors: number;
    approvedVendors: number;
    pendingVendors: number;
    blockedVendors: number;
  };
  vendorGrowths: {
    time: string;
    vendors: number;
  }[];
  statusDistribution: {
    approved: number;
    blocked: number;
    pending: number;
    rejected: number;
    submitted: number;
  };
}

export interface IFleetManagerReportAnalytics {
  stats: {
    totalManagers: number;
    approvedManagers: number;
    totalDrivers: number;
    totalDeliveries: number;
  };
  fleetGrowths: {
    time: string;
    managers: number;
  }[];
  statusDistribution: {
    approved: number;
    blocked: number;
    pending: number;
    rejected: number;
    submitted: number;
  };
}

export interface IDeliveryPartnerReportAnalytics {
  stats: {
    approvedPartners: number;
    totalDeliveries: number;
    totalPartners: number;
    totalEarnings: number;
  };
  partnerGrowths: {
    time: string;
    managers: number;
  }[];
  vehicleDistribution: {
    BICYCLE: number;
    MOTORBIKE: number;
    CAR: number;
    SCOOTER: number;
    "E-BIKE": number;
  };
}
