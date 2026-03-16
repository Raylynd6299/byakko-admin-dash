import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminProfile, AdminTokens } from "@/types/auth.types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  profile: AdminProfile | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (tokens: AdminTokens, profile: AdminProfile) => void;
  logout: () => void;
  setTokens: (tokens: AdminTokens) => void;
}

type AuthStore = AuthState & AuthActions;

const INITIAL_STATE: AuthState = {
  accessToken: null,
  refreshToken: null,
  profile: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      login: (tokens: AdminTokens, profile: AdminProfile): void => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          profile,
          isAuthenticated: true,
        });
      },

      logout: (): void => {
        set(INITIAL_STATE);
      },

      setTokens: (tokens: AdminTokens): void => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      },
    }),
    {
      name: "byakko-admin-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
