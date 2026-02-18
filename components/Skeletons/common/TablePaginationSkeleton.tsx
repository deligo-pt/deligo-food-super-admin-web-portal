import FilterSkeleton from "@/components/Skeletons/common/FilterSkeleton";
import PaginationSkeleton from "@/components/Skeletons/common/PaginationSkeleton";
import TableSkeleton from "@/components/Skeletons/common/TableSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function TablePaginationSkeleton({
  rows = 10,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="p-6 space-y-6">
      <TitleHeaderSkeleton />

      <FilterSkeleton />

      <div className="space-y-4 bg-white rounded-xl">
        <TableSkeleton rows={rows} cols={cols} />
      </div>

      <PaginationSkeleton />
    </div>
  );
}
