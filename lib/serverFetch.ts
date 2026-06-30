import axios, {
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const backendUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: backendUrl,
});

const createHeaders = async (
  lang: string,
  options?: AxiosRequestConfig
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value || "";
  const cookieStr = cookieStore.toString();


  return {
    ...(options?.headers || {}),
    "Accept-Language": lang,
    ...(accessToken && {
      authorization: `Bearer ${accessToken}`,
    }),

    ...(cookieStr && {
      cookie: cookieStr,
    }),
  };
};

const serverRequestHelper = async (
  url: string,
  options?: AxiosRequestConfig,
) => {

  let activeLang = "en";

  try {
    const targetUrlParams = new URLSearchParams(url.split("?")[1]);
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
    console.error("Failed to parse language query, defaulting to 'en'", e);
  }

  try {
    const response = await axiosInstance({
      url,
      ...options,
      headers: await createHeaders(activeLang, options),
    });

    return response.data;

  } catch (error) {

    if (isRedirectError(error)) {
      throw error;
    }

    const err = error as AxiosError;

    if (err.response?.status === 401) {
      console.log("Unauthorized! Redirecting to login...");

      redirect('/?clearSession=true');
    }


    throw error;
  }

}

export const serverRequest = {
  get: (url: string, options: AxiosRequestConfig = {}) =>
    serverRequestHelper(url, { ...options, method: "GET" }),

  post: (url: string, options: AxiosRequestConfig = {}) =>
    serverRequestHelper(url, { ...options, method: "POST" }),

  patch: (url: string, options: AxiosRequestConfig = {}) =>
    serverRequestHelper(url, { ...options, method: "PATCH" }),

  delete: (url: string, options: AxiosRequestConfig = {}) =>
    serverRequestHelper(url, { ...options, method: "DELETE" }),
};