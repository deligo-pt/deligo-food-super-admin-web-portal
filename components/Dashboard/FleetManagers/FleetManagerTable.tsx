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
                Name
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Mail className="w-4" />
                Email
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Phone className="w-4" />
                Phone
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CircleCheckBig className="w-4" />
                Status
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              Actions
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
                No fleet managers found
              </TableCell>
            </TableRow>
          )}
          {agents?.map((agent) => (
            <TableRow key={agent._id}>
              <TableCell>
                {agent.name?.firstName} {agent.name?.lastName}
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
                        View
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
                          Approve
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
                          Reject
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
                          Block
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
                          Unblock
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteId(agent.userId)}
                      >
                        Delete
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
