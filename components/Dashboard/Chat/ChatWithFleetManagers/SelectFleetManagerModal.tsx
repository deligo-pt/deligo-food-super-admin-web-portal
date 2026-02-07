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
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TAgent } from "@/types/user.type";
import { Mail, UserCircle } from "lucide-react";

interface IProps {
  fleetManagersData: { data: TAgent[]; meta?: TMeta };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClick: (v: TAgent) => void;
  getFleetManagers: ({ limit }: { limit?: number }) => void;
}

export default function SelectFleetManagerModal({
  open,
  onOpenChange,
  onClick,
  fleetManagersData,
  getFleetManagers,
}: IProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("start_a_conversation")}</DialogTitle>
            <DialogDescription>{t("")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {fleetManagersData?.data?.map((fleetManager) => (
              <div
                className="w-full bg-[#DC3173]/20 text-[#DC3173] hover:bg-[#DC3173] hover:text-white flex items-center gap-3 p-4 rounded-lg group transition-colors cursor-pointer"
                key={fleetManager._id}
                onClick={() => onClick(fleetManager)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={fleetManager?.profilePhoto}
                    alt={`${fleetManager?.name?.firstName} ${fleetManager?.name?.lastName}`}
                  />
                  <AvatarFallback className="bg-[#DC3173] text-white group-hover:bg-white/30 transition-colors">
                    {fleetManager?.name?.firstName?.charAt(0)}
                    {fleetManager?.name?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-black group-hover:text-white transition-colors">
                  <h3 className="text-lg font-bold flex items-center gap-1">
                    <UserCircle size={22} />
                    {fleetManager?.name?.firstName}{" "}
                    {fleetManager?.name?.lastName}
                    {!fleetManager?.name?.firstName &&
                      !fleetManager?.name?.lastName &&
                      "N/A"}
                  </h3>
                  <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <Mail size={14} />
                    {fleetManager?.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            {(fleetManagersData?.meta?.limit || 10) <
              (fleetManagersData?.meta?.total || 0) && (
              <Button
                onClick={() =>
                  getFleetManagers({
                    limit: (fleetManagersData?.meta?.limit || 0) + 10,
                  })
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
