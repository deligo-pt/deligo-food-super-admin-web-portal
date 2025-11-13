import { TVendor } from "@/types/user.type";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

export default function SortIndicator({
  column,
  sort,
}: {
  column: keyof TVendor;
  sort: string;
}) {
  if (!sort.includes(column)) {
    return <ChevronsUpDown className="ml-1 h-4 w-4" />;
  }
  return sort === column ? (
    <ChevronUp className="ml-1 h-4 w-4 text-white" />
  ) : (
    <ChevronDown className="ml-1 h-4 w-4 text-white" />
  );
}
