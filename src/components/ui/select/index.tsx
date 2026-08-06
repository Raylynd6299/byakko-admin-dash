import { type ReactElement, type KeyboardEvent, useState, useRef, useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { matchesText } from "@/lib/text-search";

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
  // Optional, defaults to false — every existing call site stays as-is.
  // Adds a filter input inside the panel (A7). Arrow/Enter/Escape
  // navigation applies in BOTH modes, unconditionally.
  searchable?: boolean;
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
  searchable = false,
}: SelectProps<T>): ReactElement {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);
  const optionElements = useRef<Map<number, HTMLButtonElement>>(new Map());

  const rawId = useId();
  const listboxId = `select-${rawId}-listbox`;

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = searchable
    ? options.filter((o) => matchesText(filterText, o.label))
    : options;

  // The active index resets to 0 on every filter change, so Enter can
  // never select a row that has scrolled out of the (filtered) results.
  // Set directly from the input's onChange (below) rather than in a
  // useEffect keyed on filterText — deriving it there would cascade an
  // extra render on every keystroke for state that is fully computable
  // at the point of the change.
  const handleFilterChange = (nextFilterText: string): void => {
    setFilterText(nextFilterText);
    setActiveIndex(0);
  };

  // Close on click outside — also clears the filter so a reopened panel
  // starts from every eligible option again.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilterText("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus the filter input when a searchable panel opens.
  useEffect(() => {
    if (isOpen && searchable) {
      filterInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  // Keep the active option in view within the existing max-h-60 list.
  useEffect(() => {
    if (!isOpen) return;
    optionElements.current.get(activeIndex)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const openPanel = (): void => {
    if (disabled) return;
    const selectedIndex = filteredOptions.findIndex((o) => o.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const closeAndFocusTrigger = (): void => {
    setIsOpen(false);
    setFilterText("");
    triggerRef.current?.focus();
  };

  const handleSelect = (option: SelectOption<T>): void => {
    onChange(option.value);
    closeAndFocusTrigger();
  };

  const moveActive = (delta: number): void => {
    if (filteredOptions.length === 0) return;
    setActiveIndex((prev) => (prev + delta + filteredOptions.length) % filteredOptions.length);
  };

  // Arrow/Enter/Escape navigation is unconditional (A7) — it was missing
  // from every render site before this change. Handled at the container
  // level so it applies whether focus is on the trigger (non-searchable)
  // or the filter input (searchable); printable characters are left
  // alone so they still reach the filter input's onChange normally.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) openPanel();
        else moveActive(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) openPanel();
        else moveActive(-1);
        break;
      case "Enter":
        if (!isOpen) {
          e.preventDefault();
          openPanel();
        } else {
          const option = filteredOptions[activeIndex];
          if (option) {
            e.preventDefault();
            handleSelect(option);
          }
        }
        break;
      case "Escape":
        if (isOpen) {
          e.preventDefault();
          closeAndFocusTrigger();
        }
        break;
      case "Tab":
        if (isOpen) {
          setIsOpen(false);
          setFilterText("");
        }
        break;
      default:
        break;
    }
  };

  const activeOptionId =
    searchable && filteredOptions[activeIndex] ? `${listboxId}-opt-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className={cn("relative", className)} onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (disabled) return;
          if (isOpen) closeAndFocusTrigger();
          else openPanel();
        }}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={searchable ? listboxId : undefined}
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
          "absolute left-0 top-full z-50 mt-1 min-w-full w-max max-w-xs overflow-hidden rounded-lg border shadow-lg",
          "bg-[var(--surface-2)] border-[var(--border-default)]",
          "transition-all duration-200 ease-out",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        )}
        role="listbox"
        id={searchable ? listboxId : undefined}
        aria-label={ariaLabel}
      >
        {searchable && isOpen && (
          <div
            className="border-b px-2 py-1.5"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <input
              ref={filterInputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={isOpen}
              aria-activedescendant={activeOptionId}
              value={filterText}
              onChange={(e) => handleFilterChange(e.target.value)}
              placeholder={t("common.search")}
              aria-label={ariaLabel}
              className={cn(
                "w-full rounded-md border px-2 py-1 text-sm outline-none",
                "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)]",
                "focus:border-[var(--border-focus)]"
              )}
            />
          </div>
        )}

        <div className="max-h-60 overflow-auto py-1">
          {searchable && filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {t("common.noResults")}
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = value === option.value;
              const isActive = index === activeIndex;
              return (
                <button
                  key={String(option.value)}
                  ref={(el) => {
                    if (el) optionElements.current.set(index, el);
                    else optionElements.current.delete(index);
                  }}
                  id={searchable ? `${listboxId}-opt-${index}` : undefined}
                  type="button"
                  tabIndex={searchable ? -1 : undefined}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors duration-150",
                    isSelected
                      ? "bg-[var(--accent-muted)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
                    isActive && !isSelected && "bg-[var(--surface-3)] text-[var(--text-primary)]"
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
