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


// agreement version
export type Clause = {
    clauseNumber: number;
    clauseTitle: string;
    bodyHtml: string;
    forcePageBreakBefore?: boolean;
    showPosPaymentWidget?: boolean;
};

export type AgreementPart = {
    partTitle?: string;
    clauses: Clause[];
};

export interface IAgreementVersion {
    _id: string;
    agreementType: "INITIAL_VENDOR_AGREEMENT" | "INITIAL_FLEET_MANAGER_AGREEMENT";
    versionNumber: number | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;
    isCurrent: boolean;
    parts: AgreementPart[];
    documentTitle: string;
    effectiveFrom: string | null;
    createdBy: {
        email: string;
        name: {
            firstName: string;
            lastName: string;
        },
        _id: string;
    };
    publishedBy: {
        email: string;
        name: {
            firstName: string;
            lastName: string;
        },
        _id: string;
    } | null;
    publishedAt: string | null;
    archivedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export interface IAgreementVersionResponse {
    data: IAgreementVersion[];
    meta: TMeta;
}