import { type ReactElement, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

const LANGUAGES = [
  { code: "es" as const, flag: "🇲🇽", label: "Español" },
  { code: "en" as const, flag: "🇺🇸", label: "English" },
] as const;

interface LanguageSelectorProps {
  /** Where to position the dropdown relative to the trigger */
  position?: "bottom" | "top";
}

export function LanguageSelector({ position = "bottom" }: LanguageSelectorProps): ReactElement {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(
    (l) => i18n.language === l.code || i18n.language.startsWith(l.code + "-")
  ) ?? LANGUAGES[1];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (code: "es" | "en"): void => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const isTop = position === "top";

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "flex h-8 items-center gap-1 rounded-md px-1.5 transition-all duration-200",
          "text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
          isOpen && "bg-[var(--surface-3)] text-[var(--text-primary)]"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <span className="text-base">{currentLang.flag}</span>
        <svg
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            isOpen && (isTop ? "-rotate-180" : "rotate-180")
          )}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute right-0 z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border shadow-lg",
          "bg-[var(--surface-2)] border-[var(--border-default)]",
          "transition-all duration-200 ease-out",
          isTop ? "bottom-full mb-1" : "top-full mt-1",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : isTop
              ? "pointer-events-none translate-y-2 scale-95 opacity-0"
              : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        )}
        role="listbox"
        aria-label="Select language"
      >
        <div className="py-1">
          {LANGUAGES.map((lang) => {
            const isActive = currentLang.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors duration-150",
                  isActive
                    ? "bg-[var(--accent-muted)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                )}
                role="option"
                aria-selected={isActive}
                type="button"
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1">{lang.label}</span>
                {isActive && (
                  <svg
                    className="h-4 w-4 text-[var(--accent)]"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 8L6.5 11.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}