/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

import {
  Search,
  
  FileText,
  Eye,
  CheckCircle,
  ShieldAlert,
  Clock,
  AlertTriangle,
  
  Ban,
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

type Doc = { name: string; url?: string };

type BlockedFleet = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  rating: number;
  totalDeliveries: number;
  blockedAt: string;
  reason: string;
  riskScore: number; // 0-100
  documents?: Doc[];
  violations?: string[];
};

// ------------------ PAGE ------------------
export default function BlockedFleetManagersPage() {
  const [data, setData] = useState<BlockedFleet[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<BlockedFleet | null>(null);
  const [confirmUnblock, setConfirmUnblock] = useState<BlockedFleet | null>(null);

  useEffect(() => {
    setData(mockData());
  }, []);

  const filtered = data.filter((f) =>
    [f.name, f.email, f.phone, f.city, f.id].join(' ').toLowerCase().includes(query.toLowerCase())
  );

  function handleUnblock(id: string) {
    setData((prev) => prev.filter((f) => f.id !== id));
    setConfirmUnblock(null);
    // optionally: show a toast / API call
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6 flex items-center gap-3"
      >
        <Ban className="w-8 h-8" style={{ color: DELIGO }} /> Blocked Fleet Managers
      </motion.h1>

      {/* SEARCH */}
      <div className="flex items-center gap-3 mb-6 max-w-xl">
        <Input
          placeholder="Search name, phone, email, city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button style={{ background: DELIGO }}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* LIST CARD */}
      <Card className="p-6 bg-white shadow-sm rounded-2xl">
        <h2 className="text-xl font-semibold mb-4">Blocked Managers</h2>
        <Separator className="mb-4" />

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No blocked managers found.</div>
          ) : (
            filtered.map((f) => (
              <motion.div
                key={f.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 rounded-xl border flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`/images/fleets/${f.name.replace(/\s+/g, '-').toLowerCase()}.jpg`} />
                    <AvatarFallback>{f.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-semibold text-lg">{f.name}</div>
                    <div className="text-xs text-slate-500">{f.email}</div>
                    <div className="text-xs text-slate-500">City: {f.city}</div>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                          f.riskScore >= 80 ? 'bg-red-200 text-red-700' : f.riskScore >= 50 ? 'bg-yellow-200 text-yellow-700' : 'bg-emerald-200 text-emerald-700'
                        }`}
                      >
                        Risk: {f.riskScore}
                      </span>

                      <Badge variant="destructive">Blocked</Badge>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-600 text-sm">Blocked: {new Date(f.blockedAt).toLocaleString()}</p>

                  <div className="flex items-center gap-2 justify-end mt-3">
                    <Button size="sm" variant="outline" onClick={() => setSelected(f)}>
                      <Eye className="w-4 h-4 mr-1" /> Details
                    </Button>

                    <Button size="sm" variant="destructive" onClick={() => setConfirmUnblock(f)}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Unblock
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {/* PREMIUM SIDEBAR (Sheet) */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="max-w-md p-6 overflow-y-auto border-l bg-white shadow-xl animate-in slide-in-from-right duration-300">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold tracking-tight">Blocked Manager Details</SheetTitle>
            <SheetDescription className="text-sm text-slate-500">Full details, risk score, violations, documents & actions</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-6 space-y-6">
              {/* Avatar + basic */}
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 ring-2 ring-rose-500/25">
                  <AvatarImage src={`/images/fleets/${selected.name.replace(/\s+/g, '-').toLowerCase()}.jpg`} />
                  <AvatarFallback>{selected.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-lg font-semibold text-slate-800">{selected.name}</p>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                  <p className="text-sm text-slate-500">{selected.phone}</p>
                </div>
              </div>

              {/* Risk score box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-slate-50 border flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
                <div>
                  <p className="text-xs text-slate-500">Risk Score</p>
                  <p className="text-lg font-bold">{selected.riskScore}%</p>
                </div>
              </div>

              <Separator />

              {/* Info grid */}
              <div className="grid grid-cols-1 gap-4 text-sm">
                {[
                  { label: 'Manager ID', value: selected.id },
                  { label: 'City', value: selected.city },
                  { label: 'Rating', value: `${selected.rating} ⭐` },
                  { label: 'Total Deliveries', value: selected.totalDeliveries },
                  { label: 'Blocked At', value: new Date(selected.blockedAt).toLocaleString() },
                ].map((it, idx) => (
                  <div key={idx}>
                    <p className="text-[13px] text-slate-500">{it.label}</p>
                    <p className="font-semibold text-slate-800 mt-1">{it.value}</p>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <div>
                <p className="text-[13px] text-slate-500">Reason</p>
                <p className="font-semibold text-red-600 mt-1 leading-relaxed">{selected.reason}</p>
              </div>

              <Separator />

              {/* Violations */}
              <div>
                <p className="font-semibold mb-2">Recent Violations</p>
                <div className="flex flex-wrap gap-2">
                  {(selected.violations && selected.violations.length > 0) ? (
                    selected.violations.map((v, i) => <Badge key={i} variant="destructive">{v}</Badge>)
                  ) : (
                    <div className="text-sm text-slate-500">No recorded violations</div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Activity timeline (mock) */}
              <div>
                <p className="font-semibold mb-2">Activity Timeline</p>
                <div className="space-y-4 ml-1 border-l pl-4 border-slate-200">
                  <div className="relative">
                    <Clock className="absolute -left-6 top-1 w-4 h-4 text-slate-500" />
                    <p className="font-medium">Blocked by Admin</p>
                    <p className="text-xs text-slate-500">{new Date(selected.blockedAt).toLocaleString()}</p>
                  </div>

                  <div className="relative">
                    <AlertTriangle className="absolute -left-6 top-1 w-4 h-4 text-orange-500" />
                    <p className="font-medium">Violation Report Submitted</p>
                    <p className="text-xs text-slate-500">24 hours before block</p>
                  </div>

                  <div className="relative">
                    <FileText className="absolute -left-6 top-1 w-4 h-4 text-blue-500" />
                    <p className="font-medium">Document Verification Failed</p>
                    <p className="text-xs text-slate-500">2 days before block</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Documents */}
              <div>
                <p className="font-semibold mb-2">Documents</p>
                <div className="space-y-2">
                  {(selected.documents || []).map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border">
                      <div className="text-sm font-medium">{doc.name}</div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => doc.url && window.open(doc.url, '_blank')}>
                          <FileText className="w-4 h-4 mr-1" /> View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-3">
                <Button
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => setConfirmUnblock(selected)}
                >
                  <CheckCircle className="w-4 h-4" /> Unblock Manager
                </Button>

                <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* CONFIRM UNBLOCK DIALOG */}
      <Dialog open={!!confirmUnblock} onOpenChange={() => setConfirmUnblock(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unblock Manager</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to <strong>unblock</strong> {confirmUnblock?.name}?
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUnblock(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleUnblock(confirmUnblock!.id)}>
              Unblock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------ MOCK DATA ------------------
function mockData(): BlockedFleet[] {
  return [
    {
      id: 'FM-9001',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '+351 910000111',
      city: 'Lisbon',
      rating: 4.8,
      totalDeliveries: 1280,
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      reason: 'Multiple late deliveries and violation of delivery guidelines.',
      riskScore: 85,
      documents: [{ name: 'Violation Report.pdf', url: '#' }],
      violations: ['Late Deliveries', 'Customer Complaint'],
    },
    {
      id: 'FM-9002',
      name: 'Maria Fernandes',
      email: 'maria@example.com',
      phone: '+351 920000222',
      city: 'Porto',
      rating: 4.5,
      totalDeliveries: 980,
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      reason: 'Incorrect documents provided.',
      riskScore: 62,
      documents: [{ name: 'Document Issue.pdf', url: '#' }],
      violations: ['Document Failure'],
    },
    {
      id: 'FM-9003',
      name: 'Rui Costa',
      email: 'rui@example.com',
      phone: '+351 930000333',
      city: 'Braga',
      rating: 4.1,
      totalDeliveries: 720,
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      reason: 'Fraudulent activity detected.',
      riskScore: 93,
      documents: [{ name: 'Fraud Report.pdf', url: '#' }],
      violations: ['Fraud', 'Multiple Accounts'],
    },
  ];
}
