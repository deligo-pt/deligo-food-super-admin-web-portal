"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface SearchFilterProps {
  paramName?: string;
  placeholder?: string;
  className?: string;
}

export default function SearchFilter({
  paramName = "searchTerm",
  placeholder,
  className = "",
}: SearchFilterProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get(paramName) || "";

  const [value, setValue] = useState(currentValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep local state in sync when URL changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setValue(currentValue);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [currentValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const updateURL = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term.trim()) {
      params.set(paramName, term.trim());
    } else {
      params.delete(paramName);
    }
    router.push(`?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Debounce
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updateURL(newValue);
    }, 400);
  };

  const clearSearch = () => {
    setValue("");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder ? placeholder : t("searching")}
        className="pl-9 pr-9"
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full
                     text-gray-400 hover:text-gray-600 hover:bg-gray-100
                     transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}