"use client"
import { useState } from "react";
import {
  Send,
  Users,
  UserCheck,
  UserCircle,
  Mail,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";



export default function EmailBroadcast() {
  const { t } = useTranslation();
  const userTypes = [
    { id: "all", label: t("all_users"), icon: <Users size={18} /> },
    { id: "customers", label: t("customers"), icon: <UserCircle size={18} /> },
    { id: "restaurants", label: t("restaurants"), icon: <UserCheck size={18} /> },
    { id: "drivers", label: t("drivers"), icon: <UserCircle size={18} /> },
    { id: "admins", label: t("admins"), icon: <UserCircle size={18} /> },
  ];

  const [selectedType, setSelectedType] = useState("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>(
    { type: null, message: "" }
  );
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setStatus({ type: "error", message: "Subject & Message are required." });
      return;
    }

    setSending(true);
    setStatus({ type: null, message: "" });

    // FAKE API DELAY
    setTimeout(() => {
      setSending(false);
      setStatus({ type: "success", message: "Email sent to selected user group!" });
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t("email_broadcast")}</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            {t("send_announcements_alerts_promotional_emails")}
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT FORM */}
        <section className="lg:col-span-2 bg-white rounded-2xl shadow p-6 space-y-6">
          {/* USER TYPE SELECT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("select_user_type")}</label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {userTypes.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedType(u.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${selectedType === u.id
                    ? "border-[#DC3173] bg-[#fff0f6] shadow-sm"
                    : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {u.icon}
                  <span className="text-sm font-medium">{u.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SUBJECT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("email_subject")}</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#ffd4e6]"
              placeholder="Write an attractive subject..."
            />
          </div>

          {/* MESSAGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("message")}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-40 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#ffd4e6]"
              placeholder="Write your message..."
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 rounded-xl border hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye /> {t("preview")}
            </button>

            <button
              onClick={handleSend}
              disabled={sending}
              className="px-6 py-2 rounded-xl text-white shadow-md flex items-center gap-2 disabled:opacity-60"
              style={{ background: "#DC3173" }}
            >
              {sending ? <Loader2 className="animate-spin" /> : <Send />} {t("send_email")}
            </button>
          </div>

          {/* STATUS */}
          {status.type && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${status.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
                }`}
            >
              {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {status.message}
            </div>
          )}
        </section>

        {/* RIGHT PANEL */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users size={18} className="text-[#DC3173]" /> {t("selected_group")}
            </h3>
            <p className="text-sm text-gray-600 mt-2">{userTypes.find((u) => u.id === selectedType)?.label}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Mail size={18} className="text-[#DC3173]" /> {t("")}
            </h3>

            <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc ml-4">
              <li>{t("keep_subjects_short_and_clear")}</li>
              <li>{t("always_check_before_broadcasting")}</li>
              <li>{t("do_not_spam_users_frequently")}</li>
              <li>{t("use_the_preview_before_sending")}</li>
            </ul>
          </div>
        </aside>
      </main>

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-2">{t("preview_email")}</h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">{t("to")}</p>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border text-sm">
                  {userTypes.find((u) => u.id === selectedType)?.label}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">{t("subject")}</p>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border text-sm">{subject}</div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">{t("message")}</p>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border text-sm whitespace-pre-line">
                  {message}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
