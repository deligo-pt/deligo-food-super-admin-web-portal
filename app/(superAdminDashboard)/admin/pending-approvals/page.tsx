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
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MapPin,
  Search,
  Store,
  User,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Deligo primary color
const DELIGO = "#DC3173";

type Vendor = {
  id: string;
  name: string;
  owner: string;
  phone: string;
  city: string;
  cuisine: string;
  createdAt: string;
  documentsUploaded: boolean;
};

export default function PendingApprovalsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // mock fetch
    setTimeout(() => {
      setVendors(mockVendors());
      setLoading(false);
    }, 600);
  }, []);

  const filtered = vendors.filter((v) =>
    [v.name, v.owner, v.city, v.cuisine]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function approveVendor(id: string) {
    // TODO: replace with API call (POST /api/admin/vendors/{id}/approve)
    setVendors((prev) => prev.filter((p) => p.id !== id));
  }

  function rejectVendor(id: string) {
    // TODO: replace with API call (POST /api/admin/vendors/{id}/reject)
    setVendors((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Store className="w-6 h-6 text-slate-800" />
              Pending Vendor Approvals
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review newly registered vendors before they go live on Deligo
              Portugal
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full max-w-md">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, owner, city or cuisine..."
                className="pr-12"
                aria-label="Search pending vendors"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Button
                  size="sm"
                  style={{ background: DELIGO, borderColor: DELIGO }}
                  onClick={() => {}}
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </motion.div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuery("");
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <StatCard
              title="Total Pending"
              value={`${vendors.length}`}
              icon={<Clock />}
              accent={DELIGO}
            />
            <StatCard
              title="With Documents"
              value={`${vendors.filter((v) => v.documentsUploaded).length}`}
              icon={<FileText />}
            />
            <StatCard
              title="Without Documents"
              value={`${vendors.filter((v) => !v.documentsUploaded).length}`}
              icon={<User />}
            />
          </div>

          {/* Table */}
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Approvals
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Region: Portugal</Badge>
                  <Button variant="ghost" size="sm">
                    Bulk Actions
                  </Button>
                </div>
              </div>

              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHead>
                    <TableRow className="bg-white">
                      <TableCell className="pl-6">Vendor</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Cuisine</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell className="text-right pr-6">Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="py-12 text-center">
                            <AnimatedSkeleton />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="py-12 text-center text-slate-500">
                            No pending vendors found.
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
                          transition={{ duration: 0.18 }}
                          className="bg-white"
                        >
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <motion.div whileHover={{ scale: 1.05 }}>
                                <Avatar>
                                  <AvatarImage
                                    src={`/images/vendors/${v.id}.jpg`}
                                    alt={v.name}
                                  />
                                  <AvatarFallback>
                                    {v.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .slice(0, 2)
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  <Store className="w-4 h-4 text-slate-700" />
                                  {v.name}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {v.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-600" />
                              <div>
                                <div className="font-medium">{v.owner}</div>
                                <div className="text-xs text-slate-400">
                                  {v.phone}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-600" />
                              {v.city}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-600" />
                              {v.cuisine}
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
                                onClick={() => setSelected(v)}
                              >
                                <Eye className="w-4 h-4 mr-2" /> View
                              </Button>
                              <motion.div whileTap={{ scale: 0.96 }}>
                                <Button
                                  size="sm"
                                  style={{
                                    background: DELIGO,
                                    borderColor: DELIGO,
                                  }}
                                  onClick={() => approveVendor(v.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />{" "}
                                  Approve
                                </Button>
                              </motion.div>
                              <motion.div whileTap={{ scale: 0.96 }}>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => rejectVendor(v.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> Reject
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

        {/* Details Dialog */}
        <Dialog
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Vendor Details</DialogTitle>
            </DialogHeader>

            {selected ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <Avatar className="w-32 h-32">
                      <AvatarImage
                        src={`/images/vendors/${selected.id}.jpg`}
                        alt={selected.name}
                      />
                      <AvatarFallback>
                        {selected.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">{selected.name}</h3>
                      <p className="text-sm text-slate-500">
                        {selected.cuisine}
                      </p>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" /> Owner: {selected.owner}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> City: {selected.city}
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Joined:{" "}
                          {new Date(selected.createdAt).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Documents:{" "}
                          {selected.documentsUploaded ? "Uploaded" : "Missing"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Documents
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-md border shadow-sm">
                        <div>
                          <div className="font-medium">Business License</div>
                          <div className="text-xs text-slate-400">Uploaded</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" /> View
                          </Button>
                          <Button size="sm">Download</Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-md border shadow-sm">
                        <div>
                          <div className="font-medium">Owner ID</div>
                          <div className="text-xs text-slate-400">Pending</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            Request
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelected(null)}
                      >
                        Close
                      </Button>
                      <Button
                        style={{ background: DELIGO, borderColor: DELIGO }}
                        onClick={() => {
                          if (selected) {
                            approveVendor(selected.id);
                            setSelected(null);
                          }
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (selected) {
                            rejectVendor(selected.id);
                            setSelected(null);
                          }
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            <DialogFooter />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* -------------------- Small Reusable Subcomponents -------------------- */

function StatCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="p-4 relative overflow-hidden">
      <div
        className="absolute -top-4 left-0 w-full h-1"
        style={{
          background: `linear-gradient(90deg, ${
            accent ?? "#7c3aed"
          }, rgba(0,0,0,0))`,
        }}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="text-2xl text-slate-700">
          {icon ?? <Clock className="w-6 h-6" />}
        </div>
      </div>
    </Card>
  );
}

function AnimatedSkeleton() {
  return (
    <div className="flex flex-col gap-3 items-center">
      <motion.div
        className="w-48 h-4 rounded bg-slate-200"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      />
      <motion.div
        className="w-64 h-4 rounded bg-slate-200"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.1, delay: 0.15 }}
      />
      <motion.div
        className="w-56 h-4 rounded bg-slate-200"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.3, delay: 0.25 }}
      />
    </div>
  );
}

/* ---------------------- MOCK DATA (Remove in production) ---------------------- */
function mockVendors(): Vendor[] {
  return Array.from({ length: 27 }).map((_, i) => ({
    id: `VND-${1000 + i}`,
    name: [
      "Casa Lisboa",
      "Prego Urban",
      "Sabor de Porto",
      "Pastelaria do Bairro",
      "Sushi Tejo",
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
    cuisine: ["Portuguese", "Fast Food", "Portuguese", "Bakery", "Japanese"][
      i % 5
    ],
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
    documentsUploaded: i % 3 !== 0,
  }));
}
