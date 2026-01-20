/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useMemo, useEffect, JSX } from "react";
import { Plus, Edit3, Trash2, Calendar, PercentCircle, Timer, CheckCircle2, XCircle, Search } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";


export type Campaign = {
  id: string;
  title: string;
  type: string;
  vendor?: string;
  discount: number;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  status: string; // ongoing | upcoming | expired
  updatedAt: string;
};

const LS_KEY = "deligo:campaigns:v1";

const sampleCampaigns: Campaign[] = [
  {
    id: "c1",
    title: "Weekend Super Combo",
    type: "Combo Offer",
    vendor: "Burger House",
    discount: 25,
    startDate: "2025-11-01",
    endDate: "2025-12-31",
    status: "ongoing",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c2",
    title: "Free Delivery Week",
    type: "Free Delivery",
    vendor: "All Vendors",
    discount: 100,
    startDate: "2025-12-01",
    endDate: "2025-12-08",
    status: "upcoming",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c3",
    title: "Happy Hour Drinks",
    type: "Percentage Discount",
    vendor: "Drinks Corner",
    discount: 15,
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    status: "expired",
    updatedAt: new Date().toISOString(),
  },
];

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function ActiveCampaignsPage(): JSX.Element {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : sampleCampaigns;
      }
    } catch (e) { }
    return sampleCampaigns;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(campaigns));
    } catch (e) { }
  }, [campaigns]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const campaignTypes = ["Percentage Discount", "Free Delivery", "Combo Offer", "BOGO", "Vendor Special"];

  function calculateStatus(start: string, end: string) {
    const now = new Date();
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T23:59:59");

    if (now < s) return "upcoming";
    if (now >= s && now <= e) return "ongoing";
    return "expired";
  }

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const q = query.trim().toLowerCase();
      const match =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.vendor || "").toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q);

      const matchType = filterType === "all" || c.type === filterType;
      return match && matchType;
    });
  }, [campaigns, query, filterType]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onEdit = (c: Campaign) => {
    setEditing(c);
    setModalOpen(true);
  };

  const deleteCampaign = (id: string) => {
    if (!confirm("Delete campaign? This cannot be undone.")) return;
    setCampaigns((prev) => prev.filter((x) => x.id !== id));
  };

  const saveCampaign = (data: Partial<Campaign>) => {
    // validation done in form
    if (editing) {
      setCampaigns((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
              ...p,
              ...data,
              status: calculateStatus(data.startDate || p.startDate, data.endDate || p.endDate),
              updatedAt: new Date().toISOString(),
            }
            : p
        )
      );
    } else {
      const newItem: Campaign = {
        id: uid("c"),
        title: data.title || "",
        type: data.type || "Percentage Discount",
        vendor: data.vendor || "All Vendors",
        discount: data.discount ?? 0,
        startDate: data.startDate || new Date().toISOString().slice(0, 10),
        endDate: data.endDate || new Date().toISOString().slice(0, 10),
        status: calculateStatus(data.startDate || new Date().toISOString().slice(0, 10), data.endDate || new Date().toISOString().slice(0, 10)),
        updatedAt: new Date().toISOString(),
      };
      setCampaigns((prev) => [newItem, ...prev]);
    }
    setModalOpen(false);
  };

  const statusBadge = (status: string) => {
    if (status === "ongoing")
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
          <CheckCircle2 size={14} /> {t("ongoing")}
        </span>
      );
    if (status === "upcoming")
      return (
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center gap-1">
          <Timer size={14} /> {t("upcoming")}
        </span>
      );
    return (
      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium flex items-center gap-1">
        <XCircle size={14} /> {t("expired")}
      </span>
    );
  };

  const typeIcon = (type: string) => {
    if (type.includes("Percentage")) return <PercentCircle size={18} className="text-[#DC3173]" />;
    if (type.includes("Delivery")) return <Calendar size={18} className="text-[#DC3173]" />;
    if (type.includes("Combo")) return <CheckCircle2 size={18} className="text-[#DC3173]" />;
    if (type.includes("BOGO")) return <Timer size={18} className="text-[#DC3173]" />;
    return <Calendar size={18} className="text-[#DC3173]" />;
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("active_campaigns")}</h1>
          <p className="text-gray-600 text-sm mt-1">{t("manage_ongoing_upcoming_promotional_campaign")}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-white border rounded-full px-3 py-1 shadow-sm">
            <Search size={14} className="text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search_campaign_vendor_type")} className="ml-2 outline-none w-56 text-sm" />
          </div>

          <div className="hidden sm:block">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border rounded-full px-4 py-2 text-sm shadow-sm">
              <option value="all">{t("all_types")}</option>
              {campaignTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold shadow" style={{ background: "#DC3173" }}>
            <Plus size={16} /> {t("new_campaign")}
          </button>
        </div>
      </div>

      {/* Mobile search + filter */}
      <div className="sm:hidden mt-4 flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-full border rounded-xl px-3 py-2 text-sm" />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
          <option value="all">{t("all")}</option>
          {campaignTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block mt-8 bg-white rounded-3xl border shadow overflow-x-auto">
        <table className="w-full text-sm table-auto">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-4 text-left">{t("campaign")}</th>
              <th className="p-4 text-left">{t("type")}</th>
              <th className="p-4 text-left">{t("vendor")}</th>
              <th className="p-4 text-left">{t("discount")}</th>
              <th className="p-4 text-left">{t("duration")}</th>
              <th className="p-4 text-left">{t("status")}</th>
              <th className="p-4 text-left">{t("actions")}</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  {t("no_campaigns_found")}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-semibold">{c.title}</td>
                  <td className="p-4 flex items-center gap-2">{typeIcon(c.type)} {c.type}</td>
                  <td className="p-4">{c.vendor}</td>
                  <td className="p-4 font-semibold">{c.discount}%</td>
                  <td className="p-4 text-sm">{c.startDate} → {c.endDate}</td>
                  <td className="p-4">{statusBadge(c.status)}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => onEdit(c)} className="p-2 rounded-lg border hover:bg-gray-50" aria-label={`Edit ${c.title}`}>
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => deleteCampaign(c.id)} className="p-2 rounded-lg border text-red-600 hover:bg-red-50" aria-label={`Delete ${c.title}`}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden grid grid-cols-1 gap-4 mt-6">
        {filtered.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border text-center text-gray-500">{t("no_campaigns_found")}</div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="p-4 bg-white rounded-2xl shadow border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg">{c.title}</div>
                  <div className="flex items-center gap-2 text-sm mt-1 text-[#DC3173]">
                    {typeIcon(c.type)} {c.type}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{t("vendor")}: {c.vendor}</div>
                  <div className="text-sm font-semibold mt-1">{c.discount}% {t("off_lg")}</div>
                  <div className="text-xs text-gray-500 mt-1">{c.startDate} → {c.endDate}</div>
                  <div className="mt-2">{statusBadge(c.status)}</div>
                </div>

                <div className="flex flex-col gap-2 ml-3">
                  <button onClick={() => onEdit(c)} className="p-2 rounded-lg border" aria-label={`Edit ${c.title}`}>
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => deleteCampaign(c.id)} className="p-2 rounded-lg border text-red-600" aria-label={`Delete ${c.title}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <CampaignForm initial={editing} campaignTypes={campaignTypes} onSave={saveCampaign} onCancel={() => setModalOpen(false)} />
        </Modal>
      )}

      <style jsx>{`@keyframes fadeIn { from{opacity:0; transform: translateY(6px)} to{opacity:1; transform: translateY(0)} }`}</style>
    </div>
  );
}

// Modal component (accessible)
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-[fadeIn_200ms_ease]">{children}</div>
    </div>
  );
}

// Campaign form component
function CampaignForm({ initial, campaignTypes, onSave, onCancel }: any) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title || "");
  const [type, setType] = useState(initial?.type || campaignTypes[0]);
  const [vendor, setVendor] = useState(initial?.vendor || "All Vendors");
  const [discount, setDiscount] = useState<number>(initial?.discount ?? 0);
  const [startDate, setStartDate] = useState(initial?.startDate || new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(initial?.endDate || new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setTitle(initial?.title || "");
    setType(initial?.type || campaignTypes[0]);
    setVendor(initial?.vendor || "All Vendors");
    setDiscount(initial?.discount ?? 0);
    setStartDate(initial?.startDate || new Date().toISOString().slice(0, 10));
    setEndDate(initial?.endDate || new Date().toISOString().slice(0, 10));
  }, [initial, campaignTypes]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required.");
    if (new Date(startDate) > new Date(endDate)) return alert("Start date cannot be after end date.");
    onSave({ title: title.trim(), type, vendor, discount, startDate, endDate });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium">{t("title")}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-xl px-3 py-2 mt-1" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">{t("type")}</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-xl px-3 py-2 mt-1">
            {campaignTypes.map((t: string) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">{t("vendor")}</label>
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} className="w-full border rounded-xl px-3 py-2 mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">{t("discount")} (%)</label>
          <input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full border rounded-xl px-3 py-2 mt-1" />
        </div>

        <div>
          <label className="text-sm font-medium">{t("start_date")}</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded-xl px-3 py-2 mt-1" />
        </div>

        <div>
          <label className="text-sm font-medium">{t("end_date")}</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border rounded-xl px-3 py-2 mt-1" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border">{t("cancel")}</button>
        <button type="submit" className="px-4 py-2 rounded-xl text-white" style={{ background: "#DC3173" }}>
          {initial ? "Save Campaign" : "Create Campaign"}
        </button>
      </div>
    </form>
  );
}
