import { create } from "zustand";
import { persist } from "zustand/middleware";

const THEME = {
  DARK: "dark",
  LIGHT: "light",
} as const;

type Theme = (typeof THEME)[keyof typeof THEME];

interface ThemeState {
  theme: Theme;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: THEME.DARK,

      setTheme: (theme: Theme): void => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: (): void => {
        const next = get().theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: "byakko-admin-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);

export { THEME };
export type { Theme };
