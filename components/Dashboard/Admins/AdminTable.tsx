"use client";

import RoleBadge from "@/components/Dashboard/Admins/RoleBadge";
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
import { TAdmin } from "@/types/admin.type";
import { motion } from "framer-motion";
import {
  CircleCheckBig,
  Cog,
  IdCard,
  Mail,
  MoreVertical,
  ShieldUser,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  admins: TAdmin[];
  handleStatusInfo: (
    adminId: string,
    adminName: string,
    status: string,
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function AdminTable({
  admins,
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
                <ShieldUser className="w-4" />
                Role
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
          {admins?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                No admins found
              </TableCell>
            </TableRow>
          )}
          {admins?.map((admin) => (
            <TableRow key={admin._id}>
              <TableCell>
                {admin.name?.firstName} {admin.name?.lastName}
              </TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>
                <RoleBadge role={admin.role} />
              </TableCell>
              <TableCell>
                {admin.isDeleted ? "Deleted" : admin.status}
              </TableCell>
              <TableCell className="text-right">
                {!admin.isDeleted && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className=""
                        onClick={() =>
                          router.push("/admin/admin/" + admin.userId)
                        }
                      >
                        View
                      </DropdownMenuItem>
                      {admin.status === "APPROVED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              admin.userId as string,
                              `${admin.name?.firstName} ${admin.name?.lastName}`,
                              "BLOCKED",
                            )
                          }
                        >
                          Block
                        </DropdownMenuItem>
                      )}
                      {admin.status === "BLOCKED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              admin.userId as string,
                              `${admin.name?.firstName} ${admin.name?.lastName}`,
                              "UNBLOCKED",
                            )
                          }
                        >
                          Unblock
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteId(admin.userId)}
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
