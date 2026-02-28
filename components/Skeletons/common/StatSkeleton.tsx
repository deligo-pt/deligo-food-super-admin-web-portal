import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";

const StatSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="h-6 w-6 rounded-full" />
          </div>
          <SkeletonBase className="h-8 w-12 mb-2" />
          <SkeletonBase className="h-3 w-32" />
        </div>
      ))}
    </>
  );
};

export default StatSkeleton;
