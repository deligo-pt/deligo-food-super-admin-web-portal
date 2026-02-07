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
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { Bike, Mail, Phone } from "lucide-react";

interface IProps {
  driversData: { data: TDeliveryPartner[]; meta?: TMeta };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClick: (v: TDeliveryPartner) => void;
  getDrivers: ({ limit }: { limit?: number }) => void;
}

export default function SelectDriverModal({
  open,
  onOpenChange,
  onClick,
  driversData,
  getDrivers,
}: IProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Start a conversation</DialogTitle>
            <DialogDescription>
              Select a driver to start a conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {driversData?.data?.map((driver) => (
              <div
                className="w-full bg-[#DC3173]/20 text-[#DC3173] hover:bg-[#DC3173] hover:text-white flex items-center gap-3 p-4 rounded-lg group transition-colors cursor-pointer"
                key={driver._id}
                onClick={() => onClick(driver)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={driver?.profilePhoto}
                    alt={`${driver?.name?.firstName} ${driver?.name?.lastName}`}
                  />
                  <AvatarFallback className="bg-[#DC3173] text-white group-hover:bg-white/30 transition-colors">
                    {driver?.name?.firstName?.charAt(0)}
                    {driver?.name?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-black group-hover:text-white transition-colors">
                  <h3 className="text-lg font-bold flex items-center gap-1">
                    <Bike size={22} />
                    {driver?.name?.firstName} {driver?.name?.lastName}
                  </h3>
                  <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <Mail size={14} />
                    {driver?.email}
                  </p>
                  <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <Phone size={14} />
                    {driver?.contactNumber}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            {(driversData?.meta?.limit || 10) <
              (driversData?.meta?.total || 0) && (
              <Button
                onClick={() =>
                  getDrivers({ limit: (driversData?.meta?.limit || 0) + 10 })
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
