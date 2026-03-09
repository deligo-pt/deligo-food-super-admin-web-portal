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
  totalDeliveries: number;
  totalDrivers: number;
  totalEarnings: number;
  rating: {
    average: number;
    totalReviews: number;
  };
};

export type TFleetPerformanceStat = {
  mostOrders: {
    fleetName: {
      firstName: string;
      lastName: string;
    };
    fleetPhoto: string;
    ordersCount: number;
  };
  highestRating: {
    fleetName: {
      firstName: string;
      lastName: string;
    };
    fleetPhoto: string;
    rating: number;
  };
  highestEarnings: {
    fleetName: {
      firstName: string;
      lastName: string;
    };
    fleetPhoto: string;
    earnings: number;
  };
};

export type TFleetWeeklyPerformance = {
  day: string;
  totalOrders: number;
  totalEarnings: number;
};

export type TTopFleetPerformers = {
  _id: string;
  fleetName: {
    firstName: string;
    lastName: string;
  };
  fleetPhoto: string;
  rating: number;
  totalEarnings: number;
};

export type TFleetPerformanceData = {
  fleetPerformance: TFleetManagerPerformance[];
  fleetPerformanceStat: TFleetPerformanceStat;
  fleetWeeklyPerformance: TFleetWeeklyPerformance[];
  topFleetPerformers: TTopFleetPerformers[];
};

export type TFleetPerformanceDetailsData = {
  fleetPerformance: TFleetManagerPerformance;
  fleetWeeklyPerformance: TFleetWeeklyPerformance[];
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
  totalDeliveries: number;
  completedDeliveries: number;
  rating: number;
  totalEarnings: number;
};

export type TPartnerPerformanceStat = {
  mostOrders: {
    partnerName: {
      firstName: string;
      lastName: string;
    };
    partnerPhoto: string;
    ordersCount: number;
  };
  highestRated: {
    partnerName: {
      firstName: string;
      lastName: string;
    };
    partnerPhoto: string;
    rating: {
      average: number;
      totalRatings: number;
    };
  };
  highestEarnings: {
    partnerName: {
      firstName: string;
      lastName: string;
    };
    partnerPhoto: string;
    earnings: number;
  };
};

export type TPartnerMonthlyPerformance = {
  month: string;
  totalOrders: number;
};

export type TTopPartnerPerformers = {
  totalEarnings: number;
  initials: string;
  name: {
    firstName: string;
    lastName: string;
  };
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
};
