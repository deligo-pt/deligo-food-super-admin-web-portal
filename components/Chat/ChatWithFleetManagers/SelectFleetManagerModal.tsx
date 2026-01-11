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
import { TAgent } from "@/types/user.type";
import { Mail, Store, UserCircle } from "lucide-react";

interface IProps {
  fleetManagers: TAgent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClick: (v: TAgent) => void;
}

export default function SelectFleetManagerModal({
  open,
  onOpenChange,
  onClick,
  fleetManagers,
}: IProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Start a conversation</DialogTitle>
            <DialogDescription>
              Select a fleet manager to start a conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {fleetManagers?.map((fleetManager) => (
              <div
                className="w-full bg-[#DC3173]/20 text-[#DC3173] hover:bg-[#DC3173] hover:text-white flex items-center gap-3 p-4 rounded-lg group transition-colors cursor-pointer"
                key={fleetManager._id}
                onClick={() => onClick(fleetManager)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={fleetManager?.profilePhoto}
                    alt={fleetManager?.businessDetails?.businessName}
                  />
                  <AvatarFallback className="bg-[#DC3173] text-white group-hover:bg-white/30 transition-colors">
                    {fleetManager?.businessDetails?.businessName
                      .split(" ")
                      .map((name) => name?.charAt(0))
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-black group-hover:text-white transition-colors">
                  <h3 className="text-lg font-bold flex items-center gap-1">
                    <Store size={22} />
                    {fleetManager?.businessDetails?.businessName}
                  </h3>
                  <span className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <UserCircle size={14} />
                    {fleetManager?.name?.firstName}{" "}
                    {fleetManager?.name?.lastName}
                  </span>
                  <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <Mail size={14} />
                    {fleetManager?.email}
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
