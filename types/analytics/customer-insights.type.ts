export type TCustomerSummary = {
  newCustomers: number;
  returningCustomers: number;
  churnRate: number;
  averageCLV: number;
};

export type TActiveUsers = {
  dau: number;
  wau: number;
  mau: number;
};

export type TTopCustomer = {
  customerId: string;
  name: string;
  totalSpent: number;
  totalOrders: number;
};

export type TOrderFrequency = {
  range: string;
  userCount: number;
};

export type THourlyOrders = {
  hour: number;
  orderCount: number;
};

export type TCustomerInsights = {
  summary: TCustomerSummary;
  activeUsers: TActiveUsers;
  topCustomers: TTopCustomer[];
  orderFrequency: TOrderFrequency[];
  hourlyOrders: THourlyOrders[];
};
