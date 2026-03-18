import { type ReactElement } from "react";
import { cn } from "@/lib/cn";

// ─── Variants ─────────────────────────────────────────────────────────────────

const BADGE_VARIANT = {
  DEFAULT:  "default",
  SUCCESS:  "success",
  WARNING:  "warning",
  DANGER:   "danger",
  MUTED:    "muted",
} as const;

type BadgeVariant = (typeof BADGE_VARIANT)[keyof typeof BADGE_VARIANT];

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--accent-muted)]   text-[var(--accent-hover)]",
  success: "bg-[var(--success-bg)]     text-[var(--success-fg)]",
  warning: "bg-[var(--warning-bg)]     text-[var(--warning-fg)]",
  danger:  "bg-[var(--danger-bg)]      text-[var(--danger-fg)]",
  muted:   "bg-[var(--surface-3)]      text-[var(--text-muted)]",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  variant?:  BadgeVariant;
  dot?:      boolean;
  children:  React.ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  variant   = BADGE_VARIANT.DEFAULT,
  dot       = false,
  children,
  className,
}: BadgeProps): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
        "text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { BADGE_VARIANT };
export type { BadgeVariant };
