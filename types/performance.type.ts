import {
  TTopRatedDeliveryPartner,
  TTopRatedItems,
} from "@/types/analytics.type";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
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
      totalReviews: number;
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
  vendorPerformance: TVendorPerformance[];
  vendorPerformanceStat: TVendorPerformanceStat;
  vendorMonthlyPerformance: TVendorMonthlyPerformance[];
  topVendorPerformers: TTopVendorPerformers[];
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
  highestRated: {
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
  earnings: number;
  initials: string;
  name: string;
  rating: number;
  profilePhoto: string;
};

export type TFleetPerformanceData = {
  fleetPerformance: TFleetManagerPerformance[];
  topCards: TFleetPerformanceStat;
  earningsPerformance: TFleetMonthlyPerformance[];
  topPerformers: TTopFleetPerformers[];
};

export type TFleetPerformanceDetailsData = {
  fleetPerformance: TFleetManagerPerformance;
  fleetMonthlyPerformance: TFleetMonthlyPerformance[];
  topRatedDrivers: TTopRatedDeliveryPartner[];
};

export type TDeliveryPartnerPerformance = Pick<
  TDeliveryPartner,
  | "_id"
  | "profilePhoto"
  | "userId"
  | "email"
  | "status"
  | "name"
  | "address"
  | "earnings"
  | "operationalData"
> & {
  totalEarnings: number;
};

export type TPartnerPerformanceStat = {
  mostOrders: {
    partnerName: string;
    partnerPhoto: string;
    ordersCount: number;
  };
  highestRated: {
    partnerName: string;
    partnerPhoto: string;
    rating: {
      average: number;
      totalRatings: number;
    };
  };
  highestEarnings: {
    partnerName: string;
    partnerPhoto: string;
    earnings: number;
  };
};

export type TPartnerMonthlyPerformance = {
  month: string;
  totalOrders: number;
};

export type TTopPartnerPerformers = {
  earnings: number;
  initials: string;
  name: string;
  rating: number;
  profilePhoto: string;
};

export type TPartnerPerformanceData = {
  partnerPerformance: TDeliveryPartnerPerformance[];
  topCards: TPartnerPerformanceStat;
  earningsPerformance: TPartnerMonthlyPerformance[];
  topPerformers: TTopPartnerPerformers[];
};

export type TPartnerPerformanceDetailsData = {
  partnerPerformance: TDeliveryPartnerPerformance;
  partnerMonthlyPerformance: TPartnerMonthlyPerformance[];
  topRatedDrivers: TTopRatedDeliveryPartner[];
};
