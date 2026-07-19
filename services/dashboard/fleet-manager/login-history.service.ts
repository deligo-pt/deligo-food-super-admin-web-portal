import { serverFetch } from "@/lib/fetchHelper";
import { TLoginHistory } from "@/types/login-history.type";
import { catchAsync } from "@/utils/catchAsync";


export const getAllLoginHistory = async (queryString?: string) => {
    let sanitizedQuery = "";

    if (queryString) {
        const params = new URLSearchParams(queryString);
        params.delete("lang");

        const stringifiedParams = params.toString();
        sanitizedQuery = stringifiedParams ? `?${stringifiedParams}` : "";
    }

    const url = `/login-histories${sanitizedQuery}`;

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