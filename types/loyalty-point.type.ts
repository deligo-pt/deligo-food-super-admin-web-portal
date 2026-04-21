import { USER_ROLE } from "@/consts/user.const";
import { TUserModel } from "@/types/support.type";

export type TLoyaltyPoint = {
  _id: string;

  currentPoints: number;
  totalSpent: number;
  totalEarned: number;

  userId: {
    id: {
      email: string;
      name: {
        firstName: string;
        lastName: string;
      };
    };
    role: keyof typeof USER_ROLE;
    model: TUserModel;
  };

  expiryDate: string;
  createdAt: string;
  updatedAt: string;
};
