"use client";

import SupportRoleBadge from "@/components/SupportTickets/SupportRoleBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TLoyaltyPoint } from "@/types/loyalty-point.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  CoinsIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  User,
} from "lucide-react";

interface IProps {
  points: TLoyaltyPoint[];
}

export default function LoyaltyPointTable({ points }: IProps) {
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
                <User className="w-4" />
                User
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <ShieldCheckIcon className="w-4" />
                Role
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CoinsIcon className="w-4" />
                Current Points
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <ShoppingBagIcon className="w-4" />
                Total Spent
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <TrendingUpIcon className="w-4" />
                Total Earned
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CalendarIcon className="w-4" />
                Expiry Date
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {points?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={6}
              >
                No point found
              </TableCell>
            </TableRow>
          )}
          {points?.map((p) => (
            <TableRow key={p._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="w-8 h-8 bg-[#DC3173]/20 rounded-full flex justify-center items-center text-sm text-[#DC3173]">
                      {p.userId?.id?.name?.firstName?.charAt(0)}
                      {p.userId?.id?.name?.lastName?.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">
                      {!p.userId?.id?.name?.firstName &&
                        !p.userId?.id?.name?.lastName &&
                        "N/A"}
                      {p.userId?.id?.name?.firstName}{" "}
                      {p.userId?.id?.name?.lastName}
                    </div>
                    <div className="text-xs text-slate-400"></div>
                    <div className="text-xs text-slate-400">
                      {p.userId?.id?.email || "-"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <SupportRoleBadge role={p.userId?.model} />
              </TableCell>
              <TableCell>{p.currentPoints}</TableCell>
              <TableCell>{p.totalSpent}</TableCell>
              <TableCell>{p.totalEarned}</TableCell>
              <TableCell>{format(p.expiryDate, "do MMM yyyy")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
