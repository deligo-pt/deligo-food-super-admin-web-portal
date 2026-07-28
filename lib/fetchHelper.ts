import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const backendUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

async function createHeaders(
  lang: string,
  headers?: HeadersInit
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value || "";
  const cookieStr = cookieStore.toString();

  return {
    ...headers,
    "Accept-Language": lang,
    ...(accessToken && {
      Authorization: `Bearer ${accessToken}`,
    }),

    ...(cookieStr && {
      cookie: cookieStr,
    }),
  };
}

async function serverFetchHelper(
  endPoint: string,
  options: RequestInit = {},
): Promise<Response> {
  let activeLang: string = "en";

  try {
    const targetUrlParams = new URLSearchParams(endPoint.split("?")[1]);
    if (targetUrlParams.has("lang")) {
      activeLang = targetUrlParams.get("lang") || "en";
    } else {
      const headersList = await headers();
      const referer = headersList.get("referer");

      if (referer) {
        const refererUrl = new URL(referer);
        const langQuery = refererUrl.searchParams.get("lang");
        if (langQuery === "en" || langQuery === "pt") {
          activeLang = langQuery;
        }
      }
    }
  } catch (e) {
    console.error("Failed to parse language query inside serverFetch, defaulting to 'en'", e);
  }

  try {
    const { headers, ...rest } = options;

    const response = await fetch(
      `${backendUrl}${endPoint}`,
      {
        ...rest,
        credentials: "include",
        headers: await createHeaders(activeLang, headers),
      }
    );

    if (response.status === 401) {
      console.log("Unauthorized! Redirecting to login...");
      redirect("/?clearSession=true");
    }

    return response;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error(
      "Server Fetch Helper Error:",
      error
    );

    throw error;
  }
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