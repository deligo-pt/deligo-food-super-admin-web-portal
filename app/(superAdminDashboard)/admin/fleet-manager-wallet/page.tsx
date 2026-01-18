/* eslint-disable @typescript-eslint/no-explicit-any */


'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';

const DELIGO = '#DC3173';

// ---------------------- Types ----------------------
type Transaction = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  date: string;
  fleetManager: string;
  reason: string;
  status: "pending" | "completed" | "failed" | "success" | "rejected";
  method: 'bank_transfer' | 'wallet_adjustment' | 'bonus' | 'deduction';
};

export default function FleetManagerWalletPage() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    Promise.resolve().then(() => {
      setTransactions(mockWallet());
    });
  }, []);


  const filtered = transactions.filter((t) => {
    const matchesQuery = [t.fleetManager, t.id, t.reason].join(' ').toLowerCase().includes(query.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesQuery && matchesStatus && matchesType;
  });

  const totalBalance = filtered.reduce((s, t) => s + (t.type === 'credit' ? t.amount : -t.amount), 0);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <Wallet className="w-8 h-8" style={{ color: DELIGO }} /> {t("fleet_manager_wallet")}
      </motion.h1>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input placeholder={t("search_fleet_manager_id_reason")} value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />

        <Button style={{ background: DELIGO }}><Search className="w-4 h-4" /></Button>

        {/* Filter by status */}
        <select
          className="px-3 py-2 border rounded-md bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">{t("all_status")}</option>
          <option value="completed">{t("completed")}</option>
          <option value="pending">{t("pending")}</option>
          <option value="failed">{t("failed")}</option>
        </select>

        {/* Filter by type */}
        <select
          className="px-3 py-2 border rounded-md bg-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">{t("all_types")}</option>
          <option value="credit">{t("credit")}</option>
          <option value="debit">{t("debit")}</option>
        </select>

        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> {t("export_csv")}
        </Button>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title={t("total_wallet_balance")}
          value={`€ ${totalBalance.toLocaleString()}`}
          icon={<Wallet className="w-6 h-6" style={{ color: DELIGO }} />}
        />

        <SummaryCard
          title={t("total_credit")}
          value={`€ ${filtered.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0).toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />

        <SummaryCard
          title={t("total_debit")}
          value={`€ ${filtered.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0).toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-red-600" />}
        />

        <SummaryCard
          title={t("pending_transactions")}
          value={`${filtered.filter((t) => t.status === 'pending').length}`}
          icon={<Filter className="w-6 h-6" style={{ color: DELIGO }} />}
        />

      </div>

      {/* Transactions */}
      <Card className="p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{t("transactions")}</h2>
        <Separator className="mb-4" />

        <div className="space-y-4">
          {filtered.map((trx) => (
            <motion.div key={trx.id} whileHover={{ scale: 1.01 }} className="p-4 bg-slate-50 rounded-xl border flex items-center justify-between">
              <div className="flex items-center gap-4">
                {trx.type === 'credit' ? (
                  <ArrowUpCircle className="w-7 h-7 text-green-600" />
                ) : (
                  <ArrowDownCircle className="w-7 h-7 text-red-600" />
                )}

                <div>
                  <div className="font-semibold">{trx.fleetManager}</div>
                  <div className="text-xs text-slate-500">{trx.reason}</div>

                  <Badge className="mt-1" variant={badgeVariant(trx.status)}>
                    {trx.status}
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold ${trx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {trx.type === 'credit' ? '+' : '-'} € {trx.amount.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">{new Date(trx.date).toLocaleString()}</div>
                <div className="text-xs text-slate-400 italic">{t("method")}: {trx.method}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, icon }: any) {
  return (
    <Card className="p-5 shadow-sm border rounded-xl bg-white flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
      </div>
      <div className="p-3 rounded-xl bg-slate-100">{icon}</div>
    </Card>
  );
}

function badgeVariant(status: string) {
  return status === 'completed' ? 'default' : status === 'pending' ? 'secondary' : 'destructive';
}

// ---------------------- Mock Wallet Data ----------------------
function mockWallet(): Transaction[] {
  const statuses = ['completed', 'pending', 'failed'] as const;
  const managers = ['João Silva', 'Maria Fernandes', 'Rui Costa', 'Ana Pereira'] as const;
  const reasons = ['Weekly Bonus', 'Penalty Deduction', 'Fuel Compensation', 'Payout Adjustment'] as const;
  const methods = ['bank_transfer', 'wallet_adjustment', 'bonus', 'deduction'] as const;

  return Array.from({ length: 20 }).map((_, i) => ({
    id: `TRX-${2000 + i}`,
    type: i % 2 === 0 ? "credit" : "debit",
    amount: Math.floor(Math.random() * 500) + 50,
    date: new Date(Date.now() - i * 3600 * 1000 * 6).toISOString(),
    fleetManager: managers[i % 4],
    reason: reasons[i % 4],
    status: statuses[i % 3],
    method: methods[i % 4],
  }));
}
