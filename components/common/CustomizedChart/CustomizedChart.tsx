"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface IProps<T> {
  type?: "bar" | "area" | "line";
  title: string;
  description?: string;
  caption?: string;
  data: T[];
  xKey?: string;
  yKey?: string;
  xLabel?: string;
  yLabel?: string;
  yLabelOffset?: number;
  height?: number;
  delay?: number;
  xTooltipKey?: string;
  yTooltipKey?: string;
  xLabelCustomizedValue?: (val: number | string) => string;
  yLabelCustomizedValue?: (val: number | string) => string;
  isBGNeed?: boolean;
  yAxisCustomizedValue?: (val: number | string) => string;
}

export default function CustomizedCharts<T>({
  type = "bar",
  title,
  description,
  caption,
  data,
  xKey = "label",
  yKey = "value",
  xLabel,
  yLabel,
  yLabelOffset,
  height = 300,
  delay = 0,
  xTooltipKey,
  yTooltipKey,
  xLabelCustomizedValue,
  yLabelCustomizedValue,
  isBGNeed = true,
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
