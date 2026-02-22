import CardGridSkeleton from "@/components/Skeletons/common/CardGridSkeleton";
import StatSkeleton from "@/components/Skeletons/common/StatSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-8">
      <TitleHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <StatSkeleton count={3} />
      </div>

      <CardGridSkeleton count={12} className="grid-cols-1 md:grid-cols-3" />
    </div>
  );
}
