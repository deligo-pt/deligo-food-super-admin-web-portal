import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loader() {
  return (
    <div className="p-6 space-y-6">
      <SkeletonBase className="h-4 w-32" />

      <TitleHeaderSkeleton />

      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <SkeletonBase className="h-8 w-48" />
            <SkeletonBase className="h-6 w-16 rounded-full" />
          </div>
          <SkeletonBase className="h-4 w-32" />
        </div>
        <div className="flex gap-3">
          <SkeletonBase className="h-10 w-24 rounded-lg" />
          <SkeletonBase className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
            <SkeletonBase className="h-6 w-32 mb-6" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between py-2">
                <SkeletonBase className="h-4 w-1/3" />
                <SkeletonBase className="h-4 w-12" />
                <SkeletonBase className="h-4 w-12" />
                <SkeletonBase className="h-4 w-12" />
              </div>
            ))}
            <div className="pt-4 border-t flex justify-between">
              <SkeletonBase className="h-6 w-16" />
              <SkeletonBase className="h-6 w-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-6">
            <SkeletonBase className="h-6 w-36" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <SkeletonBase className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="space-y-2">
                  <SkeletonBase className="h-4 w-32" />
                  <SkeletonBase className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-6">
            <SkeletonBase className="h-6 w-32" />
            <div className="flex items-center gap-3">
              <SkeletonBase className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <SkeletonBase className="h-4 w-32" />
                <SkeletonBase className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-4 pt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBase className="h-5 w-5 rounded-md" />
                  <SkeletonBase className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
