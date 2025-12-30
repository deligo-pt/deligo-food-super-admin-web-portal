import { USER_ROLE } from "@/consts/user.const";

export type TConversationStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

export type TConversationType = "SUPPORT" | "ORDER" | "DIRECT";

export type TConversationParticipant = {
  userId: string;
  role: keyof typeof USER_ROLE;
  name?: string;
};

export type TMessage = {
  _id: string;
  room: string;
  senderId: string;
  senderRole: keyof typeof USER_ROLE;
  message: string;
  attachments: string[];
  readBy: Record<string, boolean>;
  isEdited?: boolean;
  editedAt?: Date | null;
  isDeleted?: boolean;
  replyTo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TConversation = {
  _id: string;
  room: string;
  participants: TConversationParticipant[];
  handledBy: string | null;
  status: TConversationStatus;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: Record<string, number>;
  type: TConversationType;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
