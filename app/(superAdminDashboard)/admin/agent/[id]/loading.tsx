import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";

export default function Loader() {
  return (
    <div className="p-6 space-y-6">
      <SkeletonBase className="h-10 w-24 mb-4" />

      <div className="w-full bg-[#DC3173] rounded-2xl p-8 flex items-center gap-6 opacity-90">
        <SkeletonBase className="h-20 w-20 rounded-2xl bg-white/20" />
        <div className="space-y-3 flex-1">
          <SkeletonBase className="h-6 w-48 bg-white/20" />
          <SkeletonBase className="h-4 w-64 bg-white/20" />
        </div>
        <SkeletonBase className="h-8 w-24 rounded-full bg-white/20" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden"
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-50">
              <div className="flex items-center gap-3">
                <SkeletonBase className="h-5 w-5 rounded-md" />
                <SkeletonBase className="h-4 w-32" />
              </div>
              <SkeletonBase className="h-4 w-4 rounded-full" />
            </div>

            {i === 1 && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <SkeletonBase className="h-3 w-20" />
                    <SkeletonBase className="h-4 w-32" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
