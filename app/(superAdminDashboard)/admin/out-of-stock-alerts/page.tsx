"use client";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useMemo, useState } from "react";

export type StockItem = {
  id: string;
  name: string;
  vendor: string;
  category: string;
  inventory: number;
  threshold: number;
  updatedAt: string;
};

// Placeholder sample data
const sampleItems: StockItem[] = [
  {
    id: "1",
    name: "Classic Burger",
    vendor: "Burger House",
    category: "Burgers",
    inventory: 0,
    threshold: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Hot Wings",
    vendor: "Fire Grill",
    category: "Snacks",
    inventory: 3,
    threshold: 10,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Fanta Orange",
    vendor: "Drinks Corner",
    category: "Drinks",
    inventory: 12,
    threshold: 10,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Family Pizza",
    vendor: "Pizza Magic",
    category: "Pizza",
    inventory: 0,
    threshold: 2,
    updatedAt: new Date().toISOString(),
  },
];

export default function OutOfStockAlertsPage() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [items, setItems] = useState<StockItem[]>(sampleItems);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = query.toLowerCase();
      const matchText =
        item.name.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchFilter =
        filter === "all" ||
        (filter === "out" && item.inventory === 0) ||
        (filter === "low" &&
          item.inventory > 0 &&
          item.inventory <= item.threshold);

      return matchText && matchFilter;
    });
  }, [items, query, filter]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <TitleHeader
        title={t("out_of_stock_alerts")}
        subtitle={t("live_stock_monitoring_acroos_all_vendors")}
      />

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          placeholder={t("search_item_vendor_category")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm shadow-sm bg-white focus:ring-2 focus:ring-[#DC3173]/40 outline-none"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm shadow-sm bg-white focus:ring-2 focus:ring-[#DC3173]/40 outline-none"
        >
          <option value="all">{t("all")}</option>
          <option value="out">{t("Out of Stock")}</option>
          <option value="low">{t("low_stock")}</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
        <StatCard
          title={t("total_alerts")}
          value={filtered.length}
          gradient="from-[#DC3173] to-pink-500"
        />

        <StatCard
          title={t("Out of Stock")}
          value={filtered.filter((x) => x.inventory === 0).length}
          gradient="from-red-600 to-red-400"
        />

        <StatCard
          title={t("low_stock")}
          value={
            filtered.filter(
              (x) => x.inventory > 0 && x.inventory <= x.threshold,
            ).length
          }
          gradient="from-yellow-500 to-amber-400"
        />
      </div>

      {/* Table */}
      <div className="mt-10 bg-white/80 backdrop-blur-xl rounded-3xl border shadow-xl overflow-x-auto">
        {loading ? (
          <div className="p-10 grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm table-auto border-collapse">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                <th className="p-4 text-left">{t("item")}</th>
                <th className="p-4 text-left">{t("vendor")}</th>
                <th className="p-4 text-left">{t("category_lg")}</th>
                <th className="p-4 text-left">{t("inventory")}</th>
                <th className="p-4 text-left">{t("status")}</th>
                <th className="p-4 text-left">{t("last_updated")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500">
                    {t("no_matching_results")}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => <StockRow key={item.id} item={item} />)
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ======================= COMPONENTS =======================

function StatCard({
  title,
  value,
  gradient,
}: {
  title: string;
  value: number;
  gradient: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 text-white shadow-lg bg-linear-to-br ${gradient} transform hover:scale-[1.02] transition`}
    >
      <p className="text-sm opacity-90">{title}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function StockRow({ item }: { item: StockItem }) {
  const status =
    item.inventory === 0
      ? {
          label: "Out of Stock",
          className: "bg-red-100 text-red-600 border-red-300",
        }
      : item.inventory <= item.threshold
        ? {
            label: "Low Stock",
            className: "bg-amber-100 text-amber-700 border-amber-300",
          }
        : {
            label: "In Stock",
            className: "bg-green-100 text-green-700 border-green-300",
          };

  return (
    <tr className="border-b hover:bg-gray-50 transition-all duration-150">
      <td className="p-4 font-medium">{item.name}</td>

      <td className="p-4">
        <span className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium border">
          {item.vendor}
        </span>
      </td>

      <td className="p-4">
        <span className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium border">
          {item.category}
        </span>
      </td>

      <td className="p-4 font-semibold">{item.inventory}</td>

      <td className="p-4">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${status.className} shadow-sm`}
        >
          {status.label}
        </span>
      </td>

      <td className="p-4 text-gray-500 text-xs">
        {new Date(item.updatedAt).toLocaleString()}
      </td>
    </tr>
  );
}
