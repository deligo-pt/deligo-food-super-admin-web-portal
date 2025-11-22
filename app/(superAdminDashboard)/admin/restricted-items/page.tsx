"use client"
import React, { useState, useMemo, useEffect, JSX } from "react";
import { Plus, Edit3, Trash2, Download, Search } from "lucide-react";



export type RestrictedItem = {
  id: string;
  name: string;
  category: string;
  reason: string;
  flaggedVendors: number;
  updatedAt: string;
};

const LS_KEY = "deligo:restricted_items:v1";

const sampleData: RestrictedItem[] = [
  { id: "r-1", name: "Alcohol - Whiskey", category: "Alcohol", reason: "Age restricted (18+)", flaggedVendors: 3, updatedAt: new Date().toISOString() },
  { id: "r-2", name: "Cigarettes", category: "Tobacco", reason: "Legal restriction (no sales)", flaggedVendors: 5, updatedAt: new Date().toISOString() },
  { id: "r-3", name: "Sharp Knives", category: "Hazardous", reason: "Safety risk for delivery", flaggedVendors: 1, updatedAt: new Date().toISOString() },
];

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function RestrictedItemsPage(): JSX.Element {
  const [items, setItems] = useState<RestrictedItem[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : sampleData;
      }
    } catch (e) {}
    return sampleData;
  });

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RestrictedItem | null>(null);
  const [compact, setCompact] = useState(false);

  const categories = ["Alcohol", "Tobacco", "Hazardous", "Legal", "Other"];

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((x) => {
      const matchesQuery =
        !q || x.name.toLowerCase().includes(q) || x.reason.toLowerCase().includes(q) || x.category.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === "all" || x.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, selectedCategory]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onEdit = (item: RestrictedItem) => {
    setEditing(item);
    setModalOpen(true);
  };

  const saveItem = (payload: Partial<RestrictedItem>) => {
    if (editing) {
      setItems((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...payload, updatedAt: new Date().toISOString() } as RestrictedItem : p)));
    } else {
      const newItem: RestrictedItem = {
        id: uid("r"),
        name: payload.name || "",
        category: payload.category || "Other",
        reason: payload.reason || "",
        flaggedVendors: payload.flaggedVendors ?? 0,
        updatedAt: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
    }
    setModalOpen(false);
  };

  const deleteItem = (id: string) => {
    if (!confirm("Delete this restricted item? This action cannot be undone.")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const exportCSV = () => {
    if (items.length === 0) return alert("Nothing to export.");
    const rows = items.map((i) => ({ id: i.id, name: i.name, category: i.category, reason: i.reason, flaggedVendors: i.flaggedVendors, updatedAt: i.updatedAt }));
    const csv = [Object.keys(rows[0]).join(","), ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deligo_restricted_items_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">Restricted Items</h1>
          <p className="text-gray-600 mt-1">Manage items vendors are not allowed to sell on Deligo.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border rounded-full px-3 py-1 shadow-sm">
            <Search size={16} className="text-gray-500" />
            <input aria-label="Search restricted items" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items, reason or category" className="ml-2 outline-none w-52 sm:w-64 text-sm" />
          </div>

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border rounded-full px-4 py-2 text-sm shadow-sm">
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium shadow" style={{ background: "#DC3173" }}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Actions row */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm shadow-sm">
            <Download size={14} /> Export CSV
          </button>

          <button onClick={() => setCompact((c) => !c)} className="px-3 py-2 rounded-lg border text-sm shadow-sm">Toggle Compact</button>
        </div>

        <div className="text-sm text-gray-500">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <div className="hidden md:block bg-white rounded-3xl border shadow overflow-x-auto">
          <table className="w-full table-auto text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="p-4 text-left">Item</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Reason</th>
                <th className="p-4 text-left">Flagged Vendors</th>
                <th className="p-4 text-left">Updated</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No restricted items found.</td>
                </tr>
              ) : (
                filtered.map((it) => (
                  <tr key={it.id} className={`border-b hover:bg-gray-50 transition ${compact ? "text-sm" : "text-base"}`}>
                    <td className="p-4 font-medium flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFE8F0] to-[#FFDFE8] flex items-center justify-center text-[#DC3173] font-bold">{it.name.split(" ")[0].slice(0,2).toUpperCase()}</div>
                      <div>
                        <div className="font-semibold">{it.name}</div>
                        <div className="text-xs text-gray-500">ID: {it.id}</div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border">{it.category}</span>
                    </td>

                    <td className="p-4 text-gray-600 max-w-xl">{it.reason}</td>

                    <td className="p-4 font-semibold">{it.flaggedVendors}</td>

                    <td className="p-4 text-gray-500 text-xs">{new Date(it.updatedAt).toLocaleString()}</td>

                    <td className="p-4 flex gap-2">
                      <button aria-label={`Edit ${it.name}`} onClick={() => onEdit(it)} className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50">
                        <Edit3 size={16} /> Edit
                      </button>
                      <button aria-label={`Delete ${it.name}`} onClick={() => deleteItem(it.id)} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-red-600 hover:bg-red-50">
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / tablet cards */}
        <div className="md:hidden grid grid-cols-1 gap-4 mt-3">
          {filtered.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border text-center text-gray-500">No restricted items found.</div>
          ) : (
            filtered.map((it) => (
              <div key={it.id} className="p-4 bg-white rounded-2xl border shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFE8F0] to-[#FFDFE8] flex items-center justify-center text-[#DC3173] font-bold">{it.name.split(" ")[0].slice(0,2).toUpperCase()}</div>
                      <div>
                        <div className="font-semibold">{it.name}</div>
                        <div className="text-xs text-gray-500">{it.category} • Flagged: {it.flaggedVendors}</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mt-2">{it.reason}</div>
                    <div className="text-xs text-gray-400 mt-2">Updated: {new Date(it.updatedAt).toLocaleString()}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button onClick={() => onEdit(it)} className="p-2 rounded-lg border"><Edit3 size={16} /></button>
                    <button onClick={() => deleteItem(it.id)} className="p-2 rounded-lg border text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <RestrictedForm
            initial={editing}
            categories={categories}
            onSave={saveItem}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}

      <style jsx>{`@keyframes fadeIn { from{opacity:0; transform: translateY(6px)} to{opacity:1; transform: translateY(0)} }`}</style>
    </div>
  );
}

// ================= Helper Components =================

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-[fadeIn_200ms_ease]">{children}</div>
    </div>
  );
}

function RestrictedForm({ initial, categories, onSave, onCancel }: any) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || categories[0] || "Other");
  const [reason, setReason] = useState(initial?.reason || "");
  const [flaggedVendors, setFlaggedVendors] = useState<number>(initial?.flaggedVendors ?? 0);

  useEffect(() => {
    setName(initial?.name || "");
    setCategory(initial?.category || categories[0] || "Other");
    setReason(initial?.reason || "");
    setFlaggedVendors(initial?.flaggedVendors ?? 0);
  }, [initial, categories]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return alert("Name is required.");
        onSave({ name: name.trim(), category, reason: reason.trim(), flaggedVendors });
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="text-sm font-medium">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-xl px-3 py-2 mt-1" required />
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-xl px-3 py-2 mt-1">
          {categories.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Reason</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border rounded-xl px-3 py-2 mt-1" rows={3} />
      </div>

      <div>
        <label className="text-sm font-medium">Flagged Vendors</label>
        <input type="number" min={0} value={flaggedVendors} onChange={(e) => setFlaggedVendors(Number(e.target.value))} className="w-32 border rounded-xl px-3 py-2 mt-1" />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-xl text-white" style={{ background: "#DC3173" }}>{initial ? "Save Changes" : "Add Item"}</button>
      </div>
    </form>
  );
}
