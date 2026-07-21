import LoginHistoryDetailSkeleton from "@/components/Dashboard/LoginHistory/LoginHistoryDetailsSkeleton";


export default function Loading() {
    return (
        <div className="min-h-screen">
            <LoginHistoryDetailSkeleton />
        </div>
    );
}