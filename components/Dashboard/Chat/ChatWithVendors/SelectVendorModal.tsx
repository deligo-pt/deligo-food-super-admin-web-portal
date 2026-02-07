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
import { TVendor } from "@/types/user.type";
import { Mail, Store, UserCircle } from "lucide-react";

interface IProps {
  vendorsData: { data: TVendor[]; meta?: TMeta };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClick: (v: TVendor) => void;
  getVendors: ({ limit }: { limit?: number }) => void;
}

export default function SelectVendorModal({
  open,
  onOpenChange,
  onClick,
  vendorsData,
  getVendors,
}: IProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("start_a_conversation")}</DialogTitle>
            <DialogDescription>
              {t("select_vendor_to_start_conversation")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {vendorsData?.data?.map((vendor) => (
              <div
                className="w-full bg-[#DC3173]/20 text-[#DC3173] hover:bg-[#DC3173] hover:text-white flex items-center gap-3 p-4 rounded-lg group transition-colors cursor-pointer"
                key={vendor._id}
                onClick={() => onClick(vendor)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={vendor?.profilePhoto}
                    alt={vendor?.businessDetails?.businessName}
                  />
                  <AvatarFallback className="bg-[#DC3173] text-white group-hover:bg-white/30 transition-colors">
                    {vendor?.businessDetails?.businessName
                      .split(" ")
                      .map((name) => name?.charAt(0))
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-black group-hover:text-white transition-colors">
                  <h3 className="text-lg font-bold flex items-center gap-1">
                    <Store size={22} />
                    {vendor?.businessDetails?.businessName || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <UserCircle size={14} />
                    {vendor?.name?.firstName} {vendor?.name?.lastName}
                    {!vendor?.name?.firstName &&
                      !vendor?.name?.lastName &&
                      "N/A"}
                  </p>
                  <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <Mail size={14} />
                    {vendor?.email || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            {(vendorsData?.meta?.limit || 10) <
              (vendorsData?.meta?.total || 0) && (
              <Button
                onClick={() =>
                  getVendors({
                    limit: (vendorsData?.meta?.limit || 0) + 10,
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
