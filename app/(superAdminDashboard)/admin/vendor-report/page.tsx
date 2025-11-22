
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
} from 'recharts';
import {
  BarChart2,
  TrendingUp,
  Users,
  Store,
  Euro,
  Flame,
  PieChart,
  Download,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Deligo primary
const DELIGO = '#DC3173';

type Vendor = {
  id: string;
  name: string;
  city: string;
  orders: number;
  revenue: number;
  cuisine: string;
  createdAt: string;
  hourlyOrders?: number[]; 
};

export default function VendorAnalyticsPage() {
  const [query, setQuery] = useState('');

  // date range
  const [range, setRange] = useState<'7d' | '30d' | 'custom'>('30d');
  const [from, setFrom] = useState<string>(() => formatDateOffset(30));
  const [to, setTo] = useState<string>(() => formatDateOffset(0));

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // create mock data that changes slightly with date range
    const days = range === '7d' ? 7 : 30;
    setRevenueData(generateMonthlyRevenue(days));
    setOrdersData(generateTopVendors(days));
    setCategoryData(generateCategoryData());
    setVendors(generateVendors(days));
  }, [range]);

  useEffect(() => {
    // when custom range selected keep existing from/to
    if (range === '7d') {
      setFrom(formatDateOffset(7));
      setTo(formatDateOffset(0));
    }
    if (range === '30d') {
      setFrom(formatDateOffset(30));
      setTo(formatDateOffset(0));
    }
  }, [range]);

  const filteredVendors = vendors.filter((v) => [v.name, v.city, v.cuisine].join(' ').toLowerCase().includes(query.toLowerCase()));

  // CSV Export
  function exportCSV() {
    const rows = [
      ['Vendor ID', 'Name', 'City', 'Cuisine', 'Orders', 'Revenue'],
      ...filteredVendors.map((v) => [v.id, v.name, v.city, v.cuisine, String(v.orders), String(v.revenue)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor_analytics_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // PDF export using dynamic imports (html2canvas + jspdf) if available, fallback to window.print
  async function exportPDF() {
    if (!printRef.current) return window.print();
    try {
      const html2canvasModule = await import('html2canvas');
      const { default: html2canvas } = html2canvasModule;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'px', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = (pdf as any).getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`vendor_analytics_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      // fallback
      // eslint-disable-next-line no-console
      console.warn('html2canvas/jsPDF not available, using print fallback', e);
      window.print();
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-3xl font-extrabold mb-4 flex items-center gap-3">
        <BarChart2 className="w-9 h-9" style={{ color: DELIGO }} /> Vendor Analytics
      </motion.h1>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-6">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Input placeholder="Search vendor, city, cuisine..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button style={{ background: DELIGO }}>Filter</Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2">
            <button className={`px-3 py-1 rounded-md border ${range === '7d' ? 'bg-white border-slate-200 shadow-sm' : 'bg-white'}`} onClick={() => setRange('7d')}>7d</button>
            <button className={`px-3 py-1 rounded-md border ${range === '30d' ? 'bg-white border-slate-200 shadow-sm' : 'bg-white'}`} onClick={() => setRange('30d')}>30d</button>
            <button className={`px-3 py-1 rounded-md border ${range === 'custom' ? 'bg-white border-slate-200 shadow-sm' : 'bg-white'}`} onClick={() => setRange('custom')}>Custom</button>
          </div>

          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-1 rounded-md border bg-white" />
              <span className="text-slate-400">to</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-1 rounded-md border bg-white" />
            </div>
          )}

          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>

          <Button size="sm" onClick={exportPDF}>
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* printable wrapper */}
      <div ref={printRef as any}>
        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <AnalyticsCard title="Total Vendors" value={`${vendors.length}`} icon={<Store style={{ color: DELIGO }} className="w-6 h-6" />} />
          <AnalyticsCard title="Active Vendors" value={`${vendors.filter(v => v.orders > 0).length}`} icon={<TrendingUp style={{ color: DELIGO }} className="w-6 h-6" />} />
          <AnalyticsCard title="Total Orders" value={`${vendors.reduce((s, v) => s + v.orders, 0)}`} icon={<Users style={{ color: DELIGO }} className="w-6 h-6" />} />
          <AnalyticsCard title="Total Revenue (€)" value={`€ ${vendors.reduce((s, v) => s + v.revenue, 0).toLocaleString()}`} icon={<Euro style={{ color: DELIGO }} className="w-6 h-6" />} />
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          <ChartCard title="Revenue Over Time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 6, right: 6, left: -8, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value: any) => `€ ${Number(value).toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" stroke={DELIGO} fill={fade(DELIGO, 0.12)} />
                <Line type="monotone" dataKey="revenue" stroke={DELIGO} strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Orders Per Vendor">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData} margin={{ top: 6, right: 6, left: -8, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill={DELIGO} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Heatmap (hourly peak) represented as hourly bars colored by intensity */}
        <ChartCard title="Hourly Orders Heatmap (Avg)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={generateHourlyHeatmap(vendors)} margin={{ top: 6, right: 6, left: -8, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              {/** custom bars with color scale */}
              <Bar dataKey="orders">
                {generateHourlyHeatmap(vendors).map((d, i) => (
                  <Cell key={`cell-${i}`} fill={colorScale(d.orders)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Vendor growth */}
        <ChartCard title="Vendor Growth (Monthly)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={generateVendorGrowthData()} margin={{ top: 6, right: 6, left: -8, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="vendors" stroke={DELIGO} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top vendors list with drill-down */}
        <Card className="p-6 shadow-md bg-white mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Flame style={{ color: DELIGO }} className="w-5 h-5" /> Top Vendors</h2>
            <div className="text-sm text-slate-500">Click a vendor to view detailed analytics</div>
          </div>
          <Separator className="mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.slice(0, 8).map((v) => (
              <motion.div key={v.id} whileHover={{ scale: 1.01 }} className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`/images/vendors/${v.id}.jpg`} />
                    <AvatarFallback>{v.name.split(' ').map(n => n[0]).slice(0,2).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.city} • {v.cuisine}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-500">Orders</div>
                  <div className="font-bold">{v.orders}</div>
                  <div className="text-xs text-slate-500">€ {v.revenue.toLocaleString()}</div>
                  <div className="mt-2">
                    <Button size="sm" onClick={() => setSelectedVendor(v)}>View</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Drill-down dialog */}
        <Dialog open={!!selectedVendor} onOpenChange={(open) => { if (!open) setSelectedVendor(null); }}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Vendor Analytics</DialogTitle>
            </DialogHeader>

            {selectedVendor && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Avatar className="w-28 h-28">
                    <AvatarImage src={`/images/vendors/${selectedVendor.id}.jpg`} />
                    <AvatarFallback>{selectedVendor.name.split(' ').map(n => n[0]).slice(0,2).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="mt-3">
                    <h3 className="font-semibold text-lg">{selectedVendor.name}</h3>
                    <div className="text-sm text-slate-500">{selectedVendor.city} • {selectedVendor.cuisine}</div>
                    <div className="mt-2 text-sm">Orders: <strong>{selectedVendor.orders}</strong></div>
                    <div className="text-sm">Revenue: <strong>€ {selectedVendor.revenue.toLocaleString()}</strong></div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium mb-2">Hourly Orders (Today average)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={selectedVendor.hourlyOrders?.map((o,i) => ({ hour: String(i), orders: o })) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill={DELIGO} />
                    </BarChart>
                  </ResponsiveContainer>

                  <Separator className="my-4" />

                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="outline" onClick={() => setSelectedVendor(null)}>Close</Button>
                    <Button style={{ background: DELIGO }} onClick={() => { /* navigate to vendor page */ }}>Open Vendor</Button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* ---------------- UI Helpers & Mock generators ---------------- */
import { Cell } from 'recharts';

function AnalyticsCard({ title, value, icon }: { title: string; value: string; icon?: React.ReactNode }) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="p-5 shadow-sm border rounded-xl bg-white flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-slate-100`}>{icon}</div>
      </Card>
    </motion.div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 h-80 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: DELIGO }}>
        <PieChart className="w-5 h-5" /> {title}
      </h2>
      <div className="h-full">{children}</div>
    </Card>
  );
}

function formatDateOffset(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function fade(hex: string, opacity = 0.1) {
  const c = hex.replace('#', '');
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function generateMonthlyRevenue(days: number) {
  const labels = days <= 7 ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['W1','W2','W3','W4'];
  return labels.map((l, i) => ({ label: l, revenue: Math.round((Math.random() * 50000) + (i*2000)) }));
}

function generateTopVendors(days: number) {
  const base = [
    { name: 'Casa Lisboa', orders: Math.max(20, Math.floor(Math.random() * 1000)) },
    { name: 'Prego Urban', orders: Math.max(20, Math.floor(Math.random() * 900)) },
    { name: 'Sushi Tejo', orders: Math.max(20, Math.floor(Math.random() * 800)) },
    { name: 'Pastelaria do Bairro', orders: Math.max(20, Math.floor(Math.random() * 700)) },
    { name: 'Sabor de Porto', orders: Math.max(20, Math.floor(Math.random() * 600)) },
  ];
  return base;
}

function generateCategoryData() {
  return [
    { category: 'Portuguese', count: 28 },
    { category: 'Fast Food', count: 16 },
    { category: 'Bakery', count: 12 },
    { category: 'Japanese', count: 9 },
    { category: 'Grocery', count: 7 },
  ];
}

function generateVendors(days: number): Vendor[] {
  const base = [
    { id: 'VND-2001', name: 'Casa Lisboa', city: 'Lisbon', cuisine: 'Portuguese' },
    { id: 'VND-2002', name: 'Prego Urban', city: 'Porto', cuisine: 'Fast Food' },
    { id: 'VND-2003', name: 'Sushi Tejo', city: 'Lisbon', cuisine: 'Japanese' },
    { id: 'VND-2004', name: 'Pastelaria do Bairro', city: 'Coimbra', cuisine: 'Bakery' },
    { id: 'VND-2005', name: 'Sabor de Porto', city: 'Porto', cuisine: 'Portuguese' },
  ];
  return Array.from({ length: 12 }).map((_, i) => {
    const b = base[i % base.length];
    const hourly = Array.from({ length: 24 }).map(() => Math.floor(Math.random() * 10));
    const orders = hourly.reduce((s, n) => s + n, 0);
    return {
      id: `${b.id}-${i}`,
      name: `${b.name} ${i + 1}`,
      city: b.city,
      cuisine: b.cuisine,
      orders,
      revenue: Math.round(orders * (5 + Math.random() * 20)),
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      hourlyOrders: hourly,
    } as Vendor;
  });
}

// Heatmap helpers (using bars colored by intensity)
function generateHourlyHeatmap(vendors: Vendor[]) {
  if (!vendors || vendors.length === 0) return Array.from({ length: 24 }).map((_, i) => ({ hour: String(i), orders: 0 }));
  const sum = Array.from({ length: 24 }).map(() => 0);
  vendors.forEach((v) => {
    (v.hourlyOrders || []).forEach((o, i) => { sum[i] += o; });
  });
  return sum.map((orders, i) => ({ hour: String(i), orders }));
}

function colorScale(value: number) {
  // simple scale from light to DELIGO
  const max =  Math.max(...generateHourlyHeatmap(generateVendors(30)).map(d => d.orders), 1);
  const t = Math.min(1, value / max);
  // interpolate between light gray and DELIGO
  return interpolateColor('#f1f5f9', DELIGO, t);
}

function interpolateColor(a: string, b: string, t: number) {
  const ah = a.replace('#',''); const bh = b.replace('#','');
  const ar = parseInt(ah.substring(0,2),16), ag = parseInt(ah.substring(2,4),16), ab = parseInt(ah.substring(4,6),16);
  const br = parseInt(bh.substring(0,2),16), bg = parseInt(bh.substring(2,4),16), bb = parseInt(bh.substring(4,6),16);
  const rr = Math.round(ar + (br - ar) * t); const rg = Math.round(ag + (bg - ag) * t); const rb = Math.round(ab + (bb - ab) * t);
  return `rgb(${rr}, ${rg}, ${rb})`;
}

function generateVendorGrowthData() {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => ({ month: m, vendors: 100 + i * 5 + Math.floor(Math.random() * 10) }));
}
