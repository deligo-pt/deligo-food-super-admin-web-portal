// File: app/admin/fleet-manager/fleet-manager-withdrawals/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  
  Search,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  Download,
  EuroIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const DELIGO = '#DC3173';

// ---------- types ----------
type Withdrawal = {
  id: string;
  fleetManager: string;
  amount: number;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  method: 'bank_transfer' | 'mbway' | 'wallet_cashout';
  iban: string;
  documents?: { name: string; url?: string }[];
};

// ---------- main component ----------
export default function FleetManagerWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Withdrawal['status']>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  // selected for drawer
  const [selected, setSelected] = useState<Withdrawal | null>(null);

  // confirm modal: { type, id } or null
  const [confirmAction, setConfirmAction] = useState<null | { type: 'approve' | 'reject'; id: string }>(null);

  // upload file for receipts in the drawer (mocked)
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    setWithdrawals(mockData());
  }, []);

  // ---------- sort & filter ----------
  const sorted = [...withdrawals].sort((a, b) => {
    if (sortBy === 'amount') return b.amount - a.amount;
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });

  const filtered = sorted.filter((w) => {
    const matchQuery = [w.fleetManager, w.id].join(' ').toLowerCase().includes(query.toLowerCase());
    const matchStatus = filterStatus === 'all' || w.status === filterStatus;
    return matchQuery && matchStatus;
  });

  // ---------- actions ----------
  function approveWithdrawalById(id: string) {
    setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'approved' } : w)));
    setConfirmAction(null);
    // close drawer if that one is opened
    if (selected?.id === id) setSelected((s) => (s ? { ...s, status: 'approved' } : s));
  }

  function rejectWithdrawalById(id: string) {
    setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'rejected' } : w)));
    setConfirmAction(null);
    if (selected?.id === id) setSelected((s) => (s ? { ...s, status: 'rejected' } : s));
  }

  // when clicking Approve/Reject on row: use confirm modal (no drawer open)
  function onRowApproveClick(id: string) {
    setConfirmAction({ type: 'approve', id });
  }
  function onRowRejectClick(id: string) {
    setConfirmAction({ type: 'reject', id });
  }

  // upload file mock (adds to selected.documents)
  function handleUploadReceiptInDrawer() {
    if (!selected || !uploadFile) return;
    const fakeUrl = URL.createObjectURL(uploadFile);
    setWithdrawals((prev) => prev.map((w) => (w.id === selected.id ? { ...w, documents: [...(w.documents || []), { name: uploadFile.name, url: fakeUrl }] } : w)));
    // update selected too so UI immediately shows it
    setSelected((s) => (s ? { ...s, documents: [...(s.documents || []), { name: uploadFile.name, url: fakeUrl }] } : s));
    setUploadFile(null);
  }

  // Export PDF -> fallback print
  function exportPDF() {
    window.print();
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* Header */}
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <EuroIcon className="w-8 h-8" style={{ color: DELIGO }} /> Fleet Manager Withdrawals
      </motion.h1>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input placeholder="Search by name or withdrawal ID..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
        <Button style={{ background: DELIGO }}><Search className="w-4 h-4" /></Button>

        <select className="px-3 py-2 border rounded-md bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select className="px-3 py-2 border rounded-md bg-white" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>

        <Button variant="outline" onClick={exportPDF} className="flex items-center gap-2"><Download className="w-4 h-4" /> Export PDF</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard title="Total Withdrawal Requests" value={`${filtered.length}`} icon={<EuroIcon className="w-6 h-6" style={{ color: DELIGO }} />} />
        <SummaryCard title="Pending Requests" value={`${filtered.filter((w) => w.status === 'pending').length}`} icon={<Clock className="w-6 h-6 text-orange-500" />} />
        <SummaryCard title="Approved Amount (€)" value={`€ ${filtered.filter((w) => w.status === 'approved').reduce((s, w) => s + w.amount, 0).toLocaleString()}`} icon={<CheckCircle className="w-6 h-6 text-green-600" />} />
      </div>

      {/* List */}
      <Card className="p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Withdrawal Requests</h2>
        <Separator className="mb-4" />

        <div className="space-y-4">
          {filtered.map((w) => (
            <motion.div key={w.id} whileHover={{ scale: 1.01 }} className="p-4 bg-white rounded-xl border flex items-center justify-between">
              {/* left: clicking opens drawer */}
              <div onClick={() => setSelected(w)} className="cursor-pointer flex items-center gap-4">
                {w.status === 'approved' ? (
                  <CheckCircle className="w-7 h-7 text-green-600" />
                ) : w.status === 'pending' ? (
                  <Clock className="w-7 h-7 text-orange-500" />
                ) : (
                  <XCircle className="w-7 h-7 text-red-600" />
                )}

                <div>
                  <div className="font-semibold">{w.fleetManager}</div>
                  <div className="text-xs text-slate-500">ID: {w.id}</div>
                  <Badge className="mt-1" variant={badgeVariant(w.status)}>{w.status}</Badge>
                </div>
              </div>

              {/* right: amount + actions (approve/reject do NOT open drawer) */}
              <div className="text-right">
                <div className="text-lg font-bold">€ {w.amount.toLocaleString()}</div>
                <div className="text-xs text-slate-500">{new Date(w.requestedAt).toLocaleString()}</div>

                {w.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <Button size="sm" variant="destructive" onClick={() => onRowRejectClick(w.id)}>Reject</Button>
                    <Button size="sm" style={{ background: DELIGO }} onClick={() => onRowApproveClick(w.id)}>Approve</Button>
                  </div>
                )}

                {w.status !== 'pending' && (
                  <div className="mt-2">
                    <Button size="sm" variant="outline" onClick={() => setSelected(w)}><FileText className="w-4 h-4 mr-1" /> Details</Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* ---------------- DRAWER (DETAILS) ----------------
          IMPORTANT:
          - Drawer content is scrollable: `overflow-y-auto max-h-[100vh]`
          - Padding at bottom to avoid clipped content
      -------------------------------------------------- */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md p-4 overflow-y-auto max-h-[100vh]">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">Withdrawal Details</SheetTitle>
            <SheetDescription>Full payout breakdown, bank verification & documents</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-6 space-y-6 pb-12">
              <Detail label="Fleet Manager" value={selected.fleetManager} />
              <Detail label="Withdrawal ID" value={selected.id} />
              <Detail label="Amount" value={`€ ${selected.amount.toLocaleString()}`} />
              <Detail label="Status" value={selected.status} />
              <Detail label="Method" value={selected.method.replace('_', ' ')} />
              <Detail label="IBAN" value={selected.iban} />
              <Detail label="Requested At" value={new Date(selected.requestedAt).toLocaleString()} />

              {/* Bank verification preview (mock) */}
              <div>
                <h3 className="font-semibold">Bank Verification</h3>
                <div className="p-3 mt-2 border rounded-md bg-slate-50 text-sm">
                  <div>Account Holder: <strong>{selected.fleetManager}</strong></div>
                  <div>IBAN Match: <strong>Yes</strong></div>
                  <div>Verified On: <strong>{new Date(new Date(selected.requestedAt).getTime() - 3600 * 1000 * 24).toLocaleDateString()}</strong></div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold">Documents</h3>
                <div className="mt-2 space-y-2">
                  {(selected.documents || []).map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded-md bg-white">
                      <div className="text-sm">{d.name}</div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => d.url && window.open(d.url, '_blank')}><FileText className="w-4 h-4 mr-1" /> View</Button>
                      </div>
                    </div>
                  ))}

                  {(!selected.documents || selected.documents.length === 0) && (
                    <div className="text-sm text-slate-500">No documents uploaded.</div>
                  )}
                </div>
              </div>

              {/* Upload transfer receipt */}
              <div>
                <h3 className="font-semibold">Upload Transfer Receipt</h3>
                <div className="mt-2 flex items-center gap-2">
                  <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
                  <Button size="sm" style={{ background: DELIGO }} onClick={handleUploadReceiptInDrawer}><Upload className="w-4 h-4 mr-1" /> Upload</Button>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold">Payout Processing Timeline</h3>
                <ol className="mt-2 text-sm space-y-2">
                  <li>1. Request received — <span className="text-slate-500">{new Date(selected.requestedAt).toLocaleString()}</span></li>
                  <li>2. Bank verification — <span className="text-slate-500">In progress</span></li>
                  <li>3. Transfer initiated — <span className="text-slate-500">—</span></li>
                  <li>4. Completed — <span className="text-slate-500">—</span></li>
                </ol>
              </div>

              {/* Actions (drawer) */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                {selected.status === 'pending' && (
                  <>
                    <Button variant="destructive" onClick={() => setConfirmAction({ type: 'reject', id: selected.id })}>Reject</Button>
                    <Button style={{ background: DELIGO }} onClick={() => setConfirmAction({ type: 'approve', id: selected.id })}>Approve</Button>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Modal */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.type === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-600 mb-4">Are you sure you want to <strong>{confirmAction?.type}</strong> this withdrawal?</p>

          <div className="flex items-center gap-2 mb-4">
            <Input placeholder="Optional note (will be saved in audit log)" onChange={() => {}} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              style={{ background: DELIGO }}
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === 'approve') approveWithdrawalById(confirmAction.id);
                else rejectWithdrawalById(confirmAction.id);
              }}
            >
              {confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- small UI helpers ----------
function SummaryCard({ title, value, icon }: any) {
  return (
    <Card className="p-5 shadow-sm border rounded-xl bg-white flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
      </div>
      <div className="p-3 rounded-xl bg-slate-100">{icon}</div>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function badgeVariant(status: Withdrawal['status']) {
  if (status === 'approved') return 'default';
  if (status === 'pending') return 'secondary';
  return 'destructive';
}

// ---------- mock data ----------
function mockData(): Withdrawal[] {
  return Array.from({ length: 18 }).map((_, i) => ({
    id: `WD-${3000 + i}`,
    fleetManager: ['João Silva', 'Maria Fernandes', 'Rui Costa', 'Ana Pereira'][i % 4],
    amount: Math.floor(Math.random() * 800) + 50,
    requestedAt: new Date(Date.now() - i * 3600 * 1000 * 12).toISOString(),
    status: ['pending', 'approved', 'rejected'][i % 3],
    method: ['bank_transfer', 'mbway', 'wallet_cashout'][i % 3] as Withdrawal['method'],
    iban: 'PT50 1234 5678 9101 2345 6',
    documents: i % 3 === 0 ? [{ name: 'Bank Proof.pdf', url: undefined }] : [],
  }));
}
