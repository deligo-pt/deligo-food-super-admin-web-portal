"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCcw, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import SearchFilter from "./SearchFilter";
import SelectFilter from "./SelectFilter";
import { useTranslation } from "@/hooks/use-translation";

interface IProps {
  sortOptions: { label: string; value: string }[];
  filterOptions?: {
    label: string;
    key: string;
    placeholder: string;
    type: string;
    items: { label: string; value: string }[];
  }[];
  searchPlaceholder?: string;
}

export default function AllFilters({
  sortOptions,
  filterOptions,
  searchPlaceholder,
}: IProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const oldFilters =
    filterOptions?.reduce((acc, option) => {
      acc[option.key] = searchParams.get(option.key) || "";
      return acc;
    }, {} as Record<string, string>) || {};

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] =
    useState<Record<string, string>>(oldFilters);
  const [paramFilters, setParamFilters] = useState(oldFilters);

  // Current search term from URL
  const searchTerm = searchParams.get("searchTerm") || "";

  const handleAddFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        if (value !== "all") {
          setParamFilters((prev) => ({ ...prev, [key]: value }));
          params.set(key, value);
        } else {
          setParamFilters((prev) => ({ ...prev, [key]: "" }));
          params.delete(key);
        }
      }
    });
    router.push(`?${params.toString()}`);
    setShowFilters(false);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    setParamFilters((prev) => ({ ...prev, [key]: "" }));
    params.delete(key);
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    filterOptions?.forEach((option) => {
      setParamFilters((prev) => ({ ...prev, [option.key]: "" }));
      params.delete(option.key);
    });
    router.push(`?${params.toString()}`);
  };

  // Clear search handler
  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("searchTerm");
    router.push(`?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-1"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search + Clear button */}
        <div className="relative w-full lg:w-auto flex-1 max-w-xs">
          <SearchFilter
            paramName="searchTerm"
            placeholder={
              searchPlaceholder ? t(`${searchPlaceholder}`) : t("search")
            }
          />

          {/* Cross button – only visible when there is a search term */}
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors z-10"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="w-full lg:w-48">
            <SelectFilter
              paramName="sortBy"
              options={sortOptions}
              placeholder={t("sort_by")}
            />
          </div>

          {filterOptions && (
            <Button
              variant="outline"
              className={`flex items-center ${showFilters ||
                Object.entries(paramFilters)?.filter(
                  (filter) => filter[1] !== ""
                )?.length > 0
                ? "border-[#DC3173] text-[#DC3173]"
                : ""
                }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t("filters")}{" "}
              {Object.entries(paramFilters)?.filter(
                (filter) => filter[1] !== ""
              )?.length || ""}
            </Button>
          )}
        </div>
      </div>

      {/* Active filter badges */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {filterOptions?.map((option, i) =>
          paramFilters[option.key]?.length > 0 ? (
            <Badge
              key={i}
              variant="outline"
              className="text-[#DC3173] border-[#DC3173]"
            >
              {paramFilters[option.key]}
              <span>
                <X
                  className="ml-2 h-4 w-4 cursor-pointer"
                  onClick={() => removeFilter(option.key)}
                />
              </span>
            </Badge>
          ) : null
        )}

        {Object.entries(paramFilters)?.filter((filter) => filter[1] !== "")
          ?.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-sm text-[#DC3173] hover:text-[#DC3173] hover:bg-pink-50"
            >
              <RefreshCcw className="h-3 w-3 mr-1" /> {t("clear_all")}
            </Button>
          )}
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filterOptions?.map((options, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium mb-1">
                      {options.label}
                    </label>
                    <Select
                      value={activeFilters[options.key]}
                      onValueChange={(value) =>
                        setActiveFilters((prev) => ({
                          ...prev,
                          [options.key]: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={options.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {options?.items?.map((item, i2) => (
                          <SelectItem key={i2} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  className="mr-2"
                  onClick={() => setShowFilters(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  className="mr-2 bg-[#DC3173] hover:bg-[#DC3173]/90 text-white"
                  onClick={handleAddFilter}
                >
                  {t("apply_filters")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}