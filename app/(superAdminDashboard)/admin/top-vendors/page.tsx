"use client";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Star,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";

type Vendor = {
  id: string;
  name: string;
  rating: number;
  orders: number;
  revenue: number;
  zone: string;
  status: "Active" | "Paused" | "Pending";
  growth: number;
  trend: { day: string; value: number }[];
  description?: string;
};

const PRIMARY = "#DC3173";

const MOCK_VENDORS: Vendor[] = [
  {
    id: "V-001",
    name: "Lisbon Sushi House",
    rating: 4.8,
    orders: 1840,
    revenue: 23400,
    zone: "Lisbon",
    status: "Active",
    growth: 12.4,
    description:
      "Premium sushi with fast prep times and consistent 5-star reviews.",
    trend: [
      { day: "Mon", value: 2400 },
      { day: "Tue", value: 3200 },
      { day: "Wed", value: 2900 },
      { day: "Thu", value: 4100 },
      { day: "Fri", value: 5200 },
      { day: "Sat", value: 6300 },
      { day: "Sun", value: 4800 },
    ],
  },
  {
    id: "V-002",
    name: "Braga Pizza Hub",
    rating: 4.5,
    orders: 1320,
    revenue: 17800,
    zone: "Braga",
    status: "Active",
    growth: 9.1,
    description: "Family-friendly pizzas with localized promotions.",
    trend: [
      { day: "Mon", value: 1400 },
      { day: "Tue", value: 1800 },
      { day: "Wed", value: 2100 },
      { day: "Thu", value: 2300 },
      { day: "Fri", value: 3000 },
      { day: "Sat", value: 3600 },
      { day: "Sun", value: 2800 },
    ],
  },
  {
    id: "V-003",
    name: "Porto Grill Master",
    rating: 4.2,
    orders: 980,
    revenue: 13600,
    zone: "Porto",
    status: "Paused",
    growth: -4.3,
    description: "Popular grill; temporarily paused due to kitchen remodel.",
    trend: [
      { day: "Mon", value: 1200 },
      { day: "Tue", value: 1400 },
      { day: "Wed", value: 1300 },
      { day: "Thu", value: 1000 },
      { day: "Fri", value: 1600 },
      { day: "Sat", value: 1500 },
      { day: "Sun", value: 1100 },
    ],
  },
  {
    id: "V-004",
    name: "Coimbra Vegan Bites",
    rating: 4.9,
    orders: 1160,
    revenue: 15220,
    zone: "Coimbra",
    status: "Active",
    growth: 15.8,
    description: "Top-rated vegan kitchen with quick pickup options.",
    trend: [
      { day: "Mon", value: 800 },
      { day: "Tue", value: 1200 },
      { day: "Wed", value: 1400 },
      { day: "Thu", value: 1500 },
      { day: "Fri", value: 1800 },
      { day: "Sat", value: 2100 },
      { day: "Sun", value: 1600 },
    ],
  },
];

