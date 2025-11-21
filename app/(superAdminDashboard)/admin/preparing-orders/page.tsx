/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Clock, AlertTriangle, Truck, Eye, Download } from 'lucide-react';

// Deligo primary
const DELIGO = '#DC3173';
const SAMPLE_AVATAR = '/images/avatar-sample.jpg';

type PreparingOrder = {
  id: string;
  restaurant: string;
  customer: string;
  address: string;
  items: { name: string; qty: number }[];
  amount: number;
  status: 'Preparing' | 'Ready' | 'Delayed';
  city: string;
  createdAt: string; // ISO
  kitchenStartedAt?: string; // ISO
  expectedReadyInMin: number;
  delayReason?: string;
  restaurantScore: number; // 0-100 performance metric
};

export default function PreparingOrdersPremium() {
  const [orders, setOrders] = useState<PreparingOrder[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PreparingOrder | null>(null);
  const [assignModal, setAssignModal] = useState<PreparingOrder | null>(null);
  const [delayModal, setDelayModal] = useState<PreparingOrder | null>(null);
  const [delayNote, setDelayNote] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => setOrders(mockPreparingOrders()), []);

  // live timers
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) =>
      q ? `${o.id} ${o.restaurant} ${o.customer} ${o.city} ${o.address}`.toLowerCase().includes(q) : true
    );
  }, [orders, query]);

  function markReady(id: string) {
    setOrders((p) => p.map((x) => (x.id === id ? { ...x, status: 'Ready' } : x)));
  }

  function assignRider(orderId: string, riderName: string) {
    // placeholder: replace with API call
    alert(`(mock) Assigned ${riderName} → ${orderId}`);
    setAssignModal(null);
  }

  function applyDelay(id: string, note: string) {
    setOrders((p) => p.map((x) => (x.id === id ? { ...x, status: 'Delayed', delayReason: note } : x)));
    setDelayModal(null);
    setDelayNote('');
  }

  function exportCSV() {
    const head = ['ID', 'Restaurant', 'Customer', 'Amount', 'Status', 'City', 'Items', 'Created', 'Started', 'ETA(min)', 'Delay'];
    const rows = filtered.map((o) => [
      o.id,
      o.restaurant,
      o.customer,
      o.amount,
      o.status,
      o.city,
      o.items.map((it) => `${it.qty}x ${it.name}`).join('|'),
      o.createdAt,
      o.kitchenStartedAt ?? '-',
      String(o.expectedReadyInMin),
      o.delayReason ?? '-',
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preparing_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <Clock className="w-8 h-8" style={{ color: DELIGO }} />
              Preparing Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">Live kitchen dashboard — assign riders, track timers & manage delays.</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order, restaurant, customer, city..." className="max-w-md" />
            <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Preparing" value={`${orders.filter((o) => o.status === 'Preparing').length}`} accent={DELIGO} />
        <KpiCard title="Ready" value={`${orders.filter((o) => o.status === 'Ready').length}`} accent="#10B981" />
        <KpiCard title="Delayed" value={`${orders.filter((o) => o.status === 'Delayed').length}`} accent="#F97316" />
        <KpiCard title="Avg Prep (min)" value={`${Math.round(orders.reduce((s, o) => s + o.expectedReadyInMin, 0) / (orders.length || 1))}`} accent="#06B6D4" />
      </div>

      {/* Scroll container with fixed-layout table */}
      <Card className="p-4 overflow-x-auto">
        {/* Table wrapper gives a max width but allows horizontal scroll on narrow screens */}
        <div className="min-w-[1100px]">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-slate-100 text-slate-700 text-left">
              <tr className="align-middle">
                <th className="px-4 py-3 w-28">Order</th>
                <th className="px-4 py-3 w-64">Restaurant / Performance</th>
                <th className="px-4 py-3 w-80">Customer & Items</th>
                <th className="px-4 py-3 w-28 text-center">Timer</th>
                <th className="px-4 py-3 w-28 text-center">ETA</th>
                <th className="px-4 py-3 w-28 text-center">Status</th>
                <th className="px-4 py-3 w-40 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.map((o) => {
                const started = o.kitchenStartedAt ? new Date(o.kitchenStartedAt).getTime() : new Date(o.createdAt).getTime();
                const elapsedMin = Math.floor((now - started) / 60000);
                const remain = o.expectedReadyInMin - elapsedMin;

                const etaColor = remain <= 0 ? 'bg-rose-100 text-rose-600' : remain <= 5 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600';

                return (
                  <tr key={o.id} className="hover:bg-slate-50 align-top">
                    {/* ORDER */}
                    <td className="px-4 py-4 align-middle">
                      <div className="font-semibold">{o.id}</div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(o.createdAt).toLocaleTimeString()}</div>
                      <div className="text-xs text-slate-400 mt-1">€ {o.amount.toFixed(2)}</div>
                    </td>

                    {/* RESTAURANT */}
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{o.restaurant}</div>
                          <div className="text-xs text-slate-500 truncate">{o.city}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Performance</div>
                          <div className="font-semibold">{o.restaurantScore}%</div>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="h-8 rounded-md bg-gradient-to-r from-slate-100 to-white" aria-hidden />
                      </div>
                    </td>

                    {/* CUSTOMER & ITEMS */}
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-start gap-3 min-w-0">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={SAMPLE_AVATAR} />
                          <AvatarFallback>{o.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}</AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <div className="font-medium truncate">{o.customer}</div>
                          <div className="text-xs text-slate-500 truncate">{o.address}</div>
                          <div className="text-xs text-slate-400 mt-2 truncate">{o.items.map((it) => `${it.qty}× ${it.name}`).join(', ')}</div>
                        </div>
                      </div>
                    </td>

                    {/* TIMER */}
                    <td className="px-4 py-4 text-center align-middle">
                      <div className="text-xs text-slate-500">Elapsed</div>
                      <div className="font-semibold">{elapsedMin}m</div>
                      <div className="text-xs text-slate-400 mt-1">Started: {o.kitchenStartedAt ? new Date(o.kitchenStartedAt).toLocaleTimeString() : '-'}</div>
                    </td>

                    {/* ETA */}
                    <td className="px-4 py-4 text-center align-middle">
                      <div className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${etaColor}`}>{remain <= 0 ? 'Overdue' : `~ ${remain}m`}</div>
                      {o.status === 'Delayed' && (
                        <div className="mt-2 text-xs text-rose-600 flex items-center gap-1 justify-center"><AlertTriangle className="w-4 h-4" />{o.delayReason}</div>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4 text-center align-middle">
                      <Badge variant={o.status === 'Ready' ? 'default' : o.status === 'Delayed' ? 'destructive' : 'secondary'}>{o.status}</Badge>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4 text-center align-middle">
                      <div className="flex items-center gap-2 justify-center">
                        <Button size="sm" variant="ghost" onClick={() => setSelected(o)} aria-label={`View ${o.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button size="sm" onClick={() => setAssignModal(o)} style={{ background: DELIGO }} className="flex items-center gap-2">
                          <Truck className="w-4 h-4" /> Assign
                        </Button>

                        <Button size="sm" variant="outline" onClick={() => setDelayModal(o)}>Delay</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAILS SHEET */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="max-w-2xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>Full details & quick actions</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16"><AvatarImage src={SAMPLE_AVATAR} /><AvatarFallback>{selected.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}</AvatarFallback></Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selected.restaurant} — {selected.id}</h3>
                  <p className="text-sm text-slate-500">Customer: {selected.customer} • {selected.city}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold">Items</h4>
                <ul className="mt-2 space-y-2">
                  {selected.items.map((it, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <div className="truncate">{it.qty} × {it.name}</div>
                      <div className="text-sm text-slate-500">—</div>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Order created</p>
                  <p className="font-semibold">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Expected ready in</p>
                  <p className="font-semibold">{selected.expectedReadyInMin} min</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-semibold">{selected.status}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Restaurant score</p>
                  <p className="font-semibold">{selected.restaurantScore}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                {selected.status !== 'Ready' && <Button style={{ background: DELIGO }} onClick={() => markReady(selected.id)}>Mark Ready</Button>}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ASSIGN DIALOG */}
      <Dialog open={!!assignModal} onOpenChange={() => setAssignModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Rider</DialogTitle>
          </DialogHeader>

          {assignModal && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Order: <strong>{assignModal.id}</strong> — {assignModal.restaurant}</p>
              <Input id="riderName" placeholder="Rider name (mock)" />

              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" onClick={() => setAssignModal(null)}>Cancel</Button>
                <Button onClick={() => { const el = document.getElementById('riderName') as HTMLInputElement | null; assignRider(assignModal.id, el?.value || 'Rider-Unknown'); }}>Assign</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELAY DIALOG */}
      <Dialog open={!!delayModal} onOpenChange={() => setDelayModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Delay</DialogTitle>
          </DialogHeader>

          {delayModal && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Order: <strong>{delayModal.id}</strong> — {delayModal.restaurant}</p>
              <Textarea placeholder="Reason for delay" value={delayNote} onChange={(e) => setDelayNote((e.target as HTMLTextAreaElement).value)} />

              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" onClick={() => { setDelayNote(''); setDelayModal(null); }}>Cancel</Button>
                <Button onClick={() => applyDelay(delayModal.id, delayNote)}>Apply Delay</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KpiCard({ title, value, accent }: { title: string; value: string; accent?: string }) {
  return (
    <Card className="p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
      </div>
      <div className="p-3 rounded-xl" style={{ background: `${accent ?? DELIGO}1A` }}>
        <div style={{ color: accent ?? DELIGO }}><Truck className="w-5 h-5" /></div>
      </div>
    </Card>
  );
}

// ---------------- Mock Data ----------------
function mockPreparingOrders(): PreparingOrder[] {
  const now = new Date();
  return [
    {
      id: 'ORD-7101',
      restaurant: 'Casa Lisboa',
      customer: 'João Silva',
      address: 'Rua Augusta 12, Lisbon',
      items: [{ name: 'Bacalhau à Brás', qty: 1 }, { name: 'Pastéis', qty: 2 }],
      amount: 28.5,
      status: 'Preparing',
      city: 'Lisbon',
      createdAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
      kitchenStartedAt: new Date(now.getTime() - 1000 * 60 * 6).toISOString(),
      expectedReadyInMin: 12,
      restaurantScore: 92,
    },
    {
      id: 'ORD-7102',
      restaurant: 'Prego Urban',
      customer: 'Maria Fernandes',
      address: 'Av. da Boavista 88, Porto',
      items: [{ name: 'Prego', qty: 2 }],
      amount: 16.0,
      status: 'Preparing',
      city: 'Porto',
      createdAt: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
      kitchenStartedAt: new Date(now.getTime() - 1000 * 60 * 12).toISOString(),
      expectedReadyInMin: 18,
      restaurantScore: 86,
    },
    {
      id: 'ORD-7103',
      restaurant: 'Sushi Tejo',
      customer: 'Rui Costa',
      address: 'Rua da Betesga, Braga',
      items: [{ name: 'Sushi Platter', qty: 1 }],
      amount: 34.0,
      status: 'Delayed',
      delayReason: 'Missing ingredient',
      city: 'Braga',
      createdAt: new Date(now.getTime() - 1000 * 60 * 35).toISOString(),
      kitchenStartedAt: new Date(now.getTime() - 1000 * 60 * 25).toISOString(),
      expectedReadyInMin: 15,
      restaurantScore: 72,
    },
    {
      id: 'ORD-7104',
      restaurant: 'Pastelaria do Bairro',
      customer: 'Ana Pereira',
      address: 'Largo da Porta, Coimbra',
      items: [{ name: 'Croissant', qty: 3 }, { name: 'Coffee', qty: 2 }],
      amount: 12.5,
      status: 'Preparing',
      city: 'Coimbra',
      createdAt: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
      kitchenStartedAt: new Date(now.getTime() - 1000 * 60 * 2).toISOString(),
      expectedReadyInMin: 8,
      restaurantScore: 95,
    },
  ];
}
