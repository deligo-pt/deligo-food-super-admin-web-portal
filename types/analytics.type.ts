// type TAnalytics = {
//     totalOrders: number;
//     totalDeliveries: number;
//     totalCustomers: number;
//     totalVendors: number;
//     totalFleets: number;
//     totalDeliveryPartners: number;
//     totalProducts: number;
//     totalBusinessCategories: number;
//     totalProductCategories: number;
//     totalOrdersByMonth: number[];
//     totalDeliveriesByMonth: number[];
//     totalCustomersByMonth: number[];
//     totalVendorsByMonth: number[];
//     totalFleetsByMonth: number[];
//     totalDeliveryPartnersByMonth: number[];
//     totalProductsByMonth: number[];
//     totalBusinessCategoriesByMonth: number[];
//     totalProductCategoriesByMonth: number[];
//     totalSubCategoriesByMonth: number[];
//     totalBrandsByMonth: number[];
// }

export type TAnalytics = {
  customers: number;
  vendors: number;
  fleetManagers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todaysRevenue: number;
};
