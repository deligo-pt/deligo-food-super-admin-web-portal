"use client";

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
import { TAgent } from "@/types/user.type";
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

interface IProps {
  agents: TAgent[];
  handleStatusInfo: (
    agentId: string,
    agentName: string,
    status: string,
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function FleetManagerTable({
  agents,
  handleStatusInfo,
  handleDeleteId,
}: IProps) {
  const { t } = useTranslation();
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
          {agents?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                {t("no_fleet_managers_found")}
              </TableCell>
            </TableRow>
          )}
          {agents?.map((agent) => (
            <TableRow key={agent._id}>
              <TableCell>
                {agent?.businessDetails?.businessName || "N/A"}
              </TableCell>
              <TableCell>{agent.email}</TableCell>
              <TableCell>{agent.contactNumber}</TableCell>
              <TableCell>
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
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              agent.userId as string,
                              agent.businessDetails?.businessName as string,
                              "APPROVED",
                            )
                          }
                        >
                          {t("approve")}
                        </DropdownMenuItem>
                      )}
                      {agent.status === "SUBMITTED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              agent.userId as string,
                              agent.businessDetails?.businessName as string,
                              "REJECTED",
                            )
                          }
                        >
                          {t("reject")}
                        </DropdownMenuItem>
                      )}
                      {agent.status === "APPROVED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              agent.userId as string,
                              agent.businessDetails?.businessName as string,
                              "BLOCKED",
                            )
                          }
                        >
                          {t("block")}
                        </DropdownMenuItem>
                      )}
                      {agent.status === "BLOCKED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              agent.userId as string,
                              agent.businessDetails?.businessName as string,
                              "UNBLOCKED",
                            )
                          }
                        >
                          {t("unblock")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteId(agent.userId)}
                      >
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
