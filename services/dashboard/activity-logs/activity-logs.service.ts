import { serverFetch } from "@/lib/fetchHelper";
import { ActivityLogResponse, IActivityLog } from "@/types/activity-logs.type";
import { catchAsync } from "@/utils/catchAsync";


export const getAllActivityLogs = async (queryString?: string) => {
    const url = `/activity-logs${queryString ? `?${queryString}` : ""}`;

    const result = await catchAsync<ActivityLogResponse>(async () => {
        const res = await serverFetch.get(url, {
            next: {
                tags: ["activity-logs"],
                revalidate: 30,
            },
        });
        return await res.json();
    });

    return result;
};


export const getSingleActivityLog = async (id: string) => {
    const url = `/activity-logs/${id}`;

    const result = await catchAsync<IActivityLog>(async () => {
        const res = await serverFetch.get(url, {
            next: {
                tags: ["activity-logs"],
                revalidate: 30,
            },
        });
        return await res.json();
    });

    return result?.data;
};