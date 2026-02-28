import FormSkeleton from "@/components/Skeletons/common/FormSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loading() {
  return (
    <div className="p-6">
      <TitleHeaderSkeleton />

      <div className="bg-white p-4 rounded-xl shadow-xl my-6">
        <FormSkeleton fields={5} />
      </div>
    </div>
  );
}
