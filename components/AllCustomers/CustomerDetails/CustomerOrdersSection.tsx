"use client";

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
import { CalendarIcon, EuroIcon, HashIcon, PackageIcon } from "lucide-react";

interface IProps {
  orders: TOrder[];
}

export default function CustomerOrdersSection({ orders }: IProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto"
    >
      {orders?.length === 0 ? (
        <div className="text-gray-500 text-sm text-center">No orders found</div>
      ) : (
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>
                  {order.items?.map((i, index) => (
                    <span key={index}>
                      {i.productId?.name} x {i.quantity}
                    </span>
                  ))}
                </TableCell>
                <TableCell> €{order.totalPrice?.toLocaleString()}</TableCell>
                <TableCell>{format(order.createdAt, "do MMM yyyy")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </motion.div>
  );
}
