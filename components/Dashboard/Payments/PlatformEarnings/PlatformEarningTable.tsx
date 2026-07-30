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
  const { t } = useTranslation();

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
                {t("transaction_id")}
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
                <ShoppingBagIcon className="w-4" />
                {t("order_id")}
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
                <PercentIcon className="w-4" />
                {t("platform_fee")}
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
                {t("no_commissions_found")}
              </TableCell>
            </TableRow>
          )}
          {commissions?.map((c) => (
            <TableRow key={c._id}>
              <TableCell>{c.transactionId}</TableCell>
              <TableCell>
                {c.customer?.name?.firstName || "N/A"} {c.customer?.name?.lastName}
              </TableCell>
              <TableCell>{c.orderId || "N/A"}</TableCell>
              <TableCell>€{formatPrice(c.amount || 0)}</TableCell>
              <TableCell>€{formatPrice(c.platformFee || 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
