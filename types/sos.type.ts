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
