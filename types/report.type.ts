import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TAgent, TCustomer, TVendor } from "@/types/user.type";

export type TCustomerReport = {
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    totalSpent: number;
    totalOrders: number;
  };

  monthlySignups: {
    name: string; // Jan
    customers: number; // 10
  }[]; // based on last 6 months

  statusDistribution: {
    active: number; // approved
    blocked: number;
  };

  //   All customers
  customers: TCustomer[];
};

export type TVendorReport = {
  stats: {
    totalVendors: number;
    approvedVendors: number;
    pendingVendors: number;
    blockedVendors: number;
  };

  monthlySignups: {
    name: string; // Jan
    vendors: number; // 10
  }[]; // based on last 6 months

  statusDistribution: {
    approved: number;
    pending: number;
    submitted: number;
    rejected: number;
    blocked: number;
  };

  //   All vendors
  vendors: TVendor[];
};

export type TFleetManagerReport = {
  stats: {
    totalManagers: number;
    approvedManagers: number;
    totalDrivers: number;
    totalDeliveries: number;
  };

  monthlySignups: {
    name: string; // Jan
    managers: number; // 10
  }[]; // based on last 6 months

  statusDistribution: {
    approved: number;
    pending: number;
    submitted: number;
    rejected: number;
    blocked: number;
  };

  //   All Fleet Managers
  fleetManagers: TAgent[];
};

export type TDeliveryPartnerReport = {
  stats: {
    totalPartners: number;
    approvedPartners: number;
    totalDeliveries: number;
    totalEarnings: number;
  };

  monthlySignups: {
    name: string; // Jan
    partners: number; // 10
  }[]; // based on last 6 months

  vehicleDistribution: {
    "E-BIKE": number;
    BICYCLE: number;
    SCOOTER: number;
    MOTORBIKE: number;
    CAR: number;
  };

  //   All Delivery Partners
  partners: TDeliveryPartner[];
};
