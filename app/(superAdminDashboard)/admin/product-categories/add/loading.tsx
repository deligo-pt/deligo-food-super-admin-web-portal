import FormSkeleton from "@/components/Skeletons/common/FormSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loader() {
  return (
    <div className="p-6 space-y-6">
      <TitleHeaderSkeleton />

      <FormSkeleton fields={4} />
    </div>
  );
}
