"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TVendor } from "@/types/user.type";
import { getSortOptions } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  Eye,
  FileText,
  MapPin,
  Store,
  Undo2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DELIGO = "#DC3173";

interface IProps {
  vendorsResult: { data: TVendor[]; meta?: TMeta };
}

export default function SuspendedVendors({ vendorsResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    open: false,
    vendorId: "",
    vendorName: "",
  });

  const closeApproveOrRejectModal = (open: boolean) => {
    if (!open) {
      setStatusInfo({
        open: false,
        vendorId: "",
        vendorName: "",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-full mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Ban className="w-6 h-6 text-red-600" /> {t("suspended_vendors")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t("manage_review_vendors_suspended_due_policy")}
            </p>
          </div>
        </div>

        <AllFilters sortOptions={sortOptions} />

        {/* TABLE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-lg flex items-center gap-2">
                  <Ban className="w-4 h-4 text-red-600" /> {t("suspended_vendors")}:{" "}
                  {vendorsResult?.meta?.total}
                </h2>
                <Badge variant="outline">{t("portugal")}</Badge>
              </div>

              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white">
                      <TableCell className="pl-6">{t("vendor")}</TableCell>
                      <TableCell>{t("city")}</TableCell>
                      <TableCell>{t("reason")}</TableCell>
                      <TableCell>{t("suspended_on")}</TableCell>
                      <TableCell>{t("documents")}</TableCell>
                      <TableCell className="text-right pr-6">{t("actions")}</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {vendorsResult?.data?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="py-12 text-center text-slate-500">
                            {t("no_suspended_vendors_found")}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendorsResult?.data?.map((v) => (
                        <motion.tr
                          key={v._id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ translateY: -4 }}
                          transition={{ duration: 0.16 }}
                          className="bg-white"
                        >
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={v?.profilePhoto}
                                  alt={v.businessDetails?.businessName}
                                />
                                <AvatarFallback>
                                  {v.businessDetails?.businessName
                                    ?.split(" ")
                                    ?.map((n) => n[0])
                                    ?.join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold flex items-center gap-2">
                                  <Store className="w-4 h-4 text-slate-700" />{" "}
                                  {v.businessDetails?.businessName}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {v.name?.firstName} {v.name?.lastName} •{" "}
                                  {v.contactNumber}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />{" "}
                              {v.businessLocation?.city}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="text-xs flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" /> {v.remarks}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {v.approvedOrRejectedOrBlockedAt
                              ? new Date(
                                v.approvedOrRejectedOrBlockedAt
                              ).toLocaleDateString("en-GB")
                              : ""}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>
                                {Object.values(v.documents || {}).filter(
                                  (v) => !!v
                                ).length === 5
                                  ? "Uploaded"
                                  : 5 -
                                  Object.values(v.documents || {}).filter(
                                    (v) => !!v
                                  ).length +
                                  " Missing"}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  router.push(`/admin/vendor/${v.userId}`)
                                }
                              >
                                <Eye className="w-4 h-4 mr-2" /> {t("view")}
                              </Button>
                              <Button
                                size="sm"
                                style={{ background: DELIGO }}
                                onClick={() =>
                                  setStatusInfo({
                                    open: true,
                                    vendorId: v.userId,
                                    vendorName:
                                      v.businessDetails?.businessName || "",
                                  })
                                }
                              >
                                <Undo2 className="w-4 h-4 mr-2" /> {t("reinstate")}
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {!!vendorsResult?.meta?.total &&
                vendorsResult?.meta?.total > 0 && (
                  <div className="px-6 mt-4">
                    <PaginationComponent
                      totalPages={vendorsResult?.meta?.totalPage || 0}
                    />
                  </div>
                )}
            </div>
          </Card>
        </motion.div>
      </div>
      <ApproveOrRejectModal
        open={statusInfo?.open}
        onOpenChange={closeApproveOrRejectModal}
        status="UNBLOCKED"
        userId={statusInfo?.vendorId}
        userName={statusInfo?.vendorName}
      />
    </div>
  );
}
