"use client";

import SearchFilter from "@/components/Filtering/SearchFilter";
import SelectFilter from "@/components/Filtering/SelectFilter";
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

interface IProps {
  sortOptions: { label: string; value: string }[];
  filterOptions: {
    label: string;
    key: string;
    placeholder: string;
    type: string;
    items: { label: string; value: string }[];
  }[];
}

export default function AllFilters({ sortOptions, filterOptions }: IProps) {
  const searchParams = useSearchParams();
  const oldFilters = filterOptions.reduce((acc, option) => {
    acc[option.key] = searchParams.get(option.key) || "";
    return acc;
  }, {} as Record<string, string>);
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] =
    useState<Record<string, string>>(oldFilters);
  const [paramFilters, setParamFilters] = useState(oldFilters);

  const handleAddFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        setParamFilters((prevFilters) => ({
          ...prevFilters,
          [key]: value,
        }));
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`);
    setShowFilters(false);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    setParamFilters((prevFilters) => ({
      ...prevFilters,
      [key]: "",
    }));
    params.delete(key);
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    filterOptions.forEach((option) => {
      setParamFilters((prevFilters) => ({
        ...prevFilters,
        [option.key]: "",
      }));
      params.delete(option.key);
    });
    router.push(`?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-1"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start md:items-center justify-between">
        <SearchFilter paramName="searchTerm" placeholder="Searching..." />
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="w-full lg:w-48">
            <SelectFilter
              paramName="sortBy"
              options={sortOptions}
              placeholder="Sort By"
            />
          </div>
          <Button
            variant="outline"
            className={`flex items-center ${
              showFilters ||
              Object.entries(paramFilters)?.filter((filter) => filter[1] !== "")
                ?.length > 0
                ? "border-[#DC3173] text-[#DC3173]"
                : ""
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters{" "}
            {Object.entries(paramFilters)?.filter((filter) => filter[1] !== "")
              ?.length || ""}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {filterOptions.map((option, i) =>
          paramFilters[option.key].length > 0 ? (
            <Badge
              key={i}
              variant="outline"
              className="text-[#DC3173] border-[#DC3173]"
            >
              {paramFilters[option.key]}
              <X
                className="ml-2 h-4 w-4"
                onClick={() => removeFilter(option.key)}
              />
            </Badge>
          ) : (
            ""
          )
        )}
        {Object.entries(paramFilters)?.filter((filter) => filter[1] !== "")
          ?.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-sm text-[#DC3173] hover:text-[#DC3173] hover:bg-pink-50"
          >
            <RefreshCcw className="h-3 w-3 mr-1" /> Clear All
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
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
                        setActiveFilters((prevFilters) => ({
                          ...prevFilters,
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
                  Cancel
                </Button>
                <Button
                  className="mr-2 bg-[#DC3173] hover:bg-[#DC3173]/90 text-white"
                  onClick={handleAddFilter}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
