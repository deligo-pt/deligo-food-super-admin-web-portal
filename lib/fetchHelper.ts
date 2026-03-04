
import { cookies } from "next/headers";

const backendUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

async function serverFetchHelper(
    endPoint: string,
    options: RequestInit
): Promise<Response> {
    const { headers, ...rest } = options;

    const accessToken = (await cookies()).get("accessToken")?.value;

    return fetch(`${backendUrl}${endPoint}`, {
        credentials: "include",
        headers: {
            ...headers,
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        ...rest,
    });
}

export const serverFetch = {
    get: (endPoint: string, options: RequestInit = {}) =>
        serverFetchHelper(endPoint, { method: "GET", ...options }),

    post: (endPoint: string, options: RequestInit = {}) =>
        serverFetchHelper(endPoint, { method: "POST", ...options }),

    put: (endPoint: string, options: RequestInit = {}) =>
        serverFetchHelper(endPoint, { method: "PUT", ...options }),

    patch: (endPoint: string, options: RequestInit = {}) =>
        serverFetchHelper(endPoint, { method: "PATCH", ...options }),

    delete: (endPoint: string, options: RequestInit = {}) =>
        serverFetchHelper(endPoint, { method: "DELETE", ...options }),
};
