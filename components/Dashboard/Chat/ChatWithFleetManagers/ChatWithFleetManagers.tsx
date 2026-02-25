"use client";

import SelectFleetManagerModal from "@/components/Dashboard/Chat/ChatWithFleetManagers/SelectFleetManagerModal";
import { Button } from "@/components/ui/button";
import { USER_ROLE } from "@/consts/user.const";
import { useAdminChatSocket, useChatSocket } from "@/hooks/use-chat-socket";
import { useTranslation } from "@/hooks/use-translation";
import { getMessagesByRoom } from "@/services/chat/chat";
import { openConversationReq } from "@/services/dashboard/chat/chat";
import { getAllFleetManagersReq } from "@/services/dashboard/chat/chat-with-fleet-manager";
import { TMeta, TResponse } from "@/types";
import { TConversation, TMessage } from "@/types/chat.type";
import { TAgent } from "@/types/user.type";
import { fetchData } from "@/utils/requests";
import { formatDistanceToNow } from "date-fns";
import {
  Camera,
  Check,
  Edit2,
  Mic,
  MoreVertical,
  Paperclip,
  Search,
  Send,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface IProps {
  conversationsData: { data: TConversation[]; meta?: TMeta };
  accessToken: string;
  decoded: { userId: string };
}

export default function ChatWithFleetManagers({
  conversationsData,
  accessToken,
  decoded,
}: IProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [conversations, setConversations] = useState<TConversation[]>(
    conversationsData?.data || [],
  );
  const [fleetManagersData, setFleetManagersData] = useState<{
    data: TAgent[];
    meta?: TMeta;
  }>({ data: [] });
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [typingInfo, setTypingInfo] = useState<{
    userId: string;
    isTyping: boolean;
    name: { firstName: string; lastName: string };
  }>({ userId: "", isTyping: false, name: { firstName: "", lastName: "" } });

  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Selected fleetManager
  const selected = useMemo(() => {
    const participant = conversations
      ?.find((c) => c.room === selectedId)
      ?.participants?.find((p) => p.role === USER_ROLE.FLEET_MANAGER);
    return participant;
  }, [conversations, selectedId]);

  const getConversation = async (room: string) => {
    try {
      const result = (await fetchData(`/support/conversations/${room}`, {
        headers: { authorization: accessToken },
      })) as TResponse<TConversation>;

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
    if (message?.message?.senderRole === USER_ROLE.FLEET_MANAGER) {
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
          (c) => c.room !== message.room,
        );

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
        },
      ),
    onClosed: () => { },
    onError: (msg) => console.log(msg),
  });

  const { sendMessage, makeTyping } = useChatSocket({
    room: selectedId,
    token: accessToken as string,
    onMessage: (msg) => {
      if (msg.room === selectedId) {
        setMessages((prev) => [...prev, msg]);
      }
    },
    onTyping: (data) => {
      if (decoded.userId === data.userId) return;
      setTypingInfo({
        userId: data.userId,
        isTyping: data.isTyping,
        name: data.name,
      });
      scrollToBottom();
      setTimeout(() => {
        setTypingInfo({
          userId: "",
          isTyping: false,
          name: { firstName: "", lastName: "" },
        });
      }, 3000);
    },
    onClosed: () => { },
    onError: (msg) => console.log(msg),
  });

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (isTyping: boolean) => {
    makeTyping(isTyping);
  };

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

  const getFleetManagers = async ({ limit = 10 }) => {
    const result = await getAllFleetManagersReq({ limit });

    if (result.success) {
      setFleetManagersData({ data: result.data, meta: result.meta });
    }
  };

  const selectFleetManager = async (fleetManager: TAgent) => {
    setShowSelectModal(false);
    // check if conversation already exists
    const existingConversation = conversations.find((c) =>
      c.participants?.some(
        (p) =>
          p.userId === fleetManager.userId &&
          p.role === USER_ROLE.FLEET_MANAGER,
      ),
    );
    if (
      existingConversation &&
      existingConversation.type === "FLEET_MANAGER_CHAT"
    ) {
      setSelectedId(existingConversation.room);
    } else {
      // create new conversation
      const result = await openConversationReq({
        type: "FLEET_MANAGER_CHAT",
        targetUser: {
          userId: fleetManager.userId,
          role: USER_ROLE.FLEET_MANAGER,
          name: `${fleetManager.name?.firstName} ${fleetManager.name?.lastName}`,
        },
      });

      if (result.success) {
        setSelectedId(result.data.room);
        setConversations((prev) => [result.data, ...prev]);
      } else {
        console.log(result);
      }
    }
  };

  useEffect(() => {
    (() => getFleetManagers({ limit: 20 }))();
  }, []);

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
    <div className="h-full">
      <div className="flex gap-6 items-start h-full">
        {/* Floating glass card sidebar (360px) */}
        <aside
          className="w-[360px] max-w-[360px] min-w-[360px] backdrop-blur-md border border-white/40 rounded-3xl p-4 shadow-xl overflow-hidden h-full! max-h-full! min-h-full! bg-white"
          aria-label="Fleet Managers (floating card)"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">{t("fleet_managers")}</h3>
              <p className="text-xs text-gray-600/80">
                {t("active_conversations")}
              </p>
            </div>
            <div>
              <Button
                onClick={() => setShowSelectModal(true)}
                className="flex justify-center items-center bg-[#DC3173] hover:bg-[#DC3173]/90 w-8 h-8 rounded-full"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="hidden sm:flex items-center bg-white/60 rounded-lg px-3 py-2 border border-white/30 shadow-sm mt-3">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              aria-label="Search fleet Managers"
              placeholder={`${t("search")}...`}
              className="outline-none text-sm bg-transparent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div
            className="space-y-3 max-h-[68vh] overflow-auto px-1 custom-scroll min-h-full mt-4"
            role="list"
          >
            {conversations?.length === 0 && (
              <div className="mb-2 text-center">
                <Button
                  onClick={() => setShowSelectModal(true)}
                  className="bg-[#DC3173] hover:bg-[#DC3173]/90"
                >
                  {t("start_new_conversation")}
                </Button>
              </div>
            )}
            {conversations?.map((c, i) => (
              <div
                key={c._id}
                role="listitem"
                className={`flex items-center gap-3 p-3 rounded-2xl transition ${selectedId === c.room
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
                    {c.participants
                      ?.find((p) => p.role === USER_ROLE.FLEET_MANAGER)
                      ?.name?.trim()?.[0] ?? `F${i + 1}`}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-sm">
                        {c.participants
                          ?.find((p) => p.role === USER_ROLE.FLEET_MANAGER)
                          ?.name?.trim() || `Fleet Manager${i + 1}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(c.lastMessageTime || new Date(), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 truncate mt-1">
                      {c.lastMessage || "-"}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  {c.unreadCount?.[decoded?.userId] > 0 ? (
                    <div
                      className="bg-[#DC3173] text-white text-xs px-2 py-1 rounded-full"
                      aria-label={`${c.unreadCount?.[decoded?.userId]
                        } unread messages`}
                    >
                      {c.unreadCount?.[decoded?.userId]}
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
                  <div className="w-12 h-12">
                    <div className="w-12 h-12 rounded-full bg-[#DC3173]/12 flex items-center justify-center text-[#DC3173] font-semibold">
                      {selected?.name?.[0]}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{selected?.name}</div>
                    <div className="text-xs text-gray-500">
                      {t("fleet_managers")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500">
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
                className="flex-1 overflow-auto custom-scroll flex flex-col"
                role="log"
                aria-live="polite"
              >
                <div className="flex flex-col flex-1 gap-4 p-6">
                  {messages.map((m) => (
                    <article
                      key={m._id}
                      className={`max-w-[78%] p-3 rounded-2xl border ${m.senderRole === "ADMIN" ||
                          m.senderRole === "SUPER_ADMIN"
                          ? "ml-auto bg-[#DC3173]/15 border-[#DC3173]/20"
                          : "bg-gray-50 border-gray-100"
                        }`}
                      aria-label={`${m.senderRole === "ADMIN" ||
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
                    </article>
                  ))}
                </div>

                {typingInfo?.isTyping && (
                  <div className="max-w-[50%] mx-auto p-3 rounded-2xl bg-gray-50 border border-gray-100 mb-2">
                    <div className="text-xs text-gray-500">
                      {typingInfo?.name?.firstName || typingInfo?.name?.lastName
                        ? `${typingInfo?.name?.firstName} ${typingInfo?.name?.lastName}`
                        : t("fleet_managers")}{" "}
                      {t("is_typing")}
                    </div>
                    <div className="flex justify-center gap-1 mt-2">
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
                )}

                <div ref={endRef} />
              </div>

              {/* Composer (fixed bottom inside card) */}
              <div className="border-t p-4 bg-white">
                <div className="flex items-end gap-3">
                  <div className="flex items-center gap-2">
                    <label
                      className="cursor-pointer bg-gray-100 p-2 rounded-xl"
                      title={t("attach_images")}
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
                      title={t("attach_audio")}
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
                      title={t("attach_file")}
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
                      placeholder={t("write_a_message")}
                      rows={2}
                      className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-[#DC3173]/30 outline-none"
                      aria-label="Message composer"
                      onKeyUp={(e) => {
                        handleTyping(e.currentTarget.value.length > 0);
                      }}
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
                      {t("send")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t p-4 bg-white text-center text-gray-500 h-full flex items-center justify-center">
              {t("select_conversation_start_chatting")}
            </div>
          )}
        </section>

        {/* Fleet Manager Selection Modal */}
        <SelectFleetManagerModal
          open={showSelectModal}
          onOpenChange={(open) => !open && setShowSelectModal(open)}
          onClick={(fleetManager: TAgent) => selectFleetManager(fleetManager)}
          fleetManagersData={fleetManagersData}
          getFleetManagers={getFleetManagers}
        />
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
          aside[aria-label="FleetManagers (floating card)"] {
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
