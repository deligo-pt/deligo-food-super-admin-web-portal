// Active Customers Page (Premium Glovo/Uber Eats Level) - FULL CODE
// Next.js + TypeScript + TailwindCSS + shadcn + Framer Motion

"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TCustomer } from "@/types/user.type";
import { getSortOptions } from "@/utils/sortOptions";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, Eye, Slash, Trash } from "lucide-react";
import Link from "next/link";

interface IProps {
  customersResult: { data: TCustomer[]; meta?: TMeta };
}

export default function ActiveCustomers({ customersResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6"
      >
        {t("active_customers")}
      </motion.h1>
      <AllFilters sortOptions={sortOptions} />
      {/* Table with horizontal scroll */}
      <Card className="p-0 overflow-x-auto rounded-xl shadow-sm border">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left w-[60px]">#</th>
              <th className="px-4 py-3 text-left w-[280px]">{t("customer")}</th>
              <th className="px-4 py-3 text-center w-[120px]">{t("orders_lg")}</th>
              <th className="px-4 py-3 text-center w-[150px]">{t("spend")} (€)</th>
              <th className="px-4 py-3 text-center w-[150px]">{t("joined")}</th>
              <th className="px-4 py-3 text-center w-[260px]">{t("actions")}</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {customersResult?.data?.map((c, i) => (
              <tr key={c._id} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-semibold text-slate-600">
                  {i + 1}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={c.profilePhoto} />
                      <AvatarFallback>
                        {c.name?.firstName?.charAt(0)}
                        {c.name?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {c?.name?.firstName} {c?.name?.lastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {c.email}
                      </p>
                      <p className="text-xs text-slate-400">
                        {c.address?.city}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-center">
                  <div className="font-semibold">{c.orders?.totalOrders}</div>
                  <p className="text-xs text-slate-500">{t("orders")}</p>
                </td>

                <td className="px-4 py-4 text-center font-bold text-emerald-600">
                  € {c?.orders?.totalSpent?.toLocaleString()}
                </td>

                <td className="px-4 py-4 text-center text-slate-600">
                  {c.createdAt ? format(c.createdAt, "do MMM yyyy") : "N/A"}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/all-customers/${c.userId}`}>
                      <Eye className="w-4 h-4" />
                    </Link>

                    {c.status === "BLOCKED" ? (
                      <Button
                        size="sm"
                        className="whitespace-nowrap bg-[#DC3173] hover:bg-[#DC3173]/90"
                      >
                        <Check className="w-4 h-4 mr-1" /> {t("unblock")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="whitespace-nowrap bg-yellow-500 hover:bg-yellow-600"
                      >
                        <Slash className="w-4 h-4 mr-1" /> {t("block")}
                      </Button>
                    )}
                    {!c?.isDeleted && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="whitespace-nowrap"
                      >
                        <Trash className="w-4 h-4 mr-1" /> {t("delete")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {!!customersResult?.meta?.total && customersResult?.meta?.total > 0 && (
        <div className="mt-2">
          <PaginationComponent
            totalPages={customersResult?.meta?.totalPage || 0}
          />
        </div>
      )}
    </div>
  );
}
