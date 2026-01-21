/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ---------------------- Types ----------------------
type DisputeRow = {
  id: string;
  date: string; // YYYY-MM-DD
  orderId: string;
  vendor: string;
  customer: string;
  reason: string;
  details?: string;
  attachments?: string[]; // urls (placeholder)
  amount: number;
  status: "Open" | "Resolved" | "Pending Vendor" | "Pending Customer";
};

// ---------------------- Sample Data (client-only placeholder) ----------------------
const statuses = [
  "Open",
  "Resolved",
  "Pending Vendor",
  "Pending Customer",
] as const;

const sampleRows: DisputeRow[] = Array.from({ length: 42 }).map((_, i) => ({
  id: `DP-${4000 + i}`,
  date: `2025-11-${((i % 28) + 1).toString().padStart(2, "0")}`,
  orderId: `ORD-${2000 + i}`,
  vendor: `Vendor ${(i % 6) + 1}`,
  customer: `Customer ${(i % 10) + 1}`,
  reason: [
    "Wrong item delivered",
    "Food cold",
    "Extra charge complaint",
    "Late delivery",
  ][i % 4],
  details:
    "Customer reported wrong item. Vendor claims packed correctly. Photos attached.",
  attachments: [],
  amount: Math.round((Math.random() * 50 + 5) * 100) / 100,
  status: statuses[i % 4], // ← NOW it's literal union, NOT string
}));

// ---------------------- Helpers ----------------------
const formatCurrency = (v: number) => `€${v.toFixed(2)}`;
const toISO = (d: Date) => d.toISOString().slice(0, 10);

