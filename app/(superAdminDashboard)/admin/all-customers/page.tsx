/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Eye, Mail, Download, Check, Slash } from 'lucide-react';

const DELIGO = '#DC3173';
// Local uploaded screenshot (used as sample avatar). Keep this path or replace with your CDN path.
const SAMPLE_AVATAR = '/mnt/data/Screenshot from 2025-11-21 00-13-57.png';

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  joinedAt: string;
  totalOrders: number;
  totalSpend: number;
  verified: boolean;
  suspended: boolean;
  riskScore: number;
  address?: string[];
  paymentMethods?: { type: string; last4?: string }[];
  documents?: { name: string; url?: string }[];
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [suspendDialog, setSuspendDialog] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(mockData());
  }, []);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.phone, c.city, c.id].join(' ').toLowerCase().includes(t)
    );
  }, [q, customers]);

  function toggleVerify(id: string) {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, verified: !c.verified } : c)));
  }

  function toggleSuspend(id: string) {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, suspended: !c.suspended } : c)));
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6"
      >
        All Customers
      </motion.h1>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input
          placeholder="Search by name, email, phone or id..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" className="hidden sm:flex gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button className="flex gap-2" style={{ background: DELIGO }}>
            <Mail className="w-4 h-4" /> Message
          </Button>
        </div>
      </div>

      {/* Horizontal-scroll table container */}
      <Card className="p-0 overflow-x-auto rounded-xl shadow-sm border">
        <table className="min-w-[1300px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left w-[60px]">#</th>
              <th className="px-4 py-3 text-left w-[280px]">Customer</th>
              <th className="px-4 py-3 text-center w-[120px]">Orders</th>
              <th className="px-4 py-3 text-center w-[150px]">Spend (€)</th>
              <th className="px-4 py-3 text-center w-[150px]">Joined</th>
              <th className="px-4 py-3 text-center w-[260px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filtered.map((c, i) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-semibold text-slate-700">{i + 1}</td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={SAMPLE_AVATAR} alt={c.name} />
                      <AvatarFallback>{initials(c.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{c.name}</div>
                      <div className="text-xs text-slate-500 truncate">{c.email}</div>
                      <div className="text-xs text-slate-400">{c.city}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-center">
                  <div className="font-semibold">{c.totalOrders}</div>
                  <div className="text-xs text-slate-500">orders</div>
                </td>

                <td className="px-4 py-4 text-center">
                  <div className="font-bold text-emerald-600">€ {c.totalSpend.toLocaleString()}</div>
                </td>

                <td className="px-4 py-4 text-center text-slate-700">{formatDate(c.joinedAt)}</td>

                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(c)}>
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVerify(c.id)}
                      className="whitespace-nowrap"
                    >
                      <Check className="w-4 h-4 mr-1" /> {c.verified ? 'Unverify' : 'Verify'}
                    </Button>

                    <Button
                      size="sm"
                      variant={c.suspended ? 'secondary' : 'destructive'}
                      onClick={() => setSuspendDialog(c)}
                      className="whitespace-nowrap"
                    >
                      <Slash className="w-4 h-4 mr-1" /> {c.suspended ? 'Unsuspend' : 'Suspend'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Details sheet (right drawer) */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="max-w-xl p-6 overflow-y-auto border-l">
          <SheetHeader>
            <SheetTitle>Customer Details</SheetTitle>
            <SheetDescription>Profile, activity & admin actions</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={SAMPLE_AVATAR} />
                  <AvatarFallback>{initials(selected.name)}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-lg font-bold">{selected.name}</p>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                </div>
              </div>

              <Separator />

              <Info label="Customer ID" value={selected.id} />
              <Info label="City" value={selected.city || '—'} />
              <Info label="Total Orders" value={String(selected.totalOrders)} />
              <Info label="Total Spend" value={`€ ${selected.totalSpend.toLocaleString()}`} />
              <Info label="Joined" value={formatDate(selected.joinedAt)} />

              <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={() => toggleVerify(selected.id)}>Toggle Verify</Button>
                <Button className="w-full" variant="destructive" onClick={() => setSuspendDialog(selected)}>Suspend / Unsuspend</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Suspend / Unsuspend confirmation dialog */}
      <Dialog open={!!suspendDialog} onOpenChange={() => setSuspendDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{suspendDialog?.suspended ? 'Unsuspend Customer' : 'Suspend Customer'}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-600 mb-4">
            {suspendDialog?.suspended
              ? `Are you sure you want to unsuspend ${suspendDialog.name}?`
              : `Are you sure you want to suspend ${suspendDialog?.name}? You can provide a reason in backend.`}
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialog(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                toggleSuspend(suspendDialog!.id);
                setSuspendDialog(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ----------------- Small UI helpers ----------------- */

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

/* ----------------- Mock data ----------------- */

function mockData(): Customer[] {
  const names = ['Ana Pereira', 'João Silva', 'Maria Fernandes', 'Carlos Sousa', 'Rui Costa', 'Inês Duarte'];
  const cities = ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro'];
  return Array.from({ length: 18 }).map((_, i) => ({
    id: `CUST-${1000 + i}`,
    name: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: `+3519${10000000 + i}`,
    city: cities[i % cities.length],
    joinedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24 * 3).toISOString(),
    totalOrders: Math.floor(Math.random() * 120),
    totalSpend: Math.floor(Math.random() * 2000),
    verified: i % 3 === 0,
    suspended: i % 11 === 0,
    riskScore: Math.floor(Math.random() * 100),
    address: i % 2 === 0 ? ['Rua ABC, 12', 'Apt 3B'] : [],
    paymentMethods: i % 2 === 0 ? [{ type: 'Visa', last4: '4242' }] : [],
    documents: i % 5 === 0 ? [{ name: 'ID Proof.pdf', url: SAMPLE_AVATAR }] : [],
  }));
}
