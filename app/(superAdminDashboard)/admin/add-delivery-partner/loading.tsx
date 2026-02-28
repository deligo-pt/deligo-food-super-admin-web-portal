import FormSkeleton from "@/components/Skeletons/common/FormSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loader() {
  return (
    <div className="p-6 space-y-6">
      <TitleHeaderSkeleton />

      <div className="flex flex-col md:flex-row gap-6 w-full">
        {[
          [4, 5, 3],
          [3, 6, 2],
        ].map((section, i) => (
          <div key={i} className="space-y-6 w-full">
            {section.map((fields, j) => (
              <div
                key={j}
                className="bg-white rounded-xl p-6 shadow-xl border border-[#DC3173]/20"
              >
                <FormSkeleton fields={fields} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
