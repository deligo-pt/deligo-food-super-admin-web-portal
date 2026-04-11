"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const dateOptions = [
  { label: "Last 7 Days", value: "last7days" },
  { label: "Last 14 Days", value: "last14days" },
  { label: "Last 30 Days", value: "last30days" },
  { label: "Last 90 Days", value: "last90days" },
  { label: "Last 1 Year", value: "last1year" },
  { label: "Custom Range", value: "custom" },
];

export function SelectDateRangeFilter({
  placeholder,
  paramName = "timeframe",
  options = dateOptions,
  onCustomRangeSelect,
  isAllNeeded = false,
}: {
  placeholder: string;
  paramName?: string;
  options?: { label: string; value: string }[];
  onCustomRangeSelect: () => void;
  isAllNeeded?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentValue = searchParams.get(paramName) || "";

  const handleChange = (value: string) => {
    if (value === "custom") {
      onCustomRangeSelect();
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(paramName);
    } else if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <Select
      value={currentValue}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-full bg-white text-[#DC3173]! font-medium! h-10! disabled:opacity-50 disabled:cursor-not-allowed">
        <SelectValue
          placeholder={placeholder}
          className="text-[#DC3173]! font-medium!"
        />
      </SelectTrigger>
      <SelectContent>
        {isAllNeeded && <SelectItem value="all">All</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SelectCustomDateFilter({
  paramName = "timeframe",
  fromDateParamName = "fromDate",
  fromDateLabel = "From Date",
  toDateParamName = "toDate",
  toDateLabel = "To Date",
  onClear,
}: {
  paramName?: string;
  fromDateParamName?: string;
  fromDateLabel?: string;
  toDateParamName?: string;
  toDateLabel?: string;
  onClear?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentFromDate = searchParams.get(fromDateParamName) || "";
  const currentToDate = searchParams.get(toDateParamName) || "";

  const [dateRange, setDateRange] = useState({
    from: currentFromDate,
    to: currentToDate,
  });
  const [error, setError] = useState("");

  const onApply = () => {
    if (!dateRange.from || !dateRange.to) {
      setError("Both From and To dates are required");
      return;
    }

    if (dateRange.from >= dateRange.to) {
      setError("To date must be greater than From date");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    params.set(paramName, "custom");
    params.set(fromDateParamName, new Date(dateRange.from).toISOString());
    params.set(toDateParamName, new Date(dateRange.to).toISOString());

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const onFilterClear = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(paramName);
    params.delete(fromDateParamName);
    params.delete(toDateParamName);

    onClear?.();

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
    >
      <div className="flex items-end gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">
            {fromDateLabel}
          </label>
          <input
            type="date"
            className={cn(
              "border rounded-md p-2 text-sm",
              error && "border-destructive",
            )}
            onChange={(e) =>
              setDateRange({ ...dateRange, from: e.target.value })
            }
            value={dateRange.from}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">
            {toDateLabel}
          </label>
          <input
            type="date"
            className={cn(
              "border rounded-md p-2 text-sm",
              error && "border-destructive",
            )}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            value={dateRange.to}
          />
        </div>
        <button
          className="bg-[#DC3173] text-white px-4 py-2 rounded-md text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
          onClick={onApply}
        >
          Apply
        </button>
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
          onClick={onFilterClear}
        >
          Clear
        </button>
      </div>
      {error && <p className="text-destructive text-sm mt-2">{error}</p>}
    </motion.div>
  );
}
