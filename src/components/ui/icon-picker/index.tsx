import { type ReactElement, type KeyboardEvent, useState, useRef, useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { iconNames } from "lucide-react/dynamic";
import { cn } from "@/lib/cn";
import { matchesText } from "@/lib/text-search";
import { PermissionIcon } from "@/components/ui/permission-icon";

// ─── Windowing ────────────────────────────────────────────────────────────────
// A11 rejects a virtualization dependency (R1: no new runtime deps in
// frontend PRs). A fixed-column grid + a "show more" slice bounds the
// number of live `DynamicIcon` instances without one (design.md §16.2).
const GRID_COLUMNS = 8;
const PAGE_SIZE = 64; // 8 rows at GRID_COLUMNS width

// ─── Props ────────────────────────────────────────────────────────────────────

interface IconPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A purpose-built visual grid over the 1951 installed lucide names (A11) —
 * deliberately NOT the PR2 searchable `Select`, whose 1-D vertical listbox
 * of text labels is the wrong affordance for icons recognised visually in
 * 2D (design.md §16.2). Reuses `matchesText` (§10) for filtering so icon
 * search cannot drift from the two existing search surfaces.
 */
export function IconPicker({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
}: IconPickerProps): ReactElement {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);
  const cellElements = useRef<Map<number, HTMLButtonElement>>(new Map());

  const rawId = useId();
  const gridId = `icon-picker-${rawId}-grid`;

  // No memoization: measured at ~0.5ms for a 1951-item filter pass over
  // this exact predicate (R4 — measure, don't memoise defensively), well
  // under a frame budget on every keystroke.
  const filteredNames = filterText ? iconNames.filter((name) => matchesText(filterText, name)) : iconNames;
  const visibleNames = filteredNames.slice(0, visibleCount);
  const hasMore = filteredNames.length > visibleNames.length;

  // Active index resets to 0 and the window resets to the first page on
  // every filter change, mirroring Select's rule (§9) — Enter can never
  // select a row scrolled out of the (re-filtered, re-paged) results.
  const handleFilterChange = (nextFilterText: string): void => {
    setFilterText(nextFilterText);
    setVisibleCount(PAGE_SIZE);
    setActiveIndex(0);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilterText("");
        setVisibleCount(PAGE_SIZE);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) filterInputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    cellElements.current.get(activeIndex)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const openPanel = (): void => {
    if (disabled) return;
    setActiveIndex(0);
    setIsOpen(true);
  };

  const closeAndFocusTrigger = (): void => {
    setIsOpen(false);
    setFilterText("");
    setVisibleCount(PAGE_SIZE);
    triggerRef.current?.focus();
  };

  const handleSelect = (name: string): void => {
    onChange(name);
    closeAndFocusTrigger();
  };

  const handleClear = (): void => {
    onChange(null);
    closeAndFocusTrigger();
  };

  // 2-D navigation (A11 — the reason a purpose-built grid exists instead
  // of reusing Select's 1-D ArrowUp/ArrowDown model). Boundaries clamp
  // rather than wrap: wrapping in two dimensions has no unambiguous
  // meaning at a grid edge.
  const moveActive = (delta: number): void => {
    if (visibleNames.length === 0) return;
    setActiveIndex((prev) => Math.min(Math.max(prev + delta, 0), visibleNames.length - 1));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        if (!isOpen) openPanel();
        else moveActive(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (!isOpen) openPanel();
        else moveActive(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) openPanel();
        else moveActive(GRID_COLUMNS);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) openPanel();
        else moveActive(-GRID_COLUMNS);
        break;
      case "Enter":
        if (!isOpen) {
          e.preventDefault();
          openPanel();
        } else {
          const name = visibleNames[activeIndex];
          if (name) {
            e.preventDefault();
            handleSelect(name);
          }
        }
        break;
      case "Escape":
        if (isOpen) {
          e.preventDefault();
          closeAndFocusTrigger();
        }
        break;
      default:
        break;
    }
  };

  const activeCellId = visibleNames[activeIndex] ? `${gridId}-cell-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger */}
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
        aria-controls={gridId}
        aria-label={ariaLabel ?? t("permissions.icon")}
        className={cn(
          "flex h-8 items-center gap-2 rounded-md border px-3 text-sm transition-all duration-200",
          "bg-[var(--input-bg)] border-[var(--input-border)]",
          "text-[var(--text-primary)]",
          !disabled && "hover:border-[var(--border-focus)]",
          disabled && "cursor-not-allowed opacity-50",
          isOpen && "border-[var(--border-focus)]"
        )}
      >
        <PermissionIcon name={value} size={16} />
        <span className="flex-1 truncate text-left">
          {value ?? t("permissions.iconNone")}
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

      {/* Panel */}
      <div
        className={cn(
          "absolute left-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-lg border shadow-lg",
          "bg-[var(--surface-2)] border-[var(--border-default)]",
          "transition-all duration-200 ease-out",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        )}
      >
        {isOpen && (
          <div
            className="flex items-center gap-2 border-b px-2 py-1.5"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <input
              ref={filterInputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-controls={gridId}
              aria-expanded={isOpen}
              aria-activedescendant={activeCellId}
              value={filterText}
              onChange={(e) => handleFilterChange(e.target.value)}
              placeholder={t("permissions.iconSearchPlaceholder")}
              aria-label={t("permissions.iconSearchPlaceholder")}
              className={cn(
                "w-full rounded-md border px-2 py-1 text-sm outline-none",
                "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)]",
                "focus:border-[var(--border-focus)]"
              )}
            />
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 rounded-md px-2 py-1 text-xs whitespace-nowrap hover:bg-[var(--surface-3)]"
              style={{ color: "var(--text-muted)" }}
            >
              {t("permissions.iconClear")}
            </button>
          </div>
        )}

        {isOpen && visibleNames.length === 0 && (
          <div className="px-3 py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            {t("permissions.iconNoResults")}
          </div>
        )}
        {isOpen && visibleNames.length > 0 && (
          <div className="max-h-72 overflow-auto p-2">
            <div
              id={gridId}
              role="listbox"
              aria-label={t("permissions.iconPickerTitle")}
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))` }}
            >
              {visibleNames.map((name, index) => {
                const isSelected = value === name;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={name}
                    ref={(el) => {
                      if (el) cellElements.current.set(index, el);
                      else cellElements.current.delete(index);
                    }}
                    id={`${gridId}-cell-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    title={name}
                    onClick={() => handleSelect(name)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md transition-colors duration-150",
                      isSelected
                        ? "bg-[var(--accent-muted)]"
                        : "hover:bg-[var(--surface-3)]",
                      isActive && !isSelected && "bg-[var(--surface-3)]"
                    )}
                  >
                    <PermissionIcon name={name} size={18} />
                  </button>
                );
              })}
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="mt-2 w-full rounded-md py-1.5 text-center text-xs hover:bg-[var(--surface-3)]"
                style={{ color: "var(--text-muted)" }}
              >
                {t("permissions.iconShowMore", { count: filteredNames.length - visibleNames.length })}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
