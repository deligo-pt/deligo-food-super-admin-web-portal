"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface IProps<T> {
  type?: "bar" | "area" | "line" | "pie";
  title: string;
  description?: string;
  caption?: string;
  data: T[];
  colors?: string[];
  xKey?: string;
  yKey?: string;
  xLabel?: string;
  yLabel?: string;
  yLabelOffset?: number;
  height?: number;
  delay?: number;
  xTooltipKey?: string;
  yTooltipKey?: string;
  isBGNeed?: boolean;
  isLegendNeed?: boolean;
  xLabelCustomizedValue?: (val: number | string) => string;
  yLabelCustomizedValue?: (val: number | string) => string;
  yAxisCustomizedValue?: (val: number | string) => string;
}

const COLORS = [
  "#DC3173",
  "#16a34a",
  "#f59e0b",
  "#2563eb",
  "#8b5cf6",
  "#06b6d4",
  "#dc2626",
  "#a3e635",
];

export default function CustomizedCharts<T>({
  type = "bar",
  title,
  description,
  caption,
  data,
  colors = COLORS,
  xKey = "label",
  yKey = "value",
  xLabel,
  yLabel,
  yLabelOffset,
  height = 300,
  delay = 0,
  xTooltipKey,
  yTooltipKey,
  isBGNeed = true,
  isLegendNeed = true,
  xLabelCustomizedValue,
  yLabelCustomizedValue,
  yAxisCustomizedValue,
}: IProps<T>) {
  const chartMargin = { top: 10, right: 20, left: 10, bottom: 30 };

  const axisesComponents = () => {
    return (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
        <XAxis dataKey={xKey}>
          {xLabel && (
            <Label
              value={xLabel}
              offset={-15}
              position="insideBottom"
              className="text-gray-900 font-semibold"
            />
          )}
        </XAxis>
        <YAxis
          dataKey={yKey}
          tickFormatter={(val) =>
            yAxisCustomizedValue ? yAxisCustomizedValue(val) : val
          }
        >
          {yLabel && (
            <Label
              value={yLabel}
              offset={yLabelOffset || -5}
              style={{ textAnchor: "middle" }}
              position="insideLeft"
              angle={-90}
              className="text-gray-900 font-semibold"
            />
          )}
        </YAxis>
        <Tooltip
          labelFormatter={(val: number | string) =>
            `${xTooltipKey || xLabel || "Label"}: ${xLabelCustomizedValue ? xLabelCustomizedValue(val) : val}`
          }
          formatter={(val: number | string) => [
            yLabelCustomizedValue ? yLabelCustomizedValue(val) : val,
            yTooltipKey || yLabel || "Value",
          ]}
        />
      </>
    );
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay,
      }}
      className={
        isBGNeed
          ? "bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
          : ""
      }
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>

        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>

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
          {type === "bar" && (
            <BarChart data={data} margin={chartMargin}>
              {axisesComponents()}

              <Bar dataKey={yKey} fill="#DC3173" />
            </BarChart>
          )}

          {type === "area" && (
            <AreaChart data={data} margin={chartMargin}>
              {axisesComponents()}

              <defs>
                <linearGradient
                  id={`gradient-${yKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#DC3173" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DC3173" stopOpacity={0} />
                </linearGradient>
              </defs>

              <Area
                type="monotone"
                dataKey={yKey}
                stroke="#DC3173"
                strokeWidth={2.5}
                fill={`url(#gradient-${yKey})`}
              />
            </AreaChart>
          )}

          {type === "line" && (
            <LineChart data={data} margin={chartMargin}>
              {axisesComponents()}

              <Line
                type="monotone"
                dataKey={yKey}
                stroke="#DC3173"
                strokeWidth={2.5}
                dot={{
                  fill: "#DC3173",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: "#DC3173",
                }}
              />
            </LineChart>
          )}

          {type === "pie" && (
            <PieChart>
              <Pie
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data={data as any[]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey={yKey}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(val: number | string, label) => [
                  yLabelCustomizedValue ? yLabelCustomizedValue(val) : val,
                  xLabelCustomizedValue ? xLabelCustomizedValue(label) : label,
                ]}
              />

              {isLegendNeed && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-slate-600 font-medium">
                      {xLabelCustomizedValue
                        ? xLabelCustomizedValue(value)
                        : value}
                    </span>
                  )}
                />
              )}
            </PieChart>
          )}
        </ResponsiveContainer>
      </motion.div>

      {caption && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 italic">{caption}</p>
        </div>
      )}
    </motion.div>
  );
}
