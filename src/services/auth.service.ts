import axios from "axios";
import type { AdminTokens } from "@/types/auth.types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/v1/admin";

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

// ─── Raw axios instance (sin interceptores) para llamadas de auth ──────────
// Usamos un cliente limpio para evitar que el interceptor 401 del httpClient
// atrape el propio request de refresh y genere un loop infinito.
const authClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export async function refreshTokens(refreshToken: string): Promise<AdminTokens> {
  const { data } = await authClient.post<RefreshResponse>("/refresh", {
    refresh_token: refreshToken,
  });

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}
