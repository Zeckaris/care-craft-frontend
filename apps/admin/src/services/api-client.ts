import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://192.168.22.145:5000/api/",
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})


apiClient.interceptors.request.use((config: any) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});


export const ASSETS_BASE = 'http://192.168.22.145:5000';