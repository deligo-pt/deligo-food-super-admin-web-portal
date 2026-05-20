"use client";


export default function AgreementDetailsLoading() {
    return (
        <div className="space-y-6 max-w-full animate-pulse">

            {/* 1. Header Banner Loading State */}
            <div className="bg-slate-200 h-35 md:h-29 w-full rounded-lg mb-6 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex gap-3 w-full lg:w-auto">
                    {/* Back Button Circle */}
                    <div className="w-8 h-8 bg-slate-300 rounded-full shrink-0 mt-1" />

                    {/* Title & Subtitle lines */}
                    <div className="space-y-2 w-48 md:w-64">
                        <div className="h-7 bg-slate-300 rounded-md w-full" />
                        <div className="h-4 bg-slate-300/60 rounded-md w-3/4" />
                    </div>
                </div>

                {/* Top Right Header Action Button */}
                <div className="h-10 bg-slate-300 rounded-lg w-36 shrink-0 hidden lg:block" />
            </div>

            {/* 2. Analytics Card Grid Skeleton Loading State */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className="bg-white shadow-xs border border-slate-100 rounded-2xl p-6 flex items-center justify-between"
                    >
                        {/* Left Content Column */}
                        <div className="space-y-3 w-1/2">
                            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                            <div className="h-6 bg-slate-300 rounded-md w-full" />
                            <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                        </div>

                        {/* Right Side Rounded Icon Box */}
                        <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                    </div>
                ))}
            </div>

            {/* 3. Secure PDF View Framework Container Wrapper */}
            <div className="bg-slate-900 rounded-2xl p-3 md:p-4 border border-slate-800 mt-6">
                <div className="bg-slate-800 rounded-xl relative min-h-125 h-[75vh] w-full flex flex-col items-center justify-center p-4 space-y-4">

                    {/* Spinner graphic effect to simulate embedded content validation */}
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#DC3173] border-t-transparent rounded-full animate-spin" />
                    </div>

                    <div className="space-y-2 text-center w-full max-w-xs">
                        <div className="h-4 bg-slate-700 rounded-md w-2/3 mx-auto" />
                        <div className="h-3 bg-slate-700/50 rounded-md w-1/2 mx-auto" />
                    </div>

                </div>
            </div>

        </div>
    );
}