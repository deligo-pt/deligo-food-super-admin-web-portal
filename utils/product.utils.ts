
export function getProductImageUrl(product: {
    image?: string;
    images?: string[];
}): string {
    if (typeof product.image === "string" && product.image.trim()) {
        return product.image.trim();
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
        const first = product.images.find((u) => typeof u === "string" && u.trim());
        if (first) return first.trim();
    }
    return ""; // caller shows placeholder when empty
}

/** All image URLs for gallery (deduped, non-empty) */
export function getProductImageUrls(product: {
    image?: string;
    images?: string[];
}): string[] {
    const urls: string[] = [];

    if (typeof product.image === "string" && product.image.trim()) {
        urls.push(product.image.trim());
    }

    if (Array.isArray(product.images)) {
        for (const u of product.images) {
            if (typeof u === "string" && u.trim() && !urls.includes(u.trim())) {
                urls.push(u.trim());
            }
        }
    }

    return urls;
}