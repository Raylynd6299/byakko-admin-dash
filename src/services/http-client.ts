import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { refreshTokens } from "@/services/auth.service";

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

// ─── Silent token renewal state ────────────────────────────────────────────
// Evitamos múltiples llamadas simultáneas a /refresh cuando varios requests
// fallan con 401 al mismo tiempo. Los requests que llegan mientras se está
// renovando se encolan y se resuelven/rechazan juntos al terminar.

let isRefreshing = false;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let pendingQueue: QueueEntry[] = [];

function flushQueue(error: unknown, token: string | null): void {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || token === null) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
}

function forceLogout(): void {
  useAuthStore.getState().logout();
  window.location.href = "/login";
}

// ─── Response interceptor: silent renewal on 401 ──────────────────────────
httpClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosResponse> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Solo intentamos renovar en 401 y si no es un retry ya en curso
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const storedRefreshToken = useAuthStore.getState().refreshToken;

    // Sin refresh token → logout directo
    if (!storedRefreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    // Si ya hay un refresh en curso, encolamos este request
    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        pendingQueue.push({
          resolve: (newAccessToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(httpClient(originalRequest));
          },
          reject,
        });
      });
    }

    // Somos el primero → iniciamos el refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newTokens = await refreshTokens(storedRefreshToken);
      useAuthStore.getState().setTokens(newTokens);

      // Actualizamos el header del request original con el nuevo token
      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

      // Desbloqueamos la cola con el nuevo access token
      flushQueue(null, newTokens.accessToken);

      return httpClient(originalRequest);
    } catch (refreshError) {
      // El refresh falló (token expirado o revocado) → logout
      flushQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
