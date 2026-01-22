/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Map, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const DELIGO = '#DC3173';

// ----------------------- Types -----------------------
type Zone = {
  id: string;
  name: string;
  city: string;
  group: 'North' | 'Central' | 'South';
  baseFee: number;
  perKmFee: number;
  estimatedTime: string;
  color: string;
  active: boolean;
  manager?: string;
};

// ----------------------- Component -----------------------
export default function FleetZonesPage() {
  const { t } = useTranslation();
  const [zones, setZones] = useState<Zone[]>(mockZones());
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);

  const [form, setForm] = useState<any>({
    name: '',
    city: '',
    group: 'Central',
    baseFee: '',
    perKmFee: '',
    estimatedTime: '',
    color: DELIGO,
    active: true,
    manager: '',
  });

  const filtered = zones.filter((z) =>
    [z.name, z.city, z.group, z.manager].join(' ').toLowerCase().includes(query.toLowerCase())
  );

  // Open add modal
  function openAddModal() {
    setEditing(null);
    setForm({
      name: '',
      city: '',
      group: 'Central',
      baseFee: '',
      perKmFee: '',
      estimatedTime: '',
      color: DELIGO,
      active: true,
      manager: '',
    });
    setModalOpen(true);
  }

  // Open edit modal
  function openEditModal(zone: Zone) {
    setEditing(zone);
    setForm({
      name: zone.name,
      city: zone.city,
      group: zone.group,
      baseFee: String(zone.baseFee),
      perKmFee: String(zone.perKmFee),
      estimatedTime: zone.estimatedTime,
      color: zone.color,
      active: zone.active,
      manager: zone.manager ?? '',
    });
    setModalOpen(true);
  }

  // Save zone (add or update)
  function saveZone() {
    // Basic validation
    if (!form.name || !form.city) {
      alert('Please enter zone name and city.');
      return;
    }

    const newZone: Zone = {
      id: editing ? editing.id : `ZN-${1000 + zones.length}`,
      name: form.name,
      city: form.city,
      group: form.group,
      baseFee: Number(form.baseFee || 0),
      perKmFee: Number(form.perKmFee || 0),
      estimatedTime: form.estimatedTime,
      color: form.color || DELIGO,
      active: !!form.active,
      manager: form.manager || undefined,
    };

    if (editing) {
      setZones((prev) => prev.map((z) => (z.id === editing.id ? newZone : z)));
    } else {
      setZones((prev) => [...prev, newZone]);
    }

    setModalOpen(false);
  }

  // Delete zone
  function deleteZone(id: string) {
    if (!confirm('Delete this zone?')) return;
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6 flex items-center gap-3"
      >
        <Map className="w-8 h-8" style={{ color: DELIGO }} /> {t("fleet_zones")}
      </motion.h1>

      {/* Search + Add */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input
          placeholder={t("search_zone_city_group")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        <Button style={{ background: DELIGO }} onClick={openAddModal}>
          <PlusCircle className="w-4 h-4 mr-1" /> {t("add_zone")}
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <div className="text-sm text-slate-500">{t("total_zones")}:</div>
          <div className="px-3 py-1 rounded-md bg-white border">{zones.length}</div>
        </div>
      </div>

      {/* Zones list */}
      <Card className="p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{t("all_zones")}</h2>
        <Separator className="mb-4" />

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500">{t("no_zones_found")}</div>
          ) : (
            filtered.map((z) => (
              <motion.div
                key={z.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-white rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* left info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ background: z.color }} />
                    <div className="font-bold text-lg">{z.name}</div>
                    <Badge variant={z.active ? 'default' : 'destructive'} className="ml-3">
                      {z.active ? t("active") : t("maintenance")}
                    </Badge>
                  </div>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <div>{t("city")}: <strong className="text-slate-800">{z.city}</strong></div>
                    <div>{t("group")}: <strong className="text-slate-800">{z.group}</strong></div>
                    <div>{t("base_fee")}: <strong className="text-slate-800">€ {z.baseFee}</strong></div>
                    <div>{t("per_km_fee")}: <strong className="text-slate-800">€ {z.perKmFee}</strong></div>
                    <div>{t("eta")}: <strong className="text-slate-800">{z.estimatedTime}</strong></div>
                    <div>{t("manager")}: <strong className="text-slate-800">{z.manager ?? '—'}</strong></div>
                  </div>
                </div>

                {/* actions */}
                <div className="shrink-0 flex items-center gap-3">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(z)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteZone(z.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? t("edit_zone") : t("add_zone")}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input placeholder={t("zone_name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder={t("city")} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />

            <div>
              <label className="text-xs text-slate-500">{t("group")}</label>
              <select className="w-full mt-1 border rounded-md p-2" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                <option value="North">{t("north")}</option>
                <option value="Central">{t("central")}</option>
                <option value="South">{t("south")}</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500">{t("fleet_manager")} ({t("optional")})</label>
              <Input placeholder={t("manager_name")} value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
            </div>

            <Input placeholder={`${t("base_fee")} (€)`} value={form.baseFee} onChange={(e) => setForm({ ...form, baseFee: e.target.value })} />
            <Input placeholder={`${t("per_km_fee")} (€)`} value={form.perKmFee} onChange={(e) => setForm({ ...form, perKmFee: e.target.value })} />

            <Input placeholder={t("estimated_time_min")} value={form.estimatedTime} onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })} />

            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs text-slate-500">{t("zone_color")}</label>
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-10 p-0 border-0" />
              </div>

              <div className="flex items-center gap-2">
                <input id="zone-active" type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <label htmlFor="zone-active" className="text-sm">{t("active_zone")}</label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t("cancel")}</Button>
            <Button style={{ background: DELIGO }} onClick={saveZone}>{editing ? t("update") : t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----------------------- Mock Data -----------------------
function mockZones(): Zone[] {
  return [
    {
      id: 'ZN-1001',
      name: 'Lisbon Central',
      city: 'Lisbon',
      group: 'Central',
      baseFee: 2.5,
      perKmFee: 0.45,
      estimatedTime: '20-30 min',
      color: '#DC3173',
      active: true,
      manager: 'João Silva',
    },
    {
      id: 'ZN-1002',
      name: 'Porto Downtown',
      city: 'Porto',
      group: 'North',
      baseFee: 3.0,
      perKmFee: 0.5,
      estimatedTime: '25-35 min',
      color: '#0ea5a4',
      active: true,
      manager: 'Maria Fernandes',
    },
    {
      id: 'ZN-1003',
      name: 'Braga West',
      city: 'Braga',
      group: 'North',
      baseFee: 2.0,
      perKmFee: 0.4,
      estimatedTime: '15-25 min',
      color: '#f59e0b',
      active: false,
      manager: 'Rui Costa',
    },
  ];
}
