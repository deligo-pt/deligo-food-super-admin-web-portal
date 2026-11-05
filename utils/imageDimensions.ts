// src/utils/imageDimensions.ts
export const MIN_SQUARE_SIZE = 256;

export const getImageDimensions = (file: File) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
            URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Unable to read image"));
        };

        img.src = objectUrl;
    });

/** Returns an error message, or null when the image is a valid square of at least `min` px. */
export const validateSquareImage = async (
    file: File,
    min: number = MIN_SQUARE_SIZE
): Promise<string | null> => {
    try {
        const { width, height } = await getImageDimensions(file);

        if (width !== height) {
            return `Image must be square (1:1). Yours is ${width}×${height}px.`;
        }
        if (width < min) {
            return `Image must be at least ${min}×${min}px. Yours is ${width}×${height}px.`;
        }
        return null;
    } catch {
        return "Could not read the image file.";
    }
};