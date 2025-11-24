"use client"
import React, { useEffect, useMemo, useState } from "react";
import { PlusCircle, Search, MoreHorizontal, Edit2, Trash2, ChevronLeft, ChevronRight,  UserCheck, ShieldCheck, AlertCircle, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Admin type
type Role = "Super Admin" | "Admin" | "Moderator";

type Admin = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  active: boolean;
  createdAt: string; // ISO
};

// Enhanced mock data (replace with real API)
const initialAdmins: Admin[] = [
  { id: "a1", name: "Mariana Silva", email: "mariana@deligo.pt", role: "Super Admin", active: true, createdAt: "2024-06-10" },
  { id: "a2", name: "Tiago Fernandes", email: "tiago@deligo.pt", role: "Admin", active: true, createdAt: "2024-07-02" },
  { id: "a3", name: "Rita Gomes", email: "rita@deligo.pt", role: "Moderator", active: false, createdAt: "2024-08-15" },
  { id: "a4", name: "João Pereira", email: "joao@deligo.pt", role: "Admin", active: true, createdAt: "2024-09-01" },
  { id: "a5", name: "Inês Costa", email: "ines@deligo.pt", role: "Moderator", active: true, createdAt: "2024-10-21" },
  { id: "a6", name: "Carlos Sousa", email: "carlos@deligo.pt", role: "Admin", active: true, createdAt: "2024-11-02" },
  { id: "a7", name: "Sofia Moreira", email: "sofia@deligo.pt", role: "Moderator", active: true, createdAt: "2024-12-12" },
];

// Utilities
const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

