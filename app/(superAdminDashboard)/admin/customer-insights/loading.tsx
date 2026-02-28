import StatSkeleton from "@/components/Skeletons/common/StatSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-8">
      <TitleHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        <StatSkeleton count={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <StatSkeleton count={3} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <StatSkeleton count={1} />
        <StatSkeleton count={1} />
      </div>

      <StatSkeleton count={1} />
    </div>
  );
}
