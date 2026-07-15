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
import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/store/store";
import { TTransaction } from "@/types/transaction.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  Cog,
  EuroIcon,
  EyeIcon,
  PackageIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  spends: TTransaction[];
}

export default function CustomerSpendTable({ spends }: IProps) {
  const { t } = useTranslation();
  const { lang } = useStore();
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
                <UserIcon className="w-4" />
                {t("customer")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <PackageIcon className="w-4" />
                {t("items")}
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
                <CalendarIcon className="w-4" />
                {t("date")}
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              {t("actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spends?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                {t("no_spends_found")}
              </TableCell>
            </TableRow>
          )}
          {spends?.map((s) => (
            <TableRow key={s._id}>
              <TableCell>
                {!s.customer?.name?.firstName || !s.customer?.name?.lastName
                  ? "N/A"
                  : `${s.customer?.name?.firstName} ${s.customer?.name?.lastName}`}
              </TableCell>
              <TableCell>
                {s.items?.map((item, i) => (
                  <p key={i}>
                    {item?.name?.[lang]} (x{item.qty})
                  </p>
                ))}
              </TableCell>
              <TableCell>€{formatPrice(s.amount || 0)}</TableCell>
              <TableCell>{format(s.createdAt, "do MMM yyyy")}</TableCell>
              <TableCell className="text-right">
                <Button
                  onClick={() =>
                    router.push(`/admin/customer-spends/${s.transactionId}`)
                  }
                  size="sm"
                  className="bg-[#DC3173] flex items-center gap-2 hover:bg-[#DC3173]/90 ml-auto"
                >
                  <EyeIcon />
                  {t("view")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
