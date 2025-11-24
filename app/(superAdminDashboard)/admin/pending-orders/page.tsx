'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Clock,
  Loader,
  Eye,
  MapPin,
  ShoppingBag,
  Bike,
} from 'lucide-react';

// DELIGO theme
const DELIGO = '#DC3173';

type PendingOrder = {
  id: string;
  customer: string;
  address: string;
  items: number;
  amount: number;
  status: string;
  restaurant: string;
  eta: string;
  orderTime: string;
  rider?: string;
  image?: string;
};

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setOrders(mockPendingOrders());
  }, []);

  const filtered = orders.filter((o) =>
    [o.customer, o.restaurant, o.id, o.rider].join(' ').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-slate-50">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold flex items-center gap-3 mb-6">
          <Clock className="w-8 h-8" style={{ color: DELIGO }} /> Pending Orders
        </h1>
      </motion.div>

      {/* SEARCH */}
      <div className="flex items-center gap-3 mb-6 max-w-xl">
        <Input
          placeholder="Search order ID, customer, restaurant, rider..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button style={{ background: DELIGO }}><Search className="w-4 h-4" /></Button>
      </div>

      {/* CARD WRAPPER */}
      <Card className="p-6 bg-white shadow-sm rounded-2xl">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin text-slate-600" /> Live Pending Orders
        </h2>
        <Separator className="mb-4" />

        {/* ORDERS LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((order, idx) => (
            <motion.div
              key={order.id}
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-slate-50 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer"
            >

              {/* LEFT SECTION */}
              <div className="flex items-center gap-4 min-w-0">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={order.image || ''} />
                  <AvatarFallback>
                    {order.customer.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="font-semibold text-lg truncate">{order.customer}</p>
                  <p className="text-xs text-slate-600 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {order.address}
                  </p>
                  <p className="text-xs text-slate-600 truncate flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" /> {order.restaurant}
                  </p>

                  <Badge variant="outline" className="mt-1 border-amber-500 text-amber-600">
                    {order.items} items
                  </Badge>
                </div>
              </div>

              {/* RIGHT SECTION */}
              <div className="text-right min-w-[120px]">
                <p className="text-sm text-slate-500">Amount</p>
                <p className="text-lg font-bold">€ {order.amount.toLocaleString()}</p>

                <p className="text-xs text-slate-500 mt-1">ETA: {order.eta}</p>
                <p className="text-xs text-slate-500">{new Date(order.orderTime).toLocaleTimeString()}</p>

                <div className="mt-2 flex items-center gap-2 justify-end">
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" style={{ background: DELIGO }}>
                    <Bike className="w-4 h-4 mr-1" /> Assign
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Mock Data ---------------- */
function mockPendingOrders(): PendingOrder[] {
  return [
    {
      id: 'ORD-9011',
      customer: 'João Silva',
      address: 'Rua Augusta, Lisbon',
      items: 4,
      amount: 28.5,
      status: 'pending',
      restaurant: 'Casa Lisboa',
      eta: '18-25 min',
      orderTime: new Date().toISOString(),
      image: '',
    },
    {
      id: 'ORD-9012',
      customer: 'Maria Fernandes',
      address: 'Av. da Boavista, Porto',
      items: 2,
      amount: 16.0,
      status: 'preparing',
      restaurant: 'Prego Urban',
      eta: '12-18 min',
      orderTime: new Date().toISOString(),
      image: '',
    },
    {
      id: 'ORD-9013',
      customer: 'Rui Costa',
      address: 'Centro, Braga',
      items: 5,
      amount: 32.9,
      status: 'waiting_for_rider',
      restaurant: 'Sabor de Braga',
      eta: '20-30 min',
      orderTime: new Date().toISOString(),
      image: '',
    },
    {
      id: 'ORD-9014',
      customer: 'Ana Pereira',
      address: 'Avenida Liberdade, Lisbon',
      items: 3,
      amount: 22.5,
      status: 'pending',
      restaurant: 'Lisboa Grills',
      eta: '15-22 min',
      orderTime: new Date().toISOString(),
      image: '',
    },
  ];
}
