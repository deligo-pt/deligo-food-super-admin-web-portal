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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Star, Search as SearchIcon, Download, Trash2, MessageSquare } from 'lucide-react';

const DELIGO = '#DC3173';
const SAMPLE_IMAGE = '/mnt/data/Screenshot from 2025-11-21 00-13-57.png';

type Feedback = {
  id: string;
  customerId: string;
  name: string;
  email?: string;
  city?: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
  attachments?: { name: string; url?: string }[];
  replied?: boolean;
};

export default function CustomerFeedbackPremium() {
  const [data, setData] = useState<Feedback[]>([]);
  const [query, setQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [cityFilter, setCityFilter] = useState<string | 'all'>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Feedback | null>(null);

  useEffect(() => setData(mockFeedback()), []);

  const cities = useMemo(() => Array.from(new Set(data.map((d) => d.city).filter(Boolean) as string[])), [data]);

  const filtered = useMemo(() => {
    return data.filter((f) => {
      const q = query.trim().toLowerCase();
      if (q && ![f.name, f.email, f.comment, f.tags?.join(' ') || ''].join(' ').toLowerCase().includes(q)) return false;
      if (ratingFilter !== 'all' && f.rating !== ratingFilter) return false;
      if (cityFilter !== 'all' && f.city !== cityFilter) return false;
      if (dateFrom && new Date(f.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(f.date) > new Date(dateTo)) return false;
      return true;
    });
  }, [data, query, ratingFilter, cityFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const total = data.length;
    const avg = total ? data.reduce((s, x) => s + x.rating, 0) / total : 0;
    const positive = total ? (data.filter((d) => d.sentiment === 'positive').length / total) * 100 : 0;
    return { total, avg: Number(avg.toFixed(2)), positive: Math.round(positive) };
  }, [data]);

  function exportCSV(items: Feedback[]) {
    const rows = [['ID', 'Customer', 'Email', 'City', 'Rating', 'Comment', 'Date', 'Sentiment', 'Tags']];
    items.forEach((r) => rows.push([r.id, r.name, r.email || '', r.city || '', String(r.rating), r.comment.replace(/"/g, '""'), r.date, r.sentiment || '', (r.tags || []).join('|')]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `feedback_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  // function deleteFeedback(id: string) {
  //   setData((p) => p.filter((x) => x.id !== id));
  //   setConfirmDelete(null);
  //   setSelected(null);
  // }

  // function replyToFeedback(id: string, reply: string) {
  //   // mock: mark replied
  //   setData((p) => p.map((x) => (x.id === id ? { ...x, replied: true } : x)));
  //   alert('Reply saved (mock): ' + reply);
  // }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <Star className="w-7 h-7" style={{ color: DELIGO }} /> Customer Feedback
      </motion.h1>

      {/* Top: stats + filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Average Rating</p>
          <h3 className="text-2xl font-bold">{stats.avg} <span className="text-sm text-slate-500">/ 5</span></h3>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-slate-500">Total Feedback</p>
          <h3 className="text-2xl font-bold">{stats.total}</h3>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-slate-500">Positive</p>
          <h3 className="text-2xl font-bold">{stats.positive}%</h3>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-slate-500">Trend (7d)</p>
          <div className="mt-2"><Sparkline data={data.slice(0, 12).map((d) => d.rating)} /></div>
        </Card>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Search comments, names, tags..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xl" />

        <Select value={String(ratingFilter)} onValueChange={(v) => setRatingFilter(v === 'all' ? 'all' : Number(v) as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        <Select value={String(cityFilter)} onValueChange={(v) => setCityFilter(v === 'all' ? 'all' : v as any)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={() => { setQuery(''); setRatingFilter('all'); setCityFilter('all'); setDateFrom(''); setDateTo(''); }}>Reset</Button>
          <Button onClick={() => exportCSV(filtered)} className="flex items-center gap-2"><Download className="w-4 h-4" />Export CSV</Button>
        </div>
      </div>

      {/* Table — horizontal scroll */}
      <Card className="p-0 overflow-x-auto rounded-xl shadow-sm border">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left w-[60px]">#</th>
              <th className="px-4 py-3 text-left w-[260px]">Customer</th>
              <th className="px-4 py-3 text-left w-[380px]">Comment</th>
              <th className="px-4 py-3 text-center w-[110px]">Rating</th>
              <th className="px-4 py-3 text-center w-[140px]">Date</th>
              <th className="px-4 py-3 text-center w-[160px]">Tags</th>
              <th className="px-4 py-3 text-center w-[180px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filtered.map((f, idx) => (
              <tr key={f.id} className="hover:bg-slate-50 align-top">
                <td className="px-4 py-4 font-semibold">{idx + 1}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-11 h-11"><AvatarImage src={SAMPLE_IMAGE} /><AvatarFallback>{initials(f.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">{f.name}</div>
                      <div className="text-xs text-slate-500 truncate">{f.email}</div>
                      <div className="text-xs text-slate-400">{f.city}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 max-w-xl">
                  <div className="text-sm text-slate-700 line-clamp-3">{f.comment}</div>
                </td>

                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <div className="font-semibold">{f.rating}</div>
                  </div>
                </td>

                <td className="px-4 py-4 text-center text-slate-600">{new Date(f.date).toLocaleDateString()}</td>

                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {(f.tags || []).slice(0, 3).map((t) => (
                      <span key={t} className="text-xs px-2 py-1 bg-slate-100 rounded-full">{t}</span>
                    ))}
                  </div>
                </td>

                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(f)}><MessageSquare className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => { setConfirmDelete(f); }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Feedback Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="max-w-2xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>Feedback Details</SheetTitle>
            <SheetDescription>View full feedback and reply</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-14 h-14"><AvatarImage src={SAMPLE_IMAGE} /><AvatarFallback>{initials(selected.name)}</AvatarFallback></Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selected.name}</h3>
                    <p className="text-sm text-slate-500">{selected.email} • {selected.city}</p>
                    <div className="mt-2 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> <span className="font-semibold">{selected.rating}</span></div>
                  </div>
                </div>

                <Separator />

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Comment</h4>
                  <p className="text-slate-700 whitespace-pre-wrap">{selected.comment}</p>
                </div>

                {selected.attachments && selected.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Attachments</h4>
                    <div className="flex gap-3 flex-wrap">
                      {selected.attachments.map((a, i) => (
                        <div key={i} className="w-32 h-20 bg-slate-100 rounded-md flex items-center justify-center text-xs">{a.name}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Admin Reply</h4>
                  <ReplyForm feedback={selected} onReply={(text) => replyToFeedback(selected.id, text)} />
                </div>
              </div>

              <div className="col-span-1">
                <Card className="p-4 mb-4">
                  <p className="text-xs text-slate-500">Feedback ID</p>
                  <p className="font-semibold">{selected.id}</p>
                </Card>

                <Card className="p-4 mb-4">
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-semibold">{new Date(selected.date).toLocaleString()}</p>
                </Card>

                <Card className="p-4 mb-4">
                  <p className="text-xs text-slate-500">Sentiment</p>
                  <p className="font-semibold capitalize">{selected.sentiment || '—'}</p>
                </Card>

                <div className="space-y-2">
                  <Button className="w-full" onClick={() => alert('flagged (mock)')}>Flag</Button>
                  <Button variant="destructive" className="w-full" onClick={() => { setConfirmDelete(selected); }}>Delete</Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 mb-4">Are you sure you want to permanently delete this feedback? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteFeedback(confirmDelete!.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function replyToFeedback(id: string, text: string) {
    // mock action handled above
    replyToFeedbackCore(id, text);
  }

  function deleteFeedback(id: string) {
    deleteFeedbackCore(id);
  }
}

/* ----------------- Subcomponents / Utils ----------------- */
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-full h-10">
      <polyline fill="none" stroke="#e9e9e9" strokeWidth={0.8} points={points} />
      <polyline fill="none" stroke={DELIGO} strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReplyForm({ feedback, onReply }: { feedback: Feedback; onReply: (t: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply..." className="w-full p-3 rounded-md border resize-y min-h-[100px]" />
      <div className="mt-2 flex gap-2">
        <Button onClick={() => { onReply(text); setText(''); }}>Send Reply</Button>
        <Button variant="outline" onClick={() => setText('')}>Clear</Button>
      </div>
    </div>
  );
}

/* ---------- Mock helpers used inside functions to avoid closure issues ---------- */

function replyToFeedbackCore(id: string, text: string) {
  // find feedback and mark replied (mock)
  // eslint-disable-next-line no-console
  console.log('Reply to', id, text);
  alert('Reply saved (mock)');
}

function deleteFeedbackCore(id: string) {
  // eslint-disable-next-line no-console
  console.log('Delete feedback', id);
  // in real app remove from server and update client state via refetch
  alert('Deleted (mock)');
}

function initials(name = '') {
  return name.split(' ').map((n) => n[0] || '').slice(0, 2).join('').toUpperCase();
}

/* ----------------- Mock Data ----------------- */
function mockFeedback(): Feedback[] {
  const names = ['Ana Pereira', 'João Silva', 'Maria Fernandes', 'Carlos Sousa', 'Rui Costa'];
  const cities = ['Lisbon', 'Porto', 'Braga', 'Coimbra'];
  const tagsPool = [['delivery', 'time'], ['food', 'taste'], ['packaging'], ['rider', 'behavior']];
  return Array.from({ length: 28 }).map((_, i) => {
    const rating = Math.ceil(Math.random() * 5);
    const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
    return {
      id: `FB-${2000 + i}`,
      customerId: `CUST-${1000 + i}`,
      name: names[i % names.length],
      email: `${names[i % names.length].toLowerCase().replace(/\s+/g, '.')}@example.com`,
      city: cities[i % cities.length],
      rating,
      comment: ['Great food!', 'Late delivery', 'Packaging was soggy', 'Excellent rider', 'Wrong item'][i % 5] + ' ' + 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'.slice(0, Math.floor(Math.random() * 60)),
      date: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
      sentiment,
      tags: tagsPool[i % tagsPool.length],
      attachments: i % 7 === 0 ? [{ name: 'photo.jpg', url: SAMPLE_IMAGE }] : [],
      replied: i % 6 === 0,
    } as Feedback;
  });
}
