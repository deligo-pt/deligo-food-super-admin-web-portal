import ActivityLogDetails from '@/components/Dashboard/ActivityLogs/ActivityLogDetails';
import { getSingleActivityLog } from '@/services/dashboard/activity-logs/activity-logs.service';
import React from 'react';

interface IProps {
    params: Promise<{ id: string }>
}

const ActivityLogDetailsPage = async ({ params }: IProps) => {
    const { id } = await params;
    const log = await getSingleActivityLog(id);

    return (
        <div>
            <ActivityLogDetails log={log} />
        </div>
    );
};

export default ActivityLogDetailsPage;