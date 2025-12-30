/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatSocket } from "@/hooks/use-chat-socket";
import {
  TConversation,
  TConversationStatus,
  TMessage,
} from "@/types/chat.type";
import { getCookie } from "@/utils/cookies";
import { format } from "date-fns";
import { ArrowRight, Mail, MessageCircle, Search, X } from "lucide-react";
import { useRef, useState } from "react";

// Types

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

type Ticket = {
  id: string;
  subject: string;
  user: string;
  userEmail: string;
  createdAt: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  messages: { from: string; body: string; at: string }[];
};

// Mock Data

const MOCK: Ticket[] = [
  {
    id: "TCK-0001",
    subject: "Order not delivered - address issue",
    user: "Ana Costa",
    userEmail: "ana.costa@example.pt",
    createdAt: "2025-11-20T10:24:00.000Z",
    status: "open",
    priority: "high",
    messages: [
      {
        from: "Ana Costa",
        body: "My order didn’t arrive.",
        at: "2025-11-20T10:25:00.000Z",
      },
    ],
  },
  {
    id: "TCK-0002",
    subject: "Payment charged twice",
    user: "Miguel Santos",
    userEmail: "miguel.santos@example.pt",
    createdAt: "2025-11-19T08:14:00.000Z",
    status: "in_progress",
    priority: "medium",
    messages: [
      {
        from: "Miguel",
        body: "I see two charges.",
        at: "2025-11-19T08:15:00.000Z",
      },
    ],
  },
  {
    id: "TCK-0003",
    subject: "App crashed while uploading photo",
    user: "Joana Alves",
    userEmail: "joana.alves@example.pt",
    createdAt: "2025-11-18T12:44:00.000Z",
    status: "resolved",
    priority: "low",
    messages: [
      {
        from: "Joana",
        body: "Crash on upload.",
        at: "2025-11-18T12:45:00.000Z",
      },
    ],
  },
];

// Status Styling
const STATUS: Record<TicketStatus, string> = {
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-pink-100 text-pink-700",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-200 text-gray-700",
};

export default function SupportTickets() {
  const [tickets] = useState<Ticket[]>(MOCK);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TConversationStatus>("OPEN");
  const [drawer, setDrawer] = useState<Ticket | null>(null);
  const replyRef = useRef<HTMLTextAreaElement | null>(null);
  const accessToken = getCookie("accessToken");
  const [newMessageContent, setNewMessageContent] = useState<TMessage | null>(
    null
  );
  const [conversation, setConversation] = useState<TConversation | null>(null);

  const filtered = tickets.filter((t) =>
    [t.subject, t.user, t.id]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  function sendReply() {
    if (!drawer || !replyRef.current) return;
    const text = replyRef.current.value.trim();
    if (!text) return;

    drawer.messages.push({
      from: "Support",
      body: text,
      at: new Date().toISOString(),
    });
    replyRef.current.value = "";
    setDrawer({ ...drawer });
  }

  function openNewMessageModal(message: TMessage) {
    if (drawer) return;
    setNewMessageContent(message);
  }

  const { sendMessage } = useChatSocket({
    // const { sendMessage, closeConversation } = useChatSocket({
    room: "admin-notifications-room",
    token: accessToken as string,
    onMessage: (msg) => setMessages((prev) => [...prev, msg]),
    onClosed: () => setStatus("CLOSED"),
    onError: (msg) => alert(msg),
    onNewTicket: (message) => openNewMessageModal(message),
  });

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-gray-500 text-sm">Manage issues</p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            placeholder="Search tickets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="outline-none text-sm"
          />
        </div>
      </div>

      {/* Card Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => (
          <div
            key={t.id}
            onClick={() => setDrawer(t)}
            className="cursor-pointer bg-white rounded-3xl p-5 shadow-sm border hover:shadow-lg transition group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`px-3 py-1 text-xs rounded-full ${STATUS[t.status]}`}
              >
                {t.status.replace("_", " ")}
              </span>

              <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-[#DC3173] transition" />
            </div>

            {/* Subject */}
            <h2 className="text-lg font-semibold leading-tight group-hover:text-[#DC3173] transition">
              {t.subject}
            </h2>

            {/* User */}
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-[#DC3173]/10 text-[#DC3173] font-semibold flex items-center justify-center">
                {t.user[0]}
              </div>
              <div className="text-sm">
                <p className="font-medium">{t.user}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(t.createdAt)}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t">
              <p className="text-xs text-gray-500">ID: {t.id}</p>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#DC3173] transition" />
            </div>
          </div>
        ))}
      </div>

      {/* Drawer */}
      {!!conversation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full sm:w-[420px] h-full bg-white rounded-l-3xl p-6 flex flex-col shadow-xl animate-slide-in">
            {/* Top */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold w-10/12 leading-tight">
                {conversation.room}
              </h2>
              <button
                onClick={() => setDrawer(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#DC3173]/10 text-[#DC3173] font-semibold flex items-center justify-center text-lg">
                {
                  conversation?.participants?.find(
                    (p) => p.role !== "ADMIN" && p.role !== "SUPER_ADMIN"
                  )?.name
                }
              </div>
              <div>
                <p className="font-medium">
                  {
                    conversation?.participants?.find(
                      (p) => p.role !== "ADMIN" && p.role !== "SUPER_ADMIN"
                    )?.name
                  }
                </p>
                {/* // <p className="text-xs text-gray-500">{conversation.userEmail}</p> */}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto custom-scroll pr-2 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-4 rounded-2xl border text-sm leading-relaxed ${
                    m.senderRole === "ADMIN" || m.senderRole === "SUPER_ADMIN"
                      ? "ml-auto bg-[#DC3173]/20 border-[#DC3173]/30"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">
                    {m.senderId} • {format(m.createdAt as Date, "hh:mm a")}
                  </p>
                  {m.message}
                </div>
              ))}
            </div>

            {/* Reply */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-end gap-3">
                <textarea
                  ref={replyRef}
                  rows={2}
                  placeholder="Write a reply..."
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 resize-none focus:ring-2 focus:ring-[#DC3173]/40 outline-none"
                />
                <button
                  onClick={sendReply}
                  className="px-5 py-3 rounded-2xl bg-[#DC3173] text-white font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes slide-in {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .animate-slide-in {
              animation: slide-in 0.25s ease-out;
            }

            .custom-scroll::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #ff8fb2, #dc3173);
              border-radius: 999px;
            }
          `}</style>
        </div>
      )}

      <Dialog
        open={!!newMessageContent}
        onOpenChange={(open) => !open && setNewMessageContent(null)}
      >
        <form>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#DC3173]">
                <Mail className="w-5 h-5" /> New message
              </DialogTitle>
              <DialogDescription>
                Got a new message from {newMessageContent?.senderId}
              </DialogDescription>
            </DialogHeader>
            <div>
              <p className="text-sm leading-relaxed">
                {newMessageContent?.message}
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="bg-[#DC3173] hover:bg-[#DC3173]/90"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  // openDrawer(newMessageContent!);
                }}
              >
                Open
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  );
}
