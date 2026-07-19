import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";

const LoginHistoryDetailSkeleton = () => {
    return (
        <div className="space-y-6">

            {/* Top Back Link + Header Banner Skeleton */}
            <div className="flex flex-col gap-2">
                <SkeletonBase className="h-4 w-36 rounded-md" />
                <div className="rounded-xl bg-linear-to-r from-rose-400 to-rose-500 p-8 space-y-3 opacity-40 animate-pulse">
                    <SkeletonBase className="h-8 w-64 bg-white/40" />
                    <SkeletonBase className="h-4 w-96 bg-white/30" />
                </div>
            </div>

            {/* Core Layout Grid Layout matching the view */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Context Skeleton Card Column (Left/Span 2) */}
                <div className="md:col-span-2 space-y-6">

                    {/* Identity Authentication Card Skeleton */}
                    <div className="rounded-xl border border-rose-100 bg-white p-6 space-y-5 shadow-xs">
                        <SkeletonBase className="h-5 w-44 rounded-md" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2"><SkeletonBase className="h-3 w-20" /><SkeletonBase className="h-4 w-48" /></div>
                            <div className="space-y-2"><SkeletonBase className="h-3 w-16" /><SkeletonBase className="h-5 w-40" /></div>
                            <div className="space-y-2"><SkeletonBase className="h-3 w-24" /><SkeletonBase className="h-5 w-24 rounded-full" /></div>
                            <div className="space-y-2"><SkeletonBase className="h-3 w-20" /><SkeletonBase className="h-4 w-32" /></div>
                        </div>
                    </div>

                    {/* Network Location Card Skeleton */}
                    <div className="rounded-xl border border-rose-100 bg-white p-6 space-y-5 shadow-xs">
                        <SkeletonBase className="h-5 w-36 rounded-md" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2"><SkeletonBase className="h-3 w-20" /><SkeletonBase className="h-4 w-36" /></div>
                            <div className="space-y-2"><SkeletonBase className="h-3 w-32" /><SkeletonBase className="h-4 w-40" /></div>
                        </div>
                    </div>

                    {/* Raw User Agent Box Skeleton */}
                    <div className="rounded-xl border border-rose-100 bg-white p-6 space-y-4 shadow-xs">
                        <SkeletonBase className="h-5 w-32 rounded-md" />
                        <SkeletonBase className="h-16 w-full rounded-lg" />
                    </div>

                </div>

                {/* Side Panels Column (Right/Span 1) */}
                <div className="space-y-6">

                    {/* Status & Timing Sidebar Widget Skeleton */}
                    <div className="rounded-xl border border-rose-100 bg-white p-6 space-y-6 shadow-xs">
                        <div className="space-y-2">
                            <SkeletonBase className="h-3 w-24" />
                            <SkeletonBase className="h-6 w-36 rounded-full" />
                        </div>
                        <div className="border-t border-rose-50 pt-4 space-y-2">
                            <SkeletonBase className="h-3 w-28" />
                            <SkeletonBase className="h-4 w-44" />
                        </div>
                        <div className="border-t border-rose-50 pt-4 space-y-2">
                            <SkeletonBase className="h-3 w-24" />
                            <SkeletonBase className="h-4 w-12" />
                        </div>
                    </div>

                    {/* Environment Parameters Sidebar Skeleton */}
                    <div className="rounded-xl border border-rose-100 bg-white p-6 space-y-5 shadow-xs">
                        <SkeletonBase className="h-5 w-28 rounded-md" />
                        <div className="space-y-4 pt-1">
                            <div className="space-y-2"><SkeletonBase className="h-3 w-20" /><SkeletonBase className="h-4 w-28" /></div>
                            <div className="border-t border-rose-50 pt-3 space-y-2"><SkeletonBase className="h-3 w-16" /><SkeletonBase className="h-4 w-24" /></div>
                            <div className="border-t border-rose-50 pt-3 space-y-2"><SkeletonBase className="h-3 w-28" /><SkeletonBase className="h-4 w-24" /></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LoginHistoryDetailSkeleton;