import PaginationSkeleton from "@/components/Skeletons/common/PaginationSkeleton";
import TablePaginationSkeleton from "@/components/Skeletons/common/TablePaginationSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
       <TablePaginationSkeleton cols={7} />
      <PaginationSkeleton />
    </div>
  );
}