export default function TopVendorsPage() {
  const { t } = useTranslation();
  // UI state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "revenue" | "orders" | "growth" | "rating"
  >("revenue");
  const [desc, setDesc] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Debounce search (300ms)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
      setPage(1);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    const q = debouncedQuery;
    let list = MOCK_VENDORS.filter(
      (v) =>
        v.name.toLowerCase().includes(q) || v.zone.toLowerCase().includes(q),
    );
    list = list.sort((a, b) => {
      const dir = desc ? -1 : 1;
      if (sortBy === "revenue") return dir * (a.revenue - b.revenue);
      if (sortBy === "orders") return dir * (a.orders - b.orders);
      if (sortBy === "growth") return dir * (a.growth - b.growth);
      return dir * (a.rating - b.rating);
    });
    return list;
  }, [debouncedQuery, sortBy, desc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(column: typeof sortBy) {
    if (sortBy === column) setDesc(!desc);
    else {
      setSortBy(column);
      setDesc(true);
    }
  }

  function exportCSV() {
    const headers = [
      "id",
      "name",
      "rating",
      "orders",
      "revenue",
      "zone",
      "status",
      "growth",
    ];
    const rows = filtered.map((v) => [
      v.id,
      v.name,
      v.rating,
      v.orders,
      v.revenue,
      v.zone,
      v.status,
      v.growth,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "top_vendors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // keyboard navigation: open first vendor on Enter when focused on list container
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        // focus search
        const el = document.getElementById(
          "vendor-search",
        ) as HTMLInputElement | null;
        el?.focus();
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen p-6 bg-linear-to-b from-white to-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto">
        <TitleHeader
          title={t("top_vendors")}
          subtitle={t("curated_ranking_the_best_performing_restaurants")}
        />

        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="vendor-search"
              className="pl-11 pr-3 py-2 w-64 rounded-full border text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white"
              style={{ borderColor: PRIMARY }}
              placeholder={t("search_name_zone")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search vendors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === "grid" ? "table" : "grid")}
              className="px-3 py-2 rounded-md bg-white border border-gray-200 shadow-sm hover:shadow transition focus:outline-none focus:ring-2"
              title="Toggle view"
              aria-pressed={view === "grid"}
            >
              {view === "grid" ? t("table") : t("grid")}
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 shadow-sm hover:shadow transition focus:outline-none focus:ring-2"
              aria-label="Export CSV"
            >
              <Download size={16} />
              <span className="sr-only">{t("export")}</span>
              <span className="text-sm">{t("export")}</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">{t("sort_by")}</div>
            <div
              className="inline-flex bg-white rounded-full shadow-sm overflow-hidden"
              role="tablist"
              aria-label="Sort options"
            >
              <button
                onClick={() => toggleSort("revenue")}
                className={`px-3 py-1 text-sm ${sortBy === "revenue" ? "font-semibold" : "text-gray-600"}`}
                role="tab"
                aria-selected={sortBy === "revenue"}
              >
                {t("revenue")}{" "}
                {sortBy === "revenue" &&
                  (desc ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
              </button>
              <button
                onClick={() => toggleSort("orders")}
                className={`px-3 py-1 text-sm ${sortBy === "orders" ? "font-semibold" : "text-gray-600"}`}
                role="tab"
                aria-selected={sortBy === "orders"}
              >
                {t("orders_lg")}{" "}
                {sortBy === "orders" &&
                  (desc ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
              </button>
              <button
                onClick={() => toggleSort("growth")}
                className={`px-3 py-1 text-sm ${sortBy === "growth" ? "font-semibold" : "text-gray-600"}`}
                role="tab"
                aria-selected={sortBy === "growth"}
              >
                {t("growth")}{" "}
                {sortBy === "growth" &&
                  (desc ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
              </button>
              <button
                onClick={() => toggleSort("rating")}
                className={`px-3 py-1 text-sm ${sortBy === "rating" ? "font-semibold" : "text-gray-600"}`}
                role="tab"
                aria-selected={sortBy === "rating"}
              >
                {t("rating")}{" "}
                {sortBy === "rating" &&
                  (desc ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {t("results_lg")}:{" "}
              <span className="font-medium text-gray-700">
                {filtered.length}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 rounded-md bg-white border text-gray-600 disabled:opacity-50"
                aria-label="Previous page"
              >
                Prev
              </button>
              <div className="px-2">
                {page} / {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 rounded-md bg-white border text-gray-600 disabled:opacity-50"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-2xl p-4 shadow-sm h-40"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Grid view (cards) */}
            {view === "grid" ? (
              <section
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
                aria-live="polite"
              >
                {pageItems.map((v) => (
                  <article
                    key={v.id}
                    tabIndex={0}
                    aria-labelledby={`vendor-${v.id}-name`}
                    className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSelectedVendor(v);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl bg-linear-to-br from-pink-50 to-pink-100 flex items-center justify-center text-white font-bold text-sm"
                          style={{ color: PRIMARY }}
                        >
                          {v.name
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h3
                            id={`vendor-${v.id}-name`}
                            className="font-semibold"
                          >
                            {v.name}
                          </h3>
                          <div className="text-xs text-gray-500">{v.zone}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          €{v.revenue.toLocaleString()}
                        </div>
                        <div
                          className={`text-xs ${v.growth >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {v.growth >= 0 ? `+${v.growth}%` : `${v.growth}%`}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 items-center">
                      <div>
                        <div className="text-xs text-gray-500">
                          {t("orders")}
                        </div>
                        <div className="font-medium">
                          {v.orders.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500">
                          {t("rating")}
                        </div>
                        <div className="font-medium flex items-center gap-2">
                          <Star size={14} className="text-yellow-500" />{" "}
                          {v.rating}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height={60}>
                          <AreaChart
                            data={v.trend}
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id={`g-${v.id}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor={PRIMARY}
                                  stopOpacity={0.18}
                                />
                                <stop
                                  offset="100%"
                                  stopColor={PRIMARY}
                                  stopOpacity={0.02}
                                />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={PRIMARY}
                              fill={`url(#g-${v.id})`}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {v.status === "Active" ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={14} /> {t("active")}
                          </span>
                        ) : v.status === "Paused" ? (
                          <span className="text-red-600 flex items-center gap-1">
                            <XCircle size={14} /> {t("paused")}
                          </span>
                        ) : (
                          <span className="text-yellow-600">
                            {t("pending")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedVendor(v)}
                          className="px-3 py-1 rounded-md bg-white border hover:shadow text-sm focus:outline-none focus:ring-2"
                        >
                          {t("view")}
                        </button>
                        <button
                          className="px-3 py-1 rounded-md text-white"
                          style={{ background: PRIMARY }}
                        >
                          {t("promote")}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              /* Table view */
              <section className="bg-white rounded-2xl p-4 shadow-sm mb-6 overflow-x-auto">
                <table
                  className="w-full text-left text-sm table-auto"
                  role="table"
                  aria-label="Top vendors table"
                >
                  <thead>
                    <tr className="text-gray-500">
                      <th className="pb-3">{t("vendor")}</th>
                      <th className="pb-3">{t("rating")}</th>
                      <th className="pb-3">{t("orders")}</th>
                      <th className="pb-3">{t("revenue")}</th>
                      <th className="pb-3">{t("zone")}</th>
                      <th className="pb-3">{t("trend")}</th>
                      <th className="pb-3">{t("growth")}</th>
                      <th className="pb-3">{t("status")}</th>
                      <th className="pb-3">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pageItems.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 font-medium">{v.name}</td>
                        <td className="py-3 text-yellow-600 flex items-center gap-1">
                          <Star size={14} /> {v.rating}
                        </td>
                        <td className="py-3">{v.orders.toLocaleString()}</td>
                        <td className="py-3">€{v.revenue.toLocaleString()}</td>
                        <td className="py-3">{v.zone}</td>
                        <td className="py-3 w-48">
                          <div className="h-12 w-48">
                            <ResponsiveContainer width="100%" height={40}>
                              <LineChart
                                data={v.trend}
                                margin={{
                                  top: 0,
                                  right: 0,
                                  left: 0,
                                  bottom: 0,
                                }}
                              >
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={PRIMARY}
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                        <td className="py-3">
                          {v.growth >= 0 ? (
                            <span className="text-green-600">+{v.growth}%</span>
                          ) : (
                            <span className="text-red-600">{v.growth}%</span>
                          )}
                        </td>
                        <td className="py-3">
                          {v.status === "Active" ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle size={14} /> {t("active")}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle size={14} /> {t("paused")}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedVendor(v)}
                              className="px-3 py-1 rounded-md bg-white border hover:shadow text-sm focus:outline-none focus:ring-2"
                            >
                              {t("view")}
                            </button>
                            <button
                              className="px-3 py-1 rounded-md text-white"
                              style={{ background: PRIMARY }}
                            >
                              {t("promote")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Pagination controls repeated below for easy access */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="text-sm text-gray-500">
                {t("showing")}{" "}
                <span className="font-medium text-gray-700">
                  {(page - 1) * pageSize + 1}
                </span>{" "}
                -{" "}
                <span className="font-medium text-gray-700">
                  {Math.min(page * pageSize, filtered.length)}
                </span>{" "}
                {t("of")}{" "}
                <span className="font-medium text-gray-700">
                  {filtered.length}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 text-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md bg-white border text-gray-600 disabled:opacity-50"
                  aria-label="Previous page"
                >
                  Prev
                </button>
                <div className="px-2">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md bg-white border text-gray-600 disabled:opacity-50"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* Vendor details modal */}
        {selectedVendor && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="vendor-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedVendor(null)}
            />

            <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-6 z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="vendor-modal-title" className="text-xl font-semibold">
                    {selectedVendor.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedVendor.zone} • {t("rating")}{" "}
                    {selectedVendor.rating}
                  </p>
                </div>
                <button
                  aria-label="Close"
                  className="p-2 rounded-md hover:bg-gray-100"
                  onClick={() => setSelectedVendor(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-600">
                    {selectedVendor.description}
                  </div>

                  <div className="mt-4 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedVendor.trend}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={PRIMARY}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">{t("orders")}</div>
                      <div className="font-semibold">
                        {selectedVendor.orders.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">
                        {t("revenue")}
                      </div>
                      <div className="font-semibold">
                        €{selectedVendor.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="bg-gray-50 p-4 rounded-lg flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">{t("growth")}</div>
                    <div
                      className={`text-sm font-semibold ${selectedVendor.growth >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {selectedVendor.growth >= 0
                        ? `+${selectedVendor.growth}%`
                        : `${selectedVendor.growth}%`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedVendor.status === "Active" ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle size={14} /> {t("active")}
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle size={14} /> {t("paused")}
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      className="w-full px-3 py-2 rounded-md text-white font-medium"
                      style={{ background: PRIMARY }}
                    >
                      {t("promote_vendor")}
                    </button>
                    <button
                      className="w-full mt-2 px-3 py-2 rounded-md border"
                      onClick={() => {
                        alert("Open payout settings (placeholder)");
                      }}
                    >
                      {t("payouts")}
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
