import { ReactElement } from "react";
import { cn } from "@/lib/cn";

// ─── Props ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:       string;
  error?:       string;
  hint?:        string;
  leftIcon?:    React.ReactNode;
  rightIcon?:   React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  id,
  className,
  ...props
}: InputProps): ReactElement {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          >
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          className={cn(
            "w-full rounded-md border text-sm outline-none",
            "transition-colors duration-150",
            "placeholder:text-[var(--text-muted)]",
            "focus:border-[var(--border-focus)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon  ? "pl-9" : "pl-3",
            rightIcon ? "pr-9" : "pr-3",
            "py-2",
            hasError
              ? "border-[var(--danger)] bg-[var(--danger-bg)] text-[var(--text-primary)]"
              : "border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:bg-[var(--input-focus-bg)]",
            className
          )}
          {...props}
        />

        {rightIcon && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs" style={{ color: "var(--danger-fg)" }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
