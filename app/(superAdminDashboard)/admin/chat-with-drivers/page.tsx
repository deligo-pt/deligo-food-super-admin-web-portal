"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Camera,
  Send,
  Mic,
  Paperclip,
  MoreVertical,
  Check,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";



type Message = {
  id: string;
  from: "vendor" | "admin";
  text?: string;
  images?: string[];
  audio?: string | null;
  at: string;
  status?: "sent" | "delivered" | "read";
};

type Vendor = {
  id: string;
  name: string;
  store?: string;
  avatar?: string;
  lastSeen?: string;
  typing?: boolean;
  unread?: number;
  pinned?: boolean;
  messages: Message[];
};

const SAMPLE = "/mnt/data/Screenshot from 2025-11-22 23-47-09.png";

const INITIAL_drivers: Vendor[] = [
  {
    id: "v1",
    name: "Padaria Lisboa",
    store: "Padaria Lisboa — Lisbon",
    avatar: SAMPLE,
    lastSeen: new Date().toISOString(),
    unread: 2,
    pinned: true,
    typing: false,
    messages: [
      { id: "m1", from: "vendor", text: "Hi! Order #123 will be 10 min late.", at: new Date().toISOString(), status: "delivered" },
    ],
  },
  {
    id: "v2",
    name: "Mercearia Porto",
    store: "Mercearia Porto — Porto",
    avatar: undefined,
    lastSeen: new Date().toISOString(),
    typing: true,
    messages: [
      { id: "m2", from: "vendor", text: "Uploaded the receipt.", images: [SAMPLE], at: new Date().toISOString(), status: "read" },
    ],
  },
  {
    id: "v3",
    name: "Restaurante Gaia",
    avatar: undefined,
    lastSeen: new Date().toISOString(),
    typing: false,
    messages: [
      { id: "m3", from: "vendor", text: "Obrigado!", at: new Date().toISOString(), status: "read" },
    ],
  },
];

