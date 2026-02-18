import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";

const FormSkeleton = ({ fields = 4 }: { fields?: number }) => {
  return (
    <div className="space-y-6 w-full">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2 w-full">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className={`w-full ${i === 2 ? "h-32" : "h-12"}`} />
        </div>
      ))}
      <div className="flex justify-end w-full">
        <SkeletonBase className="h-12 w-40 rounded-lg" />
      </div>
    </div>
  );
};

export default FormSkeleton;
