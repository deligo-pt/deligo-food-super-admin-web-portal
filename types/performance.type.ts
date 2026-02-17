import { TMeta } from "@/types";
import {
  TTopRatedDeliveryPartner,
  TTopRatedItems,
} from "@/types/analytics.type";
import { TAgent, TVendor } from "@/types/user.type";

export type TVendorPerformance = Pick<
  TVendor,
  | "_id"
  | "profilePhoto"
  | "userId"
  | "email"
  | "status"
  | "name"
  | "businessDetails"
  | "businessLocation"
  | "rating"
  | "totalOrders"
> & {
  totalRevenue: number;
  totalItems: number;
};

export type TVendorPerformanceStat = {
  mostOrders: {
    vendorName: string;
    vendorPhoto: string;
    ordersCount: number;
  };
  highestRating: {
    vendorName: string;
    vendorPhoto: string;
    rating: {
      average: number;
      totalRatings: number;
    };
  };
  highestRevenue: {
    vendorName: string;
    vendorPhoto: string;
    revenue: number;
  };
};

export type TVendorMonthlyPerformance = {
  month: string;
  totalOrders: number;
  totalRevenue: number;
};

export type TTopVendorPerformers = {
  vendorName: string;
  vendorPhoto: string;
  rating: number;
  totalRevenue: number;
};

export type TVendorPerformanceData = {
  data: {
    vendorPerformance: TVendorPerformance[];
    vendorPerformanceStat: TVendorPerformanceStat;
    vendorMonthlyPerformance: TVendorMonthlyPerformance[];
    topVendorPerformers: TTopVendorPerformers[];
  };
  meta: TMeta;
};

export type TVendorPerformanceDetailsData = {
  vendorPerformance: TVendorPerformance;
  vendorMonthlyPerformance: TVendorMonthlyPerformance[];
  topRatedItems: TTopRatedItems[];
};

export type TFleetManagerPerformance = Pick<
  TAgent,
  | "_id"
  | "profilePhoto"
  | "userId"
  | "email"
  | "status"
  | "name"
  | "address"
  | "operationalData"
> & {
  totalEarnings: number;
};

export type TFleetPerformanceStat = {
  mostOrders: {
    fleetName: string;
    fleetPhoto: string;
    ordersCount: number;
  };
  highestRating: {
    fleetName: string;
    fleetPhoto: string;
    rating: {
      average: number;
      totalRatings: number;
    };
  };
  highestEarnings: {
    fleetName: string;
    fleetPhoto: string;
    earnings: number;
  };
};

export type TFleetMonthlyPerformance = {
  month: string;
  totalOrders: number;
  totalEarnings: number;
};

export type TTopFleetPerformers = {
  fleetName: string;
  fleetPhoto: string;
  rating: number;
  totalEarnings: number;
};

export type TFleetPerformanceData = {
  data: {
    fleetPerformance: TFleetManagerPerformance[];
    fleetPerformanceStat: TFleetPerformanceStat;
    fleetMonthlyPerformance: TFleetMonthlyPerformance[];
    topFleetPerformers: TTopFleetPerformers[];
  };
  meta: TMeta;
};

export type TFleetPerformanceDetailsData = {
  fleetPerformance: TFleetManagerPerformance;
  fleetMonthlyPerformance: TFleetMonthlyPerformance[];
  topRatedDrivers: TTopRatedDeliveryPartner[];
};
