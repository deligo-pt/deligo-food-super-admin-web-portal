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
import {
  Loader2,
  LoaderIcon,
  RefreshCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import SearchFilter from "./SearchFilter";
import SelectFilter from "./SelectFilter";
import { useTranslation } from "@/hooks/use-translation";
import { FilterOption, FilterOptionItem } from "@/types";


interface IProps {
  sortOptions: { label: string; value: string }[];
  filterOptions?: FilterOption[];
  searchPlaceholder?: string;
  extraSelectFilter?: {
    key: string;
    placeholder: string;
    options: { label: string; value: string }[];
    defaultValue?: string;
    isAllNeeded?: boolean;
  };
  refreshButton?: boolean;
}

/*
 * Helpers
 */

function findItem(
  option: FilterOption,
  value: string
): FilterOptionItem | undefined {
  return option.items.find((i) => i.value === value);
}

/** Apply one filter selection onto URLSearchParams */
function applyFilterValue(
  params: URLSearchParams,
  option: FilterOption,
  value: string
) {
  const item = findItem(option, value);

  item?.clearKeys?.forEach((k) => params.delete(k));

  if (!value || item?.clear) {
    params.delete(option.key);
    // also clear any custom queryKeys this option might own
    option.items.forEach((i) => {
      if (i.queryKey) params.delete(i.queryKey);
    });
    return;
  }

  const queryKey = item?.queryKey || option.key;
  const queryValue = item?.queryValue ?? value;

  if (queryKey !== option.key) {
    params.delete(option.key);
  }

  // clear other custom keys belonging to this option
  option.items.forEach((i) => {
    if (i.queryKey && i.queryKey !== queryKey) {
      params.delete(i.queryKey);
    }
  });

  params.set(queryKey, queryValue);
}

/** Resolve UI value from current URL for one filter option */
function resolveUiValue(
  option: FilterOption,
  searchParams: URLSearchParams
): string {
  for (const item of option.items) {
    if (item.clear) continue;
    const qKey = item.queryKey || option.key;
    const qVal = item.queryValue ?? item.value;
    if (searchParams.get(qKey) === qVal) {
      return item.value;
    }
  }

  const raw = searchParams.get(option.key);
  if (raw) return raw;

  return option.defaultValue || "";
}

/* ─────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────── */

export default function AllFilters({
  sortOptions,
  filterOptions,
  searchPlaceholder,
  extraSelectFilter,
  refreshButton = false,
}: IProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const oldFilters =
    filterOptions?.reduce(
      (acc, option) => {
        acc[option.key] = resolveUiValue(option, searchParams);
        return acc;
      },
      {} as Record<string, string>
    ) || {};

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] =
    useState<Record<string, string>>(oldFilters);
  const [paramFilters, setParamFilters] =
    useState<Record<string, string>>(oldFilters);

  const searchTerm = searchParams.get("searchTerm") || "";

  // Apply defaultValue only for options that define it
  useEffect(() => {
    if (!filterOptions?.length) return;

    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    filterOptions.forEach((option) => {
      if (!option.defaultValue) return;

      const hasOwn = searchParams.has(option.key);
      const hasUnless = option.defaultUnlessKeys?.some((k) =>
        searchParams.has(k)
      );
      const hasCustom = option.items.some(
        (item) => item.queryKey && searchParams.has(item.queryKey)
      );

      if (!hasOwn && !hasUnless && !hasCustom) {
        applyFilterValue(params, option, option.defaultValue);
        changed = true;
      }
    });

    if (changed) {
      router.replace(`?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local state in sync when URL changes externally
  useEffect(() => {
    if (!filterOptions?.length) return;

    const next =
      filterOptions.reduce(
        (acc, option) => {
          acc[option.key] = resolveUiValue(option, searchParams);
          return acc;
        },
        {} as Record<string, string>
      ) || {};

    setActiveFilters(next);
    setParamFilters(next);
  }, [searchParams, filterOptions]);

  const handleAddFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    const nextParamFilters = { ...paramFilters };

    Object.entries(activeFilters).forEach(([key, value]) => {
      const option = filterOptions?.find((o) => o.key === key);
      if (!option) return;

      applyFilterValue(params, option, value);

      const item = findItem(option, value);
      nextParamFilters[key] = !value || item?.clear ? "" : value;
    });

    setParamFilters(nextParamFilters);
    router.push(`?${params.toString()}`);
    setShowFilters(false);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const option = filterOptions?.find((o) => o.key === key);
    if (!option) return;

    params.delete(option.key);
    option.items.forEach((item) => {
      if (item.queryKey) params.delete(item.queryKey);
      item.clearKeys?.forEach((k) => params.delete(k));
    });

    if (option.defaultValue) {
      applyFilterValue(params, option, option.defaultValue);
      setParamFilters((prev) => ({
        ...prev,
        [key]: option.defaultValue!,
      }));
      setActiveFilters((prev) => ({
        ...prev,
        [key]: option.defaultValue!,
      }));
    } else {
      setParamFilters((prev) => ({ ...prev, [key]: "" }));
      setActiveFilters((prev) => ({ ...prev, [key]: "" }));
    }

    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    const next: Record<string, string> = {};

    filterOptions?.forEach((option) => {
      params.delete(option.key);
      option.items.forEach((item) => {
        if (item.queryKey) params.delete(item.queryKey);
        item.clearKeys?.forEach((k) => params.delete(k));
      });
      next[option.key] = "";
    });

    setParamFilters(next);
    setActiveFilters(next);
    router.push(`?${params.toString()}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("searchTerm");
    router.push(`?${params.toString()}`);
  };

  const activeFilterCount = Object.entries(paramFilters).filter(
    ([, v]) => v !== ""
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-1"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col lg:flex-row gap-2 w-full">
          {/* Search */}
          <div className="relative w-full lg:w-auto flex-1 lg:max-w-xs">
            <SearchFilter
              paramName="searchTerm"
              placeholder={
                searchPlaceholder ? t(`${searchPlaceholder}`) : t("search")
              }
            />
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

          {extraSelectFilter && (
            <div className="w-full lg:w-32">
              <SelectFilter
                paramName={extraSelectFilter.key}
                options={extraSelectFilter.options}
                placeholder={extraSelectFilter.placeholder}
                defaultValue={extraSelectFilter.defaultValue}
                isAllNeeded={extraSelectFilter.isAllNeeded}
              />
            </div>
          )}

          {(refreshButton || true) && (
            <Button
              className="bg-[#DC3173] text-white"
              variant="outline"
              disabled={isPending}
              onClick={handleRefresh}
            >
              {isPending ? (
                <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <>
                  <Loader2 /> <span>Refresh</span>
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {filterOptions && filterOptions.length > 0 && (
            <Button
              variant="outline"
              className={`flex items-center ${showFilters || activeFilterCount > 0
                ? "border-[#DC3173] text-[#DC3173]"
                : ""
                }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t("filters")} {activeFilterCount > 0 ? activeFilterCount : ""}
            </Button>
          )}

          <div className="w-full lg:w-40">
            <SelectFilter
              paramName="sortBy"
              options={sortOptions}
              placeholder={t("sort_by")}
            />
          </div>
        </div>
      </div>

      {/* Active filter badges */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {filterOptions?.map((option, i) => {
          const value = paramFilters[option.key];
          if (!value) return null;

          const label =
            option.items.find((item) => item.value === value)?.label || value;

          return (
            <Badge
              key={i}
              variant="outline"
              className="text-[#DC3173] border-[#DC3173]"
            >
              {label}
              <span>
                <X
                  className="ml-2 h-4 w-4 cursor-pointer"
                  onClick={() => removeFilter(option.key)}
                />
              </span>
            </Badge>
          );
        })}

        {activeFilterCount > 0 && (
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
                {filterOptions?.map((option, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium mb-1">
                      {t(`${option.label}`)}
                    </label>
                    <Select
                      value={activeFilters[option.key] || undefined}
                      onValueChange={(value) =>
                        setActiveFilters((prev) => ({
                          ...prev,
                          [option.key]: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={option.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {option.items.map((item, i2) => (
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