"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
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
import { useTranslation } from "@/hooks/use-translation";
import { TMeta, TResponse } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { getCookie } from "@/utils/cookies";
import { deleteData } from "@/utils/requests";
import { getSortOptions } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import {
  CircleCheckBig,
  Cog,
  IdCard,
  Mail,
  MoreVertical,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  deliveryPartnersResult: { data: TDeliveryPartner[]; meta?: TMeta };
}

export default function DeliveryPartnerTable({
  deliveryPartnersResult,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    deliveryPartnerId: "",
    deliveryPartnerName: "",
    status: "",
  });
  const [deleteId, setDeleteId] = useState("");
  const sortOptions = getSortOptions(t);
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

  const deleteDeliveryPartner = async () => {
    const toastId = toast.loading("Deleting Delivery Partner...");

    try {
      const result = (await deleteData(`/auth/soft-delete/${deleteId}`, {
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<null>;

      if (result?.success) {
        router.refresh();
        setDeleteId("");
        toast.success(
          result.message || "Delivery Partner deleted successfully!",
          {
            id: toastId,
          }
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Delivery Partner delete failed",
        {
          id: toastId,
        }
      );
    }
  };

  return (
    <>
      <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />
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
                  <IdCard className="w-4" />
                  {t("name")}
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <Mail className="w-4" />
                  {t("email")}
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <Phone className="w-4" />
                  {t("phone")}
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <CircleCheckBig className="w-4" />
                  {t("status")}
                </div>
              </TableHead>
              <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
                <Cog className="w-4" />
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveryPartnersResult &&
              deliveryPartnersResult?.data?.length > 0 &&
              deliveryPartnersResult?.data?.map((deliveryPartner) => (
                <TableRow key={deliveryPartner?._id}>
                  <TableCell>
                    {deliveryPartner?.name?.firstName}{" "}
                    {deliveryPartner?.name?.lastName}
                  </TableCell>
                  <TableCell>{deliveryPartner?.email}</TableCell>
                  <TableCell>{deliveryPartner?.contactNumber}</TableCell>
                  <TableCell>
                    {deliveryPartner?.isDeleted
                      ? "DELETED"
                      : deliveryPartner?.status}
                  </TableCell>
                  <TableCell className="text-right">
                    {!deliveryPartner?.isDeleted && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className=""
                            onClick={() =>
                              router.push(
                                "/admin/all-delivery-partners/" +
                                deliveryPartner.userId
                              )
                            }
                          >
                            {t("view")}
                          </DropdownMenuItem>
                          {deliveryPartner.status === "SUBMITTED" && (
                            <DropdownMenuItem
                              className=""
                              onClick={() =>
                                setStatusInfo({
                                  deliveryPartnerId:
                                    deliveryPartner.userId as string,
                                  deliveryPartnerName: `${deliveryPartner?.name?.firstName} ${deliveryPartner?.name?.lastName}`,
                                  status: "APPROVED",
                                })
                              }
                            >
                              {t("approve")}
                            </DropdownMenuItem>
                          )}
                          {deliveryPartner.status === "SUBMITTED" && (
                            <DropdownMenuItem
                              className=""
                              onClick={() =>
                                setStatusInfo({
                                  deliveryPartnerId:
                                    deliveryPartner.userId as string,
                                  deliveryPartnerName: `${deliveryPartner?.name?.firstName} ${deliveryPartner?.name?.lastName}`,
                                  status: "REJECTED",
                                })
                              }
                            >
                              {t("reject")}
                            </DropdownMenuItem>
                          )}
                          {deliveryPartner.status === "APPROVED" && (
                            <DropdownMenuItem
                              className=""
                              onClick={() =>
                                setStatusInfo({
                                  deliveryPartnerId:
                                    deliveryPartner.userId as string,
                                  deliveryPartnerName: `${deliveryPartner?.name?.firstName} ${deliveryPartner?.name?.lastName}`,
                                  status: "BLOCKED",
                                })
                              }
                            >
                              {t("block")}
                            </DropdownMenuItem>
                          )}
                          {deliveryPartner.status === "BLOCKED" && (
                            <DropdownMenuItem
                              className=""
                              onClick={() =>
                                setStatusInfo({
                                  deliveryPartnerId:
                                    deliveryPartner.userId as string,
                                  deliveryPartnerName: `${deliveryPartner?.name?.firstName} ${deliveryPartner?.name?.lastName}`,
                                  status: "UNBLOCKED",
                                })
                              }
                            >
                              {t("unblock")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              setDeleteId(deliveryPartner.userId as string)
                            }
                          >
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {deliveryPartnersResult?.data?.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-[#DC3173] text-lg text-center"
                  colSpan={5}
                >
                 {t("no_delivery_partners_found")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
      {!!deliveryPartnersResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={deliveryPartnersResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteDeliveryPartner}
      />

      <ApproveOrRejectModal
        open={statusInfo?.deliveryPartnerId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({
            deliveryPartnerId: "",
            status: "",
            deliveryPartnerName: "",
          })
        }
        status={
          statusInfo.status as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userId={statusInfo.deliveryPartnerId}
        userName={statusInfo.deliveryPartnerName}
      />
    </>
  );
}
