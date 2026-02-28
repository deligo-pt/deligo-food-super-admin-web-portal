import FormSkeleton from "@/components/Skeletons/common/FormSkeleton";
import StatSkeleton from "@/components/Skeletons/common/StatSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-8">
      <TitleHeaderSkeleton />

      <div className="w-full">
        <StatSkeleton count={1} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {Array.from({ length: 7 }).map((_, i) => (
          <FormSkeleton key={i} fields={4} />
        ))}
      </div>
    </div>
  );
}
