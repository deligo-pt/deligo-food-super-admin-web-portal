"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TCustomer } from "@/types/user.type";
import { getSortOptions } from "@/utils/sortOptions";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Eye, Unlock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface IProps {
  customersResult: { data: TCustomer[]; meta?: TMeta };
}

export default function BlockedCustomers({ customersResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);
  const [statusInfo, setStatusInfo] = useState({
    customerId: "",
    customerName: "",
  });

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6"
      >
        {t("blocked_customers")}
      </motion.h1>

      <AllFilters sortOptions={sortOptions} />

      {/* List */}
      <Card className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("blocked_customers")}</h2>
          <div className="text-sm text-slate-500">
            {customersResult?.meta?.total} {t("results")}
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-4">
          {customersResult?.data?.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              {t("no_blocked_customers_found")}
            </div>
          ) : (
            customersResult?.data?.map((c) => (
              <motion.div
                key={c._id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between"
              >
                {/* Left */}
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar>
                    <AvatarImage src={c.profilePhoto} />
                    <AvatarFallback>
                      {c.name?.firstName?.charAt(0)}
                      {c.name?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-semibold text-lg truncate">
                      {c.name?.firstName}
                      {c.name?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{c.email}</p>
                    <p className="text-xs text-slate-400">
                      {t("city")}: {c.address?.city || "—"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                        {t("blocked")}
                      </span>
                      <span className="text-xs text-slate-500">
                        {t("orders_lg")}: {c.orders?.totalOrders}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right flex flex-col items-end gap-3">
                  <p className="text-sm text-slate-500">
                    {t("blocked")}:{" "}
                    {c.approvedOrRejectedOrBlockedAt &&
                      format(
                        c.approvedOrRejectedOrBlockedAt,
                        "do MMM yyyy, hh:mm a"
                      )}
                  </p>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/all-customers/${c.userId}`}>
                      <Button
                        size="sm"
                        className="bg-gray-300 hover:bg-gray-200 text-slate-800"
                      >
                        <Eye className="w-4 h-4 mr-1" /> {t("details")}
                      </Button>
                    </Link>

                    <Button
                      onClick={() =>
                        setStatusInfo({
                          customerId: c.userId,
                          customerName: `${c.name?.firstName} ${c.name?.lastName}`,
                        })
                      }
                      size="sm"
                      className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white"
                    >
                      <Unlock className="w-4 h-4 mr-1" /> {t("unblock")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
      {!!customersResult?.meta?.total && customersResult?.meta?.total > 0 && (
        <div className="mt-2">
          <PaginationComponent
            totalPages={customersResult?.meta?.totalPage || 0}
          />
        </div>
      )}

      <ApproveOrRejectModal
        open={statusInfo?.customerId?.length > 0}
        onOpenChange={() => setStatusInfo({ customerId: "", customerName: "" })}
        status="UNBLOCKED"
        userId={statusInfo?.customerId}
        userName={statusInfo?.customerName}
      />
    </div>
  );
}
