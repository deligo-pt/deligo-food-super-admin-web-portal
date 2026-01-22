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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Euro,
  Wallet,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Download,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const DELIGO = '#DC3173';

type Payout = {
  id: string;
  driverId: string;
  driverName: string;
  amount: number; // in euros
  payoutMethod: string; // e.g., 'IBAN', 'Multibanco', 'Transfer'
  city: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Rejected';
  accountHolder?: string;
  iban?: string;
  note?: string;
};

export default function DriverPayoutsPage() {
  const { t } = useTranslation();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [selected, setSelected] = useState<Payout | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPayouts(mockPayouts());
      setLoading(false);
    }, 450);
  }, []);

  const filtered = payouts.filter((p) =>
    [p.driverName, p.city, p.payoutMethod, p.status, p.id].join(' ').toLowerCase().includes(query.toLowerCase())
  );

  function approve(id: string) {
    setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Completed' } : p)));
    if (selected?.id === id) setSelected({ ...(selected as Payout), status: 'Completed' });
  }

  function reject(id: string) {
    setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p)));
    if (selected?.id === id) setSelected({ ...(selected as Payout), status: 'Rejected' });
  }

  function exportCSV() {
    const rows = [
      ['Payout ID', 'Driver ID', 'Driver Name', 'Amount (€)', 'Method', 'City', 'Date', 'Status', 'IBAN', 'Account Holder'],
      ...filtered.map((p) => [
        p.id,
        p.driverId,
        p.driverName,
        p.amount.toFixed(2),
        p.payoutMethod,
        p.city,
        new Date(p.date).toLocaleString(),
        p.status,
        p.iban ?? '',
        p.accountHolder ?? '',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driver_payouts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <Wallet className="w-8 h-8 text-slate-800" /> {t("driver_payouts")}
      </motion.h1>

      {/* Search + Export */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
        <div className="flex items-center gap-3 w-full md:max-w-lg">
          <Input
            placeholder={t("search_driver_city_payout_method_status")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button style={{ background: DELIGO, borderColor: DELIGO }} onClick={() => { /* search */ }}>
            <Search className="w-4 h-4 mr-2" /> {t("search")}
          </Button>
          <Button variant="outline" onClick={() => { setQuery(''); }}>
            {t("reset")}
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> {t("export_csv")}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <StatCard title={t("total_requests")} value={payouts.length} icon={<Wallet />} />
        <StatCard title={t("pending")} value={payouts.filter((p) => p.status === 'Pending').length} />
        <StatCard title={t("completed")} value={payouts.filter((p) => p.status === 'Completed').length} />
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden shadow-md">
        <div className="p-4 sm:p-6">
          <h2 className="font-semibold text-lg mb-4">{t("payout_requests")}</h2>

          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="pl-6">{t("driver")}</TableCell>
                  <TableCell>{t("amount")}</TableCell>
                  <TableCell>{t("method")}</TableCell>
                  <TableCell>{t("city")}</TableCell>
                  <TableCell>{t("date")}</TableCell>
                  <TableCell>{t("status")}</TableCell>
                  <TableCell className="text-right pr-6">{t("actions")}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">{t("loading")}</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-slate-500">{t("no_payouts_found")}</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <motion.tr key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="bg-white">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`/images/drivers/${p.driverId}.jpg`} alt={p.driverName} />
                            <AvatarFallback>{p.driverName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{p.driverName}</div>
                            <div className="text-xs text-slate-400">{p.driverId}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-semibold flex items-center gap-1">
                        <Euro className="w-4 h-4" /> {p.amount.toFixed(2)}
                      </TableCell>

                      <TableCell>{p.payoutMethod}</TableCell>
                      <TableCell>{p.city}</TableCell>
                      <TableCell>{new Date(p.date).toLocaleDateString('en-GB')}</TableCell>

                      <TableCell>
                        <Badge className={p.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : p.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {p.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelected(p)}>
                            <Eye className="w-4 h-4 mr-2" /> {t("view")}
                          </Button>

                          {p.status === 'Pending' && (
                            <>
                              <Button size="sm" style={{ background: DELIGO, borderColor: DELIGO }} onClick={() => approve(p.id)}>
                                <CheckCircle className="w-4 h-4 mr-2" /> {t("approve")}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => reject(p.id)}>
                                <XCircle className="w-4 h-4 mr-2" /> {t("reject")}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* Details dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("payout_details")}</DialogTitle>
          </DialogHeader>

          {selected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`/images/drivers/${selected.driverId}.jpg`} alt={selected.driverName} />
                  <AvatarFallback>{selected.driverName[0]}</AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="text-xl font-semibold">{selected.driverName}</h3>
                  <p className="text-sm text-slate-500">{selected.city}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Info label={t("amount")} value={`€ ${selected.amount.toFixed(2)}`} />
                <Info label={t("method")} value={selected.payoutMethod} />
                <Info label={t("status")} value={selected.status} />
                <Info label={t("date")} value={new Date(selected.date).toLocaleString()} />
                <Info label={t("account_holder")} value={selected.accountHolder ?? '-'} />
                <Info label={t("iban")} value={selected.iban ?? '-'} />
              </div>

              <Separator className="my-4" />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>{t("close")}</Button>
                {selected.status === 'Pending' && (
                  <>
                    <Button style={{ background: DELIGO, borderColor: DELIGO }} onClick={() => { approve(selected.id); setSelected({ ...selected, status: 'Completed' }); }}>
                      <CheckCircle className="w-4 h-4 mr-2" /> {t("approve")}
                    </Button>
                    <Button variant="destructive" onClick={() => { reject(selected.id); setSelected({ ...selected, status: 'Rejected' }); }}>
                      <XCircle className="w-4 h-4 mr-2" /> {t("reject")}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          <DialogFooter />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------------- Small UI helpers ---------------------- */
function StatCard({ title, value, icon }: { title: string; value: number; icon?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="text-2xl text-slate-700">{icon ?? <Wallet className="w-6 h-6" />}</div>
      </div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-3 bg-white rounded-md border">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

/* ---------------------- Mock data (replace with API) ---------------------- */
function mockPayouts(): Payout[] {
  const drivers = [
    { id: 'VND-2001', name: 'Casa Lisboa', city: 'Lisbon' },
    { id: 'VND-2002', name: 'Prego Urban', city: 'Porto' },
    { id: 'VND-2003', name: 'Sabor de Porto', city: 'Porto' },
    { id: 'VND-2004', name: 'Pastelaria do Bairro', city: 'Coimbra' },
    { id: 'VND-2005', name: 'Sushi Tejo', city: 'Lisbon' },
  ];

  const methods = ['IBAN Transfer', 'Multibanco', 'Bank Transfer'];

  return Array.from({ length: 18 }).map((_, i) => {
    const v = drivers[i % drivers.length];
    const status: Payout['status'] = i % 5 === 0 ? 'Pending' : i % 7 === 0 ? 'Rejected' : 'Completed';
    return {
      id: `PAYOUT-${3000 + i}`,
      driverId: v.id,
      driverName: v.name,
      amount: +(Math.random() * 800 + 20).toFixed(2),
      payoutMethod: methods[i % methods.length],
      city: v.city,
      date: new Date(Date.now() - i * 3600 * 1000 * 24).toISOString(),
      status,
      accountHolder: `${v.name} Owner`,
      iban: (i % 3 === 0) ? `PT50${1000000000 + i}` : undefined,
      note: i % 6 === 0 ? 'Manual review required' : undefined,
    };
  });
}
