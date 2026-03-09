"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TPlaformEarningsData } from "@/types/payment.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import {
  EuroIcon,
  HashIcon,
  PercentIcon,
  ShoppingBagIcon,
  UserIcon,
} from "lucide-react";

interface IProps {
  commissions: TPlaformEarningsData["commissions"];
}

export default function PlatformEarningsTable({ commissions }: IProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white mb-2 overflow-x-auto"
    >
      <Table className="max-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <HashIcon className="w-4" />
                Transaction ID
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
                <ShoppingBagIcon className="w-4" />
                Order ID
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
                <PercentIcon className="w-4" />
                Platform Fee
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commissions?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                No commissions found
              </TableCell>
            </TableRow>
          )}
          {commissions?.map((c) => (
            <TableRow key={c._id}>
              <TableCell>{c.transactionId}</TableCell>
              <TableCell>
                {c.customer?.name?.firstName} {c.customer?.name?.lastName}
              </TableCell>
              <TableCell>{c.orderId}</TableCell>
              <TableCell>{formatPrice(c.amount || 0)}</TableCell>
              <TableCell>{formatPrice(c.platformFee || 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
