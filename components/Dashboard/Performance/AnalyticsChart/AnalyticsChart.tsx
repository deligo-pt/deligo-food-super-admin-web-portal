"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface IProps {
  data: Record<string, string | number>[];
  type: "line" | "area" | "bar" | "pie";
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showAxis?: boolean;
}

const BRAND_COLOR = "#DC3173";
const COLORS = [
  "#DC3173",
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];

export default function AnalyticsChart({
  data,
  type,
  dataKey,
  xKey = "name",
  color = BRAND_COLOR,
  height = 200,
  showGrid = true,
  showAxis = true,
}: IProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
      }}
      style={{
        height,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart data={data}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            )}
            {showAxis && (
              <XAxis
                dataKey={xKey}
                tick={{
                  fontSize: 12,
                }}
                stroke="#94a3b8"
              />
            )}
            {showAxis && (
              <YAxis
                tick={{
                  fontSize: 12,
                }}
                stroke="#94a3b8"
              />
            )}
            <Tooltip />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              dot={{
                fill: color,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: color,
              }}
            />
          </LineChart>
        ) : type === "area" ? (
          <AreaChart data={data}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            )}
            {showAxis && (
              <XAxis
                dataKey={xKey}
                tick={{
                  fontSize: 12,
                }}
                stroke="#94a3b8"
              />
            )}
            {showAxis && (
              <YAxis
                tick={{
                  fontSize: 12,
                }}
                stroke="#94a3b8"
              />
            )}
            <Tooltip />
            <defs>
              <linearGradient
                id={`gradient-${dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#gradient-${dataKey})`}
            />
          </AreaChart>
        ) : type === "bar" ? (
          <BarChart data={data}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            )}
            {showAxis && (
              <XAxis
                dataKey={xKey}
                tick={{
                  fontSize: 12,
                }}
                stroke="#94a3b8"
              />
            )}
            {showAxis && (
              <YAxis
                tick={{
                  fontSize: 12,
                }}
                stroke="#94a3b8"
              />
            )}
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey={dataKey}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
}
