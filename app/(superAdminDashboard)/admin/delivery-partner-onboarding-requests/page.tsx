

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

import { Trash2, Download, CheckCircle, XCircle, Clock, MapPin, UserPlus, Search as SearchIcon } from 'lucide-react';

const DELIGO = '#DC3173';
const SAMPLE_IMAGE = '/mnt/data/Screenshot from 2025-11-21 00-13-57.png';

type OnboardStatus = 'pending' | 'approved' | 'rejected' | 'needs_docs' | 'in_review';

type PartnerRequest = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  vehicleType?: string;
  yearsOfExperience?: number;
  status: OnboardStatus;
  appliedAt: string;
  documents?: { name: string; url?: string }[];
  backgroundCheck?: { passed: boolean; reportUrl?: string } | null;
  notes?: string;
};

export default function DeliveryPartnerOnboardingRequestsPage() {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OnboardStatus>('all');
  const [cityFilter, setCityFilter] = useState<'all' | string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [selected, setSelected] = useState<PartnerRequest | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: 'approve' | 'reject'; item: PartnerRequest } | null>(null);
  const [bulk, setBulk] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => setRequests(mockRequests()), []);

  const cities = useMemo(() => Array.from(new Set(requests.map((r) => r.city).filter(Boolean) as string[])), [requests]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const t = query.trim().toLowerCase();
      if (t && ![r.name, r.email, r.phone, r.city, r.id].join(' ').toLowerCase().includes(t)) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (cityFilter !== 'all' && r.city !== cityFilter) return false;
      if (dateFrom && new Date(r.appliedAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(r.appliedAt) > new Date(dateTo)) return false;
      return true;
    });
  }, [requests, query, statusFilter, cityFilter, dateFrom, dateTo]);

  const paginated = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'pending').length;
    const approved = requests.filter((r) => r.status === 'approved').length;
    const rejected = requests.filter((r) => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [requests]);

  function toggleBulk(id: string) {
    setBulk((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function exportCSV(items: PartnerRequest[]) {
    const rows = [['ID', 'Name', 'Email', 'Phone', 'City', 'Vehicle', 'Status', 'AppliedAt']];
    items.forEach((r) => rows.push([r.id, r.name, r.email, r.phone || '', r.city || '', r.vehicleType || '', r.status, r.appliedAt]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `onboarding_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  function applyAction(type: 'approve' | 'reject', id: string, note?: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: type === 'approve' ? 'approved' : 'rejected', notes: note ?? r.notes } : r)));
    setActionDialog(null);
    if (selected && selected.id === id) setSelected((s) => s ? { ...s, status: type === 'approve' ? 'approved' : 'rejected' } : s);
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <UserPlus className="w-7 h-7" style={{ color: DELIGO }} /> Delivery Partner — Onboarding Requests
      </motion.h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Requests" value={String(stats.total)} />
        <StatCard title="Pending" value={String(stats.pending)} accent="amber" />
        <StatCard title="Approved" value={String(stats.approved)} accent="emerald" />
        <StatCard title="Rejected" value={String(stats.rejected)} accent="rose" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Search name, email, phone or id..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-md" />

        <Select value={String(statusFilter)} onValueChange={(v) => setStatusFilter(v === 'all' ? 'all' : (v as OnboardStatus))}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="needs_docs">Needs Docs</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={String(cityFilter)} onValueChange={(v) => setCityFilter(v === 'all' ? 'all' : v as string)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={() => { setQuery(''); setStatusFilter('all'); setCityFilter('all'); setDateFrom(''); setDateTo(''); }}>Reset</Button>
          <Button onClick={() => exportCSV(filtered)} className="flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</Button>
          <Button variant="destructive" onClick={() => { setRequests((p) => p.filter((r) => !bulk.includes(r.id))); setBulk([]); }} disabled={bulk.length === 0}><Trash2 className="w-4 h-4" /> Delete ({bulk.length})</Button>
        </div>
      </div>

      {/* List / Table */}
      <Card className="p-0 overflow-x-auto rounded-xl shadow-sm border">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="px-4 py-3 w-[48px]"><input type="checkbox" checked={bulk.length === paginated.length && paginated.length > 0} onChange={(e) => { if (e.target.checked) setBulk(paginated.map((p) => p.id)); else setBulk([]); }} /></th>
              <th className="px-4 py-3 text-left w-[220px]">Applicant</th>
              <th className="px-4 py-3 text-left w-[140px]">Vehicle</th>
              <th className="px-4 py-3 text-left w-[120px]">City</th>
              <th className="px-4 py-3 text-center w-[140px]">Applied</th>
              <th className="px-4 py-3 text-center w-[140px]">Status</th>
              <th className="px-4 py-3 text-center w-[220px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {paginated.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 align-top">
                <td className="px-4 py-4"><input type="checkbox" checked={bulk.includes(r.id)} onChange={() => toggleBulk(r.id)} /></td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-11 h-11"><AvatarImage src={SAMPLE_IMAGE} /><AvatarFallback>{initials(r.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{r.name}</div>
                      <div className="text-xs text-slate-500 truncate">{r.email}</div>
                      <div className="text-xs text-slate-400">{r.phone}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">{r.vehicleType || '—'}</td>
                <td className="px-4 py-4 text-center">{r.city || '—'}</td>
                <td className="px-4 py-4 text-center text-slate-600">{new Date(r.appliedAt).toLocaleDateString()}</td>
                <td className="px-4 py-4 text-center"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>View</Button>
                    <Button size="sm" style={{ background: DELIGO }} onClick={() => setActionDialog({ type: 'approve', item: r })}><CheckCircle className="w-4 h-4 mr-1" />Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => setActionDialog({ type: 'reject', item: r })}><XCircle className="w-4 h-4 mr-1" />Reject</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

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
        <SheetContent className="max-w-2xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>Applicant Details</SheetTitle>
            <SheetDescription>Profile, documents, background check & actions</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16"><AvatarImage src={SAMPLE_IMAGE} /><AvatarFallback>{initials(selected.name)}</AvatarFallback></Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selected.name}</h3>
                    <p className="text-sm text-slate-500">{selected.email} • {selected.phone}</p>
                    <div className="mt-2 text-sm text-slate-600">Vehicle: <strong>{selected.vehicleType || '—'}</strong> • Experience: <strong>{selected.yearsOfExperience ?? '—'} yrs</strong></div>
                  </div>
                </div>

                <Separator />

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Application Notes</h4>
                  <p className="text-slate-700">{selected.notes || 'No notes provided.'}</p>
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-semibold mb-2">Documents</h4>
                  <div className="space-y-2">
                    {(selected.documents || []).map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border">
                        <div className="text-sm font-medium truncate">{d.name}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => d.url && window.open(d.url, '_blank')}>View</Button>
                          <Button size="sm" onClick={() => alert('Download (mock)') }><Download className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-semibold mb-2">Background Check</h4>
                  {selected.backgroundCheck ? (
                    <div className="p-3 bg-slate-50 rounded-md border">
                      <div className="text-sm">Passed: <strong>{selected.backgroundCheck.passed ? 'Yes' : 'No'}</strong></div>
                      {selected.backgroundCheck.reportUrl && (
                        <div className="mt-2"><Button size="sm" variant="outline" onClick={() => window.open(selected.backgroundCheck!.reportUrl, '_blank')}>View Report</Button></div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">No background check run yet.</div>
                  )}
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-semibold mb-2">Timeline</h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-3"><Clock className="w-4 h-4 text-slate-400" /> <div><div className="font-medium">Applied</div><div className="text-xs text-slate-500">{new Date(selected.appliedAt).toLocaleString()}</div></div></li>
                    <li className="flex items-start gap-3"><Clock className="w-4 h-4 text-slate-400" /> <div><div className="font-medium">Docs Verified</div><div className="text-xs text-slate-500">—</div></div></li>
                    <li className="flex items-start gap-3"><Clock className="w-4 h-4 text-slate-400" /> <div><div className="font-medium">Background Check</div><div className="text-xs text-slate-500">—</div></div></li>
                  </ol>
                </div>
              </div>

              <div className="col-span-1 space-y-3">
                <Card className="p-4">
                  <p className="text-xs text-slate-500">Application ID</p>
                  <p className="font-mono font-semibold">{selected.id}</p>
                </Card>

                <Card className="p-4">
                  <p className="text-xs text-slate-500">City</p>
                  <p className="font-semibold">{selected.city || '—'}</p>
                </Card>

                <div className="space-y-2">
                  <Button className="w-full" style={{ background: DELIGO }} onClick={() => setActionDialog({ type: 'approve', item: selected })}>Approve</Button>
                  <Button variant="destructive" className="w-full" onClick={() => setActionDialog({ type: 'reject', item: selected })}>Reject</Button>
                  <Button variant="outline" className="w-full" onClick={() => window.open(selected.documents?.[0]?.url || SAMPLE_IMAGE, '_blank')}>Open ID Photo</Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Approve / Reject Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{actionDialog?.type === 'approve' ? 'Approve Application' : 'Reject Application'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-slate-600">Provide an optional note for the action (will be saved in audit log).</p>
            <textarea className="w-full p-3 rounded-md border min-h-[120px]" placeholder="Optional note..." id="actionNote" />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button variant={actionDialog?.type === 'approve' ? undefined : 'destructive'} onClick={() => { const note = (document.getElementById('actionNote') as HTMLTextAreaElement).value; applyAction(actionDialog!.type, actionDialog!.item.id, note); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ----------------- UI small components ----------------- */
function StatCard({ title, value, accent }: { title: string; value: string; accent?: 'amber' | 'emerald' | 'rose' }) {
  const accentMap: Record<string, string> = { amber: 'text-amber-600', emerald: 'text-emerald-600', rose: 'text-rose-600' };
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <h3 className={`text-2xl font-bold ${accent ? accentMap[accent] : ''}`}>{value}</h3>
    </Card>
  );
}

function StatusBadge({ status }: { status: OnboardStatus }) {
  const map: Record<OnboardStatus, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
    in_review: { label: 'In Review', cls: 'bg-blue-100 text-blue-800' },
    needs_docs: { label: 'Needs Docs', cls: 'bg-amber-100 text-amber-800' },
    approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-800' },
    rejected: { label: 'Rejected', cls: 'bg-rose-100 text-rose-800' },
  };
  const m = map[status];
  return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${m.cls}`}>{m.label}</span>;
}

function initials(name = '') { return name.split(' ').map((n) => n[0] || '').slice(0,2).join('').toUpperCase(); }

/* ----------------- Mock Data ----------------- */
function mockRequests(): PartnerRequest[] {
  const names = ['João Silva', 'Maria Fernandes', 'Rui Costa', 'Ana Pereira', 'Carlos Sousa', 'Rita Gomes'];
  const cities = ['Lisbon', 'Porto', 'Coimbra', 'Braga', 'Faro'];
  const vehicles = ['Bike', 'Scooter', 'Car', 'Van'];
  const statuses: OnboardStatus[] = ['pending', 'in_review', 'needs_docs', 'approved', 'rejected'];

  return Array.from({ length: 34 }).map((_, i) => ({
    id: `DP-${3000 + i}`,
    name: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: `+3519${10000000 + i}`,
    city: cities[i % cities.length],
    vehicleType: vehicles[i % vehicles.length],
    yearsOfExperience: (i % 6) + 1,
    status: statuses[i % statuses.length],
    appliedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 12).toISOString(),
    documents: [{ name: 'ID Card', url: SAMPLE_IMAGE }, { name: 'Driving License', url: SAMPLE_IMAGE }],
    backgroundCheck: i % 5 === 0 ? { passed: true, reportUrl: SAMPLE_IMAGE } : null,
    notes: i % 4 === 0 ? 'Has local driving experience' : undefined,
  }));
}
