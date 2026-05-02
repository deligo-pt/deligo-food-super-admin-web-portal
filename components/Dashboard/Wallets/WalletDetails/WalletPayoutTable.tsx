"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TPayout } from "@/types/payout.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, Cog, EuroIcon, EyeIcon, ShapesIcon } from "lucide-react";

interface IProps {
  payouts: TPayout[];
}

export default function WalletPayoutTable({ payouts }: IProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-2 overflow-x-auto"
    >
      <Table className="max-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CalendarIcon className="w-4" />
                Date
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <ShapesIcon className="w-4" />
                IBAN
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <EuroIcon className="w-4" />
                Earnings Amount
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={4}
              >
                No payouts found
              </TableCell>
            </TableRow>
          )}
          {payouts?.map((p) => (
            <TableRow key={p._id}>
              <TableCell>
                {p.paymentDate ? format(p.paymentDate, "do MMM yyyy") : "-"}
              </TableCell>
              <TableCell>{p.userId?.bankDetails?.iban || "-"}</TableCell>
              <TableCell>€{formatPrice(p.amount || 0)}</TableCell>
              <TableCell className="text-right">
                <Button
                  //   onClick={() => {}}
                  size="sm"
                  className="bg-[#DC3173] flex items-center gap-2 hover:bg-[#DC3173]/90 ml-auto"
                >
                  <EyeIcon />
                  Orders
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