function useDebounced<T>(value: T, ms = 300) {
  const [state, setState] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setState(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return state;
}

// ---------------------- Component ----------------------
export default function PaymentDisputesPage() {
  // Local 'server' data - in real app replace with server fetch & pagination
  const [allRows, setAllRows] = useState<DisputeRow[]>(sampleRows);

  // UI controls
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 280);
  const [statusFilter, setStatusFilter] = useState<
    "all" | DisputeRow["status"]
  >("all");
  const [from, setFrom] = useState<string>(() =>
    toISO(new Date(new Date().setDate(new Date().getDate() - 30))),
  );
  const [to, setTo] = useState<string>(() => toISO(new Date()));
  const [preset, setPreset] = useState<string>("Last 30 days");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  // Drawer + modal state
  const [selected, setSelected] = useState<DisputeRow | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    action: "resolve" | "reject" | null;
  }>({ open: false, action: null });
  const [processingId, setProcessingId] = useState<string | null>(null);

  // apply preset
  useEffect(() => {
    const now = new Date();
    if (preset === "Last 7 days")
      setFrom(
        toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)),
      );
    if (preset === "Last 30 days")
      setFrom(
        toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)),
      );
    if (preset === "Last 90 days")
      setFrom(
        toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)),
      );
    if (preset === "Year to date") setFrom(`${now.getFullYear()}-01-01`);
    setTo(toISO(now));
  }, [preset]);

  // filtering + sorting
  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    const arr = allRows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.vendor.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    });

    const sorted = [...arr].sort((a, b) => {
      let val = 0;
      if (sortBy === "date")
        val = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount") val = a.amount - b.amount;
      return sortDir === "asc" ? val : -val;
    });
    return sorted;
  }, [allRows, debouncedQuery, statusFilter, from, to, sortBy, sortDir]);

  // pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  // summary counts
  const counts = useMemo(
    () => ({
      open: filtered.filter((r) => r.status === "Open").length,
      resolved: filtered.filter((r) => r.status === "Resolved").length,
      pendingVendor: filtered.filter((r) => r.status === "Pending Vendor")
        .length,
      pendingCustomer: filtered.filter((r) => r.status === "Pending Customer")
        .length,
    }),
    [filtered],
  );

  // CSV export
  const exportCSV = () => {
    const header = [
      "id",
      "date",
      "orderId",
      "vendor",
      "customer",
      "reason",
      "amount",
      "status",
    ];
    const csv = [header.join(",")]
      .concat(
        filtered.map((r) =>
          [
            r.id,
            r.date,
            r.orderId,
            r.vendor,
            r.customer,
            `"${r.reason.replace(/"/g, '""')}\``,
            r.amount.toFixed(2),
            r.status,
          ].join(","),
        ),
      )
      .join("");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-disputes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // API placeholders for Resolve / Reject
  const performAction = async (id: string, action: "resolve" | "reject") => {
    setProcessingId(id);
    try {
      // simulate network delay
      await new Promise((res) => setTimeout(res, 800));

      // optimistic update locally — in real app, call your API and refresh from server
      setAllRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: action === "resolve" ? "Resolved" : "Open" }
            : r,
        ),
      );

      // close modal + drawer if it was the selected
      setConfirmAction({ open: false, action: null });
      if (selected?.id === id)
        setSelected((prev) =>
          prev
            ? { ...prev, status: action === "resolve" ? "Resolved" : "Open" }
            : prev,
        );
    } catch (err) {
      console.log("action failed", err);
      alert("Action failed — try again");
    } finally {
      setProcessingId(null);
    }
  };

  // open detail
  const openDetail = (r: DisputeRow) => {
    setSelected(r);
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 overflow-x-hidden min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-[#DC3173]" /> Payment
            Disputes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Systematic dispute management with action controls and audit-ready
            export.
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#DC3173] text-white shadow"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard
          title="Open"
          value={counts.open}
          color="bg-red-50"
          icon={<AlertTriangle className="text-red-600 w-6 h-6" />}
          onClick={() => setStatusFilter("Open")}
        />
        <SummaryCard
          title="Resolved"
          value={counts.resolved}
          color="bg-green-50"
          icon={<CheckCircle className="text-green-600 w-6 h-6" />}
          onClick={() => setStatusFilter("Resolved")}
        />
        <SummaryCard
          title="Pending Vendor"
          value={counts.pendingVendor}
          color="bg-blue-50"
          icon={<Clock className="text-blue-600 w-6 h-6" />}
          onClick={() => setStatusFilter("Pending Vendor")}
        />
        <SummaryCard
          title="Pending Customer"
          value={counts.pendingCustomer}
          color="bg-orange-50"
          icon={<Clock className="text-orange-500 w-6 h-6" />}
          onClick={() => setStatusFilter("Pending Customer")}
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent outline-none text-sm"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
              <option value="Pending Vendor">Pending Vendor</option>
              <option value="Pending Customer">Pending Customer</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Year to date</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
            <input
              type="date"
              className="text-sm outline-none bg-transparent"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <span className="text-gray-300">—</span>
            <input
              type="date"
              className="text-sm outline-none bg-transparent"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 items-center w-full lg:w-auto">
          <div className="flex items-center bg-white px-3 py-2 rounded-lg border w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              aria-label="Search disputes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dispute, order, vendor, customer"
              className="ml-2 bg-transparent outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Rows</label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="px-2 py-1 rounded-md border"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop table (with internal horizontal scroll only) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="uppercase text-xs text-gray-500 border-b bg-white sticky top-0 z-10">
                <ThSortable
                  label="Date"
                  active={sortBy === "date"}
                  dir={sortDir}
                  onClick={() => {
                    if (sortBy === "date")
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    else {
                      setSortBy("date");
                      setSortDir("desc");
                    }
                  }}
                />
                <th className="py-3 px-3 text-left">Dispute ID</th>
                <th className="py-3 px-3 text-left">Order ID</th>
                <th className="py-3 px-3 text-left">Vendor</th>
                <th className="py-3 px-3 text-left">Customer</th>
                <th className="py-3 px-3 text-left">Reason</th>
                <ThSortable
                  label="Amount"
                  active={sortBy === "amount"}
                  dir={sortDir}
                  onClick={() => {
                    if (sortBy === "amount")
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    else {
                      setSortBy("amount");
                      setSortDir("desc");
                    }
                  }}
                />
                <th className="py-3 px-3 text-left">Status</th>
                <th className="py-3 px-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {paginated.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 whitespace-nowrap">{r.date}</td>
                  <td className="py-3 px-3 font-medium text-gray-800 whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">{r.orderId}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{r.vendor}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{r.customer}</td>
                  <td className="py-3 px-3 max-w-xs truncate text-gray-600">
                    {r.reason}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#DC3173] whitespace-nowrap">
                    {formatCurrency(r.amount)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetail(r)}
                        className="px-3 py-1 rounded-md border text-sm"
                      >
                        View
                      </button>
                      {r.status !== "Resolved" && (
                        <>
                          <button
                            onClick={() => {
                              setConfirmAction({
                                open: true,
                                action: "resolve",
                              });
                              setSelected(r);
                            }}
                            className="px-3 py-1 rounded-md bg-green-50 text-green-800 text-sm"
                          >
                            Resolve
                          </button>

                          <button
                            onClick={() => {
                              setConfirmAction({
                                open: true,
                                action: "reject",
                              });
                              setSelected(r);
                            }}
                            className="px-3 py-1 rounded-md bg-red-50 text-red-800 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{filtered.length}</span>{" "}
            disputes
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded-md"
            >
              Prev
            </button>
            <div className="px-3 py-1 border rounded-md text-sm">
              {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 border rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-4">
        {paginated.map((r) => (
          <article
            key={r.id}
            className="bg-white p-4 rounded-2xl shadow border space-y-2"
          >
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>{r.date}</div>
              <div className="flex items-center gap-2">
                <StatusBadge status={r.status} />
                <button
                  onClick={() => openDetail(r)}
                  aria-label={`Open details for ${r.id}`}
                  className="px-2 py-1 border rounded-md text-sm"
                >
                  Details
                </button>
              </div>
            </div>

            <h3 className="text-base font-semibold text-gray-900">
              {r.reason}
            </h3>
            <div className="text-sm text-gray-500">Order: {r.orderId}</div>
            <div className="text-sm text-gray-500">Vendor: {r.vendor}</div>
            <div className="text-sm text-gray-500">Customer: {r.customer}</div>
            <div className="text-lg font-bold text-[#DC3173]">
              {formatCurrency(r.amount)}
            </div>
          </article>
        ))}

        {/* mobile pagination simple */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded-md"
          >
            Prev
          </button>
          <div className="text-sm">
            {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 border rounded-md"
          >
            Next
          </button>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1"
            onClick={() => setSelected(null)}
            aria-hidden
          />
          <aside className="w-full sm:w-96 bg-white p-6 overflow-auto border-l shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{selected.id}</h2>
                <p className="text-sm text-gray-500">
                  Order {selected.orderId} — {selected.date}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-md border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-gray-500">Vendor</span>
                <div className="font-medium">{selected.vendor}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Customer</span>
                <div className="font-medium">{selected.customer}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Reason</span>
                <div className="font-medium">{selected.reason}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Details</span>
                <div className="text-sm text-gray-700">{selected.details}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Amount</span>
                <div className="font-semibold text-[#DC3173]">
                  {formatCurrency(selected.amount)}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Status</span>
                <div className="mt-1">
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                {selected.status !== "Resolved" && (
                  <>
                    <button
                      onClick={() =>
                        setConfirmAction({ open: true, action: "resolve" })
                      }
                      className="px-4 py-2 rounded-md bg-green-600 text-white"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({ open: true, action: "reject" })
                      }
                      className="px-4 py-2 rounded-md bg-red-600 text-white"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    /* placeholder for contacting vendor */ alert(
                      "Open chat / email to vendor (placeholder)",
                    );
                  }}
                  className="px-4 py-2 rounded-md border"
                >
                  Contact Vendor
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction.open && selected && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmAction({ open: false, action: null })}
          />
          <div className="bg-white rounded-2xl p-6 z-70 w-full max-w-lg">
            <h3 className="text-lg font-semibold">
              Confirm{" "}
              {confirmAction.action === "resolve" ? "Resolve" : "Reject"}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to{" "}
              {confirmAction.action === "resolve"
                ? "mark this dispute as Resolved"
                : "reject this dispute (it will remain Open)"}
              ? This action is audit-logged.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setConfirmAction({ open: false, action: null })}
                className="px-4 py-2 rounded-md border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selected)
                    performAction(
                      selected.id,
                      confirmAction.action === "resolve" ? "resolve" : "reject",
                    );
                }}
                className="px-4 py-2 rounded-md bg-[#DC3173] text-white"
              >
                Yes, {confirmAction.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------- Small components ----------------------
function SummaryCard({ title, value, icon, color, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl p-4 shadow-sm border flex items-center justify-between ${color} hover:shadow-md transition`}
    >
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
      <div className="p-2 bg-white rounded-md shadow">{icon}</div>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    Open: "bg-red-100 text-red-800",
    Resolved: "bg-green-100 text-green-800",
    "Pending Vendor": "bg-blue-100 text-blue-800",
    "Pending Customer": "bg-orange-100 text-orange-800",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
}

function ThSortable({ label, active, dir, onClick }: any) {
  return (
    <th
      onClick={onClick}
      className="py-3 px-3 text-left cursor-pointer select-none whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )
        ) : (
          <ChevronDown className="w-3 h-3 opacity-40" />
        )}
      </span>
    </th>
  );
}
