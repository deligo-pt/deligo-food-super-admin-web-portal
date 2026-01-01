"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import { TMeta } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { format } from "date-fns";
import { CheckCircle, UserPlus, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DELIGO = "#DC3173";

interface IProps {
  partnersResult: { data: TDeliveryPartner[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

export default function DeliveryPartnerOnboardingRequests({
  partnersResult,
}: IProps) {
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    deliveryPartnerId: "",
    deliveryPartnerName: "",
    status: "",
  });

  function exportCSV() {
    const rows = [
      [
        "ID",
        "Name",
        "Email",
        "Phone",
        "City",
        "Vehicle",
        "Status",
        "AppliedAt",
      ],
    ];
    partnersResult?.data?.forEach((r) =>
      rows.push([
        r.userId,
        `${r.name?.firstName} ${r.name?.lastName}`,
        r.email,
        r.contactNumber || "",
        r.address?.city || "",
        r.vehicleInfo?.vehicleType || "",
        r.status,
        format(r.updatedAt as Date, "yyyy-MM-dd"),
      ])
    );
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `onboarding_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold mb-6 flex items-center gap-3"
        >
          <UserPlus className="w-7 h-7" style={{ color: DELIGO }} /> Delivery
          Partner — Onboarding Requests
        </motion.h1>
        <div>
          <Button onClick={exportCSV} variant="outline">
            Export CSV
          </Button>
        </div>
      </div>

      <AllFilters sortOptions={sortOptions} />

      {/* List / Table */}
      <Card className="p-0 overflow-x-auto rounded-xl shadow-sm border">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left w-[220px]">Applicant</th>
              <th className="px-4 py-3 text-left w-[140px]">Vehicle</th>
              <th className="px-4 py-3 text-left w-[120px]">City</th>
              <th className="px-4 py-3 text-center w-[140px]">Applied</th>
              <th className="px-4 py-3 text-center w-[140px]">Status</th>
              <th className="px-4 py-3 text-center w-[220px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {partnersResult?.data?.length === 0 && (
              <tr key="no-partners" className="hover:bg-slate-50 align-top">
                <td className="px-4 py-4 text-center" colSpan={6}>
                  No requests found.
                </td>
              </tr>
            )}
            {partnersResult?.data?.map((r) => (
              <tr key={r._id} className="hover:bg-slate-50 align-top">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={r.profilePhoto} />
                      <AvatarFallback>
                        {r.name?.firstName?.[0]}
                        {r.name?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {r.name?.firstName} {r.name?.lastName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {r.email}
                      </div>
                      <div className="text-xs text-slate-400">
                        {r.contactNumber}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  {r.vehicleInfo?.vehicleType || "—"}
                </td>
                <td className="px-4 py-4 text-center">
                  {r.address?.city || "—"}
                </td>
                <td className="px-4 py-4 text-center text-slate-600">
                  {new Date(r.updatedAt as Date).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-center">{r.status}</td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() =>
                        router.push(`/admin/all-delivery-partners/${r.userId}`)
                      }
                      size="sm"
                      variant="ghost"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() =>
                        setStatusInfo({
                          deliveryPartnerId: r.userId,
                          status: "APPROVED",
                          deliveryPartnerName: `${r.name?.firstName} ${r.name?.lastName}`,
                        })
                      }
                      size="sm"
                      style={{ background: DELIGO }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() =>
                        setStatusInfo({
                          deliveryPartnerId: r.userId,
                          status: "REJECTED",
                          deliveryPartnerName: `${r.name?.firstName} ${r.name?.lastName}`,
                        })
                      }
                      size="sm"
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {!!partnersResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6 mt-4"
        >
          <PaginationComponent
            totalPages={partnersResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      <ApproveOrRejectModal
        open={statusInfo?.deliveryPartnerId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({
            deliveryPartnerId: "",
            status: "",
            deliveryPartnerName: "",
          })
        }
        status={statusInfo.status as "APPROVED" | "REJECTED"}
        userId={statusInfo.deliveryPartnerId}
        userName={statusInfo.deliveryPartnerName}
      />
    </div>
  );
}