export default function ChatWithdriversGlass() {
  const { t } = useTranslation();
  const [drivers, setdrivers] = useState<Vendor[]>(INITIAL_drivers);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_drivers[0].id);
  const [query, setQuery] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<string | null>(null);

  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Selected vendor
  const selected = useMemo(() => drivers.find((v) => v.id === selectedId) ?? drivers[0], [drivers, selectedId]);

  // Filter & pinned-first
  const filtered = useMemo(() => {
    return drivers
      .slice()
      .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))
      .filter((v) => [v.name, v.store, v.messages.map((m) => m.text).join(" ")].join(" ").toLowerCase().includes(query.toLowerCase()));
  }, [drivers, query]);

  // auto-scroll on messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [selected?.messages.length, selected?.id]);

  // small simulated typing animation for demo
  useEffect(() => {
    const t = setInterval(() => {
      setdrivers((p) => p.map((v) => (v.id === "v2" ? { ...v, typing: !v.typing } : v)));
    }, 7000);
    return () => clearInterval(t);
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
      if (e.key === "Escape") {
        textRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attachments, audioFile, selected]);

  function handleSend() {
    if (!selected) return;
    const text = textRef.current?.value.trim() ?? "";
    if (!text && attachments.length === 0 && !audioFile) return;

    const msg: Message = {
      id: `m-${Date.now()}`,
      from: "admin",
      text: text || undefined,
      images: attachments.length ? attachments : undefined,
      audio: audioFile || undefined,
      at: new Date().toISOString(),
      status: "sent",
    };

    setdrivers((prev) => prev.map((v) => (v.id === selected.id ? { ...v, messages: [...v.messages, msg], unread: 0 } : v)));

    // optimistic demo status updates
    setTimeout(() => {
      setdrivers((p) => p.map((v) => ({ ...v, messages: v.messages.map((m) => ({ ...m, status: m.status === "sent" ? "delivered" : m.status })) })));
    }, 600);
    setTimeout(() => {
      setdrivers((p) => p.map((v) => ({ ...v, messages: v.messages.map((m) => ({ ...m, status: m.status === "delivered" ? "read" : m.status })) })));
    }, 1600);

    // reset
    if (textRef.current) textRef.current.value = "";
    setAttachments([]);
    setAudioFile(null);
    textRef.current?.focus();
  }

  function onSelectImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const urls: string[] = [];
    Array.from(files)
      .slice(0, 6)
      .forEach((f) => urls.push(URL.createObjectURL(f)));
    setAttachments((s) => [...s, ...urls]);
    e.currentTarget.value = "";
  }

  function onSelectAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAudioFile(URL.createObjectURL(f));
    e.currentTarget.value = "";
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto flex gap-6 items-start">
        {/* Floating glass card sidebar (360px) */}
        <aside
          className="w-[360px] max-w-[360px] min-w-[360px] bg-white/30 backdrop-blur-md border border-white/40 rounded-3xl p-4 shadow-xl overflow-hidden"
          aria-label="drivers (floating card)"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">{t("drivers")}</h3>
              <p className="text-xs text-gray-600/80">{t("active_conversations")}</p>
            </div>

            <div className="hidden sm:flex items-center bg-white/60 rounded-lg px-3 py-2 border border-white/30 shadow-sm">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input
                aria-label="Search drivers"
                placeholder={t("search_drivers")}
                className="outline-none text-sm bg-transparent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[68vh] overflow-auto pr-2 custom-scroll" role="list">
            {filtered.map((v) => (
              <div
                key={v.id}
                role="listitem"
                className={`flex items-center gap-3 p-3 rounded-2xl transition ${selectedId === v.id ? "ring-2 ring-[#DC3173]/20 bg-[#DC3173]/6" : "hover:bg-white/40"
                  }`}
              >
                <button
                  onClick={() => setSelectedId(v.id)}
                  className="flex items-center gap-3 w-full text-left"
                  aria-label={`Open conversation with ${v.name}`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#DC3173]/12 text-[#DC3173] font-semibold overflow-hidden flex items-center justify-center">
                    {v.avatar ? (
                      <img src={v.avatar} alt={`${v.name} avatar`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{v.name[0]}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-sm">
                        {v.name}
                        {v.pinned ? <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{t("pinned")}</span> : null}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(v.lastSeen ?? Date.now()).toLocaleTimeString()}</div>
                    </div>

                    <div className="text-xs text-gray-500 truncate mt-1">{v.messages[v.messages.length - 1]?.text ?? "—"}</div>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setdrivers((s) => s.map((x) => (x.id === v.id ? { ...x, pinned: !x.pinned } : x)))}
                    title="Pin conversation"
                    className="p-2 rounded-md hover:bg-white/40"
                    aria-pressed={v.pinned ?? false}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>

                  {v.unread ? (
                    <div className="bg-[#DC3173] text-white text-xs px-2 py-1 rounded-full" aria-label={`${v.unread} unread messages`}>
                      {v.unread}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat area (flex grows) */}
        <section className="flex-1 bg-white rounded-3xl shadow-lg border p-0 overflow-hidden" aria-label="Chat area">
          <div className="flex flex-col h-[78vh]">
            {/* Header */}
            <header className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12">
                  {selected?.avatar ? (
                    <img src={selected.avatar} alt={`${selected?.name} avatar`} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#DC3173]/12 flex items-center justify-center text-[#DC3173] font-semibold">
                      {selected?.name?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold">{selected?.name}</div>
                  <div className="text-xs text-gray-500">{selected?.store ?? "Vendor"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                {t("last_seen")}: {selected ? new Date(selected.lastSeen ?? Date.now()).toLocaleString() : "-"}
                <button className="p-2 rounded-md hover:bg-gray-100" aria-label="More options">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </header>

            {/* Messages list */}
            <div className="flex-1 overflow-auto p-6 custom-scroll" role="log" aria-live="polite">
              <div className="flex flex-col gap-4">
                {selected?.messages.map((m) => (
                  <article
                    key={m.id}
                    className={`max-w-[78%] p-3 rounded-2xl border ${m.from === "admin" ? "ml-auto bg-[#DC3173]/15 border-[#DC3173]/20" : "bg-gray-50 border-gray-100"}`}
                    aria-label={`${m.from === "admin" ? "You" : selected?.name} message`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-400">
                        {m.from === "admin" ? "You" : selected?.name} • {new Date(m.at).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {m.status === "read" ? <Check className="w-4 h-4 text-[#DC3173]" /> : m.status === "delivered" ? <Check className="w-4 h-4" /> : null}
                      </div>
                    </div>

                    {m.text && <div className="text-sm leading-relaxed">{m.text}</div>}

                    {m.images?.length ? (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {m.images.map((src, i) => (
                          <div key={i} className="rounded-lg overflow-hidden border">
                            <img src={src} alt={`attachment-${i}`} className="w-full h-28 object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {m.audio ? (
                      <div className="mt-2">
                        <audio controls src={m.audio} className="w-full" />
                      </div>
                    ) : null}
                  </article>
                ))}

                {selected?.typing && (
                  <div className="max-w-[50%] p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500">{selected?.name} {t("is_typing")}</div>
                    <div className="flex gap-1 mt-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.12s" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.24s" }} />
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            </div>

            {/* Composer (fixed bottom inside card) */}
            <div className="border-t p-4 bg-white">
              <div className="flex items-end gap-3">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-gray-100 p-2 rounded-xl" title={t("attach_images")}>
                    <Camera className="w-5 h-5 text-gray-600" aria-hidden />
                    <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={onSelectImages} />
                  </label>

                  <label className="cursor-pointer bg-gray-100 p-2 rounded-xl" title={t("attach_audio")}>
                    <Mic className="w-5 h-5 text-gray-600" aria-hidden />
                    <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={onSelectAudio} />
                  </label>

                  <label className="cursor-pointer bg-gray-100 p-2 rounded-xl" title={t("attach_file")}>
                    <Paperclip className="w-5 h-5 text-gray-600" aria-hidden />
                    <input type="file" className="hidden" />
                  </label>
                </div>

                <div className="flex-1 flex flex-col">
                  <textarea
                    ref={textRef}
                    placeholder={t("write_a_message")}
                    rows={2}
                    className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-[#DC3173]/30 outline-none"
                    aria-label="Message composer"
                  />

                  {/* previews */}
                  {attachments.length > 0 && (
                    <div className="mt-2 flex gap-2" aria-live="polite">
                      {attachments.map((a, i) => (
                        <div key={i} className="w-14 h-14 rounded-lg overflow-hidden border">
                          <img src={a} alt={`attachment-preview-${i}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {audioFile && (
                    <div className="mt-2">
                      <audio controls src={audioFile} className="w-full" />
                    </div>
                  )}
                </div>

                <div>
                  <button onClick={handleSend} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#DC3173] text-white shadow-lg" aria-label="Send message">
                    <Send className="w-4 h-4" />
                    {t('send')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* styles */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ffd1e0, #dc3173);
          border-radius: 999px;
        }

        @keyframes bounce {
          0% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }
        .animate-bounce {
          animation: bounce 700ms infinite;
        }

        /* Mobile responsiveness: floating card becomes stacked at top */
        @media (max-width: 900px) {
          .max-w-7xl {
            padding-left: 12px;
            padding-right: 12px;
          }
          aside[aria-label="drivers (floating card)"] {
            width: 100%;
            max-width: 100%;
            min-width: auto;
            position: relative;
            margin-bottom: 12px;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}
