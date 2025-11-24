/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Download, Navigation, Clock, Truck, Eye, MapPin, AlertTriangle } from 'lucide-react';

// Deligo brand
const DELIGO = '#DC3173';
const SAMPLE_AVATAR = '/mnt/data/Screenshot from 2025-11-21 00-13-57.png';

export default function OnTheWayOrdersGridPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { setOrders(mockOnTheWay()); }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => (q ? `${o.id} ${o.restaurant} ${o.customer} ${o.city}`.toLowerCase().includes(q) : true));
  }, [orders, query]);

  function exportCSV() {
    const head = ['ID','Restaurant','Customer','Amount','ETA','City','Items','Created'];
    const rows = filtered.map(o => [o.id,o.restaurant,o.customer,o.amount,o.eta,o.city,o.items.map((i:any)=>`${i.qty}x ${i.name}`).join('|'),o.createdAt]);
    const csv = [head, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `on_the_way_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* header */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <Navigation className="w-8 h-8" style={{ color: DELIGO }} /> On The Way Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">Live tracking — delivery partner location, ETA and customer coordination.</p>
          </div>

          <div className="flex items-center gap-2">
            <Input placeholder="Search order, restaurant, customer..." value={query} onChange={e => setQuery(e.target.value)} className="max-w-xs" />
            <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2"><Download className="w-4 h-4" />Export CSV</Button>
          </div>
        </div>
      </motion.div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="On The Way" value={filtered.length} icon={Truck} accent={DELIGO} />
        <KPICard title="Avg ETA" value={`${calcAvgETA(filtered)} min`} icon={Clock} accent="#0EA5E9" />
        <KPICard title="High Delay" value={filtered.filter(o=>o.etaDelay).length} icon={AlertTriangle} accent="#F97316" />
        <KPICard title="Cities" value={new Set(filtered.map(o=>o.city)).size} icon={MapPin} accent="#10B981" />
      </div>

      {/* GRID table replacement */}
      <Card className="p-4 overflow-x-auto">
        {/* header row (sticky-looking inside card) */}
        <div className="bg-slate-100/80 rounded-md px-3 py-2 mb-4 font-semibold text-slate-700 grid grid-cols-[140px_300px_260px_120px_160px_160px] items-center">
          <div>Order</div>
          <div>Customer</div>
          <div>Restaurant</div>
          <div className="text-center">ETA</div>
          <div className="text-center">Partner</div>
          <div className="text-center">Actions</div>
        </div>

        <div className="space-y-4">
          {filtered.map((o, idx) => (
            <div
              key={o.id}
              className="grid grid-cols-[140px_300px_260px_120px_160px_160px] gap-4 items-center p-4 bg-white rounded-lg border hover:shadow-sm"
            >
              {/* Order col */}
              <div className="flex flex-col">
                <span className="font-semibold">{o.id}</span>
                <span className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleTimeString()}</span>
                <span className="text-xs text-slate-400 mt-1">€ {o.amount}</span>
              </div>

              {/* Customer col */}
              <div className="flex items-start gap-3 min-w-0">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={SAMPLE_AVATAR} />
                  <AvatarFallback>{o.customer.split(' ').map((n:any)=>n[0]).slice(0,2).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">{o.customer}</span>
                  <span className="text-xs text-slate-500 truncate">{o.address}</span>
                  <span className="text-xs text-slate-400 mt-1 truncate">{o.items.map((it:any)=>`${it.qty}× ${it.name}`).join(', ')}</span>
                </div>
              </div>

              {/* Restaurant col */}
              <div className="flex flex-col">
                <span className="font-medium">{o.restaurant}</span>
                <span className="text-xs text-slate-500">{o.city}</span>
                <div className="mt-2 h-8 bg-gradient-to-r from-slate-100 to-white rounded-md" />
              </div>

              {/* ETA col */}
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${o.etaDelay ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {o.eta} min
                </span>
                {o.etaDelay && <div className="text-xs text-rose-600 mt-2">Delayed</div>}
              </div>

              {/* Partner col */}
              <div className="text-center">
                <Avatar className="w-10 h-10 mx-auto">
                  <AvatarImage src={SAMPLE_AVATAR} />
                  <AvatarFallback>DP</AvatarFallback>
                </Avatar>
                <div className="text-xs text-slate-500 mt-1">{o.partner}</div>
              </div>

              {/* Actions col */}
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Button size="sm" variant="ghost" onClick={() => setSelected(o)}><Eye className="w-4 h-4" /></Button>
                  <Button size="sm" style={{ background: DELIGO }} onClick={() => alert('Open navigation (mock)')}>
                    <Navigation className="w-4 h-4 mr-1" />Track
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Details sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="max-w-2xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>Full route, ETA, partner info</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16"><AvatarImage src={SAMPLE_AVATAR} /><AvatarFallback>U</AvatarFallback></Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selected.restaurant} — {selected.id}</h3>
                  <p className="text-sm text-slate-500">Customer: {selected.customer}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold">Items</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  {selected.items.map((it:any, idx:number) => (<li key={idx}>{it.qty}× {it.name}</li>))}
                </ul>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">ETA</p>
                  <p className="font-semibold">{selected.eta} min</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Partner</p>
                  <p className="font-semibold">{selected.partner}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, accent }: any) {
  return (
    <Card className="p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
      </div>
      <div className="p-3 rounded-xl" style={{ background: `${accent}20` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
    </Card>
  );
}

function calcAvgETA(arr:any[]){ return arr.length? Math.round(arr.reduce((s,a)=>s+a.eta,0)/arr.length):0; }

// ---------------- Mock Data (full items included) ----------------
function mockOnTheWay(){ const now=new Date(); return [
  {id:'ORD-7201',restaurant:'Casa Lisboa',customer:'João Silva',address:'Rua Augusta 12, Lisbon',items:[{qty:1,name:'Bacalhau à Brás'},{qty:2,name:'Pastéis de Nata'}],amount:28.5,eta:12,etaDelay:false,city:'Lisbon',createdAt:new Date(now.getTime()-1000*60*8).toISOString(),partner:'Rui Costa'},
  {id:'ORD-7202',restaurant:'Prego Urban',customer:'Maria Fernandes',address:'Av. da Boavista 88, Porto',items:[{qty:2,name:'Prego'}],amount:16,eta:6,etaDelay:false,city:'Porto',createdAt:new Date(now.getTime()-1000*60*5).toISOString(),partner:'Ana Pereira'},
  {id:'ORD-7203',restaurant:'Sushi Tejo',customer:'Rui Almeida',address:'Rua da Betesga, Braga',items:[{qty:1,name:'Sushi Platter'}],amount:34,eta:0,etaDelay:true,city:'Braga',createdAt:new Date(now.getTime()-1000*60*22).toISOString(),partner:'Carlos Sousa'},
  {id:'ORD-7204',restaurant:'Pastelaria do Bairro',customer:'Ana Pereira',address:'Largo da Porta, Coimbra',items:[{qty:3,name:'Croissant'},{qty:2,name:'Coffee'}],amount:12.5,eta:4,etaDelay:false,city:'Coimbra',createdAt:new Date(now.getTime()-1000*60*2).toISOString(),partner:'Rita Gomes'},
]; }
