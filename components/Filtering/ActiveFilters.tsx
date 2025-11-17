import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, X } from "lucide-react";

export default function ActiveFilters({
  activeFilters,
  removeFilter,
  clearAllFilters,
}: {
  activeFilters: { label: string; value: string }[];
  removeFilter: (key: string) => void;
  clearAllFilters: () => void;
}) {
  return (
    <div>
      {activeFilters?.filter((filter) => filter.value !== "")?.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter, i) => (
            <Badge
              key={i}
              variant="outline"
              className="text-[#DC3173] border-[#DC3173]"
            >
              {filter.value}
              <X
                className="ml-2 h-4 w-4"
                onClick={() => removeFilter(filter.label)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-sm text-[#DC3173] hover:text-[#DC3173] hover:bg-pink-50"
          >
            <RefreshCcw className="h-3 w-3 mr-1" /> Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
