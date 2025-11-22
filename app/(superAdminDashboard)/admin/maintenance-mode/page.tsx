"use client"
import  { useState } from "react";
import {
  ShieldAlert,
  Power,
  Clock,
  Save,
  AlertTriangle,
  CheckCircle,
  Wrench,
} from "lucide-react";



export default function MaintenanceMode() {
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("We'll be back soon");
  const [message, setMessage] = useState("We are performing scheduled maintenance. The system will return shortly.");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  const saveSettings = () => {
    setStatus({ type: null, message: "" });
    setTimeout(() => {
      setStatus({ type: "success", message: "Maintenance configuration updated successfully!" });
    }, 800);
  };

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Wrench className="text-[#DC3173]" /> Maintenance Mode
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Configure global maintenance mode. When enabled, all users will see a maintenance screen.
          </p>
        </div>

        <button
          onClick={saveSettings}
          className="px-4 py-2 rounded-xl text-white shadow-md flex items-center gap-2"
          style={{ background: "#DC3173" }}
        >
          <Save size={16} /> Save Changes
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL SETTINGS */}
        <section className="lg:col-span-2 bg-white rounded-2xl shadow p-6 space-y-6">
          {/* MAINTENANCE TOGGLE */}
          <div className="flex items-center justify-between p-4 rounded-xl border hover:shadow-sm transition">
            <div className="flex items-center gap-3">
              <ShieldAlert size={22} className={enabled ? "text-red-600" : "text-gray-400"} />
              <div>
                <div className="font-medium text-gray-900">Enable Maintenance Mode</div>
                <p className="text-xs text-gray-500">Show global downtime screen to all users.</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#ffd4e6]"
              placeholder="We’ll be back soon"
            />
          </div>

          {/* MESSAGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-28 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#ffd4e6]"
            />
          </div>

          {/* SCHEDULE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
            <div className="flex items-center gap-3">
              <Clock className="text-gray-500" />
              <input
                type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#ffd4e6]"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Users will see scheduled downtime info.</p>
          </div>
        </section>

        {/* RIGHT SIDE — PREVIEW */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#DC3173]" /> Preview
            </h3>

            <div className="mt-4 p-4 border rounded-xl bg-gray-50">
              {!enabled && (
                <div className="text-gray-400 text-sm text-center py-10">Maintenance mode is disabled</div>
              )}

              {enabled && (
                <div className="text-center space-y-4">
                  <ShieldAlert size={40} className="mx-auto text-red-500" />
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{message}</p>

                  {schedule && (
                    <div className="text-xs text-gray-500 mt-2">Scheduled: {new Date(schedule).toLocaleString()}</div>
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
