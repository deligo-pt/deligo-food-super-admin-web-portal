import { cookies } from "next/headers";
import { getNewAccessToken } from "@/utils/getNewAccessToken";
import { redirect } from "next/navigation";

const backendUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

// CREATE HEADERS
async function createHeaders(
  headers?: HeadersInit
) {

  const cookieStore = await cookies();

  const cookieStr = cookieStore.toString();

  const accessToken =
    cookieStore.get("accessToken")?.value || "";

  return {
    ...headers,

    Authorization: accessToken
      ? `Bearer ${accessToken}`
      : "",

    ...(cookieStr && {
      cookie: cookieStr,
    }),
  };
}

// MAIN FETCH HELPER
async function serverFetchHelper(
  endPoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const { headers, ...rest } = options;

  // FIRST REQUEST
  const response = await fetch(
    `${backendUrl}${endPoint}`,
    {
      credentials: "include",
      headers: await createHeaders(headers),
      ...rest,
      cache: "no-store",
    }
  );
  console.log("fetch response", response);

  if (response.status === 401) {
    console.log("Unauthorized! Redirecting to login...");
    redirect("/?clearSession=true");
  }

  return response;
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