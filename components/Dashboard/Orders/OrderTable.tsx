"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TOrder } from "@/types/order.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  Cog,
  EuroIcon,
  EyeIcon,
  HashIcon,
  PackageIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  orders: TOrder[];
}

export default function OrderTable({ orders }: IProps) {
  const router = useRouter();

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
                <UserIcon className="w-4" />
                Customer
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <PackageIcon className="w-4" />
                Items
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <EuroIcon className="w-4" />
                Amount
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
                colSpan={6}
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
                    <AvatarImage src={order.customerId?.profilePhoto} />
                    <AvatarFallback>
                      {order.customerId?.name?.firstName?.charAt(0)}
                      {order.customerId?.name?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {order.customerId?.name?.firstName}{" "}
                      {order.customerId?.name?.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {order.deliveryAddress.street},{" "}
                      {order.deliveryAddress.city}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {order.items?.map((i, index) => (
                  <span key={index}>
                    {i.productId?.name} x {i.quantity}
                  </span>
                ))}
              </TableCell>
              <TableCell> €{order.totalPrice?.toLocaleString()}</TableCell>
              <TableCell>{format(order.createdAt, "do MMM yyyy")}</TableCell>
              <TableCell>
                <Button
                  onClick={() =>
                    router.push(`/admin/all-orders/${order.orderId}`)
                  }
                  size="sm"
                  className="bg-[#DC3173] flex items-center gap-2 hover:bg-[#DC3173]/90 ml-auto"
                >
                  <EyeIcon />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
