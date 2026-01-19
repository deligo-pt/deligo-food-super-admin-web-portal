"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TMeta } from "@/types";
import { TVendor } from "@/types/user.type";
import { motion } from "framer-motion";
import { BarChart2, Eye, FileText, MapPin, Store } from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  vendorsResult: { data: TVendor[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

export default function ActiveVendors({ vendorsResult }: IProps) {
  const router = useRouter();

  function exportCSV() {
    const rows = [
      [
        "ID",
        "Name",
        "Owner",
        "Phone",
        "City",
        "Active",
        "Total Orders",
        "Rating",
        "Documents",
      ],
      ...vendorsResult?.data?.map((v) => [
        v.userId,
        v.businessDetails?.businessName,
        `${v.name?.firstName} ${v.name?.lastName}`,
        v.contactNumber,
        v.address?.city,
        v.status === "APPROVED" ? "Yes" : "No",
        String(v.totalOrders),
        String(v.rating?.average),
        // v.zones.join('|'),
        Object.values(v.documents || {}).filter((v) => !!v).length === 5
          ? "Uploaded"
          : 5 -
            Object.values(v.documents || {}).filter((v) => !!v).length +
            " Missing",
      ]),
    ];

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `active_vendors_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  //   const zones = Array.from(new Set(vendors.flatMap((v) => v.zones)));

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Store className="w-6 h-6 text-slate-800" />
              Active Vendors
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage live vendors on Deligo Portugal — monitor performance, live
              orders and status
            </p>
          </div>
          \
        </div>

        <AllFilters sortOptions={sortOptions} />

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-lg flex items-center gap-2">
                  <Store className="w-4 h-4" /> Active Vendors:{" "}
                  {vendorsResult?.meta?.total}
                </h2>
                <Button size="sm" variant="outline" onClick={exportCSV}>
                  Export CSV
                </Button>
              </div>

              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white">
                      <TableCell className="pl-6">Vendor</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Total Orders</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Docs</TableCell>
                      <TableCell className="text-right pr-6">Actions</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {vendorsResult?.data?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="py-12 text-center text-slate-500">
                            No active vendors found.
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
                                  src={v.profilePhoto}
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
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1">
                                    <Store className="w-4 h-4 text-slate-700" />
                                    {v.businessDetails?.businessName}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400">
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
                            <div className="inline-flex items-center gap-2">
                              <div className="font-medium">{v.totalOrders}</div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BarChart2 className="w-4 h-4 text-slate-600" />
                              <div className="font-medium">
                                {v.rating?.average?.toFixed(1)}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">
                                {Object.values(v.documents || {}).filter(
                                  (v) => !!v,
                                ).length === 5
                                  ? "Uploaded"
                                  : 5 -
                                    Object.values(v.documents || {}).filter(
                                      (v) => !!v,
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
                                <Eye className="w-4 h-4" />
                                View
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
    </div>
  );
}
