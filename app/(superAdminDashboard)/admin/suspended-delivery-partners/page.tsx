/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
  Download,
  RefreshCcw,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const DELIGO = '#DC3173';
// Use uploaded file path from your environment (developer message).
const SAMPLE_IMAGE = '/mnt/data/Screenshot from 2025-11-21 00-13-57.png';

type Violation = { id: string; date: string; reason: string; notes?: string };
type Partner = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  rating: number;
  suspendedAt: string;
  suspensionReason: string;
  riskScore: number; // 0-100
  violations: Violation[];
  documents?: { name: string; url?: string }[];
  lastOnline?: string;
};

export default function SuspendedDeliveryPartnersOptimizedPage() {
  // Data
  const [partners, setPartners] = useState<Partner[]>([]);
  // Filters / UI state
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<'all' | string>('all');
  const [reasonFilter, setReasonFilter] = useState<'all' | string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [riskMin, setRiskMin] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'suspendedAt' | 'riskScore' | 'rating' | 'violations'>('suspendedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Selection & drawer/dialog
  const [selected, setSelected] = useState<Partner | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmReactivate, setConfirmReactivate] = useState<Partner | null>(null);
  const [confirmBulkReactivate, setConfirmBulkReactivate] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load mock data (replace with API fetch)
  useEffect(() => {
    setPartners(mockPartners());
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Unique filter values
  const cities = useMemo(() => Array.from(new Set(partners.map((p) => p.city).filter(Boolean) as string[])).sort(), [partners]);
  const reasons = useMemo(() => Array.from(new Set(partners.map((p) => p.suspensionReason))).sort(), [partners]);

  // Filter + sort logic
  const filtered = useMemo(() => {
    const list = partners.filter((p) => {
      if (debouncedQuery && ![p.name, p.email, p.phone, p.id].join(' ').toLowerCase().includes(debouncedQuery)) return false;
      if (cityFilter !== 'all' && p.city !== cityFilter) return false;
      if (reasonFilter !== 'all' && p.suspensionReason !== reasonFilter) return false;
      if (dateFrom && new Date(p.suspendedAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(p.suspendedAt) > new Date(dateTo)) return false;
      if (riskMin !== '' && p.riskScore < Number(riskMin)) return false;
      return true;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    return list.sort((a, b) => {
      if (sortBy === 'riskScore') return dir * (a.riskScore - b.riskScore);
      if (sortBy === 'rating') return dir * (a.rating - b.rating);
      if (sortBy === 'violations') return dir * (a.violations.length - b.violations.length);
      return dir * (new Date(a.suspendedAt).getTime() - new Date(b.suspendedAt).getTime());
    });
  }, [partners, debouncedQuery, cityFilter, reasonFilter, dateFrom, dateTo, riskMin, sortBy, sortDir]);

  const paginated = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]);

  // Stats
  const stats = useMemo(() => {
    const total = partners.length;
    const avgRating = total ? Number((partners.reduce((s, p) => s + p.rating, 0) / total).toFixed(2)) : 0;
    const commonReason = partners.reduce((acc: Record<string, number>, p) => { acc[p.suspensionReason] = (acc[p.suspensionReason] || 0) + 1; return acc; }, {});
    const mostCommon = Object.keys(commonReason).sort((a, b) => (commonReason[b] - commonReason[a]))[0] || '—';
    return { total, avgRating, mostCommon };
  }, [partners]);

  // Selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }, []);

  const selectAllCurrentPage = useCallback(() => {
    const ids = paginated.map((p) => p.id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((s) => (allSelected ? s.filter((x) => !ids.includes(x)) : Array.from(new Set([...s, ...ids]))));
  }, [paginated, selectedIds]);

  // Actions
  function reactivate(id: string) {
    setPartners((prev) => prev.filter((p) => p.id !== id));
    setConfirmReactivate(null);
    setSelected(null);
    setSelectedIds((s) => s.filter((x) => x !== id));
  }

  function bulkReactivate() {
    setPartners((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setConfirmBulkReactivate(false);
    setSelectedIds([]);
  }

  // Export CSV
  function exportCSV(items: Partner[]) {
    setIsExporting(true);
    try {
      const rows = [['ID', 'Name', 'Email', 'City', 'Rating', 'RiskScore', 'SuspendedAt', 'Reason', 'ViolationsCount']];
      items.forEach((p) => rows.push([p.id, p.name, p.email, p.city || '', String(p.rating), String(p.riskScore), p.suspendedAt, p.suspensionReason, String(p.violations.length)]));
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suspended_partners_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('CSV export failed', e);
    } finally {
      setIsExporting(false);
    }
  }

  // Export PDF (prints the visible table area)
  async function exportPDF() {
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const el = document.getElementById('suspended-print-area');
      if (!el) return window.print();
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const props = (pdf as any).getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (props.height * pdfWidth) / props.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`suspended_partners_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      // fallback to print
      // eslint-disable-next-line no-console
      console.warn('PDF export error, falling back to print', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  }

  // UI helpers
  function toggleSort(column: typeof sortBy) {
    if (sortBy === column) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(column);
      setSortDir('desc');
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <AlertTriangle className="w-8 h-8" style={{ color: DELIGO }} /> Suspended Delivery Partners
      </motion.h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total Suspended</p>
          <h3 className="text-2xl font-bold">{stats.total}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Avg Rating</p>
          <h3 className="text-2xl font-bold">{stats.avgRating}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Most Common Reason</p>
          <h3 className="text-2xl font-bold">{stats.mostCommon}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Actions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => exportCSV(filtered)} disabled={isExporting}><Download className="w-4 h-4" /> Export CSV</Button>
            <Button onClick={exportPDF} disabled={isExporting} className="flex items-center gap-2"><Download className="w-4 h-4" /> Export PDF</Button>
            <Button variant="outline" onClick={() => { setPartners(mockPartners()); setSelectedIds([]); }}><RefreshCcw className="w-4 h-4" /> Reload</Button>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="sr-only" htmlFor="search">Search</label>
        <Input id="search" placeholder="Search name, id, email..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-md" />
        <Select value={String(cityFilter)} onValueChange={(v) => setCityFilter(v === 'all' ? 'all' : v as any)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={String(reasonFilter)} onValueChange={(v) => setReasonFilter(v === 'all' ? 'all' : v as any)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reasons</SelectItem>
            {reasons.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <Input placeholder="Min Risk Score" type="number" value={String(riskMin)} onChange={(e) => setRiskMin(e.target.value === '' ? '' : Number(e.target.value))} className="w-40" />

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 text-sm text-slate-500">Sort</div>
          <Button variant="outline" size="sm" onClick={() => toggleSort('suspendedAt')}>Date {sortBy === 'suspendedAt' && (sortDir === 'asc' ? <ChevronUp className="inline-block w-4 h-4" /> : <ChevronDown className="inline-block w-4 h-4" />)}</Button>
          <Button variant="outline" size="sm" onClick={() => toggleSort('riskScore')}>Risk {sortBy === 'riskScore' && (sortDir === 'asc' ? <ChevronUp className="inline-block w-4 h-4" /> : <ChevronDown className="inline-block w-4 h-4" />)}</Button>
          <Button variant="outline" size="sm" onClick={() => toggleSort('rating')}>Rating {sortBy === 'rating' && (sortDir === 'asc' ? <ChevronUp className="inline-block w-4 h-4" /> : <ChevronDown className="inline-block w-4 h-4" />)}</Button>
        </div>
      </div>

      {/* Table area (printable id used for PDF) */}
      <div id="suspended-print-area" className="rounded-xl bg-white shadow-sm overflow-x-auto border">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
            <tr>
              <th className="px-4 py-3 w-[48px]">
                <input
                  aria-label="Select all in page"
                  type="checkbox"
                  checked={paginated.length > 0 && paginated.every((p) => selectedIds.includes(p.id))}
                  onChange={() => selectAllCurrentPage()}
                />
              </th>
              <th className="px-4 py-3 text-left w-[260px]">Partner</th>
              <th className="px-4 py-3 text-center w-[120px]">City</th>
              <th className="px-4 py-3 text-center w-[120px]">Rating</th>
              <th className="px-4 py-3 text-center w-[120px]">Risk</th>
              <th className="px-4 py-3 text-center w-[180px]">Suspended At</th>
              <th className="px-4 py-3 text-left w-[320px]">Reason</th>
              <th className="px-4 py-3 text-center w-[120px]">Violations</th>
              <th className="px-4 py-3 text-center w-[200px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {paginated.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 align-top">
                <td className="px-4 py-4">
                  <input aria-label={`Select ${p.name}`} type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-11 h-11"><AvatarImage src={SAMPLE_IMAGE} /><AvatarFallback>{initials(p.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{p.name}</div>
                      <div className="text-xs text-slate-500 truncate">{p.email}</div>
                      <div className="text-xs text-slate-400">{p.phone}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-center">{p.city}</td>
                <td className="px-4 py-4 text-center font-semibold">{p.rating}</td>

                <td className="px-4 py-4 text-center">
                  <RiskPill score={p.riskScore} />
                </td>

                <td className="px-4 py-4 text-center text-slate-600">{formatDate(p.suspendedAt)}</td>

                <td className="px-4 py-4">{p.suspensionReason}</td>

                <td className="px-4 py-4 text-center">{p.violations.length}</td>

                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(p)} aria-label={`View ${p.name} details`}>View</Button>
                    <Button size="sm" style={{ background: DELIGO }} onClick={() => setConfirmReactivate(p)} aria-label={`Reactivate ${p.name}`}><CheckCircle className="w-4 h-4 mr-1" />Reactivate</Button>
                    <Button size="sm" variant="destructive" onClick={() => setPartners((prev) => prev.filter((x) => x.id !== p.id))} aria-label={`Delete ${p.name}`}><XCircle className="w-4 h-4 mr-1" />Delete</Button>
                  </div>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">No suspended partners match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk action bar */}
      <div className="mt-3 flex items-center gap-3">
        <div className="text-sm text-slate-500">Selected: {selectedIds.length}</div>
        <Button variant="outline" onClick={() => setSelectedIds([])}>Clear</Button>
        <Button onClick={() => setConfirmBulkReactivate(true)} disabled={selectedIds.length === 0}>Reactivate Selected</Button>
        <Button variant="destructive" onClick={() => setPartners((prev) => prev.filter((p) => !selectedIds.includes(p.id)))} disabled={selectedIds.length === 0}>Delete Selected</Button>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} results</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))}>Prev</Button>
          <div className="px-3 py-1 rounded-md bg-white border">{page}</div>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* Details Drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="max-w-3xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>Partner Details</SheetTitle>
            <SheetDescription>Profile, activity, violations, documents & reinstatement</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16"><AvatarImage src={SAMPLE_IMAGE} /><AvatarFallback>{initials(selected.name)}</AvatarFallback></Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selected.name}</h3>
                  <div className="text-sm text-slate-500">{selected.email} • {selected.city}</div>
                  <div className="mt-2 text-sm">Risk: <RiskPill score={selected.riskScore} /></div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-slate-500">Suspended: {formatDate(selected.suspendedAt)}</p>
                  <Badge variant="destructive">Suspended</Badge>
                </div>
              </div>

              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="violations">Violations</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="reinstatement">Reinstatement</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Info label="Partner ID" value={selected.id} />
                    <Info label="Phone" value={selected.phone || '—'} />
                    <Info label="Rating" value={selected.rating} />
                    <Info label="Last Online" value={selected.lastOnline ? formatDate(selected.lastOnline) : '—'} />
                  </div>
                </TabsContent>

                <TabsContent value="activity">
                  <p className="text-sm text-slate-600">Recent activity (mocked)</p>
                  <ol className="mt-2 space-y-2">
                    <li className="text-sm"><strong>{formatDateISORelative(selected.suspendedAt)}</strong> — Reported incident</li>
                    <li className="text-sm"><strong>{formatDateISORelative(selected.suspendedAt, 2)}</strong> — Reviewed by Ops</li>
                  </ol>
                </TabsContent>

                <TabsContent value="violations">
                  <div className="space-y-3">
                    {selected.violations.map((v) => (
                      <div key={v.id} className="p-3 border rounded-md bg-slate-50">
                        <div className="text-sm font-semibold">{v.reason}</div>
                        <div className="text-xs text-slate-500">{formatDate(v.date)}</div>
                        {v.notes && <div className="text-sm mt-1">{v.notes}</div>}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="documents">
                  <div className="space-y-2">
                    {(selected.documents || []).length === 0 && <div className="text-sm text-slate-500">No documents</div>}
                    {(selected.documents || []).map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border rounded-md bg-white">
                        <div className="text-sm truncate">{d.name}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => d.url && window.open(d.url, '_blank')}><FileText className="w-4 h-4" /> View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reinstatement">
                  <h4 className="font-semibold">Reinstatement Requirements</h4>
                  <ul className="list-disc ml-5 mt-2 text-sm text-slate-700 space-y-1">
                    <li>Resolve violations & provide evidence.</li>
                    <li>Submit updated documents (ID/license).</li>
                    <li>Pass background check.</li>
                    <li>48-hour probation post-reactivation.</li>
                  </ul>

                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => setConfirmReactivate(selected)}>Reactivate</Button>
                    <Button variant="outline" onClick={() => alert('Message (mock)')}>Message partner</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reactivate confirm dialog */}
      <Dialog open={!!confirmReactivate} onOpenChange={() => setConfirmReactivate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reactivate Partner</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 mb-4">Are you sure you want to reactivate <strong>{confirmReactivate?.name}</strong>? This will reinstate their account and place them under probation.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReactivate(null)}>Cancel</Button>
            <Button onClick={() => reactivate(confirmReactivate!.id)}>Confirm Reactivate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reactivate confirm */}
      <Dialog open={confirmBulkReactivate} onOpenChange={() => setConfirmBulkReactivate(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reactivate Selected Partners</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 mb-4">Reactivate <strong>{selectedIds.length}</strong> selected partner(s)? This action cannot be undone here.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBulkReactivate(false)}>Cancel</Button>
            <Button onClick={() => bulkReactivate()}>Reactivate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- UI Helpers ---------------- */

function initials(name = '') {
  return name.split(' ').map((n) => (n[0] || '')).join('').slice(0, 2).toUpperCase();
}

function RiskPill({ score }: { score: number }) {
  const color = score > 70 ? 'bg-rose-100 text-rose-600' : score > 40 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
  return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>{score}</span>;
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="text-sm text-slate-700">
      <p className="text-[12px] text-slate-500">{label}</p>
      <p className="font-semibold mt-1 text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return iso;
  }
}

function formatDateISORelative(iso?: string, offsetSteps = 1) {
  if (!iso) return '—';
  const dt = new Date(iso).getTime() - offsetSteps * 1000 * 60 * 60;
  return new Date(dt).toLocaleString();
}

/* ---------------- Mock Data ---------------- */
function mockPartners(): Partner[] {
  const now = Date.now();
  const reasons = ['Fraudulent activity', 'Multiple chargebacks', 'Document mismatch', 'Violations of safety', 'Abusive behaviour'];
  const cities = ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro'];
  return Array.from({ length: 36 }).map((_, i) => ({
    id: `DP-S-${7000 + i}`,
    name: ['João Silva', 'Maria Fernandes', 'Rui Costa', 'Ana Pereira', 'Carlos Sousa', 'Rita Gomes'][i % 6],
    email: `user${i}@example.com`,
    phone: `+3519${10000000 + i}`,
    city: cities[i % cities.length],
    rating: Number((3 + Math.random() * 2).toFixed(2)),
    suspendedAt: new Date(now - i * 1000 * 60 * 60 * 12).toISOString(),
    suspensionReason: reasons[i % reasons.length],
    riskScore: Math.floor(Math.random() * 100),
    violations: Array.from({ length: (i % 4) + 1 }).map((_, vi) => ({ id: `V-${i}-${vi}`, date: new Date(now - (vi + 1) * 1000 * 60 * 60 * 24).toISOString(), reason: reasons[(i + vi) % reasons.length], notes: vi % 2 === 0 ? 'Verified by support' : undefined })),
    documents: [{ name: 'ID Card', url: SAMPLE_IMAGE }, { name: 'Driving License', url: SAMPLE_IMAGE }],
    lastOnline: new Date(now - (i % 10) * 1000 * 60 * 30).toISOString(),
  }));
}
