"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { USER_STATUS } from "@/consts/user.const";
import { TMeta } from "@/types";
import { TCustomer } from "@/types/user.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, Eye, Slash, Trash } from "lucide-react";

interface IProps {
  customersResult: { data: TCustomer[]; meta?: TMeta };
}

type TUserStatus = keyof typeof USER_STATUS;

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

const filterOptions = [
  {
    label: "Status",
    key: "status",
    placeholder: "Select Status",
    type: "select",
    items: [
      {
        label: "Pending",
        value: "PENDING",
      },
      {
        label: "Submitted",
        value: "SUBMITTED",
      },
      {
        label: "Approved",
        value: "APPROVED",
      },
      {
        label: "Rejected",
        value: "REJECTED",
      },
      {
        label: "Blocked",
        value: "BLOCKED",
      },
    ],
  },
];

export default function AllCustomers({ customersResult }: IProps) {
  const getStatusColor = (status: TUserStatus) => {
    switch (status) {
      case "PENDING":
      case "SUBMITTED":
        return "#F0B100";
      case "APPROVED":
        return "#DC3173";
      case "REJECTED":
      case "BLOCKED":
        return "#FF0000";
      default:
        return "#CCC";
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6"
      >
        All Customers
      </motion.h1>

      <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

      {/* Horizontal-scroll table container */}
      <Card className="p-0 overflow-x-auto rounded-xl shadow-sm border">
        <table className="min-w-[1300px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left w-[60px]">#</th>
              <th className="px-4 py-3 text-left w-[280px]">Customer</th>
              <th className="px-4 py-3 text-center w-[120px]">Orders</th>
              <th className="px-4 py-3 text-center w-[150px]">Spend (€)</th>
              <th className="px-4 py-3 text-center w-[150px]">Status</th>
              <th className="px-4 py-3 text-center w-[150px]">Joined</th>
              <th className="px-4 py-3 text-center w-[260px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {customersResult?.data?.map((c, i) => (
              <tr key={c._id} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-semibold text-slate-700">
                  {i + 1}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarImage
                        src={c.profilePhoto}
                        alt={`${c.name?.firstName} ${c.name?.lastName}`}
                      />
                      <AvatarFallback>
                        {c.name?.firstName?.charAt(0)}
                        {c.name?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {c.name?.firstName} {c.name?.lastName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {c.email}
                      </div>
                      <div className="text-xs text-slate-400">
                        {c.address?.city}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-center">
                  <div className="font-semibold">{c.orders?.totalOrders}</div>
                  <div className="text-xs text-slate-500">orders</div>
                </td>

                <td className="px-4 py-4 text-center">
                  <div className="font-bold text-emerald-600">
                    € {c?.orders?.totalSpent?.toLocaleString()}
                  </div>
                </td>

                <td className="px-4 py-4 text-center text-slate-700">
                  <Badge
                    style={{
                      background: getStatusColor(c.status as TUserStatus),
                    }}
                  >
                    {c.status}
                  </Badge>
                </td>

                <td className="px-4 py-4 text-center text-slate-700">
                  {c.createdAt ? format(c.createdAt, "do MMM yyyy") : "N/A"}
                </td>

                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>

                    {c.status === "BLOCKED" ? (
                      <Button
                        size="sm"
                        className="whitespace-nowrap bg-[#DC3173] hover:bg-[#DC3173]/90"
                      >
                        <Check className="w-4 h-4 mr-1" /> Unblock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="whitespace-nowrap bg-yellow-500 hover:bg-yellow-600"
                      >
                        <Slash className="w-4 h-4 mr-1" /> Block
                      </Button>
                    )}
                    {!c?.isDeleted && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="whitespace-nowrap"
                      >
                        <Trash className="w-4 h-4 mr-1" /> Delete
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
