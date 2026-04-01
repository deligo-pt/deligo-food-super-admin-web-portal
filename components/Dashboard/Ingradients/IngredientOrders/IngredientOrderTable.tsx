"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updatedIngredientOrderStatusReq } from "@/services/dashboard/ingredient/ingredient.service";
import { TIngredientOrder } from "@/types/ingredient.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog,
  EuroIcon,
  HashIcon,
  MoreVertical,
  PackageIcon,
  StoreIcon,
  TruckIcon,
  Warehouse,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface IProps {
  orders: TIngredientOrder[];
  // onDeleteClick: (id: string) => void;
}

export default function IngredientOrderTable({ orders }: IProps) {
  const router = useRouter();

  const updateStatus = async (id: string, status: "SHIPPED" | "DELIVERED") => {
    const toastId = toast.loading(
      status === "SHIPPED"
        ? "Updating order status to SHIPPED..."
        : "Updating order status to DELIVERED...",
    );

    const result = await updatedIngredientOrderStatusReq(id, { status });

    if (result?.success) {
      toast.success(
        result?.message ||
          (status === "SHIPPED"
            ? "Order status updated to SHIPPED"
            : "Order status updated to DELIVERED"),
        { id: toastId },
      );
      router.refresh();
      return;
    }

    toast.error(
      result?.message ||
        (status === "SHIPPED"
          ? "Failed to update order status to SHIPPED"
          : "Failed to update order status to DELIVERED"),
      { id: toastId },
    );
    console.log(result);
  };

  const getStatusBadge = (status: TIngredientOrder["orderStatus"]) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DC3173]/10 text-[#DC3173]">
            <CheckCircleIcon size={12} /> Delivered
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
            <TruckIcon size={12} /> Shipped
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
            <PackageIcon size={12} /> Confirmed
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <ClockIcon size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <Table className="max-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <HashIcon className="w-4" />
                Order ID
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <StoreIcon className="w-4" />
                Vendor
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Warehouse className="w-4" />
                Items
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <EuroIcon className="w-4" />
                Total
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CheckCircleIcon className="w-4" />
                Status
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CalendarIcon className="w-4" />
                Date
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={7}
              >
                No orders found
              </TableCell>
            </TableRow>
          )}
          {orders?.map((order) => (
            <TableRow key={order._id}>
              <TableCell>{order.orderId}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={order.vendor?.profilePhoto} />
                    <AvatarFallback>
                      {order.vendor?.businessDetails?.businessName
                        ?.split(" ")
                        ?.map((n) => n[0])
                        ?.join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {order.vendor?.businessDetails?.businessName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {order.vendor?.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {order.orderDetails?.ingredient?.name} (x
                {order.orderDetails?.totalQuantity})
              </TableCell>
              <TableCell>€{formatPrice(order.grandTotal)}</TableCell>
              <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
              <TableCell>{format(order.createdAt, "do MMM yyyy")}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className=""
                      onClick={() =>
                        router.push("/admin/ingredient-orders/" + order.orderId)
                      }
                    >
                      View
                    </DropdownMenuItem>
                    {order.orderStatus === "CONFIRMED" && (
                      <DropdownMenuItem
                        className=""
                        onClick={() => updateStatus(order._id, "SHIPPED")}
                      >
                        Update to SHIPPED
                      </DropdownMenuItem>
                    )}
                    {order.orderStatus === "SHIPPED" && (
                      <DropdownMenuItem
                        className=""
                        onClick={() => updateStatus(order._id, "DELIVERED")}
                      >
                        Update to DELIVERED
                      </DropdownMenuItem>
                    )}
                    {/* <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDeleteClick(order._id)}
                    >
                      Delete
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