export default function AllAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(6);
  const [selected, setSelected] = useState<Admin | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Filtered and paginated
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.role.toLowerCase().includes(q));
  }, [admins, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  const visible = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page, perPage]);

  // Actions
  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (adm: Admin) => { setEditing(adm); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const saveAdmin = (payload: Partial<Admin> & { id?: string }) => {
    // simple upsert
    if (payload.id) {
      setAdmins(prev => prev.map(p => p.id === payload.id ? { ...p, ...payload } as Admin : p));
    } else {
      const newAdmin: Admin = {
        id: Math.random().toString(36).slice(2, 9),
        name: payload.name || "New Admin",
        email: payload.email || "new@deligo.pt",
        role: (payload.role || "Admin") as Role,
        active: payload.active ?? true,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setAdmins(prev => [newAdmin, ...prev]);
    }
    closeModal();
  };

  const removeAdmin = (id: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    setAdmins(prev => prev.filter(p => p.id !== id));
  };

  // bulk actions
  const toggleSelectAll = (val: boolean) => {
    const pageIds = visible.map(v => v.id);
    const next = { ...selectedIds };
    pageIds.forEach(id => { next[id] = val; });
    setSelectedIds(next);
  };
  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const bulkRemove = () => {
    if (!selectedCount) return;
    if (!confirm(`Remove ${selectedCount} selected admins?`)) return;
    setAdmins(prev => prev.filter(p => !selectedIds[p.id]));
    setSelectedIds({});
  };

  // Small UI helpers
  const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
    const base = "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ring-inset";
    if (role === "Super Admin") return <span className={`${base} bg-[rgba(220,49,115,0.12)] text-[#DC3173] ring-[#F7D6E0] animate-pulse`}>{role}</span>;
    if (role === "Admin") return <span className={`${base} bg-gray-100 text-gray-800 ring-gray-200`}>{role}</span>;
    return <span className={`${base} bg-yellow-50 text-yellow-800 ring-yellow-100`}>{role}</span>;
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03 } }),
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* top header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">All Admins</h1>
            <p className="mt-1 text-sm text-gray-600">Manage users who can access and administer the Deligo platform.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white border rounded-full px-3 py-2 shadow-sm">
              <Search className="text-gray-400" size={16} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, email, role..." className="outline-none w-64" />
              {query && <button onClick={() => setQuery("") } className="text-gray-400">✕</button>}
            </div>

            <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#DC3173] to-[#e84b93] text-white font-semibold shadow-lg transform hover:-translate-y-0.5 transition">
              <PlusCircle size={18} /> Create
            </button>
          </div>
        </div>

        {/* stats + quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total admins</div>
              <div className="text-2xl font-bold">{admins.length}</div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={28} className="text-[#DC3173]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Active</div>
              <div className="text-2xl font-bold">{admins.filter(a => a.active).length}</div>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck size={28} className="text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Pending actions</div>
              <div className="text-2xl font-bold">{Math.max(0, 2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={28} className="text-yellow-500" />
            </div>
          </div>
        </div>

        {/* card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" onChange={(e) => toggleSelectAll(e.target.checked)} className="h-4 w-4" />
                <span className="text-sm text-gray-600">Select page</span>
              </label>

              <div className="h-8 w-px bg-gray-100" />

              <div className="flex items-center gap-2">
                <button onClick={() => { alert('Export CSV - implement API'); }} className="text-sm px-3 py-1 rounded-md border">Export</button>
              </div>
            </div>

            <div className="text-sm text-gray-500">Showing <span className="font-medium text-gray-700">{(page-1)*perPage + 1}</span> - <span className="font-medium text-gray-700">{Math.min(page*perPage, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span></div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <motion.tbody initial="hidden" animate="visible">
                {visible.map((a, idx) => (
                  <motion.tr key={a.id} custom={idx} variants={rowVariants} whileHover={{ scale: 1.005 }} className="hover:bg-gray-50 transition" style={{ cursor: 'default' }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-3">
                          <input checked={!!selectedIds[a.id]} onChange={(e) => setSelectedIds(prev => ({ ...prev, [a.id]: e.target.checked }))} type="checkbox" className="h-4 w-4" />
                        </label>

                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-gray-600 font-bold text-sm overflow-hidden">
                          {/* avatar placeholder */}
                          {a.name.split(" ")[0].slice(0,1)}{a.name.split(" ")[1]?.slice(0,1) || ''}
                        </div>

                        <div>
                          <div className="font-semibold">{a.name} <span className="ml-2 text-xs text-gray-400">@{a.email.split('@')[0]}</span></div>
                          <div className="text-sm text-gray-500">{a.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={a.role} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${a.active ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{a.active ? 'Active' : 'Disabled'}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(a.createdAt)}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(a)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-100 hover:shadow transition">
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => removeAdmin(a.id)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-red-100 text-red-600 hover:bg-red-50 transition">
                          <Trash2 size={14} /> Delete
                        </button>
                        <div className="relative inline-block text-left">
                          <button onClick={() => setSelected(a)} className="p-1 rounded-full border border-gray-100 hover:bg-gray-50">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No admins found matching your search.</td>
                  </tr>
                )}

              </motion.tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="px-6 py-4 border-t flex flex-col md:flex-row items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">Page</div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-gray-50">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="disabled:opacity-50"><ChevronLeft size={16} /></button>
                <span className="text-sm font-medium">{page}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="disabled:opacity-50"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">Rows per page</div>
              <select value={perPage} onChange={() => {}} className="text-sm border rounded px-2 py-1">
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

        </motion.div>

        {/* Side detail / drawer for selected admin */}
        <AnimatePresence>
          {selected && (
            <motion.aside initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }} transition={{ type: 'spring', damping: 20 }} className="fixed right-6 top-24 w-96 bg-white rounded-2xl shadow-2xl border p-6 z-40">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selected.name}</h3>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400">✕</button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="text-sm text-gray-600">Role</div>
                <RoleBadge role={selected.role} />

                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="mt-1">{selected.active ? 'Active' : 'Disabled'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Member since</div>
                  <div className="mt-1">{formatDate(selected.createdAt)}</div>
                </div>

                <div className="pt-3 border-t flex gap-2">
                  <button onClick={() => { openEdit(selected); setSelected(null); }} className="flex-1 px-3 py-2 rounded-md border">Edit</button>
                  <button onClick={() => { removeAdmin(selected.id); setSelected(null); }} className="flex-1 px-3 py-2 rounded-md bg-red-50 text-red-700">Remove</button>
                </div>

                <div className="pt-2 border-t">
                  <button onClick={() => alert('Open audit logs - implement backend') } className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gray-50">View audit logs <ArrowUpRight size={14} /></button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Modal for create/edit */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

              <motion.div initial={{ scale: 0.98, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 8 }} transition={{ duration: 0.18 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10">

                <h2 className="text-lg font-semibold">{editing ? 'Edit Admin' : 'Create Admin'}</h2>
                <p className="text-sm text-gray-500 mt-1">{editing ? 'Update admin details and permissions' : 'Add a new admin to your Deligo platform'}</p>

                <form onSubmit={(e) => { e.preventDefault(); const form = e.target as HTMLFormElement; const fd = new FormData(form); saveAdmin({
                  id: editing?.id,
                  name: String(fd.get('name') || '').trim(),
                  email: String(fd.get('email') || '').trim(),
                  role: (fd.get('role') as Role) || 'Admin',
                  active: fd.get('active') === 'on',
                }); }} className="mt-4 space-y-3">

                  <div>
                    <label className="text-sm font-medium">Full name</label>
                    <input name="name" defaultValue={editing?.name || ''} required className="w-full mt-1 px-3 py-2 rounded-md border" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input name="email" type="email" defaultValue={editing?.email || ''} required className="w-full mt-1 px-3 py-2 rounded-md border" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <select name="role" defaultValue={editing?.role || 'Admin'} className="w-full mt-1 px-3 py-2 rounded-md border">
                        <option>Super Admin</option>
                        <option>Admin</option>
                        <option>Moderator</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 w-full">
                        <input name="active" defaultChecked={editing?.active ?? true} type="checkbox" className="h-4 w-4" />
                        <span className="text-sm">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md border">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-gradient-to-r from-[#DC3173] to-[#e84b93] text-white">{editing ? 'Save' : 'Create'}</button>
                  </div>
                </form>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Visual accent / footer */}
      <div className="fixed left-6 bottom-6 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ background: '#DC3173' }} />
        <div className="text-xs text-gray-500">Deligo color accent</div>
      </div>
    </div>
  );
}
