"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { USER_STATUS } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { userSoftDeleteReq } from "@/services/auth/deleteUser";
import { TMeta } from "@/types";
import { TCustomer } from "@/types/user.type";
import { getSortOptions } from "@/utils/sortOptions";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, Eye, Slash, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  customersResult: { data: TCustomer[]; meta?: TMeta };
}

type TUserStatus = keyof typeof USER_STATUS;

export default function AllCustomers({ customersResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    customerId: "",
    customerName: "",
    status: "",
    remarks: "",
  });
  const [deleteId, setDeleteId] = useState("");
  const filterOptions = [
    {
      label: t("status"),
      key: "status",
      placeholder: t("select_status"),
      type: "select",
      items: [
        {
          label: t("pending"),
          value: "PENDING",
        },
        {
          label: t("submitted"),
          value: "SUBMITTED",
        },
        {
          label: t("approved"),
          value: "APPROVED",
        },
        {
          label: t("rejected"),
          value: "REJECTED",
        },
        {
          label: t("blocked"),
          value: "BLOCKED",
        },
      ],
    },
  ];

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const deleteCustomer = async () => {
    const toastId = toast.loading("Deleting Customer...");

    const result = await userSoftDeleteReq(deleteId);

    if (result?.success) {
      router.refresh();
      setDeleteId("");
      toast.success(result.message || "Customer deleted successfully!", {
        id: toastId,
      });
      return;
    }

    toast.error(result.message || "Customer deletion failed", {
      id: toastId,
    });
    console.log(result);
  };

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
        {t("all_customers")}
      </motion.h1>

      <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

      {/* Horizontal-scroll table container */}
      <Card className="p-0 overflow-x-auto rounded-xl shadow-sm border">
        <table className="min-w-[1300px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left w-[60px]">#</th>
              <th className="px-4 py-3 text-left w-[280px]">{t("customer")}</th>
              <th className="px-4 py-3 text-center w-[120px]">{t("orders_lg")}</th>
              <th className="px-4 py-3 text-center w-[150px]">{t("spend")} (€)</th>
              <th className="px-4 py-3 text-center w-[150px]">{t("status")}</th>
              <th className="px-4 py-3 text-center w-[150px]">{t("joined")}</th>
              <th className="px-4 py-3 text-center w-[260px]">{t("actions")}</th>
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
                  <div className="text-xs text-slate-500">{t("orders")}</div>
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
                    <Link href={`/admin/all-customers/${c.userId}`}>
                      <Eye className="w-4 h-4" />
                    </Link>

                    {c.status === "BLOCKED" ? (
                      <Button
                        size="sm"
                        className="whitespace-nowrap bg-[#DC3173] hover:bg-[#DC3173]/90"
                        onClick={() =>
                          setStatusInfo({
                            customerId: c.userId as string,
                            customerName: `${c.name?.firstName} ${c.name?.lastName}`,
                            status: "UNBLOCKED",
                            remarks: "",
                          })
                        }
                      >
                        <Check className="w-4 h-4 mr-1" /> {t("unblock")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="whitespace-nowrap bg-yellow-500 hover:bg-yellow-600"
                        onClick={() =>
                          setStatusInfo({
                            customerId: c.userId as string,
                            customerName: `${c.name?.firstName} ${c.name?.lastName}`,
                            status: "BLOCKED",
                            remarks: "",
                          })
                        }
                      >
                        <Slash className="w-4 h-4 mr-1" /> {t("block")}
                      </Button>
                    )}
                    {!c?.isDeleted && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="whitespace-nowrap"
                        onClick={() => setDeleteId(c.userId as string)}
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

      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteCustomer}
      />

      <ApproveOrRejectModal
        open={statusInfo.customerId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({
            customerId: "",
            customerName: "",
            status: "",
            remarks: "",
          })
        }
        status={
          statusInfo.status as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userName={statusInfo.customerName}
        userId={statusInfo.customerId}
      />
    </div>
  );
}
