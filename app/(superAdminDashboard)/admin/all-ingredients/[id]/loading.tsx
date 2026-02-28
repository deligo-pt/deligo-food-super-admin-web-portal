import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loader() {
  return (
    <div className="p-6 space-y-6">
      <SkeletonBase className="h-4 w-32" />

      <TitleHeaderSkeleton />

      <div className="flex justify-between items-center">
        <SkeletonBase className="h-8 w-64" />
        <div className="flex gap-2">
          <SkeletonBase className="h-10 w-20 rounded-lg" />
          <SkeletonBase className="h-10 w-20 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-gray-100 flex justify-between items-center"
          >
            <div className="space-y-2">
              <SkeletonBase className="h-3 w-20" />
              <SkeletonBase className="h-6 w-24" />
            </div>
            <SkeletonBase className="h-10 w-10 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-100">
          <SkeletonBase className="h-6 w-40 mb-8" />
          <div className="flex gap-8">
            <SkeletonBase className="h-24 w-24 rounded-2xl flex-shrink-0" />
            <div className="flex-1 grid grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonBase className="h-3 w-20" />
                  <SkeletonBase className="h-4 w-32" />
                </div>
              ))}
              <div className="col-span-2 space-y-2 pt-4">
                <SkeletonBase className="h-3 w-24" />
                <SkeletonBase className="h-4 w-full" />
                <SkeletonBase className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-6">
          <SkeletonBase className="h-6 w-40" />
          <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="h-5 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
