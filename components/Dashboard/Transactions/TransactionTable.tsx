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
import { TTransaction } from "@/types/transaction.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  Cog,
  EuroIcon,
  EyeIcon,
  HashIcon,
  InfoIcon,
  ShapesIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  transactions: TTransaction[];
}

export default function TransactionTable({ transactions }: IProps) {
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
                Transaction ID
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <InfoIcon className="w-4" />
                Description
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <ShapesIcon className="w-4" />
                Type
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
          {transactions?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={6}
              >
                No transactions found
              </TableCell>
            </TableRow>
          )}
          {transactions?.map((p) => (
            <TableRow key={p._id}>
              <TableCell>{p.transactionId}</TableCell>
              <TableCell>{p.description}</TableCell>
              <TableCell className="capitalize">{p.type}</TableCell>
              <TableCell
                className={p.positive ? "text-green-500" : "text-red-500"}
              >
                {p.positive ? "+" : "-"}€{p.amount}
              </TableCell>
              <TableCell>{format(p.createdAt, "do MMM yyyy")}</TableCell>
              <TableCell className="text-right">
                <Button
                  onClick={() =>
                    router.push(`/vendor/transactions/${p.transactionId}`)
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
