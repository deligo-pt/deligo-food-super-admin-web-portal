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
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { motion } from "framer-motion";
import {
  CircleCheckBig,
  Cog,
  IdCard,
  ListIcon,
  Mail,
  MoreVertical,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  partners: TDeliveryPartner[];
  handleStatusInfo: (
    partnerId: string,
    partnerName: string,
    status: string,
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function DeliveryPartnerTable({
  partners,
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
                <ListIcon className="w-4" />
                {t("associated_fleet")}
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
          {partners?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                {t("no_partners_found")}
              </TableCell>
            </TableRow>
          )}
          {partners?.map((partner) => (
            <TableRow key={partner._id}>
              <TableCell>
                {partner?.registeredBy?.id?.name?.firstName} {partner?.registeredBy?.id?.name?.lastName}
              </TableCell>
              <TableCell>
                {partner.name?.firstName} {partner.name?.lastName}
              </TableCell>
              <TableCell>{partner.email}</TableCell>
              <TableCell>{partner.contactNumber}</TableCell>
              <TableCell>
                {partner.isDeleted ? "Deleted" : partner.status}
              </TableCell>
              <TableCell className="text-right">
                {!partner.isDeleted && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className=""
                        onClick={() =>
                          router.push(
                            "/admin/all-delivery-partners/" + partner.userId,
                          )
                        }
                      >
                        {t("view")}
                      </DropdownMenuItem>
                      {partner.status === "SUBMITTED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              partner.userId as string,
                              `${partner.name?.firstName} ${partner.name?.lastName}`,
                              "APPROVED",
                            )
                          }
                        >
                          {t("approve")}
                        </DropdownMenuItem>
                      )}
                      {partner.status === "SUBMITTED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              partner.userId as string,
                              `${partner.name?.firstName} ${partner.name?.lastName}`,
                              "REJECTED",
                            )
                          }
                        >
                          {t("reject")}
                        </DropdownMenuItem>
                      )}
                      {partner.status === "APPROVED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              partner.userId as string,
                              `${partner.name?.firstName} ${partner.name?.lastName}`,
                              "BLOCKED",
                            )
                          }
                        >
                          {t("block")}
                        </DropdownMenuItem>
                      )}
                      {partner.status === "BLOCKED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusInfo(
                              partner.userId as string,
                              `${partner.name?.firstName} ${partner.name?.lastName}`,
                              "UNBLOCKED",
                            )
                          }
                        >
                          {t("unblock")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteId(partner.userId)}
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
