export interface ISalesReportAnalytics {
  stats: {
    totalRevenue: number;
    completedOrders: number;
    cancelledOrders: number;
    avgOrderValue: number;
  };

  revenueTrend: {
    time: string;
    revenue: number;
  }[];
}

export interface IOrderReportAnalytics {
  stats: {
    avgOrderValue: number;
    totalOrders: number;
    totalRevenue: number;
  };
  ordersByZone: {
    label: string;
    value: number;
  }[];
  ordersTrend: {
    time: string;
    orders: number;
  }[];
  zoneHeatmap: {
    zone: string;
    hour: number;
    orderCount: number;
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
