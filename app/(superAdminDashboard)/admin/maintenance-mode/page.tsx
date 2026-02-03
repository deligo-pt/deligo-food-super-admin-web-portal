"use client";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Power,
  Save,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";

export default function MaintenanceMode() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("We'll be back soon");
  const [message, setMessage] = useState(
    "We are performing scheduled maintenance. The system will return shortly.",
  );
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const saveSettings = () => {
    setStatus({ type: null, message: "" });
    setTimeout(() => {
      setStatus({
        type: "success",
        message: "Maintenance configuration updated successfully!",
      });
    }, 800);
  };

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <TitleHeader
        title={t("maintenance_mode")}
        subtitle={t("configure_global_maintenance_mode")}
      />

      <header className="flex items-center justify-between">
        <button
          onClick={saveSettings}
          className="px-4 py-2 rounded-xl text-white shadow-md flex items-center gap-2"
          style={{ background: "#DC3173" }}
        >
          <Save size={16} /> {t("save_changes")}
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL SETTINGS */}
        <section className="lg:col-span-2 bg-white rounded-2xl shadow p-6 space-y-6">
          {/* MAINTENANCE TOGGLE */}
          <div className="flex items-center justify-between p-4 rounded-xl border hover:shadow-sm transition">
            <div className="flex items-center gap-3">
              <ShieldAlert
                size={22}
                className={enabled ? "text-red-600" : "text-gray-400"}
              />
              <div>
                <div className="font-medium text-gray-900">
                  {t("enable_maintenance_mode")}
                </div>
                <p className="text-xs text-gray-500">
                  {t("show_global_downtime_screen_users")}
                </p>
              </div>
            </div>

            <button onClick={() => setEnabled(!enabled)}>
              {enabled ? (
                <Power size={40} className="text-[#DC3173]" />
              ) : (
                <Power size={40} className="text-gray-300" />
              )}
            </button>
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("maintenance_title")}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#ffd4e6]"
              placeholder={t("we_will_be_back_soon")}
            />
          </div>

          {/* MESSAGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("message")}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-28 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#ffd4e6]"
            />
          </div>

          {/* SCHEDULE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("schedule_optional")}
            </label>
            <div className="flex items-center gap-3">
              <Clock className="text-gray-500" />
              <input
                type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#ffd4e6]"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {t("users_will_see_scheduled_downtime_info")}
            </p>
          </div>
        </section>

        {/* RIGHT SIDE — PREVIEW */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#DC3173]" />{" "}
              {t("preview")}
            </h3>

            <div className="mt-4 p-4 border rounded-xl bg-gray-50">
              {!enabled && (
                <div className="text-gray-400 text-sm text-center py-10">
                  {t("maintenance_mode_disabled")}
                </div>
              )}

              {enabled && (
                <div className="text-center space-y-4">
                  <ShieldAlert size={40} className="mx-auto text-red-500" />
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {message}
                  </p>

                  {schedule && (
                    <div className="text-xs text-gray-500 mt-2">
                      {t("scheduled")}: {new Date(schedule).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* STATUS */}
          {status.type && (
            <div
              className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                status.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              {status.message}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
