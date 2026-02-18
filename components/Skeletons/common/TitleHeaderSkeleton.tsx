import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";

const TitleHeaderSkeleton = () => {
  return (
    <div className="animate-pulse h-24 w-full bg-[#DC3173] rounded-xl p-4 space-y-3">
      <SkeletonBase className="h-6 w-24 rounded" />
      <SkeletonBase className="h-6 w-full md:w-48" />
    </div>
  );
};

export default TitleHeaderSkeleton;
