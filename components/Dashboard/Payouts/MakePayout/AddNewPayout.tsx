"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import { initializePayoutReq } from "@/services/dashboard/payout/payout.service";
import { TMeta } from "@/types";
import { TWallet } from "@/types/wallet.type";
import { catchAsync } from "@/utils/catchAsync";
import { formatPrice } from "@/utils/formatPrice";
import { fetchData } from "@/utils/requests";
import { Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "vendor" | "fleetManager";
}

export default function AddNewPayout({ open, onOpenChange, type }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [userData, setUserData] = useState<{
    data: TWallet[];
    meta?: TMeta;
  }>({ data: [] });

  const getUsers = async (limit = "10") => {
    const result = await catchAsync<TWallet[]>(async () => {
      return await fetchData("/wallets", {
        params: {
          limit,
          userModel: type === "vendor" ? "Vendor" : "FleetManager",
        },
      });
    });

    if (result?.success) {
      setUserData({
        data: result.data,
        meta: result.meta,
      });
    }
  };

  const initializePayout = async (targetUserId: string) => {
    const toastId = toast.loading("Initializing Payout...");

    const result = await initializePayoutReq({ targetUserId });

    if (result.success) {
      toast.success(result.message || "Payout initialized successfully!", {
        id: toastId,
      });
      onOpenChange(false);
      router.push(
        result.data?.userModel === "Vendor"
          ? `/admin/vendor-payouts/${result.data?.payoutId}/settle`
          : `/admin/fleet-manager-payouts/${result.data?.payoutId}/settle`,
      );
      return;
    }

    toast.error(result.message || "Payout initialization failed", {
      id: toastId,
    });
    console.log(result);
  };

  useEffect(() => {
    (() => getUsers())();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-white hover:bg-slate-100 text-[#DC3173] cursor-pointer">
          <Store className="h-4 w-4" />
          Add New Payout
        </Button>
      </DialogTrigger>
      <form>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Payout</DialogTitle>
            <DialogDescription>
              Select the {type === "vendor" ? "vendor" : "fleet manager"} you
              want to make a payout
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {userData?.data?.map((u) => {
              const userInfo = u.userId as {
                name: {
                  firstName: string;
                  lastName: string;
                };
                profilePhoto: string;
                userId: string;
                email: string;
              };
              return (
                <div
                  className="w-full bg-[#DC3173]/20 text-[#DC3173] hover:bg-[#DC3173] hover:text-white flex items-center gap-3 p-4 rounded-lg group transition-colors cursor-pointer"
                  key={u._id}
                  onClick={() => initializePayout(userInfo?.userId)}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={userInfo?.profilePhoto}
                      alt={`${userInfo?.name?.firstName} ${userInfo?.name?.lastName}`}
                    />
                    <AvatarFallback className="bg-[#DC3173] text-white group-hover:bg-white/30 transition-colors">
                      {userInfo?.name?.firstName?.charAt(0)}
                      {userInfo?.name?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-black group-hover:text-white transition-colors">
                    <h3 className="text-lg font-bold">
                      {userInfo?.name?.firstName && userInfo?.name?.lastName
                        ? `${userInfo?.name?.firstName} ${userInfo?.name?.lastName}`
                        : "N/A"}
                    </h3>
                    <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors">
                      {userInfo?.email || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors">
                      Balance: €{formatPrice(u.totalUnpaidEarnings || 0)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            {(userData?.meta?.limit || 10) < (userData?.meta?.total || 0) && (
              <Button
                onClick={() =>
                  getUsers(((userData?.meta?.limit || 0) + 10).toString())
                }
                className="bg-[#DC3173] hover:bg-[#DC3173]/90"
              >
                Show more
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
