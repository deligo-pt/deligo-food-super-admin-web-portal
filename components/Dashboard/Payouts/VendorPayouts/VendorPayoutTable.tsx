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
import { TVendorPayout } from "@/types/payout.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  CircleCheckBig,
  Cog,
  CreditCard,
  Euro,
  MoreVertical,
  Store,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  vendorPayouts: TVendorPayout[];
}

export default function VendorPayoutTable({ vendorPayouts }: IProps) {
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
                <Store className="w-4" />
                Vendor
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Euro className="w-4" />
                Amount
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CreditCard className="w-4" />
                Method
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Calendar className="w-4" />
                Date
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CircleCheckBig className="w-4" />
                Status
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendorPayouts?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={6}
              >
                No vendor payouts found
              </TableCell>
            </TableRow>
          )}
          {vendorPayouts?.map((payout) => (
            <TableRow key={payout._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={payout?.userId?.profilePhoto}
                      alt={`${payout?.userId?.name?.firstName} ${payout?.userId?.name?.lastName}`}
                    />
                    <AvatarFallback>
                      {payout?.userId?.name?.firstName?.charAt(0)}
                      {payout?.userId?.name?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {payout?.userId?.name?.firstName}{" "}
                      {payout?.userId?.name?.lastName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {payout?.userId?.userId}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>€{payout.amount}</TableCell>
              <TableCell>{payout.paymentMethod}</TableCell>
              <TableCell>{format(payout.createdAt, "do MMM yyyy")}</TableCell>
              <TableCell>{payout.status}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/admin/vendor-payouts/${payout.payoutId}`)
                      }
                    >
                      View
                    </DropdownMenuItem>
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
