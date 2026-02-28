import FormSkeleton from "@/components/Skeletons/common/FormSkeleton";
import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loader() {
  return (
    <div className="p-6 space-y-6">
      <TitleHeaderSkeleton />

      <div className="bg-white rounded-xl p-6 shadow-xl border space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <SkeletonBase className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <SkeletonBase className="w-16 h-4" />
            <SkeletonBase className="w-24 h-4" />
          </div>
        </div>

        <FormSkeleton fields={5} />
      </div>
    </div>
  );
}
