import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth.store";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/v1/admin";

export const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor: attach Bearer token ──────────────────────────────
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown): Promise<never> => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ────────────────────────────
httpClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<never> => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
