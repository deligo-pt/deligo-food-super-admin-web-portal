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
