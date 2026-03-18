import { type ReactElement } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore, THEME } from "@/stores/theme.store";
import { cn } from "@/lib/cn";

export function ThemeToggle(): ReactElement {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === THEME.DARK;

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150",
        "text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
      )}
    >
      {isDark ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
    </button>
  );
}
