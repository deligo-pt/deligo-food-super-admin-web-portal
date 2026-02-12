"use client";

import TopbarMessageIcon from "@/components/adminTopbar/TopbarMessageIcon";
import TopbarNotification from "@/components/adminTopbar/TopbarNotification";
import { useStore } from "@/store/store";
import { TAdmin } from "@/types/admin.type";
import { removeCookie } from "@/utils/cookies";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  LogOut,
  User,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const PRIMARY = "#DC3173";

type IProps = {
  admin?: TAdmin;
};

export default function TopbarIcons({ admin }: IProps) {
  const { lang, setLang } = useStore();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  const logOut = () => {
    removeCookie("accessToken");
    removeCookie("refreshToken");
    router.push("/");
  };

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
      {/* Language */}

      <div className="relative hidden sm:block z-1002">
        <Select
          value={lang}
          onValueChange={(value: "en" | "pt") => {
            setLang(value);
          }}
        >
          <SelectTrigger className="w-[70px] hover:border hover:border-[#DC3173]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">EN</SelectItem>
            <SelectItem value="pt">PT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* SOS */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        className="relative flex items-center justify-center w-10 h-10 rounded-lg text-white font-semibold shadow shrink-0"
        style={{
          background: "linear-gradient(90deg,#ff3b30,#ff6b6b)",
          boxShadow: `0 4px 18px ${PRIMARY}33`,
        }}
        onClick={() => router.push("/admin/sos")}
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
      <TopbarNotification />

      {/* Messages */}
      <TopbarMessageIcon />

      {/* Profile */}
      <div className="relative shrink-0 z-3000">
        <button
          onClick={() => {
            setProfileOpen((s) => !s);
            setLangOpen(false);
          }}
          className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-pink-50 transition"
        >
          {admin?.profilePhoto &&
          admin?.profilePhoto !== "<admin_profile_photo_url>" ? (
            <Image
              src={admin?.profilePhoto}
              alt="avatar"
              width={36}
              height={36}
              className="rounded-full border-2 border-pink-200 object-cover w-9 h-9"
            />
          ) : (
            <div className="flex items-center justify-center rounded-full border-2 border-pink-200 object-cover w-8 h-8">
              <UserIcon size={18} className="text-[#DC3173]" />
            </div>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-700 hidden sm:inline transition-transform ${
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
              className="absolute right-0 mt-2 w-44 bg-white border border-pink-100 rounded-xl shadow-xl overflow-hidden z-4000"
            >
              <button
                className="w-full px-4 py-3 flex items-center gap-2 text-gray-700 hover:bg-pink-50"
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/admin/profile");
                }}
              >
                <User size={16} /> Profile
              </button>

              <div className="border-t border-pink-50" />

              <button
                className="w-full px-4 py-3 flex items-center gap-2 text-red-600 hover:bg-red-50"
                onClick={() => {
                  setProfileOpen(false);
                  logOut();
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
