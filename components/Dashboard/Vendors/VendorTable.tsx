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
import { TVendor } from "@/types/user.type";
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
  vendors: TVendor[];
  handleStatusInfo: (
    vendorId: string,
    vendorName: string,
    status: string,
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function VendorTable({
  vendors,
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
          {vendors?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                No vendors found
              </TableCell>
            </TableRow>
          )}
          {vendors?.map((vendor) => (
            <TableRow key={vendor._id}>
              <TableCell>
                {vendor.name?.firstName} {vendor.name?.lastName}
              </TableCell>
              <TableCell>{vendor.email}</TableCell>
              <TableCell>{vendor.contactNumber}</TableCell>
              <TableCell>
                {vendor.isDeleted ? "Deleted" : vendor.status}
              </TableCell>
              <TableCell className="text-right">
                {!vendor.isDeleted && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className=""
                        onClick={() =>
                          router.push("/admin/vendor/" + vendor.userId)
                        }
                      >
                        View
                      </DropdownMenuItem>
                      {vendor.status === "SUBMITTED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              vendor.userId as string,
                              vendor.businessDetails?.businessName as string,
                              "APPROVED",
                            )
                          }
                        >
                          Approve
                        </DropdownMenuItem>
                      )}
                      {vendor.status === "SUBMITTED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              vendor.userId as string,
                              vendor.businessDetails?.businessName as string,
                              "REJECTED",
                            )
                          }
                        >
                          Reject
                        </DropdownMenuItem>
                      )}
                      {vendor.status === "APPROVED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              vendor.userId as string,
                              vendor.businessDetails?.businessName as string,
                              "BLOCKED",
                            )
                          }
                        >
                          Block
                        </DropdownMenuItem>
                      )}
                      {vendor.status === "BLOCKED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              vendor.userId as string,
                              vendor.businessDetails?.businessName as string,
                              "UNBLOCKED",
                            )
                          }
                        >
                          Unblock
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteId(vendor.userId)}
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
