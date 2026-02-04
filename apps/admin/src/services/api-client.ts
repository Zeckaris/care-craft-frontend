import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const ASSETS_BASE = import.meta.env.VITE_ASSETS_BASE;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use((config: any) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});
