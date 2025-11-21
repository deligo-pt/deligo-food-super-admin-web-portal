

'use client';

import  { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';


import {
  Receipt,
  Eye,
  MapPin,
  Download,
  BadgeEuro,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Brand color
const DELIGO = '#DC3173';

// ---------------- Types ----------------
type Order = {
  id: string;
  customer: string;
  customerPhoto?: string;
  partner: string;
  partnerPhoto?: string;
  amount: number;
  items: number;
  status: 'Pending' | 'Accepted' | 'Ongoing' | 'Completed' | 'Cancelled';
  city: string;
  payment: 'Card'  | 'Wallet';
  createdAt: string;
  deliveredAt?: string;
  address: string;
  rider?: string;
  eta?: string;
};

// ---------------- Page Component ----------------
export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setOrders(mockOrders());
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return orders.filter((o) =>
      [o.id, o.customer, o.partner, o.city, o.status, o.rider]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [orders, query]);

  // Export CSV
  function exportCSV() {
    const head = ['ID','Customer','Partner','Amount','Status','City','Items','Payment','Created','Delivered','Address'];
    const rows = filtered.map((o) => [
      o.id,
      o.customer,
      o.partner,
      o.amount,
      o.status,
      o.city,
      o.items,
      o.payment,
      o.createdAt,
      o.deliveredAt ?? '-',
      o.address,
    ]);

    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(','))
      .join('');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export PDF (simple print fallback)
  async function exportPDF() {
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const el = document.getElementById('orders-print-area');
      if (!el) return window.print();
      const canvas = await html2canvas(el, { scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`orders_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      // fallback
      // eslint-disable-next-line no-console
      console.warn('PDF failed', e);
      window.print();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <BadgeEuro className="w-8 h-8" style={{ color: DELIGO }} /> All Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage all customer orders — realtime overview</p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search order, customer, partner..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={exportCSV} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button onClick={exportPDF} className="flex items-center gap-2" disabled={exporting}>
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Printable wrapper */}
      <div id="orders-print-area" className="space-y-6">
        {/* Quick KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card className="p-4">
            <p className="text-xs text-slate-500">Total Orders</p>
            <h3 className="text-2xl font-bold">{orders.length}</h3>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Completed</p>
            <h3 className="text-2xl font-bold">{orders.filter(o => o.status === 'Completed').length}</h3>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Pending</p>
            <h3 className="text-2xl font-bold">{orders.filter(o => o.status === 'Pending').length}</h3>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Revenue</p>
            <h3 className="text-2xl font-bold">€ {orders.reduce((s,o)=>s+o.amount,0).toLocaleString()}</h3>
          </Card>
        </div>

        {/* Orders table */}
        <Card className="p-4 overflow-x-auto">
          <table className="min-w-[1200px] w-full text-sm">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-2 text-left w-[140px]">Order ID</th>
                <th className="px-4 py-2 text-left w-[260px]">Customer</th>
                <th className="px-4 py-2 text-left w-[260px]">Partner</th>
                <th className="px-4 py-2 text-center w-[100px]">Amount</th>
                <th className="px-4 py-2 text-center w-[120px]">Status</th>
                <th className="px-4 py-2 text-center w-[120px]">City</th>
                <th className="px-4 py-2 text-center w-[80px]">Items</th>
                <th className="px-4 py-2 text-center w-[120px]">Payment</th>
                <th className="px-4 py-2 text-center w-[160px]">Created</th>
                <th className="px-4 py-2 text-center w-[160px]">Delivered</th>
                <th className="px-4 py-2 text-center w-[120px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{o.id}</td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={o.customerPhoto} />
                        <AvatarFallback>{o.customer[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{o.customer}</div>
                        <div className="text-xs text-slate-500">{o.address}</div>
                      </div>
                    </div>
                  </td>

                  {/* Partner */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={o.partnerPhoto} />
                        <AvatarFallback>{o.partner[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{o.partner}</div>
                        <div className="text-xs text-slate-500">{o.city}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center font-semibold">€ {o.amount}</td>

                  <td className="px-4 py-3 text-center">
                    <Badge
                      className="text-xs"
                      variant={
                        o.status === 'Completed'
                          ? 'default'
                          : o.status === 'Cancelled'
                          ? 'destructive'
                          : 'outline'
                      }
                    >
                      {o.status}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-center">{o.city}</td>
                  <td className="px-4 py-3 text-center">{o.items}</td>
                  <td className="px-4 py-3 text-center">{o.payment}</td>
                  <td className="px-4 py-3 text-center">{o.createdAt}</td>
                  <td className="px-4 py-3 text-center">{o.deliveredAt ?? '-'}</td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(o)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => alert('Open refund modal (mock)')}>Refund</Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Small charts + metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4">
            <h4 className="font-semibold">Orders over time</h4>
            <div className="h-40 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersChart(orders)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke={DELIGO} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold">Top Cities</h4>
            <div className="mt-3 text-sm text-slate-600">
              {topCities(orders).map(c => (
                <div key={c.city} className="flex items-center justify-between py-1">
                  <div>{c.city}</div>
                  <div className="font-semibold">{c.count}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold">Payment Breakdown</h4>
            <div className="mt-3 text-sm text-slate-600">
              {paymentBreakdown(orders).map(p => (
                <div key={p.method} className="flex items-center justify-between py-1">
                  <div>{p.method}</div>
                  <div className="font-semibold">{p.count}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Details Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="max-w-xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>Complete information about the selected order.</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 space-y-6">
              <div>
                <p className="text-sm text-slate-500">Order ID</p>
                <p className="text-lg font-semibold">{selected.id}</p>
              </div>

              <Separator />

              {/* Customer */}
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={selected.customerPhoto} />
                  <AvatarFallback>{selected.customer[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{selected.customer}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {selected.address}</p>
                </div>
              </div>

              <Separator />

              {/* Partner */}
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={selected.partnerPhoto} />
                  <AvatarFallback>{selected.partner[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{selected.partner}</p>
                  <p className="text-xs text-slate-500">{selected.city}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="font-semibold">€ {selected.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Items</p>
                  <p className="font-semibold">{selected.items}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Payment</p>
                  <p className="font-semibold">{selected.payment}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-semibold">{selected.status}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-slate-500">Delivery Timeline</p>
                <ul className="mt-2 text-sm space-y-2">
                  <li>• Created: {selected.createdAt}</li>
                  <li>• Rider: {selected.rider ?? '—'}</li>
                  <li>• ETA: {selected.eta ?? '—'}</li>
                  <li>• Delivered: {selected.deliveredAt ?? '—'}</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                <Button style={{ background: DELIGO }} onClick={() => alert('Open support modal (mock)')}>Open Support</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------- Helpers & Mocks ----------------
function ordersChart(orders: Order[]) {
  // aggregate by day label (last 7 days)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString();
    const count = orders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString()).length;
    return { label, orders: count };
  });
  return days;
}

function topCities(orders: Order[]) {
  const map: Record<string, number> = {};
  orders.forEach(o => map[o.city] = (map[o.city] || 0) + 1);
  return Object.entries(map).map(([city, count]) => ({ city, count })).sort((a,b)=>b.count-a.count).slice(0,5);
}

function paymentBreakdown(orders: Order[]) {
  const methods: Record<string, number> = {};
  orders.forEach(o => methods[o.payment] = (methods[o.payment] || 0) + 1);
  return Object.entries(methods).map(([method, count]) => ({ method, count }));
}

function mockOrders(): Order[] {
  const names = ['Miguel Santos','Ana Lopes','Pedro Martins','Rita Silva','Carlos Pereira','Sofia Gomes'];
  const partners = ['Casa Lisboa','Prego Urban','Sushi Tejo','Pastelaria do Bairro','Sabor de Porto'];
  const cities = ['Lisbon','Porto','Coimbra','Braga','Faro'];
  const statuses: Order['status'][] = ['Pending','Accepted','Ongoing','Completed','Cancelled'];

  return Array.from({ length: 48 }).map((_, i) => {
    const status = statuses[i % statuses.length];
    const created = new Date(Date.now() - i * 1000 * 60 * 60 * 6);
    const delivered = status === 'Completed' ? new Date(created.getTime() + 1000 * 60 * 60 * 2).toISOString() : undefined;
    return {
      id: `ORD-${3000 + i}`,
      customer: names[i % names.length],
      customerPhoto: undefined,
      partner: partners[i % partners.length],
      partnerPhoto: undefined,
      amount: Math.floor(8 + Math.random() * 45),
      items: Math.floor(1 + Math.random() * 5),
      status,
      city: cities[i % cities.length],
      payment: (['Card','Wallet'] as Order['payment'][])[i % 3],
      createdAt: created.toLocaleString(),
      deliveredAt: delivered ? new Date(delivered).toLocaleString() : undefined,
      address: `${Math.floor(1 + Math.random()*120)} Some Street, ${cities[i % cities.length]}`,
      rider: i % 4 === 0 ? `Rider-${100 + i}` : undefined,
      eta: i % 4 === 0 ? `${15 + (i%20)} min` : undefined,
    } as Order;
  });
}
