import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");

  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }

  return config;
});

// let isRedirecting = false;

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error?.response?.status;

//     if (status === 401 && !isRedirecting) {
//       isRedirecting = true;

//       Cookies.remove("accessToken");
//       Cookies.remove("refreshToken");

//       window.location.href = "/login?sessionExpired=true";
//     }

//     return Promise.reject(error);
//   },
// );

export const fetchData = async <T>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  const response = await api.get<T>(url, config);
  return response.data;
};

export const postData = async <T>(
  url: string,
  data: T,
  config?: AxiosRequestConfig,
) => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};

export const updateData = async <T>(
  url: string,
  data: T,
  config?: AxiosRequestConfig,
) => {
  const response = await api.patch<T>(url, data, config);
  return response.data;
};

export const deleteData = async <T>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  const response = await api.delete<T>(url, config);
  return response.data;
};
