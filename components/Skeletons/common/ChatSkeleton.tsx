import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";

export default function ChatSkeleton() {
  return (
    <div className="flex h-screen w-full gap-6 p-6">
      <div className="w-1/4 min-w-[300px] bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <SkeletonBase className="h-6 w-20" />
            <SkeletonBase className="h-3 w-32" />
          </div>
          <SkeletonBase className="h-10 w-10 rounded-full" />
        </div>

        <SkeletonBase className="h-10 w-full rounded-xl" />

        <div className="space-y-6 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <SkeletonBase className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <SkeletonBase className="h-4 w-24" />
                  <SkeletonBase className="h-3 w-12" />
                </div>
                <SkeletonBase className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SkeletonBase className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <SkeletonBase className="h-4 w-32" />
              <SkeletonBase className="h-3 w-16" />
            </div>
          </div>
          <SkeletonBase className="h-6 w-1 rounded-full" />
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 max-w-[70%]">
              <SkeletonBase className="h-3 w-40 mb-1" />
              <SkeletonBase className="h-16 w-full rounded-xl rounded-tl-none" />
            </div>
          ))}

          <div className="flex flex-col items-end space-y-4">
            <SkeletonBase className="h-14 w-24 rounded-xl rounded-tr-none" />
            <SkeletonBase className="h-14 w-32 rounded-xl rounded-tr-none" />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <SkeletonBase className="h-10 w-10 rounded-full" />
              <SkeletonBase className="h-10 w-10 rounded-full" />
              <SkeletonBase className="h-10 w-10 rounded-full" />
            </div>
            <SkeletonBase className="h-14 flex-1 rounded-xl" />
            <SkeletonBase className="h-12 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
