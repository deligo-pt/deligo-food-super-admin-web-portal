import { TMeta } from ".";

export interface IAgreement {
    _id: string;

    // Party reference
    partyId: string;
    partyModel: "FleetManager" | "Vendor" | "DeliveryPartner" | string;
    agreementType: string; // e.g. "INITIAL_FLEET_MANAGER_AGREEMENT"
    agreementVersionId: string;
    versionNumber: number;
    isCurrentForParty: boolean;
    supersededAt: string | null;

    // Party details
    partyLegalName: string;
    email: string;
    contactNumber: string;
    nif: string;
    commercialName: string;
    headOfficeAddress: string;
    zipCode: string;
    country: string;
    partyRepresentativeName: string;
    partyRepresentativeRole: string | null;
    partyIban: string;

    // DeliGo side
    deligoRepresentativeName: string | null;
    deligoRepresentativeRole: string | null;

    // Documents / files
    draftPdfPath: string | null;
    deligoSignaturePath: string | null;
    partySignaturePath: string | null;
    partyStampPath: string | null;
    signedPdfPath: string | null;

    // Signature meta
    partySignatureMethod: "DRAWN" | "UPLOADED" | "TYPED" | string | null;
    partySignatoryType: "SELF" | "REPRESENTATIVE" | string | null;

    // Status & timestamps
    status: "DRAFT" | "EMAILED" | "SIGNED" | "SUPERSEDED" | "CANCELLED" | string;
    posPaymentOption: string | null;
    signedAt: string | null;
    deligoSignedAt: string | null;
    emailedAt: string | null;

    // Created by
    createdBy: {
        _id: string;
        email: string;
        name: {
            firstName: string;
            lastName: string;
        };
    } | null;
    createdByModel: "Admin" | "Vendor" | "FleetManager" | string | null;

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

export interface ICommissionRate {
    _id: string;
    isBaseline: boolean;
    status: string;
    platformPercent: number;
    platformVatRate: number;
    note: string | null;
    agreementVersionId: string;
    createdAt: string;
    agreementVersionNumber: number | null;
    agreementVersionStatus?: string;
    effectiveFrom: string | null;
    isPublished: boolean;
    state: string; // "EFFECTIVE" | "AWAITING_PUBLISH" | ...
}