import { type ReactElement } from "react";
import { cn } from "@/lib/cn";

// ─── Variants ─────────────────────────────────────────────────────────────────

const BUTTON_VARIANT = {
  DEFAULT:     "default",
  DESTRUCTIVE: "destructive",
  OUTLINE:     "outline",
  GHOST:       "ghost",
} as const;

const BUTTON_SIZE = {
  SM: "sm",
  MD: "md",
  LG: "lg",
  ICON: "icon",
} as const;

type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];
type ButtonSize    = (typeof BUTTON_SIZE)[keyof typeof BUTTON_SIZE];

// ─── Styles ───────────────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]",
  destructive:
    "bg-[var(--danger-bg)] text-[var(--danger-fg)] border border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white",
  outline:
    "border border-[var(--border-default)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:   "h-7  px-3   text-xs  gap-1.5",
  md:   "h-8  px-3.5 text-sm  gap-2",
  lg:   "h-9  px-4   text-sm  gap-2",
  icon: "h-8  w-8    text-sm",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  isLoading?: boolean;
  children:   React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  variant   = BUTTON_VARIANT.DEFAULT,
  size      = BUTTON_SIZE.MD,
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      disabled={disabled ?? isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium",
        "transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="h-3.5 w-3.5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export { BUTTON_VARIANT, BUTTON_SIZE };
export type { ButtonVariant, ButtonSize };
