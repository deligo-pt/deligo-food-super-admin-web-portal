
export function toGeoJsonPolygon(
    path: google.maps.LatLngLiteral[] | google.maps.LatLng[]
) {
    const coords = path.map((p) => {
        const latValue = p.lat;
        const lngValue = p.lng;
        const lat = typeof latValue === "function" ? latValue() : latValue;
        const lng = typeof lngValue === "function" ? lngValue() : lngValue;
        return [lng, lat];
    });

    // close the ring if needed
    if (
        coords.length > 0 &&
        (coords[0][0] !== coords[coords.length - 1][0] ||
            coords[0][1] !== coords[coords.length - 1][1])
    ) {
        coords.push([...coords[0]]);
    }

    return {
        type: "Polygon" as const,
        coordinates: [coords],
    };
}


export function generateZoneId(name: string): string {
    const base = name
        .trim()
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base}-Zone`;
}

/** Build a closed polygon from a Google LatLngBounds (viewport) */
export function boundsToPath(
    bounds: google.maps.LatLngBounds
): google.maps.LatLngLiteral[] {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    return [
        { lat: sw.lat(), lng: sw.lng() },
        { lat: sw.lat(), lng: ne.lng() },
        { lat: ne.lat(), lng: ne.lng() },
        { lat: ne.lat(), lng: sw.lng() },
        { lat: sw.lat(), lng: sw.lng() }, // close ring
    ];
}

/** Convert GeoJSON coordinates [lng, lat][] → Google LatLngLiteral[] */
export function geoJsonToPath(
    coordinates: number[][][]
): google.maps.LatLngLiteral[] {
    const ring = coordinates[0] || [];
    return ring.map(([lng, lat]) => ({ lat, lng }));
}