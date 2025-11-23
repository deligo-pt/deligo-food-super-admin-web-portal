/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  Trash2,
  Upload,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// --- Branding ---
const DELIGO = '#DC3173';
// user-uploaded local path (developer note: keep as-is)
const SAMPLE_AVATAR = '/mnt/data/Screenshot from 2025-11-21 00-13-57.png';

// ---------------- Types ----------------
type PayoutStatus = 'pending' | 'processing' | 'completed' | 'rejected';
type PayoutMethod = 'bank' | 'mbway' | 'wallet';

type Payout = {
  id: string;
  partner: string;
  partnerId: string;
  city: string;
  amount: number;
  requestedAt: string;
  status: PayoutStatus;
  method: PayoutMethod;
  iban?: string;
  documents?: { name: string; url?: string }[];
  timeline?: { step: string; at?: string; note?: string }[];
};

// ---------------- Helpers ----------------
const initials = (name = '') =>
  name
    .split(' ')
    .map(s => (s[0] || ''))
    .slice(0, 2)
    .join('')
    .toUpperCase();

const currency = (n = 0) => `€ ${n.toLocaleString()}`;

function badgeVariantFor(status: PayoutStatus) {
  if (status === 'completed') return 'default';
  if (status === 'processing') return 'secondary';
  if (status === 'pending') return 'outline';
  return 'destructive';
}

