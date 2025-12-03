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
import { TVendor } from "@/types/user.type";
import { Mail, Store, UserCircle } from "lucide-react";

interface IProps {
  vendors: TVendor[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClick: (v: TVendor) => void;
}

export default function SelectVendorModal({
  open,
  onOpenChange,
  onClick,
  vendors,
}: IProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start a conversation</DialogTitle>
            <DialogDescription>
              Select a vendor to start a conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {vendors?.map((vendor) => (
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
                    {vendor?.businessDetails?.businessName}
                  </h3>
                  <span className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <UserCircle size={14} />
                    {vendor?.name?.firstName} {vendor?.name?.lastName}
                  </span>
                  <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <Mail size={14} />
                    {vendor?.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
