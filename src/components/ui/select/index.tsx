import { type ReactElement, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

// ─── Option type ───────────────────────────────────────────────────────────────

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface SelectProps<T = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  "aria-label"?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Select<T = string>({
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled = false,
  className,
  buttonClassName,
  "aria-label": ariaLabel,
}: SelectProps<T>): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

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

  const handleSelect = (option: SelectOption<T>): void => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((v) => !v)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          "flex h-8 items-center gap-2 rounded-md border px-3 text-sm transition-all duration-200",
          "bg-[var(--input-bg)] border-[var(--input-border)]",
          "text-[var(--text-primary)]",
          !disabled && "hover:border-[var(--border-focus)]",
          disabled && "cursor-not-allowed opacity-50",
          isOpen && "border-[var(--border-focus)]",
          buttonClassName
        )}
      >
        {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
        <span className="flex-1 truncate text-left">
          {selectedOption?.label ?? placeholder}
        </span>
        <svg
          className={cn(
            "h-3 w-3 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
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
          "absolute left-0 top-full z-50 mt-1 min-w-full overflow-hidden rounded-lg border shadow-lg",
          "bg-[var(--surface-2)] border-[var(--border-default)]",
          "transition-all duration-200 ease-out",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        )}
        role="listbox"
        aria-label={ariaLabel}
      >
        <div className="max-h-60 overflow-auto py-1">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors duration-150",
                  isSelected
                    ? "bg-[var(--accent-muted)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                )}
                role="option"
                aria-selected={isSelected}
              >
                {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                <span className="flex-1 truncate">{option.label}</span>
                {isSelected && (
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-[var(--accent)]"
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