/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { TMeta, TResponse } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { getCookie } from "@/utils/cookies";
import { deleteData } from "@/utils/requests";
import { format } from "date-fns";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { getSortOptions } from "@/utils/sortOptions";

const DELIGO = "#DC3173";

interface IProps {
  partnersResult: { data: TDeliveryPartner[]; meta?: TMeta };
}

export default function SuspendedDeliveryPartners({ partnersResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [statusInfo, setStatusInfo] = useState({
    deliveryPartnerId: "",
    deliveryPartnerName: "",
  });
  const [deleteId, setDeleteId] = useState("");

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  // Export CSV
  function exportCSV() {
    setIsExporting(true);
    try {
      const rows = [
        ["ID", "Name", "Email", "City", "Rating", "SuspendedAt", "Reason"],
      ];
      partnersResult?.data?.forEach((p) =>
        rows.push([
          p.userId,
          `${p.name?.firstName} ${p.name?.lastName}`,
          p.email,
          p.address?.city || "",
          String(p.operationalData?.rating?.average),
          p.approvedOrRejectedOrBlockedAt
            ? format(p.approvedOrRejectedOrBlockedAt, "dd/MM/yyyy")
            : "",
          p.remarks || "",
        ])
      );
      const csv = rows
        .map((r) =>
          r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `suspended_partners_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("CSV export failed", e);
    } finally {
      setIsExporting(false);
    }
  }

  // Export PDF (prints the visible table area)
  async function exportPDF() {
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const el = document.getElementById("suspended-print-area");
      if (!el) return window.print();
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const props = (pdf as any).getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (props.height * pdfWidth) / props.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `suspended_partners_${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } catch (err) {
      // fallback to print

      console.warn("PDF export error, falling back to print", err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  }

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
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6 flex items-center gap-3"
      >
        <AlertTriangle className="w-8 h-8" style={{ color: DELIGO }} />{" "}
        {t("suspended_delivery_partners")}
      </motion.h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500">{t("total_suspended")}</p>
          <h3 className="text-2xl font-bold">{partnersResult?.meta?.total}</h3>
        </Card>
        <div />
        <div />
        <Card className="p-4">
          <p className="text-xs text-slate-500">{t("actions")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => exportCSV()}
              disabled={isExporting}
            >
              <Download className="w-4 h-4" /> {t("export_csv")}
            </Button>
            <Button
              onClick={exportPDF}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> {t("export_pdf")}
            </Button>
            <Button variant="outline" onClick={() => router.refresh()}>
              <RefreshCcw className="w-4 h-4" /> {t("reload")}
            </Button>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Table area (printable id used for PDF) */}
      <div
        id="suspended-print-area"
        className="rounded-xl bg-white shadow-sm overflow-x-auto border"
      >
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left w-[260px]">{t("partner")}</th>
              <th className="px-4 py-3 text-center w-[120px]">{t("city")}</th>
              <th className="px-4 py-3 text-center w-[120px]">{t("rating")}</th>
              <th className="px-4 py-3 text-center w-[180px]">{t("suspended_at")}</th>
              <th className="px-4 py-3 text-left w-[320px]">{t("reason")}</th>
              <th className="px-4 py-3 text-center w-[200px]">{t("actions")}</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {partnersResult?.data?.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50 align-top">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={p.profilePhoto} />
                      <AvatarFallback>
                        {p.name?.firstName || p.name?.lastName
                          ? `${p.name?.firstName?.charAt(
                            0
                          )}${p.name?.lastName?.charAt(0)}`
                          : ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {p.name?.firstName} {p.name?.lastName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {p.email}
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.contactNumber}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-center">{p.address?.city}</td>
                <td className="px-4 py-4 text-center font-semibold">
                  {p.operationalData?.rating?.average}
                </td>

                <td className="px-4 py-4 text-center text-slate-600">
                  {p.approvedOrRejectedOrBlockedAt
                    ? format(p.approvedOrRejectedOrBlockedAt, "dd/MM/yyyy")
                    : "N/A"}
                </td>

                <td className="px-4 py-4">{p.remarks}</td>

                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/admin/all-delivery-partners/${p.userId}`)
                      }
                      aria-label={`View ${p.name} details`}
                    >
                      {t("view")}
                    </Button>
                    <Button
                      size="sm"
                      style={{ background: DELIGO }}
                      aria-label={`Reactivate ${p.name}`}
                      onClick={() =>
                        setStatusInfo({
                          deliveryPartnerId: p.userId,
                          deliveryPartnerName: `${p.name?.firstName} ${p.name?.lastName}`,
                        })
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t("reactivate")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      aria-label={`Delete ${p.name}`}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {t("delete")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {partnersResult?.data?.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  {t("no_suspended_partners_match_your_filters")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!!partnersResult?.meta?.total && partnersResult?.meta?.total > 0 && (
        <div className="px-6 mt-4">
          <PaginationComponent
            totalPages={partnersResult?.meta?.totalPage || 0}
          />
        </div>
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
            deliveryPartnerName: "",
          })
        }
        status="UNBLOCKED"
        userId={statusInfo?.deliveryPartnerId}
        userName={statusInfo?.deliveryPartnerName}
      />
    </div>
  );
}
