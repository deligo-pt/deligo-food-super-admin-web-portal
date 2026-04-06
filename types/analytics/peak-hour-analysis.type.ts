export type THourlyOrders = {
  hour: number;
  orderCount: number;
};

export type TMealTimeComparison = {
  type: "LUNCH" | "DINNER";
  orderCount: number;
  percentage: number;
};

export type TDayWiseOrders = {
  day: string;
  orderCount: number;
};

export type THeatmapData = {
  day: string;
  hour: number;
  orderCount: number;
};

export type TRiderDemandGap = {
  hour: number;
  orders: number;
  activeRiders: number;
  shortage: number;
};

export type TPeakHoursAnalysis = {
  hourlyOrders: THourlyOrders[];
  mealTimeComparison: TMealTimeComparison[];
  dayWiseOrders: TDayWiseOrders[];
  heatmap: THeatmapData[];
  riderDemandGap: TRiderDemandGap[];
};
