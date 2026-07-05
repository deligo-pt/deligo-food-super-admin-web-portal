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
import { TCustomer } from "@/types/user.type";
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
  customers: TCustomer[];
  handleStatusInfo: (
    customerId: string,
    customerName: string,
    status: string,
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function CustomerTable({
  customers,
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
          {customers?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                {t("no_customers_found")}
              </TableCell>
            </TableRow>
          )}
          {customers?.map((customer) => (
            <TableRow key={customer._id}>
              <TableCell>
                {customer.name?.firstName || customer.name?.lastName
                  ? `${customer.name?.firstName} ${customer.name?.lastName}`
                  : "N/A"}
              </TableCell>
              <TableCell>{customer.email || "N/A"}</TableCell>
              <TableCell>{customer.contactNumber}</TableCell>
              <TableCell>
                {customer.isDeleted ? "Deleted" : customer.status}
              </TableCell>
              <TableCell className="text-right">
                {!customer.isDeleted && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className=""
                        onClick={() =>
                          router.push(`/admin/all-customers/${customer.userId}`)
                        }
                      >
                        {t("view")}
                      </DropdownMenuItem>
                      {customer.status === "APPROVED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              customer.userId as string,
                              `${customer.name?.firstName} ${customer.name?.lastName}`,
                              "BLOCKED",
                            )
                          }
                        >
                          {t("block")}
                        </DropdownMenuItem>
                      )}
                      {customer.status === "BLOCKED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              customer.userId as string,
                              `${customer.name?.firstName} ${customer.name?.lastName}`,
                              "UNBLOCKED",
                            )
                          }
                        >
                          {t("unblock")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteId(customer.userId)}
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
