import CardGridSkeleton from "@/components/Skeletons/common/CardGridSkeleton";
import TitleHeaderSkeleton from "@/components/Skeletons/common/TitleHeaderSkeleton";

export default function Loading() {
    return (
        <div className="p-6 space-y-6">
            <TitleHeaderSkeleton />
            <CardGridSkeleton count={12} />
        </div>
    );
}
