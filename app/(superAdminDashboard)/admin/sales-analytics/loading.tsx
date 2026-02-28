import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";
import StatSkeleton from "@/components/Skeletons/common/StatSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-8">
      <TitleHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <StatSkeleton count={3} />
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-4 md:gap-6 w-full bg-white rounded-xl p-4 items-end">
        <SkeletonBase className="h-20 w-full rounded-lg" />
        <SkeletonBase className="h-32 w-full rounded-lg" />
        <SkeletonBase className="h-10 w-full rounded-lg" />
        <SkeletonBase className="h-80 w-full rounded-lg" />
        <SkeletonBase className="h-52 w-full rounded-lg" />
        <SkeletonBase className="h-42 w-full rounded-lg" />
        <SkeletonBase className="h-32 w-full rounded-lg" />
      </div>

      <div className="space-y-4 bg-white p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          <StatSkeleton count={4} />
        </div>
      </div>
    </div>
  );
}
