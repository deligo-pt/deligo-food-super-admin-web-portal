/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Store,
  Search,
  MapPin,
  FileText,
  BarChart2,
  Loader2,
  CheckCircle,
  Slash,
  Eye,
  MoreHorizontal,
  EuroIcon,
} from 'lucide-react';

// Deligo primary color
const DELIGO = '#DC3173';

type Vendor = {
  id: string;
  name: string;
  owner: string;
  phone: string;
  city: string;
  cuisine: string;
  createdAt: string;
  documentsUploaded: boolean;
  active: boolean;
  liveOrders: number;
  rating: number; // 0-5
  commissionPercent: number;
  zones: string[];
};

export default function ActiveVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterZone, setFilterZone] = useState<string | 'all'>('all');
  const [filterDoc, setFilterDoc] = useState<'all' | 'uploaded' | 'missing'>('all');
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [sortBy, setSortBy] = useState<'latest' | 'top-rated' | 'most-orders'>('latest');

  useEffect(() => {
    setLoading(true);
    // mock fetch — replace with real API call
    setTimeout(() => {
      setVendors(mockVendors());
      setLoading(false);
    }, 400);
  }, []);

  // FILTER + SEARCH + SORT
  const filtered = vendors
    .filter((v) =>
      [v.name, v.owner, v.city, v.cuisine, v.zones.join(' ')].join(' ').toLowerCase().includes(query.toLowerCase())
    )
    .filter((v) => {
      if (filterZone === 'all') return true;
      return v.zones.includes(filterZone as string);
    })
    .filter((v) => {
      if (filterDoc === 'all') return true;
      return filterDoc === 'uploaded' ? v.documentsUploaded : !v.documentsUploaded;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'top-rated') return b.rating - a.rating;
      return b.liveOrders - a.liveOrders;
    });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleActive(id: string) {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, active: !v.active } : v)));
  }


  function unBlockVendor(id: string) {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, active: true } : v)));
  }

  function exportCSV() {
    const rows = [
      ['ID', 'Name', 'Owner', 'Phone', 'City', 'Cuisine', 'Active', 'Live Orders', 'Rating', 'Zones', 'Documents'],
      ...filtered.map((v) => [
        v.id,
        v.name,
        v.owner,
        v.phone,
        v.city,
        v.cuisine,
        v.active ? 'Yes' : 'No',
        String(v.liveOrders),
        String(v.rating),
        v.zones.join('|'),
        v.documentsUploaded ? 'Uploaded' : 'Missing',
      ]),
    ];

    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `active_vendors_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const zones = Array.from(new Set(vendors.flatMap((v) => v.zones)));

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Store className="w-6 h-6 text-slate-800" />
              Active Vendors
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage live vendors on Deligo Portugal — monitor performance, live orders and status</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full max-w-md">
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search name, owner, city, cuisine or zone..."
                className="pr-12"
                aria-label="Search active vendors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button size="sm" style={{ background: DELIGO, borderColor: DELIGO }} onClick={() => { /*  search */ }}>
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
              </div>
            </div>

            <Button size="sm" variant="ghost" onClick={() => { setQuery(''); setFilterZone('all'); setFilterDoc('all'); setSortBy('latest'); }}>
              Reset
            </Button>
          </div>
        </div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }} className="mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Card className="p-3 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                  <div>
                    <div className="text-xs text-slate-400">Total Active</div>
                    <div className="font-semibold text-slate-900">{vendors.filter((v) => v.active).length}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-5 h-5" />
                  <div>
                    <div className="text-xs text-slate-400">Avg Rating</div>
                    <div className="font-semibold text-slate-900">{(vendors.reduce((s, v) => s + v.rating, 0) / Math.max(1, vendors.length)).toFixed(1)}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <EuroIcon className="w-5 h-5" />
                  <div>
                    <div className="text-xs text-slate-400">Avg Commission</div>
                    <div className="font-semibold text-slate-900">{Math.round(vendors.reduce((s, v) => s + v.commissionPercent, 0) / Math.max(1, vendors.length))}%</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterZone}
                onChange={(e) => { setFilterZone(e.target.value as any); setPage(1); }}
                className="px-3 py-2 rounded-md bg-white border"
              >
                <option value="all">All Zones</option>
                {zones.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>

              <select value={filterDoc} onChange={(e) => { setFilterDoc(e.target.value as any); setPage(1); }} className="px-3 py-2 rounded-md bg-white border">
                <option value="all">All Docs</option>
                <option value="uploaded">With Documents</option>
                <option value="missing">Missing Docs</option>
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 rounded-md bg-white border">
                <option value="latest">Latest</option>
                <option value="top-rated">Top Rated</option>
                <option value="most-orders">Most Orders</option>
              </select>

              <Button size="sm" variant="outline" onClick={exportCSV}>Export CSV</Button>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-lg flex items-center gap-2"><Store className="w-4 h-4" /> Active Vendors</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Portugal</Badge>
                </div>
              </div>

              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHead>
                    <TableRow className="bg-white">
                      <TableCell className="pl-6">Vendor</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Live Orders</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Zones</TableCell>
                      <TableCell>Docs</TableCell>
                      <TableCell className="text-right pr-6">Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="py-12 text-center">
                            <div className="text-slate-500">Loading active vendors...</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="py-12 text-center text-slate-500">No active vendors found.</div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((v) => (
                        <motion.tr key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} whileHover={{ translateY: -4 }} transition={{ duration: 0.16 }} className="bg-white">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={`/images/vendors/${v.id}.jpg`} alt={v.name} />
                                <AvatarFallback>{v.name.split(' ').map(n => n[0]).slice(0,2).join('')}</AvatarFallback>
                              </Avatar>

                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1">
                                    <Store className="w-4 h-4 text-slate-700" />
                                    {v.name}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-md ${v.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{v.active ? 'Active' : 'Blocked'}</span>
                                </div>
                                <div className="text-xs text-slate-400">{v.owner} • {v.phone}</div>
                                <div className="text-xs text-slate-400 mt-1">Commission: {v.commissionPercent}%</div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-600" />
                              {v.city}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="inline-flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                              <div className="font-medium">{v.liveOrders}</div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BarChart2 className="w-4 h-4 text-slate-600" />
                              <div className="font-medium">{v.rating.toFixed(1)}</div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2 flex-wrap">
                              {v.zones.slice(0, 3).map((z) => <Badge key={z} variant="secondary">{z}</Badge>)}
                              {v.zones.length > 3 ? <span className="text-xs text-slate-400">+{v.zones.length - 3}</span> : null}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{v.documentsUploaded ? 'Uploaded' : 'Missing'}</span>
                            </div>
                          </TableCell>

                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setSelected(v)}><Eye className="w-4 h-4 mr-2" />View</Button>

                              {v.active ? (
                                <Button size="sm" style={{ background: DELIGO, borderColor: DELIGO }} onClick={() => toggleActive(v.id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" /> Disable
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => unBlockVendor(v.id)}><Slash className="w-4 h-4 mr-2" /> Unblock</Button>
                              )}

                              <Button size="sm" variant="ghost" onClick={() => { /* show actions menu in future */ }}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} results</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, page - 1))}>Prev</Button>
                  <div className="px-3 py-1 rounded-md bg-white border">{page}</div>
                  <Button size="sm" variant="outline" onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Vendor Details Dialog */}
        <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Vendor details</DialogTitle>
            </DialogHeader>

            {selected ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={`/images/vendors/${selected.id}.jpg`} alt={selected.name} />
                      <AvatarFallback>{selected.name.split(' ').map(n => n[0]).slice(0,2).join('')}</AvatarFallback>
                    </Avatar>

                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">{selected.name}</h3>
                      <p className="text-sm text-slate-500">{selected.cuisine}</p>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2"><Store className="w-4 h-4" /> Owner: {selected.owner}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> City: {selected.city}</div>
                        <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Documents: {selected.documentsUploaded ? 'Uploaded' : 'Missing'}</div>
                        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4" /> Live Orders: {selected.liveOrders}</div>
                        <div className="flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Rating: {selected.rating.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h4 className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> Zones & Coverage</h4>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {selected.zones.map((z) => <Badge key={z}>{z}</Badge>)}
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4" /> Recent Activity</h4>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="p-3 bg-white rounded-md border shadow-sm">Order #1234 delivered • 20 min</div>
                        <div className="p-3 bg-white rounded-md border shadow-sm">Payout requested • €120</div>
                        <div className="p-3 bg-white rounded-md border shadow-sm">Menu updated • 2 days ago</div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                      {selected.active ? (
                        <Button style={{ background: DELIGO, borderColor: DELIGO }} onClick={() => { toggleActive(selected.id); setSelected({ ...selected, active: !selected.active }); }}>
                          <Slash className="w-4 h-4 mr-2" /> Disable
                        </Button>
                      ) : (
                        <Button onClick={() => { unBlockVendor(selected.id); setSelected({ ...selected, active: true }); }}>
                          Unblock
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            <DialogFooter />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* ---------------------- MOCK DATA (Replace with API) ---------------------- */
function mockVendors(): Vendor[] {
  const base = [
    {
      name: 'Casa Lisboa',
      owner: 'João Silva',
      phone: '+35191000000',
      city: 'Lisbon',
      cuisine: 'Portuguese',
      zones: ['Lisbon Central', 'Belém'],
    },
    {
      name: 'Prego Urban',
      owner: 'Maria Fernandes',
      phone: '+35192000001',
      city: 'Porto',
      cuisine: 'Fast Food',
      zones: ['Porto Centro', 'Boavista'],
    },
    {
      name: 'Sabor de Porto',
      owner: 'Carlos Sousa',
      phone: '+35193000002',
      city: 'Porto',
      cuisine: 'Portuguese',
      zones: ['Porto Centro'],
    },
    {
      name: 'Pastelaria do Bairro',
      owner: 'Ana Pereira',
      phone: '+35194000003',
      city: 'Coimbra',
      cuisine: 'Bakery',
      zones: ['Coimbra Norte'],
    },
    {
      name: 'Sushi Tejo',
      owner: 'Rui Costa',
      phone: '+35195000004',
      city: 'Lisbon',
      cuisine: 'Japanese',
      zones: ['Lisbon Central', 'Alcântara'],
    },
  ];

  return Array.from({ length: 28 }).map((_, i) => {
    const t = base[i % base.length];
    return {
      id: `VND-${2000 + i}`,
      name: t.name,
      owner: t.owner,
      phone: t.phone,
      city: t.city,
      cuisine: t.cuisine,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
      documentsUploaded: i % 4 !== 0,
      active: i % 7 !== 0,
      liveOrders: Math.max(0, Math.floor(Math.random() * 20) + (i % 5)),
      rating: Math.round((3 + Math.random() * 2) * 10) / 10,
      commissionPercent: [15, 18, 20, 12][i % 4],
      zones: t.zones,
    } as Vendor;
  });
}
