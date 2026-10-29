import { USER_ROLE, USER_STATUS } from "@/consts/user.const";

export type TMeta = {
  page: number;
  limit: number;
  totalPage: number;
  total: number;
};

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  meta?: TMeta;
  error?: unknown;
};

export type TJwtPayload = {
  userId: string;
  name: {
    firstName: string;
    lastName: string;
  };
  role: keyof typeof USER_ROLE;
  status: keyof typeof USER_STATUS;
};

export type TDeviceDetails = {
  deviceId: string;
  deviceType: string;
  deviceName: string;
  userAgent: string;
};

export type TGeoJSONPoint = {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  geoAccuracy?: number;
  heading?: number;
  speed?: number;
  isMocked?: boolean;
  lastLocationUpdate: Date;
};

export type LocalizedType = {
  en?: string;
  pt?: string;
}

export type FilterOptionItem = {
  label: string;
  value: string; // UI / badge value
  /** Write to this query key instead of parent `key` */
  queryKey?: string;
  /** Write this value instead of `value` */
  queryValue?: string;
  /** Extra query keys to remove when this item is selected */
  clearKeys?: string[];
  /** Remove parent key and set nothing (e.g. "All") */
  clear?: boolean;
};

export type FilterOption = {
  label: string;
  key: string;
  placeholder: string;
  type: string;
  items: FilterOptionItem[];
  /** Set in URL only when this key is missing */
  defaultValue?: string;
  /** Don’t apply default if any of these keys already exist (e.g. `sdr`) */
  defaultUnlessKeys?: string[];
};