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
import { TAgent } from "@/types/user.type";
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
  agentsResult: { data: TAgent[]; meta?: TMeta };
}


export default function AgentTable({ agentsResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    agentId: "",
    agentName: "",
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

  const deleteAgent = async () => {
    const toastId = toast.loading("Deleting Fleet Manager...");

    try {
      const result = (await deleteData(`/auth/soft-delete/${deleteId}`, {
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<null>;

      if (result?.success) {
        router.refresh();
        setDeleteId("");
        toast.success(result.message || "Fleet Manager deleted successfully!", {
          id: toastId,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Fleet Manager delete failed",
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
        className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2"
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
            {agentsResult?.data &&
              agentsResult?.data?.length > 0 &&
              agentsResult?.data?.map((agent) => (
                <TableRow key={agent._id}>
                  <TableCell>
                    {agent.name?.firstName} {agent.name?.lastName}
                  </TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>{agent.contactNumber}</TableCell>
                  <TableCell className={agent.isDeleted ? "text-red-500" : ""}>
                    {agent.isDeleted ? "Deleted" : agent.status}
                  </TableCell>
                  <TableCell className="text-right">
                    {!agent.isDeleted && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className=""
                            onClick={() =>
                              router.push("/admin/agent/" + agent.userId)
                            }
                          >
                            {t("view")}
                          </DropdownMenuItem>
                          {agent.status === "SUBMITTED" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusInfo({
                                    agentId: agent.userId as string,
                                    agentName: `${agent.name?.firstName} ${agent.name?.lastName}`,
                                    status: "APPROVED",
                                    remarks: "",
                                  })
                                }
                              >
                                {t("approve")}
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusInfo({
                                    agentId: agent.userId as string,
                                    agentName: `${agent.name?.firstName} ${agent.name?.lastName}`,
                                    status: "REJECTED",
                                    remarks: "",
                                  })
                                }
                              >
                                {t("reject")}
                              </DropdownMenuItem>
                            </>
                          )}
                          {agent.status === "APPROVED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setStatusInfo({
                                  agentId: agent.userId as string,
                                  agentName: `${agent.name?.firstName} ${agent.name?.lastName}`,
                                  status: "BLOCKED",
                                  remarks: "",
                                })
                              }
                            >
                              {t("block")}
                            </DropdownMenuItem>
                          )}
                          {agent.status === "BLOCKED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setStatusInfo({
                                  agentId: agent.userId as string,
                                  agentName: `${agent.name?.firstName} ${agent.name?.lastName}`,
                                  status: "UNBLOCKED",
                                  remarks: "",
                                })
                              }
                            >
                              {t("unblock")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(agent.userId as string)}
                          >
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {agentsResult?.data?.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-[#DC3173] text-lg text-center"
                  colSpan={5}
                >
                  {t("no_fleet_manager_found")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
      {!!agentsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={agentsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteAgent}
      />

      <ApproveOrRejectModal
        open={statusInfo.agentId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({ agentId: "", agentName: "", status: "", remarks: "" })
        }
        status={
          statusInfo.status as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userName={statusInfo.agentName}
        userId={statusInfo.agentId}
      />
    </>
  );
}
