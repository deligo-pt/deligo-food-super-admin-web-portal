
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