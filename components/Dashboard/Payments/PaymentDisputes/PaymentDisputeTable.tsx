"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/hooks/use-translation";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  CircleCheckBig,
  EuroIcon,
  FileTextIcon,
  HashIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react";

interface IProps {
  disputes: {
    _id: string;
    disputeId: string;
    desc: string;
    vendor: string;
    customer: string;
    amount: number;
    status: string;

    createdAt: string;
    updatedAt: string;
  }[];
}

export default function PaymentDisputeTable({ disputes }: IProps) {
  const { t } = useTranslation();

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
                <HashIcon className="w-4" />
                {t("dispute_id")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <FileTextIcon className="w-4" />
                {t("description")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <StoreIcon className="w-4" />
                {t("vendor")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <UserIcon className="w-4" />
                {t("customer")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <EuroIcon className="w-4" />
                {t("amount")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CircleCheckBig className="w-4" />
                {t("status")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CalendarIcon className="w-4" />
                {t("date")}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disputes?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={7}
              >
                {t("no_disputes_found")}
              </TableCell>
            </TableRow>
          )}
          {disputes?.map((d) => (
            <TableRow key={d._id}>
              <TableCell>{d.disputeId}</TableCell>
              <TableCell>{d.desc}</TableCell>
              <TableCell>{d.vendor}</TableCell>
              <TableCell>{d.customer}</TableCell>
              <TableCell>€{formatPrice(d.amount || 0)}</TableCell>
              <TableCell>{d.status}</TableCell>
              <TableCell>{format(d.createdAt, "do MMM yyyy")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
