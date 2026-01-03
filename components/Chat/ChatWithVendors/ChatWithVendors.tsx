/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useAdminChatSocket, useChatSocket } from "@/hooks/use-chat-socket";
import { getMessagesByRoom } from "@/services/chat/chat";
import { TMeta, TResponse } from "@/types";
import { TConversation, TMessage } from "@/types/chat.type";
import { fetchData } from "@/utils/requests";
import { formatDistanceToNow } from "date-fns";
import {
  Camera,
  Check,
  Mic,
  MoreVertical,
  Paperclip,
  Search,
  Send,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

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

// const SAMPLE = "/mnt/data/Screenshot from 2025-11-22 23-47-09.png";

// const INITIAL_VENDORS: Vendor[] = [
//   {
//     id: "v1",
//     name: "Padaria Lisboa",
//     store: "Padaria Lisboa — Lisbon",
//     avatar: SAMPLE,
//     lastSeen: new Date().toISOString(),
//     unread: 2,
//     pinned: true,
//     typing: false,
//     messages: [
//       {
//         id: "m1",
//         from: "vendor",
//         text: "Hi! Order #123 will be 10 min late.",
//         at: new Date().toISOString(),
//         status: "delivered",
//       },
//     ],
//   },
//   {
//     id: "v2",
//     name: "Mercearia Porto",
//     store: "Mercearia Porto — Porto",
//     avatar: undefined,
//     lastSeen: new Date().toISOString(),
//     typing: true,
//     messages: [
//       {
//         id: "m2",
//         from: "vendor",
//         text: "Uploaded the receipt.",
//         images: [SAMPLE],
//         at: new Date().toISOString(),
//         status: "read",
//       },
//     ],
//   },
//   {
//     id: "v3",
//     name: "Restaurante Gaia",
//     avatar: undefined,
//     lastSeen: new Date().toISOString(),
//     typing: false,
//     messages: [
//       {
//         id: "m3",
//         from: "vendor",
//         text: "Obrigado!",
//         at: new Date().toISOString(),
//         status: "read",
//       },
//     ],
//   },
// ];

interface IProps {
  conversationsData: { data: TConversation[]; meta?: TMeta };
  accessToken: string;
  decoded: { id: string };
}

export default function ChatWithVendors({
  conversationsData,
  accessToken,
  decoded,
}: IProps) {
  const [vendorMessages, setVendorMessages] = useState<Vendor[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [status, setStatus] = useState("DISCONNECTED");
  const [conversations, setConversations] = useState<TConversation[]>(
    conversationsData?.data || []
  );

  // const [previousChatLoading, setPreviousChatLoading] = useState(false);

  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Selected vendor
  const selected = useMemo(() => {
    const participant = conversations
      ?.find((c) => c.room === selectedId)
      ?.participants?.find((p) => p.role === "VENDOR");
    return participant;
  }, [conversations, selectedId]);

  // Filter & pinned-first
  const filtered = useMemo(() => {
    return vendorMessages
      ?.slice()
      .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))
      .filter((v) =>
        [v.name, v.store, v.messages.map((m) => m.text).join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      );
  }, [vendorMessages, query]);

  const getConversation = async (room: string) => {
    try {
      const result = (await fetchData(`/support/conversations/${room}`, {
        headers: { authorization: accessToken },
      })) as TResponse<TConversation>;

      console.log(result);

      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: result.message,
        };
      }

      return {
        success: false,
        data: null,
        message: result.message || "Get conversation failed",
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        success: false,
        data: error?.response?.data || error,
        message: error?.response?.data?.message || "Get conversation failed",
      };
    }
  };

  const getNewConversation = async (message: {
    message: TMessage;
    room: string;
  }) => {
    if (message?.message?.senderRole === "VENDOR") {
      let newConversation = {} as TConversation;

      const result = await getConversation(message?.room);
      if (result.success) {
        newConversation = result.data;
      }

      setConversations((prev) => {
        const isConversationExist = prev?.find((c) => c.room === message?.room);

        if (!isConversationExist) {
          return [newConversation, ...prev];
        }
        const filteredConversations = prev.filter(
          (c) => c.room !== message.room
        );
        console.log(message);

        isConversationExist!.lastMessage = message.message?.message;
        isConversationExist!.lastMessageTime = message.message
          ?.createdAt as unknown as string;
        return [isConversationExist, ...filteredConversations];
      });
    }
  };

  useAdminChatSocket({
    token: accessToken as string,
    onMessage: (msg) =>
      getNewConversation(
        msg as unknown as {
          message: TMessage;
          room: string;
        }
      ),
    onClosed: () => setStatus("CLOSED"),
    onError: (msg) => console.log(msg),
  });

  const { sendMessage } = useChatSocket({
    // const { sendMessage, closeConversation } = useChatSocket({
    room: selectedId,
    token: accessToken as string,
    onMessage: (msg) => {
      if (msg.room === selectedId) {
        setMessages((prev) => [...prev, msg]);
      }
    },
    onClosed: () => setStatus("CLOSED"),
    onError: (msg) => console.log(msg),
    // onNewTicket: (message) => getNewConversation(message),
  });

  // auto-scroll on messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function handleSend() {
    const text = textRef.current?.value.trim() ?? "";
    if (!text && attachments.length === 0 && !audioFile) return;

    sendMessage(text);

    // reset
    if (textRef.current) textRef.current.value = "";
    setAttachments([]);
    setAudioFile(null);
    textRef.current?.focus();
  }
  // keyboard shortcuts
  // useEffect(() => {
  //   function onKey(e: KeyboardEvent) {
  //     if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
  //       e.preventDefault();
  //       handleSend();
  //     }
  //     if (e.key === "Escape") {
  //       textRef.current?.blur();
  //     }
  //   }
  //   window.addEventListener("keydown", onKey);
  //   return () => window.removeEventListener("keydown", onKey);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [attachments, audioFile, selected]);

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

  useEffect(() => {
    if (selectedId) {
      getMessagesByRoom(selectedId).then((result) => {
        if (result.success) {
          setMessages(result.data);
        } else {
          setMessages([]);
        }
      });
    }
  }, [selectedId]);

  return (
    <div className="p-6 h-full">
      <div className="max-w-7xl mx-auto flex gap-6 items-start h-full">
        {/* Floating glass card sidebar (360px) */}
        <aside
          className="w-[360px] max-w-[360px] min-w-[360px] backdrop-blur-md border border-white/40 rounded-3xl p-4 shadow-xl overflow-hidden h-full! max-h-full! min-h-full! bg-white"
          aria-label="Vendors (floating card)"
        >
          <div>
            <h3 className="text-lg font-bold">Vendors</h3>
            <p className="text-xs text-gray-600/80">Active conversations</p>
          </div>
          <div className="hidden sm:flex items-center bg-white/60 rounded-lg px-3 py-2 border border-white/30 shadow-sm mt-3">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              aria-label="Search vendors"
              placeholder="Search..."
              className="outline-none text-sm bg-transparent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div
            className="space-y-3 max-h-[68vh] overflow-auto px-1 custom-scroll min-h-full mt-4"
            role="list"
          >
            {conversations?.map((c) => (
              <div
                key={c._id}
                role="listitem"
                className={`flex items-center gap-3 p-3 rounded-2xl transition ${
                  selectedId === c.room
                    ? "ring-2 ring-[#DC3173]/20 bg-[#DC3173]/6"
                    : "hover:bg-white/40"
                }`}
              >
                <button
                  onClick={() => setSelectedId(c.room)}
                  className="flex items-center gap-3 w-full text-left"
                  aria-label={`Open conversation with ${c.room}`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#DC3173]/12 text-[#DC3173] font-semibold overflow-hidden flex items-center justify-center">
                    {
                      c.participants?.find((p) => p.role === "VENDOR")
                        ?.name?.[0]
                    }
                  </div>
                  {/* <div className="w-12 h-12 rounded-full bg-[#DC3173]/12 text-[#DC3173] font-semibold overflow-hidden flex items-center justify-center">
                    {c.avatar ? (
                      <Image
                        width={500}
                        height={500}
                        src={c.avatar}
                        alt={`${c.name} avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">{c.name[0]}</span>
                    )}
                  </div> */}

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-sm">
                        {c.participants?.find((p) => p.role === "VENDOR")?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(c.lastMessageTime, {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 truncate mt-1">
                      {c.lastMessage}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  {c.unreadCount?.[decoded?.id] > 0 ? (
                    <div
                      className="bg-[#DC3173] text-white text-xs px-2 py-1 rounded-full"
                      aria-label={`${
                        c.unreadCount?.[decoded?.id]
                      } unread messages`}
                    >
                      {c.unreadCount?.[decoded?.id]}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat area (flex grows) */}

        <section
          className="max-h-[calc(100vh-148px)] flex-1 bg-white rounded-3xl shadow-lg border p-0 overflow-hidden h-full"
          aria-label="Chat area"
        >
          {selectedId ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <header className="px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* <div className="w-12 h-12">
                    {selected?.avatar ? (
                      <Image
                        width={500}
                        height={500}
                        src={selected.avatar}
                        alt={`${selected?.name} avatar`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#DC3173]/12 flex items-center justify-center text-[#DC3173] font-semibold">
                        {selected?.name?.[0]}
                      </div>
                    )}
                  </div> */}
                  <div className="w-12 h-12">
                    <div className="w-12 h-12 rounded-full bg-[#DC3173]/12 flex items-center justify-center text-[#DC3173] font-semibold">
                      {selected?.name?.[0]}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{selected?.name}</div>
                    <div className="text-xs text-gray-500">Vendor</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {/* Last seen:{" "}
                  {selected
                    ? new Date(selected.lastSeen ?? Date.now()).toLocaleString()
                    : "-"} */}
                  <button
                    className="p-2 rounded-md hover:bg-gray-100"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </header>

              {/* Messages list */}
              <div
                className="flex-1 overflow-auto p-6 custom-scroll"
                role="log"
                aria-live="polite"
              >
                <div className="flex flex-col gap-4">
                  {messages.map((m) => (
                    <article
                      key={m._id}
                      className={`max-w-[78%] p-3 rounded-2xl border ${
                        m.senderRole === "ADMIN" ||
                        m.senderRole === "SUPER_ADMIN"
                          ? "ml-auto bg-[#DC3173]/15 border-[#DC3173]/20"
                          : "bg-gray-50 border-gray-100"
                      }`}
                      aria-label={`${
                        m.senderRole === "ADMIN" ||
                        m.senderRole === "SUPER_ADMIN"
                          ? "You"
                          : selected?.name
                      } message`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-gray-400">
                          {m.senderRole === "ADMIN" ||
                          m.senderRole === "SUPER_ADMIN"
                            ? "You"
                            : selected?.name}{" "}
                          •{" "}
                          {formatDistanceToNow(m.createdAt as Date, {
                            addSuffix: true,
                          })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {m.readBy?.admin ? (
                            <Check className="w-4 h-4 text-[#DC3173]" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {m.message && (
                        <div className="text-sm leading-relaxed">
                          {m.message}
                        </div>
                      )}

                      {/* {m.images?.length ? (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {m.images.map((src, i) => (
                          <div
                            key={i}
                            className="rounded-lg overflow-hidden border"
                          >
                            <Image
                              width={500}
                              height={500}
                              src={src}
                              alt={`attachment-${i}`}
                              className="w-full h-28 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {m.audio ? (
                      <div className="mt-2">
                        <audio controls src={m.audio} className="w-full" />
                      </div>
                    ) : null} */}
                    </article>
                  ))}

                  {/* {selected?.typing && (
                    <div className="max-w-[50%] p-3 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="text-xs text-gray-500">
                        {selected?.name} is typing...
                      </div>
                      <div className="flex gap-1 mt-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.12s" }}
                        />
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.24s" }}
                        />
                      </div>
                    </div>
                  )} */}
                </div>
                <div ref={endRef} />
              </div>

              {/* Composer (fixed bottom inside card) */}
              <div className="border-t p-4 bg-white">
                <div className="flex items-end gap-3">
                  <div className="flex items-center gap-2">
                    <label
                      className="cursor-pointer bg-gray-100 p-2 rounded-xl"
                      title="Attach images"
                    >
                      <Camera className="w-5 h-5 text-gray-600" aria-hidden />
                      <input
                        ref={imageRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onSelectImages}
                      />
                    </label>

                    <label
                      className="cursor-pointer bg-gray-100 p-2 rounded-xl"
                      title="Attach audio"
                    >
                      <Mic className="w-5 h-5 text-gray-600" aria-hidden />
                      <input
                        ref={audioRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={onSelectAudio}
                      />
                    </label>

                    <label
                      className="cursor-pointer bg-gray-100 p-2 rounded-xl"
                      title="Attach file"
                    >
                      <Paperclip
                        className="w-5 h-5 text-gray-600"
                        aria-hidden
                      />
                      <input type="file" className="hidden" />
                    </label>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <textarea
                      ref={textRef}
                      placeholder="Write a message..."
                      rows={2}
                      className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-[#DC3173]/30 outline-none"
                      aria-label="Message composer"
                    />

                    {/* previews */}
                    {attachments.length > 0 && (
                      <div className="mt-2 flex gap-2" aria-live="polite">
                        {attachments.map((a, i) => (
                          <div
                            key={i}
                            className="w-14 h-14 rounded-lg overflow-hidden border"
                          >
                            <Image
                              width={500}
                              height={500}
                              src={a}
                              alt={`attachment-preview-${i}`}
                              className="w-full h-full object-cover"
                            />
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
                    <button
                      onClick={handleSend}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#DC3173] text-white shadow-lg"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t p-4 bg-white text-center text-gray-500 h-full flex items-center justify-center">
              Select a conversation to start chatting
            </div>
          )}
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
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
          100% {
            transform: translateY(0);
          }
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
          aside[aria-label="Vendors (floating card)"] {
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