// ---------------- Component ----------------
export default function DeliveryPartnerPayoutsPremium() {
  // data
  const [payouts, setPayouts] = useState<Payout[]>([]);
  // UI state
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PayoutStatus>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  // selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);

  // bulk / detail modals
  const [selected, setSelected] = useState<Payout | null>(null);
  const [confirm, setConfirm] = useState<{ type: 'approve' | 'reject'; ids: string[]; note?: string } | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // date-range (7/30/custom)
  const [dateRange, setDateRange] = useState<'7' | '30' | 'custom'>('30');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  useEffect(() => {
    // load mock data (replace with API call)
    setPayouts(mockPayouts());
  }, []);

  // ------------ Filtering & Sorting & Pagination ------------
  const processed = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = payouts.filter(p => (q ? `${p.partner} ${p.partnerId} ${p.city}`.toLowerCase().includes(q) : true));

    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);

    // date range filter (client demo)
    if (dateRange === '7' || dateRange === '30') {
      const days = Number(dateRange);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      list = list.filter(p => new Date(p.requestedAt).getTime() >= cutoff);
    } else if (dateRange === 'custom' && customFrom && customTo) {
      const from = new Date(customFrom).getTime();
      const to = new Date(customTo).getTime() + 24*60*60*1000 - 1;
      list = list.filter(p => {
        const t = new Date(p.requestedAt).getTime();
        return t >= from && t <= to;
      });
    }

    list = list.sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });

    return list;
  }, [payouts, query, statusFilter, sortBy, dateRange, customFrom, customTo]);

  const total = processed.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pageData = processed.slice((page - 1) * perPage, page * perPage);

  // update select all toggling
  useEffect(() => {
    // if selectAllOnPage true, ensure selectedIds contains current page items
    if (selectAllOnPage) {
      const ids = new Set(selectedIds);
      pageData.forEach(p => ids.add(p.id));
      setSelectedIds(ids);
    } else {
      // if turning off, remove current page ids
      const ids = new Set(selectedIds);
      pageData.forEach(p => ids.delete(p.id));
      setSelectedIds(ids);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectAllOnPage, page, perPage]);

  // toggle individual selection
  function toggleSelect(id: string) {
    const ids = new Set(selectedIds);
    if (ids.has(id)) ids.delete(id);
    else ids.add(id);
    setSelectedIds(ids);
  }

  // Bulk operations (simulate API)
  function bulkApply(type: 'approve' | 'reject', ids: string[], note?: string) {
    setPayouts(prev =>
      prev.map(p => (ids.includes(p.id) ? {
        ...p,
        status: type === 'approve' ? 'processing' : 'rejected',
        timeline: [...(p.timeline || []), { step: type === 'approve' ? 'Approved by admin' : 'Rejected by admin', at: new Date().toISOString(), note }],
      } : p))
    );
    setConfirm(null);
    // clear selection
    setSelectedIds(new Set());
    setSelectAllOnPage(false);
  }

  // Single approve/reject
  function applySingle(type: 'approve' | 'reject', payout: Payout) {
    setPayouts(prev => prev.map(p => p.id === payout.id ? { ...p, status: type === 'approve' ? 'processing' : 'rejected', timeline: [...(p.timeline || []), { step: type === 'approve' ? 'Approved' : 'Rejected', at: new Date().toISOString() }] } : p));
    setConfirm(null);
    setSelected(p => p && p.id === payout.id ? { ...p, status: type === 'approve' ? 'processing' : 'rejected' } : p);
  }

  // Upload receipt and attach (mock)
  function uploadReceiptForSelected() {
    if (!selected || !receiptFile) return;
    const url = URL.createObjectURL(receiptFile);
    setPayouts(prev => prev.map(p => p.id === selected.id ? { ...p, documents: [...(p.documents||[]), { name: receiptFile.name, url }], timeline: [...(p.timeline||[]), { step: 'Receipt uploaded', at: new Date().toISOString(), note: receiptFile.name }] } : p));
    setReceiptFile(null);
  }

  // Export CSV
  function exportCSV() {
    const head = ['ID','Partner','PartnerID','City','Amount','RequestedAt','Status','Method','IBAN'];
    const rows = processed.map(p => [p.id, p.partner, p.partnerId, p.city, p.amount, p.requestedAt, p.status, p.method, p.iban ?? '']);
    const csv = [head, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `payouts_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  // Export PDF: html2canvas + jsPDF recommended (install instructions noted at top)
  async function exportPDF() {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const el = document.getElementById('payouts-print-area');
      if (!el) return window.print();
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = (canvas.height * pw) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
      pdf.save(`payouts_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      // fallback to print
      // eslint-disable-next-line no-console
      console.warn('PDF export failed, falling back to print', e);
      window.print();
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Delivery Partner Payouts</h1>
          <p className="text-sm text-slate-500 mt-1">Approve, process and audit partner payouts — Portugal</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search partner, id or city..." className="max-w-xs" />
          <div className="flex items-center gap-1">
            <button onClick={() => setDateRange('7')} className={`px-2 py-1 rounded ${dateRange==='7' ? 'bg-white border' : ''}`}>7d</button>
            <button onClick={() => setDateRange('30')} className={`px-2 py-1 rounded ${dateRange==='30' ? 'bg-white border' : ''}`}>30d</button>
            <button onClick={() => setDateRange('custom')} className={`px-2 py-1 rounded ${dateRange==='custom' ? 'bg-white border' : ''}`}>Custom</button>
          </div>
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 border rounded p-2 bg-white">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="text-sm" />
              <span className="text-xs text-slate-400">—</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="text-sm" />
            </div>
          )}

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }} className="px-3 py-2 border rounded bg-white">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 border rounded bg-white">
            <option value="date">Sort by date</option>
            <option value="amount">Sort by amount</option>
            <option value="status">Sort by status</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2"><Download className="w-4 h-4" />CSV</Button>
            <Button onClick={exportPDF} className="flex items-center gap-2"><Download className="w-4 h-4" />PDF</Button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div id="payouts-print-area" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total Requests</p>
          <h3 className="text-2xl font-bold">{total}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Pending</p>
          <h3 className="text-2xl font-bold">{payouts.filter(p => p.status === 'pending').length}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total Amount</p>
          <h3 className="text-2xl font-bold">{currency(payouts.reduce((s, p) => s + p.amount, 0))}</h3>
        </Card>
      </div>

      {/* Sticky bulk action bar */}
      {selectedIds.size > 0 && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed left-6 right-6 top-20 z-50">
          <Card className="p-3 flex items-center justify-between">
            <div className="text-sm text-slate-700">{selectedIds.size} selected</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="destructive" onClick={() => setConfirm({ type: 'reject', ids: Array.from(selectedIds) })}>Bulk Reject</Button>
              <Button size="sm" style={{ background: DELIGO }} onClick={() => setConfirm({ type: 'approve', ids: Array.from(selectedIds) })}>Bulk Approve</Button>
              <Button size="sm" variant="outline" onClick={() => { setSelectedIds(new Set()); setSelectAllOnPage(false); }}>Clear</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main grid: chart + list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <Card className="p-4 h-64">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold">Recent Payout Sizes</h4>
              <p className="text-xs text-slate-500 mt-1">Last {Math.min(12, payouts.length)} requests</p>
            </div>
            <div className="text-sm text-slate-400">Live</div>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payouts.slice(0, 12).map(p => ({ id: p.id, amount: p.amount }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip formatter={(v: any) => currency(v)} />
                <Bar dataKey="amount" fill={DELIGO} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent list with controls */}
        <Card className="p-4 col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Recent Requests</h4>
            <div className="text-sm text-slate-500">{(page-1)*perPage + 1}–{Math.min(page*perPage, total)} of {total}</div>
          </div>

          {/* table header (scrollable) */}
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 w-[48px]">
                    <Checkbox
                      id="select-all-page"
                      checked={selectAllOnPage}
                      onChange={(e) => setSelectAllOnPage((e.target as HTMLInputElement).checked)}

                      aria-label="Select all on page"
                    />
                  </th>
                  <th className="px-3 py-2 text-left w-[260px]">Partner</th>
                  <th className="px-3 py-2 text-center w-[120px]">City</th>
                  <th className="px-3 py-2 text-center w-[120px]">Amount</th>
                  <th className="px-3 py-2 text-center w-[160px]">Requested</th>
                  <th className="px-3 py-2 text-center w-[120px]">Status</th>
                  <th className="px-3 py-2 text-center w-[140px]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {pageData.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <Checkbox id={`sel-${p.id}`} checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} />
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-10 h-10"><AvatarImage src={SAMPLE_AVATAR} /><AvatarFallback>{initials(p.partner)}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.partner}</div>
                          <div className="text-xs text-slate-500 truncate">{p.partnerId} • {p.city}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-center">{p.city}</td>
                    <td className="px-3 py-3 text-center font-semibold">{currency(p.amount)}</td>
                    <td className="px-3 py-3 text-center text-xs text-slate-500">{new Date(p.requestedAt).toLocaleString()}</td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant={badgeVariantFor(p.status)}>{p.status}</Badge>
                    </td>

                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Button size="sm" variant="ghost" onClick={() => setSelected(p)} aria-label={`View ${p.id}`}><FileText className="w-4 h-4" /></Button>
                        {p.status === 'pending' && (
                          <>
                            <Button size="sm" style={{ background: DELIGO }} onClick={() => setConfirm({ type: 'approve', ids: [p.id] })}><CheckCircle className="w-4 h-4 mr-1" />Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => setConfirm({ type: 'reject', ids: [p.id] })}><XCircle className="w-4 h-4 mr-1" />Reject</Button>
                          </>
                        )}
                        {p.status === 'processing' && (
                          <Button size="sm" onClick={() => finalize(p.id)}>Mark Complete</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">No payouts match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination & page size */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, page-1))}>Prev</Button>
              <div className="px-3 py-1 bg-white border rounded">{page}</div>
              <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pages, page+1))}>Next</Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div>Page size</div>
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded bg-white">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="max-w-lg p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>Payout Details</SheetTitle>
            <SheetDescription>Review & process payout</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14"><AvatarImage src={SAMPLE_AVATAR} /><AvatarFallback>{initials(selected.partner)}</AvatarFallback></Avatar>
                <div>
                  <div className="font-semibold text-lg">{selected.partner}</div>
                  <div className="text-xs text-slate-500">{selected.partnerId} • {selected.city}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-2 text-sm">
                <div><strong>Amount:</strong> <span className="ml-2 font-semibold">{currency(selected.amount)}</span></div>
                <div><strong>Method:</strong> <span className="ml-2">{selected.method}</span></div>
                <div><strong>IBAN:</strong> <span className="ml-2">{selected.iban ?? '—'}</span></div>
                <div><strong>Requested:</strong> <span className="ml-2">{new Date(selected.requestedAt).toLocaleString()}</span></div>
                <div><strong>Status:</strong> <span className="ml-2"><Badge variant={badgeVariantFor(selected.status)}>{selected.status}</Badge></span></div>
              </div>

              <Separator />

              {/* Bank verification preview */}
              <div>
                <h4 className="font-medium">Bank verification</h4>
                <div className="p-3 mt-2 bg-slate-50 rounded border text-sm">
                  <div>Account holder: <strong>{selected.partner}</strong></div>
                  <div>IBAN match: <strong>Yes</strong></div>
                  <div>Verified on: <strong>{new Date().toLocaleDateString()}</strong></div>
                </div>
              </div>

              <Separator />

              {/* Documents */}
              <div>
                <h4 className="font-medium">Documents</h4>
                <div className="mt-2 space-y-2">
                  {(selected.documents || []).map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="text-sm">{d.name}</div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => d.url && window.open(d.url, '_blank')}><FileText className="w-4 h-4 mr-1" />View</Button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-2 flex items-center gap-2">
                    <input aria-label="upload receipt" type="file" onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
                    <Button size="sm" style={{ background: DELIGO }} onClick={uploadReceiptForSelected}><Upload className="w-4 h-4 mr-1" />Upload</Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timeline */}
              <div>
                <h4 className="font-medium">Timeline</h4>
                <ol className="mt-2 space-y-2 text-sm">
                  {(selected.timeline || []).map((t, i) => (
                    <li key={i} className="p-2 rounded border bg-white">
                      <div className="font-semibold">{t.step}</div>
                      <div className="text-xs text-slate-500">{t.at ? new Date(t.at).toLocaleString() : '—'}</div>
                      {t.note && <div className="text-xs text-slate-400 mt-1">{t.note}</div>}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center gap-2 justify-end pt-3">
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                {selected.status === 'pending' && <Button style={{ background: DELIGO }} onClick={() => setConfirm({ type: 'approve', ids: [selected.id] })}>Approve</Button>}
                {selected.status === 'processing' && <Button onClick={() => finalize(selected.id)}>Mark Completed</Button>}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm Dialog */}
      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{confirm?.type === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-slate-600 mb-4">
            You are about to <strong>{confirm?.type}</strong> {confirm?.ids.length} payout(s).
            <div className="mt-2">Add an optional note for this action:</div>
            <textarea onChange={(e) => setConfirm(c => c ? { ...c, note: e.target.value } : c)} className="w-full mt-2 border rounded p-2" placeholder="Optional note (e.g., bank issue, corrected IBAN)"></textarea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant={confirm?.type === 'approve' ? undefined : 'destructive'} onClick={() => { if (confirm) bulkApply(confirm.type, confirm.ids, confirm.note); }}>{confirm?.type === 'approve' ? 'Approve' : 'Reject'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// finalize helper (simulate transfer completed)
function finalize(id: string) {
  // update globally — in real app use API then reload states
  // This is a quick client-side helper: emit custom event
  const evt = new CustomEvent('payout:finalize', { detail: { id } });
  window.dispatchEvent(evt);
}

// ---------------- Mock Data ----------------
function mockPayouts(): Payout[] {
  const names = ['João Silva','Maria Fernandes','Rui Costa','Ana Pereira','Rui Almeida','Rita Gomes','Carlos Sousa'];
  return Array.from({ length: 36 }).map((_, i) => {
    const name = names[i % names.length];
    const status = (['pending','processing','completed','rejected'] as PayoutStatus[])[i % 4];
    const monthTrend = Array.from({ length: 12 }).map((__, idx) => ({
      month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][idx],
      deliveries: Math.floor(50 + Math.random()*200),
      avgTime: Math.floor(20 + Math.random()*20),
      onTimePct: Math.floor(70 + Math.random()*25),
      revenue: Math.floor(1000 + Math.random()*5000),
    }));
    return {
      id: `P-${4000 + i}`,
      partner: name,
      partnerId: `DP-${5000 + i}`,
      city: ['Lisbon','Porto','Coimbra','Braga','Faro'][i % 5],
      amount: Math.floor(100 + Math.random() * 2000),
      requestedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 12).toISOString(),
      status,
      method: (['bank','mbway','wallet'] as PayoutMethod[])[i % 3],
      iban: 'PT50 1234 5678 9101 2345 6',
      documents: i % 5 === 0 ? [{ name: 'receipt.pdf', url: '' }] : [],
      timeline: [
        { step: 'Request received', at: new Date(Date.now() - i * 1000 * 60 * 60 * 12).toISOString() },
        ...(status === 'processing' ? [{ step: 'Approved by admin', at: new Date(Date.now() - i * 1000 * 60 * 60 * 8).toISOString() }] : []),
        ...(status === 'completed' ? [{ step: 'Transfer completed', at: new Date(Date.now() - i * 1000 * 60 * 60 * 6).toISOString() }] : []),
      ],
    } as Payout;
  });
}
