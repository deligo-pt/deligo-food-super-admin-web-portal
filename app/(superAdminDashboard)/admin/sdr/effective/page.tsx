import EffectiveSdrDeposit from '@/components/Dashboard/Sdr/EffectiveSdrDeposit';
import { getAllEffectiveSdrDeposits } from '@/services/dashboard/sdr-deposits/sdr-deposits.service';
import React from 'react';

const EffectiveSdrDepositPage = async () => {
    const { data } = await getAllEffectiveSdrDeposits();

    return (
        <div>
            <EffectiveSdrDeposit sdr={data} />
        </div>
    );
};

export default EffectiveSdrDepositPage;