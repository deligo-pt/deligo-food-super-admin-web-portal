/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  Eye,
  FileText,
  Info,
  MapPin,
  Search,
  Store,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";

const DELIGO = "#DC3173";

type SuspendedVendor = {
  id: string;
  name: string;
  owner: string;
  phone: string;
  city: string;
  cuisine: string;
  suspendedAt: string;
  reason: string;
  documentsFlagged: boolean;
  zones: string[];
};

export default function SuspendedVendorsPage() {
  const [vendors, setVendors] = useState<SuspendedVendor[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SuspendedVendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterReason, setFilterReason] = useState<
    "all" | "docs" | "fraud" | "violation"
  >("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setVendors(mockSuspendedVendors());
      setLoading(false);
    }, 600);
  }, []);

  const filtered = vendors
    .filter((v) =>
      [v.name, v.owner, v.city, v.cuisine, v.reason]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    .filter((v) => {
      if (filterReason === "all") return true;
      if (filterReason === "docs") return v.reason.includes("Document");
      if (filterReason === "fraud") return v.reason.includes("Fraud");
      return v.reason.includes("Policy");
    });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function reinstateVendor(id: string) {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-full mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Ban className="w-6 h-6 text-red-600" /> Suspended Vendors
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and review vendors suspended due to policy violations,
              fraud or document issues.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full max-w-md">
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, owner, city, cuisine or reason..."
                className="pr-12"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button
                  size="sm"
                  style={{ background: DELIGO, borderColor: DELIGO }}
                >
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuery("");
                setFilterReason("all");
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Card className="p-4 flex items-center gap-3 shadow-sm border-l-4 border-red-500">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="text-xs text-slate-500">Total Suspended</div>
                  <div className="font-semibold text-slate-900">
                    {vendors.length}
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterReason}
                onChange={(e) => {
                  setFilterReason(e.target.value as any);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-md bg-white border"
              >
                <option value="all">All Reasons</option>
                <option value="docs">Document Issues</option>
                <option value="fraud">Fraud / Scam</option>
                <option value="violation">Policy Violations</option>
              </select>
            </div>
          </div>
        </motion.div>

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
                  <Ban className="w-4 h-4 text-red-600" /> Suspended Vendor List
                </h2>
                <Badge variant="outline">Portugal</Badge>
              </div>

              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white">
                      <TableCell className="pl-6">Vendor</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Suspended On</TableCell>
                      <TableCell>Documents</TableCell>
                      <TableCell className="text-right pr-6">Actions</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="py-12 text-center text-slate-500">
                            Loading suspended vendors...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="py-12 text-center text-slate-500">
                            No suspended vendors found.
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((v) => (
                        <motion.tr
                          key={v.id}
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
                                  src={`/images/vendors/${v.id}.jpg`}
                                  alt={v.name}
                                />
                                <AvatarFallback>{v.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold flex items-center gap-2">
                                  <Store className="w-4 h-4 text-slate-700" />{" "}
                                  {v.name}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {v.owner} • {v.phone}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" /> {v.city}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="text-xs flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" /> {v.reason}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {new Date(v.suspendedAt).toLocaleDateString(
                              "en-GB"
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>
                                {v.documentsFlagged ? "Flagged" : "Clear"}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelected(v)}
                              >
                                <Eye className="w-4 h-4 mr-2" /> View
                              </Button>
                              <Button
                                size="sm"
                                style={{ background: DELIGO }}
                                onClick={() => reinstateVendor(v.id)}
                              >
                                <Undo2 className="w-4 h-4 mr-2" /> Reinstate
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Showing {paginated.length} of {filtered.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                  >
                    Prev
                  </Button>
                  <div className="px-3 py-1 rounded-md bg-white border">
                    {page}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* DETAILS MODAL */}
        <Dialog
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Suspended Vendor Details</DialogTitle>
            </DialogHeader>

            {selected && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <Avatar className="w-32 h-32">
                    <AvatarImage
                      src={`/images/vendors/${selected.id}.jpg`}
                      alt={selected.name}
                    />
                    <AvatarFallback>{selected.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold">{selected.name}</h3>
                    <p className="text-sm text-slate-500">{selected.cuisine}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {selected.city}
                    </p>
                  </div>
                </div>

                <div className="col-span-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4" /> Suspension Details
                  </h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <div>
                      <strong>Owner:</strong> {selected.owner}
                    </div>
                    <div>
                      <strong>Phone:</strong> {selected.phone}
                    </div>
                    <div>
                      <strong>Suspended On:</strong>{" "}
                      {new Date(selected.suspendedAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />{" "}
                      {selected.reason}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Zones
                  </h4>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {selected.zones.map((z) => (
                      <Badge key={z}>{z}</Badge>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelected(null)}>
                      Close
                    </Button>
                    <Button
                      style={{ background: DELIGO }}
                      onClick={() => {
                        reinstateVendor(selected.id);
                        setSelected(null);
                      }}
                    >
                      <Undo2 className="w-4 h-4 mr-2" /> Reinstate
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* ---------------------- MOCK DATA ---------------------- */
function mockSuspendedVendors(): SuspendedVendor[] {
  const reasons = [
    "Document Verification Failed",
    "Fraudulent Activity Detected",
    "Policy Violation: Late Orders",
    "Policy Violation: Fake Menu Items",
  ];

  return Array.from({ length: 20 }).map((_, i) => ({
    id: `S-VND-${3000 + i}`,
    name: [
      "Casa Lisboa",
      "Urban Grill",
      "Pasta Nova",
      "Veggi Porto",
      "Sushi Wave",
    ][i % 5],
    owner: [
      "João Silva",
      "Maria Fernandes",
      "Carlos Sousa",
      "Ana Pereira",
      "Rui Costa",
    ][i % 5],
    phone: [
      "+35191000000",
      "+35192000000",
      "+35193000000",
      "+35194000000",
      "+35195000000",
    ][i % 5],
    city: ["Lisbon", "Porto", "Coimbra", "Faro", "Braga"][i % 5],
    cuisine: ["Portuguese", "Fast Food", "Italian", "Vegan", "Japanese"][i % 5],
    suspendedAt: new Date(Date.now() - i * 86400000).toISOString(),
    reason: reasons[i % reasons.length],
    documentsFlagged: i % 3 === 0,
    zones: ["Lisbon Central", "Porto Centro", "Coimbra Oeste"].slice(
      0,
      (i % 3) + 1
    ),
  }));
}
