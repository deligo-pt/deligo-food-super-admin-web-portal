/* eslint-disable @typescript-eslint/no-explicit-any */
// Active Customers Page (Premium Glovo/Uber Eats Level) - FULL CODE
// Next.js + TypeScript + TailwindCSS + shadcn + Framer Motion

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Eye, Download, Slash, Check, Mail } from 'lucide-react';

const DELIGO = '#DC3173';
// Use the uploaded screenshot as sample avatar URL
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
  suspended?: boolean;
};

export default function ActiveCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [suspendDialog, setSuspendDialog] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(mockActive());
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.city, c.phone, c.id].join(' ').toLowerCase().includes(q)
    );
  }, [query, customers]);

  function toggleVerify(id: string) {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, verified: !c.verified } : c)));
  }

  function toggleSuspendLocal(id: string) {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, suspended: !c.suspended } : c)));
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6">
        Active Customers
      </motion.h1>

      {/* Search and actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input
          placeholder="Search name, email, phone, city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />

        <div className="flex gap-3 ml-auto">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button style={{ background: DELIGO }} className="flex items-center gap-2">
            <Mail className="w-4 h-4" /> Notify
          </Button>
        </div>
      </div>

      {/* Table with horizontal scroll */}
      <Card className="p-0 overflow-x-auto rounded-xl shadow-sm border">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left w-[60px]">#</th>
              <th className="px-4 py-3 text-left w-[260px]">Customer</th>
              <th className="px-4 py-3 text-center w-[140px]">Orders</th>
              <th className="px-4 py-3 text-center w-[150px]">Spend (€)</th>
              <th className="px-4 py-3 text-center w-[150px]">Joined</th>
              <th className="px-4 py-3 text-center w-[220px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filtered.map((c, i) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-semibold text-slate-600">{i + 1}</td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={SAMPLE_AVATAR} />
                      <AvatarFallback>{initials(c.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 truncate">{c.email}</p>
                      <p className="text-xs text-slate-400">{c.city}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-center">
                  <div className="font-semibold">{c.totalOrders}</div>
                  <p className="text-xs text-slate-500">orders</p>
                </td>

                <td className="px-4 py-4 text-center font-bold text-emerald-600">
                  € {c.totalSpend.toLocaleString()}
                </td>

                <td className="px-4 py-4 text-center text-slate-600">
                  {formatDate(c.joinedAt)}
                </td>

                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(c)}>
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant={c.verified ? 'outline' : 'secondary'}
                      onClick={() => toggleVerify(c.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {c.verified ? 'Unverify' : 'Verify'}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => toggleSuspendLocal(c.id)}
                    >
                      <Slash className="w-4 h-4 mr-1" /> Suspend
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Customer Details Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="max-w-xl p-6 overflow-y-auto border-l">
          <SheetHeader>
            <SheetTitle>Customer Details</SheetTitle>
            <SheetDescription>Complete customer information</SheetDescription>
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
              <Info label="City" value={selected.city} />
              <Info label="Total Orders" value={selected.totalOrders} />
              <Info label="Total Spend" value={`€ ${selected.totalSpend}`} />
              <Info label="Joined" value={formatDate(selected.joinedAt)} />

              <div className="flex flex-col gap-3">
                <Button onClick={() => toggleVerify(selected.id)}>Toggle Verification</Button>

                <Button variant="destructive" onClick={() => toggleSuspendLocal(selected.id)}>
                  Suspend Customer
                </Button>

                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* suspend dialog */}
      <Dialog open={!!suspendDialog} onOpenChange={() => setSuspendDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{suspendDialog?.suspended ? 'Unsuspend Customer' : 'Suspend Customer'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 mb-4">Provide a reason (optional) and confirm.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toggleSuspendLocal(suspendDialog!.id); setSuspendDialog(null); }}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- helpers ---------- */
function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function formatDate(dateStr = '') {
  const d = new Date(dateStr || Date.now());
  return d.toLocaleDateString();
}

/* --------- mock data ---------- */
function mockActive(): Customer[] {
  const names = ['Ana Pereira', 'João Silva', 'Maria Fernandes', 'Carlos Sousa', 'Rui Costa', 'Inês Duarte'];
  const cities = ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro'];
  return Array.from({ length: 18 }).map((_, i) => ({
    id: `CUST-A-${1000 + i}`,
    name: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: `+3519${10000000 + i}`,
    city: cities[i % cities.length],
    joinedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24 * 3).toISOString(),
    totalOrders: Math.floor(Math.random() * 120),
    totalSpend: Math.floor(Math.random() * 2000),
    verified: i % 3 === 0,
    suspended: false,
  }));
}
