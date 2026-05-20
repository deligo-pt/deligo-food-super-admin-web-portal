import AgreementDetails from '@/components/Dashboard/VendorAgreement/AgreementDetails';
import { getSingleAgreement } from '@/services/dashboard/agreement/agreement.service';
import { notFound } from 'next/navigation';
import React from 'react';

type IParams = {
    params: Promise<{ id: string }>;
};

const AgreementDetailsPage = async ({ params }: IParams) => {
    const { id } = await params;
    const agreement = await getSingleAgreement(id);

    if (!agreement) {
        notFound();
    }

    return (
        <>
            <AgreementDetails agreement={agreement} />
        </>
    );
};

export default AgreementDetailsPage;