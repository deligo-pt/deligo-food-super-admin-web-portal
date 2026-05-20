export interface IAgreement {
    _id: string;
    establishmentName: string;
    email: string;
    contactNumber: string;
    nif: string;
    isEmailVerified: boolean;
    emailVerifiedAt: string;
    draftPdfPath: string;
    signaturePath: string;
    signedPdfPath: string;
    status: 'draft' | 'emailed' | 'signed' | string;
    signedAt?: string;
    emailedAt?: string;
    vendor?: string | null;
    createdBy?: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
}