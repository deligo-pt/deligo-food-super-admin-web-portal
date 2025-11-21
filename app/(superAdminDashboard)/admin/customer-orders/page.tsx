/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Download, FileText, CreditCard, Truck, User, Clock, CheckCircle, XCircle, Search as SearchIcon } from 'lucide-react';

const DELIGO = '#DC3173';
const SAMPLE_IMAGE = '/mnt/data/Screenshot from 2025-11-21 00-13-57.png';

type OrderStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded';

type OrderItem = { id: string; name: string; qty: number; price: number };
type Order = {
  id: string;
  customerName: string;
  vendorName: string;
  fleetManager?: string;
  amount: number;
  paymentMethod: 'card'  | 'mbway';
  city: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  timeline?: { step: string; at?: string }[];
  notes?: string;
};

export default function CustomerOrdersPremium() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [cityFilter, setCityFilter] = useState<'all' | string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => setOrders(mockOrders()), []);

  const cities = useMemo(() => Array.from(new Set(orders.map((o) => o.city))), [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const t = query.trim().toLowerCase();
      if (t && ![o.id, o.customerName, o.vendorName].join(' ').toLowerCase().includes(t)) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (cityFilter !== 'all' && o.city !== cityFilter) return false;
      if (paymentFilter !== 'all' && o.paymentMethod !== paymentFilter) return false;
      if (dateFrom && new Date(o.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(o.createdAt) > new Date(dateTo)) return false;
      return true;
    });
  }, [orders, query, statusFilter, cityFilter, paymentFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled' || o.status === 'refunded').length;
    const revenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.amount, 0);
    return { total, completed, cancelled, revenue };
  }, [orders]);

  function exportCSV(items: Order[]) {
    const rows = [['OrderID', 'Customer', 'Vendor', 'Amount', 'Status', 'Payment', 'City', 'Date']];
    items.forEach((o) => rows.push([o.id, o.customerName, o.vendorName, String(o.amount), o.status, o.paymentMethod, o.city, o.createdAt]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  async function exportPDFArea() {
    try {
      setExporting(true);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const el = document.getElementById('orders-print-area');
      if (!el) return window.print();
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = (pdf as any).getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`orders_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      // fallback
      // eslint-disable-next-line no-console
      console.warn('PDF export failed', e);
      window.print();
    } finally {
      setExporting(false);
    }
  }

  function updateOrderStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selected && selected.id === id) setSelected({ ...selected, status });
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <Truck className="w-7 h-7" style={{ color: DELIGO }} /> Customer Orders
      </motion.h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total Orders</p>
          <h3 className="text-2xl font-bold">{stats.total}</h3>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-slate-500">Completed</p>
          <h3 className="text-2xl font-bold">{stats.completed}</h3>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-slate-500">Cancelled/Refunded</p>
          <h3 className="text-2xl font-bold">{stats.cancelled}</h3>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-slate-500">Revenue (€)</p>
          <h3 className="text-2xl font-bold">€ {stats.revenue.toLocaleString()}</h3>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Search order id, customer, vendor..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-md" />

        <Select value={String(statusFilter)} onValueChange={(v) => setStatusFilter(v === 'all' ? 'all' : v as OrderStatus)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select value={String(cityFilter)} onValueChange={(v) => setCityFilter(v === 'all' ? 'all' : v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={String(paymentFilter)} onValueChange={(v) => setPaymentFilter(v === 'all' ? 'all' : v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="mbway">MB WAY</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => { setQuery(''); setStatusFilter('all'); setCityFilter('all'); setPaymentFilter('all'); setDateFrom(''); setDateTo(''); }}>Reset</Button>
          <Button variant="outline" onClick={() => exportCSV(filtered)}><Download className="w-4 h-4" /> Export CSV</Button>
          <Button onClick={exportPDFArea} className="flex items-center gap-2"><FileText className="w-4 h-4" /> Export PDF</Button>
        </div>
      </div>

      {/* Table (horizontal scroll) */}
      <div id="orders-print-area">
        <Card className="p-0 overflow-x-auto rounded-xl shadow-sm border">
          <table className="min-w-[1400px] w-full text-sm">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left w-[60px]">#</th>
                <th className="px-4 py-3 text-left w-[180px]">Order ID</th>
                <th className="px-4 py-3 text-left w-[220px]">Customer</th>
                <th className="px-4 py-3 text-left w-[220px]">Vendor</th>
                <th className="px-4 py-3 text-center w-[120px]">Amount</th>
                <th className="px-4 py-3 text-center w-[140px]">Payment</th>
                <th className="px-4 py-3 text-center w-[140px]">City</th>
                <th className="px-4 py-3 text-center w-[160px]">Status</th>
                <th className="px-4 py-3 text-center w-[200px]">Date</th>
                <th className="px-4 py-3 text-center w-[160px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.map((o, i) => (
                <tr key={o.id} className="hover:bg-slate-50 align-top">
                  <td className="px-4 py-4 font-semibold">{i + 1}</td>
                  <td className="px-4 py-4 font-mono text-slate-700">{o.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-9 h-9"><AvatarImage src={SAMPLE_IMAGE} /><AvatarFallback>{initials(o.customerName)}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{o.customerName}</div>
                        <div className="text-xs text-slate-500">{o.city}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-medium">{o.vendorName}</div>
                    <div className="text-xs text-slate-500">{o.fleetManager || '—'}</div>
                  </td>

                  <td className="px-4 py-4 text-center font-bold">€ {o.amount.toLocaleString()}</td>

                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <PaymentIcon method={o.paymentMethod} />
                      <span className="text-xs text-slate-500">{o.paymentMethod.toUpperCase()}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center text-slate-700">{o.city}</td>

                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={o.status} />
                  </td>

                  <td className="px-4 py-4 text-center text-slate-600">{new Date(o.createdAt).toLocaleString()}</td>

                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(o)}>View</Button>
                      <Button size="sm" variant="outline" onClick={() => updateOrderStatus(o.id, 'delivered')}>Mark Delivered</Button>
                      <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(o.id, 'cancelled')}>Cancel</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Order Details Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="max-w-3xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>Customer, vendor, timeline & items</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Order ID</p>
                    <p className="font-mono font-semibold">{selected.id}</p>
                  </div>

                  <div className="ml-auto text-right">
                    <StatusBadge status={selected.status} />
                    <p className="text-sm text-slate-500 mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2">
                  {selected.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-slate-500">Qty: {it.qty}</div>
                      </div>
                      <div className="font-semibold">€ {(it.price * it.qty).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="text-right">
                  <p className="text-sm text-slate-500">Subtotal</p>
                  <p className="font-bold text-xl">€ {selected.amount.toFixed(2)}</p>
                </div>

                <Separator className="my-4" />

                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-slate-700 whitespace-pre-wrap">{selected.notes || '—'}</p>

                <Separator className="my-4" />

                <h4 className="font-semibold mb-2">Delivery Timeline</h4>
                <ol className="space-y-2 text-sm">
                  {(selected.timeline || []).map((t, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1">
                        {t.at ? <Clock className="w-4 h-4 text-slate-400" /> : <Clock className="w-4 h-4 text-slate-200" />}
                      </div>
                      <div>
                        <div className="font-medium">{t.step}</div>
                        <div className="text-xs text-slate-500">{t.at || 'Pending'}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="col-span-1 space-y-3">
                <Card className="p-4">
                  <p className="text-xs text-slate-500">Customer</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Avatar className="w-12 h-12"><AvatarImage src={SAMPLE_IMAGE} /><AvatarFallback>{initials(selected.customerName)}</AvatarFallback></Avatar>
                    <div>
                      <div className="font-semibold">{selected.customerName}</div>
                      <div className="text-xs text-slate-500">{selected.city}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <p className="text-xs text-slate-500">Vendor</p>
                  <div className="mt-2 font-semibold">{selected.vendorName}</div>
                </Card>

                <Card className="p-4">
                  <p className="text-xs text-slate-500">Fleet Manager</p>
                  <div className="mt-2 font-semibold">{selected.fleetManager || '—'}</div>
                </Card>

                <div className="space-y-2">
                  <Button className="w-full" onClick={() => updateOrderStatus(selected.id, 'in_transit')}>Start Delivery</Button>
                  <Button variant="outline" className="w-full" onClick={() => updateOrderStatus(selected.id, 'delivered')}>Mark Delivered</Button>
                  <Button variant="destructive" className="w-full" onClick={() => updateOrderStatus(selected.id, 'cancelled')}>Cancel Order</Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */
function initials(name = '') {
  return name.split(' ').map((n) => n[0] || '').slice(0, 2).join('').toUpperCase();
}

function PaymentIcon({ method }: { method: string }) {
  if (method === 'card') return <CreditCard className="w-4 h-4" />;
  return <CreditCard className="w-4 h-4" />;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
    accepted: { label: 'Accepted', cls: 'bg-blue-100 text-blue-800' },
    in_transit: { label: 'In Transit', cls: 'bg-indigo-100 text-indigo-800' },
    delivered: { label: 'Delivered', cls: 'bg-emerald-100 text-emerald-800' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-800' },
    refunded: { label: 'Refunded', cls: 'bg-rose-100 text-rose-800' },
  };
  const m = map[status];
  return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${m.cls}`}>{m.label}</span>;
}

/* ---------------- Mock Data ---------------- */
function mockOrders(): Order[] {
  const customers = ['Ana Pereira', 'João Silva', 'Maria Fernandes', 'Carlos Sousa', 'Rui Costa', 'Inês Duarte'];
  const vendors = ['Casa Lisboa', 'Prego Urban', 'Sabor de Porto', 'Pastelaria do Bairro'];
  const cities = ['Lisbon', 'Porto', 'Coimbra', 'Faro', 'Braga'];
  const payments: Order['paymentMethod'][] = ['card', 'mbway'];
  const statuses: OrderStatus[] = ['pending', 'accepted', 'in_transit', 'delivered', 'cancelled', 'refunded'];

  return Array.from({ length: 28 }).map((_, i) => {
    const status = statuses[i % statuses.length];
    const items: OrderItem[] = [
      { id: `IT-${i}-1`, name: 'Bifana', qty: 1 + (i % 3), price: 6.5 + (i % 5) },
      { id: `IT-${i}-2`, name: 'Pastel de Nata', qty: 2, price: 2.5 },
    ];
    const amount = items.reduce((s, it) => s + it.price * it.qty, 0);
    return {
      id: `ORD-${5000 + i}`,
      customerName: customers[i % customers.length],
      vendorName: vendors[i % vendors.length],
      fleetManager: i % 4 === 0 ? 'Fleet João' : undefined,
      amount,
      paymentMethod: payments[i % payments.length],
      city: cities[i % cities.length],
      status,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 6).toISOString(),
      items,
      notes: i % 3 === 0 ? 'Customer requested extra napkins' : undefined,
      timeline: [
        { step: 'Order placed', at: new Date(Date.now() - i * 1000 * 60 * 60 * 6).toLocaleString() },
        { step: 'Accepted by vendor', at: i % 2 === 0 ? new Date(Date.now() - i * 1000 * 60 * 60 * 5).toLocaleString() : undefined },
        { step: 'Out for delivery', at: i % 4 === 0 ? new Date(Date.now() - i * 1000 * 60 * 60 * 2).toLocaleString() : undefined },
        { step: 'Delivered', at: status === 'delivered' ? new Date(Date.now() - i * 1000 * 60 * 60).toLocaleString() : undefined },
      ],
    } as Order;
  });
}
