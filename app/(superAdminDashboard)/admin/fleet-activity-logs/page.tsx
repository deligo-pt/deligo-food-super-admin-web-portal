/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  Filter,
  MapPin,
  Search,
  Truck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

const DELIGO = "#DC3173";

type LogType =
  | "login"
  | "logout"
  | "zone_change"
  | "rider_added"
  | "rider_removed"
  | "payout_request"
  | "warning";

type Severity = "normal" | "warning" | "critical";

type LogEntry = {
  id: string;
  fleetManager: string;
  type: LogType;
  message: string;
  zone?: string;
  timestamp: string;
  severity: Severity;
};

// ---------------------- Page ----------------------
export default function FleetActivityLogsPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | LogType>("all");
  const [filterSeverity, setFilterSeverity] = useState<"all" | Severity>("all");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLogs(mockLogs());
  }, []);

  const filtered = logs.filter((log) => {
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      log.message.toLowerCase().includes(q) ||
      log.fleetManager.toLowerCase().includes(q) ||
      (log.zone && log.zone.toLowerCase().includes(q));

    const matchType = filterType === "all" || log.type === filterType;
    const matchSeverity =
      filterSeverity === "all" || log.severity === filterSeverity;

    return matchQuery && matchType && matchSeverity;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <TitleHeader
        title={t("fleet_activity_logs")}
        subtitle="Fleet Manager Activity Logs"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input
          placeholder={t("search_logs_fleet_manager_zone")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button style={{ background: DELIGO }}>
          <Search className="w-4 h-4" />
        </Button>

        <select
          className="px-3 py-2 border rounded-md bg-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="all">{t("all_types")}</option>
          <option value="login">{t("login")}</option>
          <option value="logout">{t("logout")}</option>
          <option value="zone_change">{t("zone_change")}</option>
          <option value="rider_added">{t("rider_added")}</option>
          <option value="rider_removed">{t("rider_removed")}</option>
          <option value="payout_request">{t("payout_request")}</option>
          <option value="warning">{t("warning")}</option>
        </select>

        <select
          className="px-3 py-2 border rounded-md bg-white"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as any)}
        >
          <option value="all">{t("all_severity")}</option>
          <option value="normal">{t("normal")}</option>
          <option value="warning">{t("warnings")}</option>
          <option value="critical">{t("critical")}</option>
        </select>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" /> {t("advanced_filters")}
        </Button>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-sm text-slate-500">{t("showing")}</div>
          <div className="px-3 py-1 rounded-md bg-white border">
            {filtered.length}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SummaryCard
          label={t("total_logs")}
          value={String(filtered.length)}
          icon={<Clock className="w-6 h-6" style={{ color: DELIGO }} />}
        />
        <SummaryCard
          label={t("warnings")}
          value={String(
            filtered.filter((l) => l.severity === "warning").length,
          )}
          icon={<AlertTriangle className="w-6 h-6 text-orange-500" />}
        />
        <SummaryCard
          label={t("critical_alerts")}
          value={String(
            filtered.filter((l) => l.severity === "critical").length,
          )}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        />
      </div>

      {/* Logs list */}
      <Card className="p-6 shadow-sm rounded-2xl">
        <h3 className="text-xl font-semibold mb-4">{t("recent_activity")}</h3>
        <Separator className="mb-4" />

        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              {t("no_logs_match_your_filters")}
            </div>
          ) : (
            filtered.map((log) => (
              <motion.div
                key={log.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-white rounded-xl border flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {iconForType(log.type)}

                  <div>
                    <p className="font-semibold text-slate-800">
                      {log.message}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 items-center text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />{" "}
                        <span>{log.fleetManager}</span>
                      </div>

                      {log.zone && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> <span>{log.zone}</span>
                        </div>
                      )}

                      <div className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={badgeVariant(log.severity)}
                    className="capitalize"
                  >
                    {log.severity}
                  </Badge>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

// ---------------------- Summary Card ----------------------
function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <Card className="p-5 shadow-sm rounded-xl bg-white flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
      </div>
      <div className="p-3 rounded-xl bg-slate-100">{icon}</div>
    </Card>
  );
}

// ---------------------- Utils ----------------------
function iconForType(type: LogType) {
  const base =
    "w-10 h-10 p-2 rounded-full flex items-center justify-center text-white shadow-sm";
  switch (type) {
    case "login":
      return (
        <div className={`${base} bg-emerald-500`}>
          <User className="w-5 h-5" />
        </div>
      );
    case "logout":
      return (
        <div className={`${base} bg-slate-500`}>
          <User className="w-5 h-5" />
        </div>
      );
    case "zone_change":
      return (
        <div className={`${base} bg-blue-500`}>
          <MapPin className="w-5 h-5" />
        </div>
      );
    case "rider_added":
      return (
        <div className={`${base} bg-purple-500`}>
          <Truck className="w-5 h-5" />
        </div>
      );
    case "rider_removed":
      return (
        <div className={`${base} bg-rose-500`}>
          <Truck className="w-5 h-5" />
        </div>
      );
    case "payout_request":
      return (
        <div className={`${base} bg-amber-500`}>
          <Clock className="w-5 h-5" />
        </div>
      );
    default:
      return (
        <div className={`${base} bg-red-600`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
      );
  }
}

function badgeVariant(sev: Severity) {
  if (sev === "critical") return "destructive";
  if (sev === "warning") return "secondary";
  return "default";
}

// ---------------------- Mock Data ----------------------
function mockLogs(): LogEntry[] {
  const managers = [
    "Carlos Sousa",
    "Miguel Rocha",
    "Ana Pereira",
    "João Silva",
    "Inês Duarte",
    "Tiago Martins",
  ];
  const zones = [
    "Lisbon Central",
    "Porto Downtown",
    "Braga West",
    "Coimbra East",
    "Faro South",
  ];
  const types: LogType[] = [
    "login",
    "logout",
    "zone_change",
    "rider_added",
    "rider_removed",
    "payout_request",
    "warning",
  ];
  const severities: Severity[] = ["normal", "warning", "critical"];

  const out: LogEntry[] = [];

  for (let i = 0; i < 45; i++) {
    const t = types[i % types.length];
    const sev =
      t === "warning"
        ? i % 5 === 0
          ? "critical"
          : "warning"
        : severities[i % severities.length];

    const message = generateMessage(
      t,
      managers[i % managers.length],
      zones[i % zones.length],
    );
    out.push({
      id: `LOG-${5000 + i}`,
      fleetManager: managers[i % managers.length],
      type: t,
      message,
      zone: Math.random() > 0.4 ? zones[i % zones.length] : undefined,
      timestamp: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
      severity: sev,
    });
  }

  // Sort recent first
  return out.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

function generateMessage(type: LogType, manager: string, zone: string) {
  switch (type) {
    case "login":
      return `${manager} logged in to the super admin console.`;
    case "logout":
      return `${manager} logged out.`;
    case "zone_change":
      return `${manager} updated zone boundary for ${zone}.`;
    case "rider_added":
      return `${manager} added a new rider to ${zone}.`;
    case "rider_removed":
      return `${manager} removed a rider from ${zone}.`;
    case "payout_request":
      return `${manager} submitted a payout request for review.`;
    case "warning":
      return `System warning: unusual activity detected in ${zone}.`;
    default:
      return "Activity recorded.";
  }
}
