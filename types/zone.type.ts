export type TZoneBoundary = {
  _id: string;
  type: "Polygon";
  coordinates: [number, number][][];
};

export type TZone = {
  _id: string;
  zoneId: string;
  // district: string;
  zoneName: string;

  // boundary: TZoneBoundary;

  isOperational: boolean;
  // minDeliveryFee: number;
  // maxDeliveryDistanceKm: number;

  totalUsers: number;

  createdAt: Date;
  updatedAt: Date;
};


export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type ZoneOverlap = {
  _id: string;
  zoneId: string;
  zoneName: string;
  district: string;
  overlapAreaM2: number;
};

export type ValidateBoundaryResponse = {
  valid: boolean;
  areaKm2: number;
  centroid: { type: "Point"; coordinates: [number, number] };
  bbox: [number, number, number, number];
  overlaps: ZoneOverlap[];
};

export type CreateZonePayload = {
  zoneId: string;
  district: string;
  zoneName: string;
  boundary: GeoJsonPolygon;
  isOperational?: boolean;
  minDeliveryFee?: number;
  maxDeliveryDistanceKm?: number;
};

export interface IZone {
  _id: string;
  zoneId: string;
  district: string;
  zoneName: string;
  areaKm2: number;
  centroid: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  bbox: [number, number, number, number];
  isOperational: boolean;
  minDeliveryFee?: number;
  maxDeliveryDistanceKm?: number;
  deactivationReason: string | null;
  createdBy: string;
  deletedBy: string | null;
  deletedAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  // boundary is usually not returned in list, only in single get
  boundary?: GeoJsonPolygon;
}

export type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type ZoneListResponse = {
  success: boolean;
  message: string;
  meta: TMeta;
  data: IZone[];
};

export type ZoneSingleResponse = {
  success: boolean;
  message: string;
  data: IZone;
};