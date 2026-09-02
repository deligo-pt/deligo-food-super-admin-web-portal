import { TMeta } from ".";

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

export interface IAgreementVersion {
    _id: string;
    agreementType: string;
    versionNumber: number | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;
    isCurrent: boolean;
    parts: {
        partTitle: string;
        clauses: Record<string, string>[];
    }[];
    documentTitle: string;
    effectiveFrom: string | null;
    createdBy: string;
    publishedBy: string | null;
    publishedAt: string | null;
    archivedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export interface IAgreementVersionResponse {
    data: IAgreementVersion[];
    meta: TMeta;
}