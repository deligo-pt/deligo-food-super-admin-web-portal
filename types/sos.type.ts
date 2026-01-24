import { USER_ROLE } from "@/consts/user.const";
import { TAdmin } from "@/types/admin.type";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TOrder } from "@/types/order.type";
import { TAgent, TVendor } from "@/types/user.type";

export type SOSType = "vendor" | "fleet" | "partner";

export type SOSPriority = "critical" | "high" | "medium";

export type SOSStatus = "active" | "in-progress" | "resolved";

export interface SOSItem {
  id: string;
  type: SOSType;
  timestamp: Date;
  status: SOSStatus;
  priority: SOSPriority;
  title: string;
  description: string;
  location: string;
  contactName: string;
  contactPhone: string;
}

export type TSosStatus =
  | "ACTIVE"
  | "INVESTIGATING"
  | "RESOLVED"
  | "FALSE_ALARM";

export type TSosIssue =
  | "Accident"
  | "Medical Emergency"
  | "Fire"
  | "Crime"
  | "Natural Disaster"
  | "Other";

export type TSOS = {
  userId: TVendor | TAgent | TDeliveryPartner;
  orderId?: TOrder;
  role: keyof typeof USER_ROLE;
  status: TSosStatus;
  userNote?: string;
  issueTags?: TSosIssue[];
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  deviceSnapshot?: {
    batteryLevel?: number;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
    networkType?: string;
  };

  resolvedBy?: TAdmin;
  resolvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
};
