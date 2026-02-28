import FilterSkeleton from "@/components/Skeletons/common/FilterSkeleton";
import PaginationSkeleton from "@/components/Skeletons/common/PaginationSkeleton";
import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";
import StatSkeleton from "@/components/Skeletons/common/StatSkeleton";
import TableSkeleton from "@/components/Skeletons/common/TableSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-8">
      <TitleHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <StatSkeleton count={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="col-span-2 grid grid-cols-7 gap-2 sm:gap-4 md:gap-6 w-full bg-white rounded-xl p-4 items-end">
          <SkeletonBase className="h-20 w-full rounded-lg" />
          <SkeletonBase className="h-32 w-full rounded-lg" />
          <SkeletonBase className="h-10 w-full rounded-lg" />
          <SkeletonBase className="h-80 w-full rounded-lg" />
          <SkeletonBase className="h-52 w-full rounded-lg" />
          <SkeletonBase className="h-42 w-full rounded-lg" />
        </div>
        <div className="space-y-4 bg-white rounded-xl p-4">
          <SkeletonBase className="h-4 w-24 rounded-lg" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex justify-between items-center gap-4"
            >
              <SkeletonBase className="h-4 w-16 rounded-lg" />
              <SkeletonBase className="h-4 w-3 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div>
            <SkeletonBase className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="h-4 w-20" />
          </div>
        </div>

        <FilterSkeleton />

        <div className="space-y-4 bg-white rounded-xl">
          <TableSkeleton rows={10} cols={7} />
        </div>

        <PaginationSkeleton />
      </div>
    </div>
  );
}
