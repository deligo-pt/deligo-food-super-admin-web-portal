export type TZoneBoundary = {
  _id: string;
  type: "Polygon";
  coordinates: [number, number][][];
};

export type TZone = {
  _id: string;
  zoneId: string;
  district: string;
  zoneName: string;

  boundary: TZoneBoundary;

  isOperational: boolean;
  minDeliveryFee: number;
  maxDeliveryDistanceKm: number;

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
};
