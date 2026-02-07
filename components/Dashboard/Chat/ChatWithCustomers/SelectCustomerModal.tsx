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
import { TCustomer } from "@/types/user.type";
import { Mail, Phone, UserCircle } from "lucide-react";

interface IProps {
  customersData: { data: TCustomer[]; meta?: TMeta };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClick: (v: TCustomer) => void;
  getCustomers: ({ limit }: { limit?: number }) => void;
}

export default function SelectCustomerModal({
  open,
  onOpenChange,
  onClick,
  customersData,
  getCustomers,
}: IProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Start a conversation</DialogTitle>
            <DialogDescription>
              Select customer to start a conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {customersData?.data?.map((customer) => (
              <div
                className="w-full bg-[#DC3173]/20 text-[#DC3173] hover:bg-[#DC3173] hover:text-white flex items-center gap-3 p-4 rounded-lg group transition-colors cursor-pointer"
                key={customer._id}
                onClick={() => onClick(customer)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={customer?.profilePhoto}
                    alt={`${customer?.name?.firstName} ${customer?.name?.lastName}`}
                  />
                  <AvatarFallback className="bg-[#DC3173] text-white group-hover:bg-white/30 transition-colors">
                    {customer?.name?.firstName?.charAt(0)}
                    {customer?.name?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-black group-hover:text-white transition-colors">
                  <h3 className="text-lg font-bold flex items-center gap-1">
                    <UserCircle size={22} />
                    {customer?.name?.firstName} {customer?.name?.lastName}
                  </h3>
                  <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <Mail size={14} />
                    {customer?.email || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700 group-hover:text-gray-200 transition-colors flex items-center gap-1">
                    <Phone size={14} />
                    {customer?.contactNumber || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            {(customersData?.meta?.limit || 10) <
              (customersData?.meta?.total || 0) && (
              <Button
                onClick={() =>
                  getCustomers({
                    limit: (customersData?.meta?.limit || 0) + 10,
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
