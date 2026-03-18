import { type ReactElement, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

// ─── Sizes ────────────────────────────────────────────────────────────────────

const DIALOG_SIZE = {
  SM: "sm",
  MD: "md",
  LG: "lg",
} as const;

type DialogSize = (typeof DIALOG_SIZE)[keyof typeof DIALOG_SIZE];

const sizeStyles: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface DialogProps {
  open:        boolean;
  onClose:     () => void;
  title:       string;
  description?: string;
  size?:       DialogSize;
  children:    React.ReactNode;
  footer?:     React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Dialog({
  open,
  onClose,
  title,
  description,
  size     = DIALOG_SIZE.MD,
  children,
  footer,
}: DialogProps): ReactElement {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect((): (() => void) => {
    if (!open) return (): void => undefined;

    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return (): void => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect((): (() => void) => {
    if (!open) return (): void => undefined;
    document.body.style.overflow = "hidden";
    return (): void => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return <></>;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === overlayRef.current) onClose();
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      <div
        className={cn(
          "animate-in relative w-full rounded-xl border",
          sizeStyles[size]
        )}
        style={{
          backgroundColor: "var(--surface-2)",
          borderColor:     "var(--border-default)",
        }}
      >
        {/* Top glow */}
        <div
          className="absolute -top-px left-1/2 h-px w-1/2 -translate-x-1/2 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, var(--border-strong), transparent)" }}
        />

        {/* Header */}
        <div
          className="flex items-start justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex flex-col gap-0.5">
            <h2
              className="text-sm font-semibold leading-none"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn(
              "ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
              "transition-colors duration-150",
              "hover:bg-[var(--surface-4)]"
            )}
            style={{ color: "var(--text-muted)" }}
            aria-label="Close dialog"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-2 border-t px-6 py-4"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export { DIALOG_SIZE };
export type { DialogSize };
