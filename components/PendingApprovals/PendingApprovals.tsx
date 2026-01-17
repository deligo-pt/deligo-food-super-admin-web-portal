"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
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
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MapPin,
  Store,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Deligo primary color
const DELIGO = "#DC3173";

// type Vendor = {
//   id: string;
//   name: string;
//   owner: string;
//   phone: string;
//   city: string;
//   cuisine: string;
//   createdAt: string;
//   documentsUploaded: boolean;
// };

interface IProps {
  vendorsResult: { data: TVendor[]; meta?: TMeta };
}

export default function PendingApprovals({ vendorsResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);
  const [statusInfo, setStatusInfo] = useState({
    vendorId: "",
    vendorName: "",
    status: "",
  });
  const router = useRouter();

  function closeApproveRejectModal(open: boolean) {
    if (!open) {
      setStatusInfo({
        vendorId: "",
        vendorName: "",
        status: "",
      });
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Store className="w-6 h-6 text-slate-800" />
              {t("pending_vendor_approvals")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t("review_newly_registered_vendors")}
            </p>
          </div>
        </div>

        <AllFilters sortOptions={sortOptions} />

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Table */}
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="p-4 sm:p-6">
              <h2 className="font-medium text-lg flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" />
                {t("pending_approvals")}: {vendorsResult?.meta?.total || 0}
              </h2>

              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white">
                      <TableCell className="pl-6">{t("vendor")}</TableCell>
                      <TableCell>{t("owner")}</TableCell>
                      <TableCell>{t("city")}</TableCell>
                      <TableCell>{t("cuisine")}</TableCell>
                      <TableCell>{t("submitted")}</TableCell>
                      <TableCell className="text-right pr-6">{t("actions")}</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {vendorsResult?.data?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="py-12 text-center text-slate-500">
                            {t("no_pending_vendors_found")}
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
                          transition={{ duration: 0.18 }}
                          className="bg-white"
                        >
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <motion.div whileHover={{ scale: 1.05 }}>
                                <Avatar>
                                  <AvatarImage
                                    src={v.profilePhoto}
                                    alt={`${v.name?.firstName} ${v.name?.lastName}`}
                                  />
                                  <AvatarFallback>
                                    {v.name?.firstName?.[0]}
                                    {v.name?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  <Store className="w-4 h-4 text-slate-700" />
                                  {v?.businessDetails?.businessName}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {v.userId}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-600" />
                              <div>
                                <div className="font-medium">
                                  {v.name?.firstName} {v.name?.lastName}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {v.contactNumber}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-600" />
                              {v.businessLocation?.city}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-600" />
                              {/* {v.cuisine} */}
                            </div>
                          </TableCell>

                          <TableCell>
                            {new Date(v.createdAt).toLocaleDateString("en-GB")}
                          </TableCell>

                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                // onClick={() => setSelected(v)}
                                onClick={() =>
                                  router.push(`/admin/vendor/${v.userId}`)
                                }
                              >
                                <Eye className="w-4 h-4 mr-2" /> {t("view")}
                              </Button>
                              <motion.div whileTap={{ scale: 0.96 }}>
                                <Button
                                  size="sm"
                                  style={{
                                    background: DELIGO,
                                    borderColor: DELIGO,
                                  }}
                                  onClick={() =>
                                    setStatusInfo({
                                      vendorId: v.userId,
                                      vendorName: `${v.name?.firstName} ${v.name?.lastName}`,
                                      status: "APPROVED",
                                    })
                                  }
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />{" "}
                                  {t("approve")}
                                </Button>
                              </motion.div>
                              <motion.div whileTap={{ scale: 0.96 }}>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    setStatusInfo({
                                      vendorId: v.userId,
                                      vendorName: `${v.name?.firstName} ${v.name?.lastName}`,
                                      status: "REJECTED",
                                    })
                                  }
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> {t("reject")}
                                </Button>
                              </motion.div>
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

        <ApproveOrRejectModal
          open={!!statusInfo.vendorId}
          userId={statusInfo.vendorId}
          userName={statusInfo.vendorName}
          status={statusInfo.status as "APPROVED" | "REJECTED"}
          onOpenChange={closeApproveRejectModal}
        />
      </div>
    </div>
  );
}
