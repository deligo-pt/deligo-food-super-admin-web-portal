import CardGridSkeleton from "@/components/Skeletons/common/CardGridSkeleton";
import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";
import StatSkeleton from "@/components/Skeletons/common/StatSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <div className="p-6 space-y-8">
      <TitleHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <StatSkeleton count={3} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <StatSkeleton count={2} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        <StatSkeleton count={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="col-span-2 space-y-2 bg-white shadow p-4 rounded-xl">
          <SkeletonBase className="w-36 h-5 rounded mb-4" />
          {["w-1/2", "w-2/3", "w-3/4", "w-1/2", "w-2/3"].map((w, i) => (
            <div key={i}>
              <div className="flex gap-2 justify-between">
                <SkeletonBase className="h-4 w-36 rounded" />
                <SkeletonBase className="h-4 w-16 rounded" />
              </div>
              <div className="w-full bg-slate-100 h-4 rounded mt-1">
                <SkeletonBase className={cn("h-4 rounded", w)} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shadow p-4 rounded-xl space-y-4">
          <SkeletonBase className="w-32 h-5 rounded mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="flex gap-2 justify-between">
                <SkeletonBase className="h-4 w-36 rounded" />
                <SkeletonBase className="h-3 w-16 rounded" />
              </div>
              <div className="flex gap-2 justify-between mt-2">
                <SkeletonBase className="h-3 w-12 rounded" />
                <SkeletonBase className="h-3 w-24 rounded" />
              </div>
            </div>
          ))}
          <SkeletonBase className="w-24 h-4 rounded mt-4 mx-auto" />
        </div>
      </div>

      <CardGridSkeleton />
    </div>
  );
}
