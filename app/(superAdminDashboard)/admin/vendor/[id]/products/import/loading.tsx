import FormSkeleton from "@/components/Skeletons/common/FormSkeleton";
import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";

export default function Loading() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="animate-pulse h-24 w-full bg-[#DC3173] p-4 space-y-3">
          <SkeletonBase className="h-6 w-24 rounded" />
          <SkeletonBase className="h-6 w-full md:w-48" />
        </div>
        <div className="md:flex gap-6 h-full p-4">
          <div className="h-full w-full md:w-64 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBase className="h-6 w-6 rounded" />
                <SkeletonBase className="h-6 w-full" />
              </div>
            ))}
          </div>
          <div className="py-0 flex-1 my-6 md:my-0">
            <FormSkeleton fields={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
