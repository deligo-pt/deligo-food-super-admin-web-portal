
export type TCuisine = {
    _id: string;
    name: {
        en: string;
        pt: string;
    };
    slug: string;
    imageUrl?: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
};