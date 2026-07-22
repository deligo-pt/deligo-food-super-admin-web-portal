import { serverFetch } from "@/lib/fetchHelper";
import { ActivityLogResponse } from "@/types/activity-logs.type";
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