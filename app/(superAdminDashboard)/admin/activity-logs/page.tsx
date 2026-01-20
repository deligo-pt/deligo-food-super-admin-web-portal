"use client"
import React, { useMemo, useState } from "react";
import { Search, Clock, User, Download, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

// Mock log data
interface LogEntry {
  id: string;
  admin: string;
  email: string;
  action: string;
  target?: string;
  timestamp: string;
  type: "info" | "warning" | "danger";
}

const initialLogs: LogEntry[] = [
  { id: "l1", admin: "Mariana Silva", email: "mariana@deligo.pt", action: "Created new admin", target: "Tiago", timestamp: "2025-01-12 10:21", type: "info" },
  { id: "l2", admin: "Tiago Fernandes", email: "tiago@deligo.pt", action: "Updated permissions", target: "Moderator Role", timestamp: "2025-01-12 09:43", type: "warning" },
  { id: "l3", admin: "Rita Gomes", email: "rita@deligo.pt", action: "Removed user", target: "User #4032", timestamp: "2025-01-11 21:12", type: "danger" },
  { id: "l4", admin: "Mariana Silva", email: "mariana@deligo.pt", action: "Suspended vendor", target: "Vendor #202", timestamp: "2025-01-11 20:27", type: "warning" },
  { id: "l5", admin: "João Pereira", email: "joao@deligo.pt", action: "Viewed payout details", target: "Vendor #322", timestamp: "2025-01-11 18:52", type: "info" },
  { id: "l6", admin: "Inês Costa", email: "ines@deligo.pt", action: "Edited delivery zone", target: "Lisbon District", timestamp: "2025-01-11 17:05", type: "info" },
];

export default function ActivityLogsPage() {
  const { t } = useTranslation();
  const [logs] = useState<LogEntry[]>(initialLogs);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => {
      const matchQuery = !q || l.admin.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.action.toLowerCase().includes(q);
      const matchType = filterType === "all" || filterType === l.type;
      return matchQuery && matchType;
    });
  }, [logs, query, filterType]);

  const typeBadge = (type: LogEntry["type"]) => {
    const base = "px-2 py-0.5 text-xs rounded-full font-medium";
    if (type === "info") return <span className={`${base} bg-blue-50 text-blue-700`}>Info</span>;
    if (type === "warning") return <span className={`${base} bg-yellow-50 text-yellow-700`}>Warning</span>;
    return <span className={`${base} bg-red-50 text-red-700`}>Critical</span>;
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-linear-to-b from-white via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t("activity_logs")}</h1>
          <p className="text-gray-600 mt-1">{t("track_every_important_action_inside")}</p>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 bg-white border rounded-full px-4 py-2 shadow-sm w-full md:w-auto">
            <Search className="text-gray-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search admin, email, action..."
              className="outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                className="px-4 py-2 border rounded-lg bg-white shadow-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">{t("all_types")}</option>
                <option value="info">{t("info")}</option>
                <option value="warning">{t("warnings")}</option>
                <option value="danger">{t("critical")}</option>
              </select>
            </div>

            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#DC3173] text-white shadow hover:brightness-95">
              <Download size={16} /> {t("export_logs")}
            </button>
          </div>
        </div>

        {/* LOGS TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">{t("admin")}</th>
                <th className="p-4 text-left">{t("action")}</th>
                <th className="p-4 text-left">{t("target")}</th>
                <th className="p-4 text-left">{t("time")}</th>
                <th className="p-4 text-center">{t("type")}</th>
                <th className="p-4 text-right">{t("details")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, i) => (
                <React.Fragment key={log.id}>
                  <motion.tr
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="p-4 flex items-center gap-3 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                        {log.admin.split(" ")[0].slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-medium">{log.admin}</div>
                        <div className="text-xs text-gray-500">{log.email}</div>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">{log.action}</td>

                    <td className="p-4 whitespace-nowrap text-gray-600">{log.target || "—"}</td>

                    <td className="p-4 whitespace-nowrap text-gray-600 flex items-center gap-1">
                      <Clock size={14} className="text-gray-400" /> {log.timestamp}
                    </td>

                    <td className="p-4 text-center">{typeBadge(log.type)}</td>

                    <td className="p-4 text-right">
                      <button className="inline-flex items-center gap-1 px-3 py-1 rounded-md border text-gray-600 hover:bg-gray-100">
                        <Eye size={14} /> {t("view")}
                      </button>
                    </td>
                  </motion.tr>

                  {/* EXPANDED ROW */}
                  <AnimatePresence>
                    {expandedId === log.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50"
                      >
                        <td colSpan={6} className="p-5 border-t text-sm text-gray-700">
                          <div className="flex items-start gap-4">
                            <User className="text-[#DC3173]" />
                            <div>
                              <div className="font-semibold text-gray-800 mb-1">{t("detailed_info")}</div>
                              <p><span className="font-medium">{t("admin")}:</span> {log.admin}</p>
                              <p><span className="font-medium">{t("email")}:</span> {log.email}</p>
                              <p><span className="font-medium">{t("action")}:</span> {log.action}</p>
                              <p><span className="font-medium">{t("target")}:</span> {log.target || "N/A"}</p>
                              <p><span className="font-medium">{t("timestamp")}:</span> {log.timestamp}</p>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
