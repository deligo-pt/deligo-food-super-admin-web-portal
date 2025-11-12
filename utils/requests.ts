import axios, { AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchData = async <T>(
  url: string,
  config?: AxiosRequestConfig
) => {
  const response = await api.get<T>(url, { ...config, withCredentials: true });
  return response.data;
};

export const postData = async <T>(
  url: string,
  data: T,
  config?: AxiosRequestConfig
) => {
  const response = await api.post<T>(url, data, {
    ...config,
    withCredentials: true,
  });
  return response.data;
};

export const updateData = async <T>(
  url: string,
  data: T,
  config?: AxiosRequestConfig
) => {
  const response = await api.patch<T>(url, data, {
    ...config,
    withCredentials: true,
  });
  return response.data;
};

export const deleteData = async <T>(
  url: string,
  config?: AxiosRequestConfig
) => {
  const response = await api.delete<T>(url, {
    ...config,
    withCredentials: true,
  });
  return response.data;
};
