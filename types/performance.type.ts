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
