"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  AlertTriangle,
  Bell,
  MessageSquare,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

const PRIMARY = "#DC3173";

type Props = {
  sidebarWidth?: number;
};

export default function Topbar({ sidebarWidth = 280 }: Props) {
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLangOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const LANGS = [
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
    { code: "es", label: "Español" },
  ];

  return (
    <>
      {/* Fixed Topbar */}
      <header
        className="fixed top-0 left-0 right-0 z-[1000] bg-white/70 backdrop-blur-lg border-b border-pink-100"
        style={{ height: 64 }}
      >
        <div
          className="flex items-center justify-between h-full px-3 sm:px-4 md:px-6"
          style={{
            paddingLeft:
              typeof sidebarWidth === "number" ? undefined : undefined,
          }}
        >
          {/* LEFT (Empty for now) */}
          <div className="flex-1 h-full flex items-center"></div>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0 relative z-[1001]">
            {/* Language */}
            <div className="relative hidden sm:block z-[1002]">
              <motion.button
                onClick={() => {
                  setLangOpen((s) => !s);
                  setProfileOpen(false);
                }}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-50 transition"
              >
                <Globe size={18} className="text-gray-700" />
                <ChevronDown
                  size={16}
                  className={`text-gray-700 transition-transform ${
                    langOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-40 bg-white border border-pink-100 rounded-xl shadow-lg overflow-hidden z-[2000]"
                  >
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setLangOpen(false)}
                        className="w-full text-left px-4 py-2 hover:bg-pink-50 text-gray-700"
                      >
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SOS */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg text-white font-semibold shadow flex-shrink-0"
              style={{
                background: "linear-gradient(90deg,#ff3b30,#ff6b6b)",
                boxShadow: `0 4px 18px ${PRIMARY}33`,
              }}
              onClick={() => alert("SOS triggered")}
            >
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-lg"
                style={{ background: PRIMARY, opacity: 0.06 }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <AlertTriangle size={18} />
            </motion.button>

            {/* Notification */}
            <div className="relative flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.06 }}
                className="p-2 rounded-lg hover:bg-pink-50 transition"
              >
                <Bell size={18} className="text-gray-700" />
              </motion.button>

              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-pink-600 rounded-full border-2 border-white"
              />
            </div>

            {/* Messages */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              className="p-2 rounded-lg hover:bg-pink-50 transition hidden sm:block flex-shrink-0"
            >
              <MessageSquare size={18} className="text-gray-700" />
            </motion.button>

            {/* Profile */}
            <div className="relative flex-shrink-0 z-[3000]">
              <button
                onClick={() => {
                  setProfileOpen((s) => !s);
                  setLangOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-pink-50 transition"
              >
                <Image
                  src="/profile.jpg"
                  alt="avatar"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-pink-200 object-cover"
                />
                <ChevronDown
                  size={16}
                  className={`text-gray-700 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 mt-2 w-44 bg-white border border-pink-100 rounded-xl shadow-xl overflow-hidden z-[4000]"
                  >
                    <button
                      className="w-full px-4 py-3 flex items-center gap-2 text-gray-700 hover:bg-pink-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={16} /> Profile
                    </button>

                    <div className="border-t border-pink-50" />

                    <button
                      className="w-full px-4 py-3 flex items-center gap-2 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setProfileOpen(false);
                        alert("Logged out (demo)");
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: 64 }} />
    </>
  );
}
