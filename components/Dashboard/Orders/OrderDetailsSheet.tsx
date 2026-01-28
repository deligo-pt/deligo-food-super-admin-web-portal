"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { MapPin } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { TOrder } from "@/types/order.type";
import { format } from "date-fns";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: TOrder | null;
}

export default function OrderDetailsSheet({
  open,
  onOpenChange,
  selectedOrder,
}: IProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-xl p-6 overflow-y-auto border-l bg-white">
        <SheetHeader>
          <SheetTitle>{t("order_details")}</SheetTitle>
          <SheetDescription>
            {t("complete_information_about_selected_order")}
          </SheetDescription>
        </SheetHeader>

        {selectedOrder && (
          <div className="mt-4 space-y-6">
            <div>
              <p className="text-sm text-slate-500">{t("order_id")}</p>
              <p className="text-lg font-semibold">{selectedOrder?.orderId}</p>
            </div>

            <Separator />

            {/* Customer */}
            <div className="flex items-center gap-3">
              <Avatar className="w-14 h-14">
                <AvatarImage src={selectedOrder?.customerId?.profilePhoto} />
                <AvatarFallback>
                  {selectedOrder?.customerId?.name?.firstName?.charAt(0)}
                  {selectedOrder?.customerId?.name?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {selectedOrder?.customerId?.name?.firstName}{" "}
                  {selectedOrder?.customerId?.name?.lastName}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{" "}
                  {selectedOrder?.deliveryAddress?.street},{" "}
                  {selectedOrder?.deliveryAddress?.city}
                </p>
              </div>
            </div>

            {/* Partner */}
            {(selectedOrder?.deliveryPartnerId?.name?.firstName ||
              selectedOrder?.deliveryPartnerId?.name?.lastName) && (
              <>
                <Separator />

                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    <AvatarImage
                      src={selectedOrder?.deliveryPartnerId?.profilePhoto}
                    />
                    <AvatarFallback>
                      {selectedOrder?.deliveryPartnerId?.name?.firstName?.charAt(
                        0,
                      )}
                      {selectedOrder?.deliveryPartnerId?.name?.lastName?.charAt(
                        0,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {selectedOrder?.deliveryPartnerId?.name?.firstName}{" "}
                      {selectedOrder?.deliveryPartnerId?.name?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedOrder?.deliveryPartnerId?.address?.city}
                    </p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">{t("amount")}</p>
                <p className="font-semibold">
                  € {selectedOrder?.totalPrice?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("items")}</p>
                <p className="font-semibold">
                  {selectedOrder?.items?.map((item, i) => (
                    <span key={i}>
                      {item?.productId?.name} x {item?.quantity}
                    </span>
                  ))}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("payment")}</p>
                <p className="font-semibold">{selectedOrder?.paymentStatus}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("status")}</p>
                <p className="font-semibold">{selectedOrder?.orderStatus}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-slate-500">{t("delivery_timeline")}</p>
              <ul className="mt-2 text-sm space-y-2">
                <li>
                  • {t("created")}:{" "}
                  {format(selectedOrder?.createdAt, "Do MMM yyyy")}
                </li>
                {(selectedOrder?.deliveryPartnerId?.name?.firstName ||
                  selectedOrder?.deliveryPartnerId?.name?.lastName) && (
                  <li>
                    • {t("rider")}:{" "}
                    {selectedOrder?.deliveryPartnerId?.name?.firstName}{" "}
                    {selectedOrder?.deliveryPartnerId?.name?.lastName}
                  </li>
                )}
                {selectedOrder?.deliveredAt && (
                  <li>
                    • {t("delivered")}:{" "}
                    {format(selectedOrder?.deliveredAt, "Do MMM yyyy")}
                  </li>
                )}
              </ul>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("close")}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
