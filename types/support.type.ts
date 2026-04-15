import { USER_ROLE } from "@/consts/user.const";
import { TAdmin } from "@/types/admin.type";
import { TOrder } from "@/types/order.type";

export type TTicketStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
export type THandlerType = "AI" | "AGENT" | "NONE";

type TUserRole = keyof typeof USER_ROLE;

export type TUserModel =
  | "Admin"
  | "Customer"
  | "Vendor"
  | "FleetManager"
  | "DeliveryPartner";

export type TSupportTicket = {
  _id: string;
  ticketId: string;
  userId: {
    _id: string;
    userId: string;
    email: string;
    name?: { firstName?: string; lastName?: string };
  };
  userModel: TUserModel;
  activeHandler: THandlerType;
  assignedAdminId?: TAdmin | null;
  status: TTicketStatus;
  category: "ORDER_ISSUE" | "PAYMENT" | "IVA_INVOICE" | "TECHNICAL" | "GENERAL";
  referenceOrderId?: TOrder;
  lastMessage?: string;
  lastMessageSender?: TUserRole;
  lastMessageTime?: string;
  unreadCount: Record<string, number>;
  closedAt?: string;
  closedBy?: unknown;

  createdAt: string;
  updatedAt: string;
};

export type TSupportMessage = {
  _id: string;
  ticketId: string;
  senderId: string;
  senderRole: TUserRole;
  message: string;
  messageType: "TEXT" | "IMAGE" | "AUDIO" | "LOCATION" | "SYSTEM";
  attachments?: string[];
  readBy: Record<string, boolean>;

  createdAt: string;
  updatedAt: string;
};

export type TUserTypingPayload = {
  userId: string;
  name: {
    firstName: string;
    lastName: string;
  };
  isTyping: boolean;
};
