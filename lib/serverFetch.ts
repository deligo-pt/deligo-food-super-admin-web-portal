import axios, { AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

const backendUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: backendUrl,
});

const serverRequestHelper = async (
  url: string,
  options?: AxiosRequestConfig,
) => {
  const cookieStore = await cookies();

  const cookieStr = cookieStore.toString();
  const accessToken = cookieStore.get("accessToken")?.value || "";

  return axiosInstance({
    url,
    ...options,
    headers: {
      ...(options?.headers || {}),
      ...(accessToken && {
        authorization: `Bearer ${accessToken}`,
      }),
      ...(cookieStr && {
        cookie: cookieStr,
      }),
    },
  }).then((res) => res.data);
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
