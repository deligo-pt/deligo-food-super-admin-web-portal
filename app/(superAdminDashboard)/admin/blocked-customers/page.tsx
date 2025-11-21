/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Eye, Unlock, Search, FileText } from 'lucide-react';

const DELIGO = '#DC3173';
const AVATAR = '/mnt/data/Screenshot from 2025-11-21 00-13-57.png';

type DocumentItem = { name: string; url?: string };

type BlockedCustomer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  totalOrders: number;
  totalSpend: number;
  blockedAt: string;
  reason: string;
  documents?: DocumentItem[];
};

export default function BlockedCustomersPage() {
  const [list, setList] = useState<BlockedCustomer[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<BlockedCustomer | null>(null);
  const [confirmUnblock, setConfirmUnblock] = useState<BlockedCustomer | null>(null);

  useEffect(() => {
    setList(mockData());
  }, []);

  const filtered = list.filter((c) =>
    [c.name, c.email, c.city, c.phone, c.id].join(' ').toLowerCase().includes(query.toLowerCase())
  );

  function handleUnblock(id: string) {
    // production: call API then update state
    setList((prev) => prev.filter((c) => c.id !== id));
    setConfirmUnblock(null);
    setSelected(null);
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6">
        Blocked Customers
      </motion.h1>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6 max-w-xl">
        <Input placeholder="Search customer, city, email..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button style={{ background: DELIGO }}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* List */}
      <Card className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Blocked Customers</h2>
          <div className="text-sm text-slate-500">{filtered.length} results</div>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No blocked customers found.</div>
          ) : (
            filtered.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between"
              >
                {/* Left */}
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar>
                    <AvatarImage src={AVATAR} />
                    <AvatarFallback>{initials(c.name)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-semibold text-lg truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{c.email}</p>
                    <p className="text-xs text-slate-400">City: {c.city || '—'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">Blocked</span>
                      <span className="text-xs text-slate-500">Orders: {c.totalOrders}</span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right flex flex-col items-end gap-3">
                  <p className="text-sm text-slate-500">Blocked: {new Date(c.blockedAt).toLocaleString()}</p>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelected(c)}>
                      <Eye className="w-4 h-4 mr-1" /> Details
                    </Button>

                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setConfirmUnblock(c)}>
                      <Unlock className="w-4 h-4 mr-1" /> Unblock
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {/* Premium Sidebar - Details */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="max-w-md p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold tracking-tight">Customer Details</SheetTitle>
            <SheetDescription className="text-sm text-slate-500">Full profile & documents</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={AVATAR} />
                  <AvatarFallback>{initials(selected.name)}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-lg font-semibold text-slate-800">{selected.name}</p>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                  <p className="text-sm text-slate-500">{selected.phone || '—'}</p>
                </div>
              </div>

              <Separator />

              <Info label="Customer ID" value={selected.id} />
              <Info label="City" value={selected.city || '—'} />
              <Info label="Total Orders" value={selected.totalOrders} />
              <Info label="Total Spend" value={`€ ${selected.totalSpend}`} />
              <Info label="Blocked At" value={new Date(selected.blockedAt).toLocaleString()} />
              <Info label="Reason" value={selected.reason} />

              {/* Documents */}
              <div>
                <p className="font-semibold mb-2">Documents</p>
                <div className="space-y-2">
                  {(selected.documents || []).length === 0 ? (
                    <div className="text-sm text-slate-500">No documents uploaded</div>
                  ) : (
                    (selected.documents || []).map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-100 border rounded-lg">
                        <div className="text-sm font-medium truncate">{d.name}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => d.url && window.open(d.url, '_blank')}>
                            <FileText className="w-4 h-4" /> View
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              <div className="pt-2 flex flex-col gap-3">
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setConfirmUnblock(selected)}>
                  <Unlock className="w-4 h-4" /> Unblock Customer
                </Button>

                <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm Unblock */}
      <Dialog open={!!confirmUnblock} onOpenChange={() => setConfirmUnblock(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unblock Customer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to unblock <strong>{confirmUnblock?.name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUnblock(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleUnblock(confirmUnblock!.id)}>Unblock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Helpers */
function initials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="text-sm text-slate-700">
      <p className="text-[12px] text-slate-500">{label}</p>
      <p className="font-semibold mt-1 text-slate-800">{value}</p>
    </div>
  );
}

/* Mock Data */
function mockData(): BlockedCustomer[] {
  return [
    {
      id: 'BC-1001',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '+351 910000111',
      city: 'Lisbon',
      totalOrders: 12,
      totalSpend: 420,
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      reason: 'Multiple chargebacks and abusive behaviour',
      documents: [{ name: 'Chargeback Report.pdf', url: AVATAR }],
    },
    {
      id: 'BC-1002',
      name: 'Maria Fernandes',
      email: 'maria@example.com',
      phone: '+351 920000222',
      city: 'Porto',
      totalOrders: 4,
      totalSpend: 80,
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      reason: 'Suspicious account creation and ID mismatch',
      documents: [{ name: 'ID Proof.jpg', url: AVATAR }],
    },
    {
      id: 'BC-1003',
      name: 'Rui Costa',
      email: 'rui@example.com',
      phone: '+351 930000333',
      city: 'Braga',
      totalOrders: 2,
      totalSpend: 25,
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      reason: 'Fraud detected (multiple accounts)',
      documents: [{ name: 'Fraud Report.pdf', url: AVATAR }],
    },
  ];
}
