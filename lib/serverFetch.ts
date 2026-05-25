import axios, {
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import { cookies } from "next/headers";
import { getNewAccessToken } from "@/utils/getNewAccessToken";

const backendUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: backendUrl,
});

const createHeaders = async (
  options?: AxiosRequestConfig
) => {

  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get("accessToken")?.value || "";

  const cookieStr = cookieStore.toString();

  return {
    ...(options?.headers || {}),

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

  try {
    // FIRST REQUEST
    const response = await axiosInstance({
      url,
      ...options,
      headers: await createHeaders(options),
    });

    return response.data;

  } catch (error) {

    const err = error as AxiosError;

    // ACCESS TOKEN EXPIRED
    if (err.response?.status === 401) {

      const refreshed =
        await getNewAccessToken();

      // refresh failed
      if (!refreshed) {
        throw error;
      }

      // RETRY REQUEST
      const retryResponse = await axiosInstance({
        url,
        ...options,
        headers: await createHeaders(options),
      });

      return retryResponse.data;
    }

    throw error;
  }
};

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