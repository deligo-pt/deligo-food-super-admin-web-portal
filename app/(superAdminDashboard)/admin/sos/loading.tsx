import CardGridSkeleton from "@/components/Skeletons/common/CardGridSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <TitleHeaderSkeleton />
      <CardGridSkeleton className="grid-cols-1 md:grid-cols-3" count={3} />
    </div>
  );
}
