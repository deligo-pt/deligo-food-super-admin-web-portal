import { USER_ROLE } from "@/consts/user.const";

export type TNotification = {
  _id: string;
  receiverId: string;
  receiverRole: keyof typeof USER_ROLE;
  title: string;
  message: string;
  data: Record<string, string>; // optional metadata
  type: "ORDER" | "SYSTEM" | "PROMO" | "ACCOUNT" | "OTHER";
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
