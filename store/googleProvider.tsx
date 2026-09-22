// store/googleProvider.tsx  (or wherever it lives)
"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

export function GoogleMapsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        // This prevents the crash and shows a clear message in the console
        console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing");
        return <>{children}</>;
    }

    return (
        <APIProvider
            apiKey={apiKey}
            libraries={["drawing", "geometry", "marker"]} // important
            onLoad={() => console.log("Google Maps loaded")}
            onError={(e) => console.error("Google Maps error", e)}
        >
            {children}
        </APIProvider>
    );
}