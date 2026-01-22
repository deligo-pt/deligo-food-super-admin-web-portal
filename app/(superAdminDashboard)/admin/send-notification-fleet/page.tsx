/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Bell, Send, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const DELIGO = '#DC3173';



type AudienceGroup = 'all' | 'active' | 'suspended' | 'zone' | 'managers';

const TEMPLATES = [
  { id: 't1', title: 'System Maintenance', body: 'Heads-up: We will have short maintenance at 02:00 — deliveries may be delayed.' },
  { id: 't2', title: 'Surge Pay', body: 'Surge pay active in Lisbon Central for the next 2 hours. Accept any orders to earn more!' },
  { id: 't3', title: 'Document Reminder', body: 'Please upload your ID and business license to avoid suspension.' },
];

export default function SendNotificationFleetPage() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<AudienceGroup>('all');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [templateId, setTemplateId] = useState<string | null>(null);

  // UI
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  // mock audience counts (replace with API)
  const audienceCount = useMemo(() => {
    // very simple mock rules
    if (selectedGroup === 'all') return 124;
    if (selectedGroup === 'active') return 98;
    if (selectedGroup === 'suspended') return 6;
    if (selectedGroup === 'managers') return selectedManagers.length || 8;
    if (selectedGroup === 'zone') return selectedZones.length * 12 || 24;
    return 0;
  }, [selectedGroup, selectedManagers.length, selectedZones.length]);

  // char count & warnings
  const charCount = message.length;
  const charWarning = charCount > 1024 ? 'Message too long ( > 1024 chars )' : null;

  // template apply
  function applyTemplate(id: string) {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setTemplateId(id);
    setTitle(t.title);
    setMessage(t.body);
  }

  // simple mock send function (replace with API)
  async function sendMock(payload: any) {
    // emulate network / processing
    await new Promise((r) => setTimeout(r, 900));
    // random fail simulation 5%
    if (Math.random() < 0.05) throw new Error('Network error');
    return { ok: true };
  }

  async function confirmSend() {
    // validation
    if (!title.trim()) {
      setToast({ kind: 'error', message: 'Title is required' });
      return;
    }
    if (!message.trim()) {
      setToast({ kind: 'error', message: 'Message is empty' });
      return;
    }
    if (scheduleMode === 'later' && !scheduledAt) {
      setToast({ kind: 'error', message: 'Please select date & time for scheduled send' });
      return;
    }

    setConfirmOpen(false);
    setSending(true);
    try {
      // prepare payload
      const payload = {
        title,
        message,
        audience: { type: selectedGroup, zones: selectedZones, managers: selectedManagers },
        schedule: scheduleMode === 'now' ? null : scheduledAt,
        meta: { createdBy: 'superadmin' },
      };

      await sendMock(payload);
      setToast({ kind: 'success', message: `Notification queued to ${audienceCount} recipients` });
      // reset form (partial)
      setTitle('');
      setMessage('');
      setSelectedZones([]);
      setSelectedManagers([]);
      setTemplateId(null);
    } catch (err) {
      setToast({ kind: 'error', message: (err as Error).message || 'Failed to send' });
    } finally {
      setSending(false);
    }
  }

  // small helpers for toggles in UI
  function toggleZone(z: string) {
    setSelectedZones((prev) => (prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z]));
  }
  function toggleManager(m: string) {
    setSelectedManagers((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  // mock lists for zone/manager in UI
  const mockZones = ['Lisbon Central', 'Porto Downtown', 'Braga West', 'Coimbra East', 'Faro South'];
  const mockManagers = ['João Silva', 'Maria Fernandes', 'Carlos Sousa', 'Ana Pereira'];

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <Bell className="w-8 h-8" style={{ color: DELIGO }} /> {t("send_notification_to_fleet")}
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 shadow-sm rounded-2xl col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{t("create_notification")}</h2>
              <p className="text-sm text-slate-500 mt-1">{t("compose_message_send_to_fleet")}</p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">{t("recipients_lg")}</div>
              <div className="text-xl font-bold" style={{ color: DELIGO }}>{audienceCount}</div>
              <div className="text-xs text-slate-400">{t("est_recipients")}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500">{t("title")}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("short_title_max_100_chars")} maxLength={100} aria-label="notification-title" />
            </div>

            <div>
              <label className="text-xs text-slate-500">{t("message")}</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[140px]" placeholder={t("write_notification_message")} aria-label="notification-body" />
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <div>
                  {charWarning ? <span className="text-red-600">{charWarning}</span> : <span>{charCount} {t("characters")}</span>}
                </div>
                <div>
                  <span>{t("preview")}: </span>
                  <Button size="sm" variant="ghost" onClick={() => setPreviewOpen(true)}>{t("open")}</Button>
                </div>
              </div>
            </div>

            {/* Templates */}
            <div>
              <label className="text-xs text-slate-500">{t("templates")}</label>
              <div className="flex gap-2 flex-wrap mt-2">
                {TEMPLATES.map((t) => (
                  <Button key={t.id} size="sm" variant={templateId === t.id ? 'default' : 'outline'} onClick={() => applyTemplate(t.id)}>
                    {t.title}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => { setTemplateId(null); setTitle(''); setMessage(''); }}>{t("clear")}</Button>
              </div>
            </div>

            {/* Audience */}
            <div>
              <label className="text-xs text-slate-500">{t("audience")}</label>
              <div className="mt-2 flex items-center gap-3">
                <Select value={selectedGroup} onValueChange={(v) => setSelectedGroup(v as AudienceGroup)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_fleet_managers")}</SelectItem>
                    <SelectItem value="active">{t("active_only")}</SelectItem>
                    <SelectItem value="suspended">{t("suspended_only")}</SelectItem>
                    <SelectItem value="zone">{t("by_zone")}</SelectItem>
                    <SelectItem value="managers">{t("specific_managers")}</SelectItem>
                  </SelectContent>
                </Select>

                {selectedGroup === 'zone' && (
                  <div className="flex gap-2 flex-wrap">
                    {mockZones.map((z) => (
                      <Badge key={z} className={`px-3 py-1 cursor-pointer ${selectedZones.includes(z) ? 'bg-black text-white' : 'bg-slate-100'}`} onClick={() => toggleZone(z)}>
                        {z}
                      </Badge>
                    ))}
                  </div>
                )}

                {selectedGroup === 'managers' && (
                  <div className="flex gap-2 flex-wrap">
                    {mockManagers.map((m) => (
                      <Badge key={m} className={`px-3 py-1 cursor-pointer ${selectedManagers.includes(m) ? 'bg-black text-white' : 'bg-slate-100'}`} onClick={() => toggleManager(m)}>
                        {m}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Scheduling */}
            <div>
              <label className="text-xs text-slate-500">{t("schedule")}</label>
              <div className="mt-2 flex items-center gap-3">
                <Button size="sm" variant={scheduleMode === 'now' ? 'default' : 'outline'} onClick={() => setScheduleMode('now')}>
                  {t("send_now")}
                </Button>

                <Button size="sm" variant={scheduleMode === 'later' ? 'default' : 'outline'} onClick={() => setScheduleMode('later')}>
                  {t("schedule")}
                </Button>

                {scheduleMode === 'later' && (
                  <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-auto" />
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-500">{t("do_quick_preview_confirm_before")}</div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                  {t("preview")}
                </Button>
                <Button style={{ background: DELIGO }} onClick={() => setConfirmOpen(true)} disabled={sending} className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> {sending ? t("sending") : t("send_notification")}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Preview / Info column */}
        <Card className="p-6 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-slate-700" />
            <div>
              <div className="text-xs text-slate-500">{t("audience")}</div>
              <div className="font-medium">{selectedGroup === 'all' ? t("all_fleet_manager") : selectedGroup}</div>
            </div>
          </div>

          <Separator className="mb-4" />

          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-500">{t("title")}</div>
              <div className="font-medium">{title || <span className="text-slate-400">{t("untitled")}</span>}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">{t("message")}</div>
              <div className="text-sm text-slate-700 whitespace-pre-line">{message || <span className="text-slate-400">{t("no_message_yet")}</span>}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">{t("schedule")}</div>
              <div className="font-medium">{scheduleMode === 'now' ? t("immediate") : scheduledAt || t("not_set")}</div>
            </div>

            <div className="pt-2">
              <Button size="sm" variant="outline" onClick={() => { setTitle(''); setMessage(''); setTemplateId(null); }}>{t("clear_draft")}</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6" style={{ color: DELIGO }} />
              <div>
                <h3 className="text-lg font-semibold">{t("notification_preview")}</h3>
                <div className="text-xs text-slate-500">{t("how_notification_look_on_devices")}</div>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 p-4 bg-slate-50 rounded-md">
            <div className="text-sm font-semibold mb-2">{title || t("untitled_notification")}</div>
            <div className="text-sm text-slate-700 whitespace-pre-line">{message || t("no_message")}</div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>{t("close")}</Button>
            <Button style={{ background: DELIGO }} onClick={() => { setPreviewOpen(false); setConfirmOpen(true); }}>{t("confirm_nd_send")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <h3 className="text-lg font-semibold">{t("confirm_send")}</h3>
            <div className="text-sm text-slate-500 mt-1">{t("your_re_sending_to")} <strong>{audienceCount}</strong> {t("recipients")}.</div>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs text-slate-500">{t("title")}</div>
              <div className="font-medium">{title}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">{t("message")}</div>
              <div className="text-sm text-slate-700 whitespace-pre-line max-h-40 overflow-auto">{message}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">{t("schedule")}</div>
              <div>{scheduleMode === 'now' ? 'Immediate' : scheduledAt}</div>
            </div>

            <div className="pt-2 text-sm text-slate-500">{t("this_action_irreversible_queued_batch")}</div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>{t("cancel")}</Button>
            <Button style={{ background: DELIGO }} onClick={confirmSend} disabled={sending}>{sending ? t("sending") : t("send_now")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${toast.kind === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.kind === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <div className="text-sm">{toast.message}</div>
          <button className="ml-3 text-xs underline" onClick={() => setToast(null)}>{t("close")}</button>
        </div>
      )}
    </div>
  );
}
