export type TDeliverySummary = {
  averageDeliveryTime: number;
  lateDeliveryPercentage: number;
  rejectedDeliveryPercentage: number;
};

export type TRiderPerformance = {
  riderId: string;
  riderName: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageTime: number;
};

export type TDistanceTimeAnalysis = {
  distanceKm: number;
  averageTime: number;
};

export type TAreaDeliveryPerformance = {
  area: string;
  averageTime: number;
  latePercentage: number;
};

export type TRiderIdleTime = {
  riderId: string;
  riderName: string;
  idleTimeMinutes: number;
};

export type TFailedDeliveryReason = {
  reason: string;
  count: number;
};

export type TDeliveryInsights = {
  summary: TDeliverySummary;
  riderPerformance: TRiderPerformance[];
  distanceTimeAnalysis: TDistanceTimeAnalysis[];
  areaPerformance: TAreaDeliveryPerformance[];
  riderIdleTime: TRiderIdleTime[];
  rejectedReasons: TFailedDeliveryReason[];
};
