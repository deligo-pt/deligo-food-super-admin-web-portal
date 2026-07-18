import { serverFetch } from "@/lib/fetchHelper";
import { TLoginHistory } from "@/types/login-history.type";
import { catchAsync } from "@/utils/catchAsync";


export const getAllLoginHistory = async (queryString?: string) => {
    const url = `/login-histories${queryString ? `?${queryString}` : ""}`;

    const result = await catchAsync<TLoginHistory[]>(async () => {
        const res = await serverFetch.get(url, {
            next: {
                tags: ["login-history-list"],
                revalidate: 30,
            },
        });
        return await res.json();
    });

    return result;
};