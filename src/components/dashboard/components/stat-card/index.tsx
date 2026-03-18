import { type ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatCardSkeleton } from "./components/skeleton";

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:      string;
  value:      number | string;
  icon:       LucideIcon;
  isLoading?: boolean;
  trend?:     "up" | "down" | "neutral";
  href?:      string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon: Icon,
  isLoading = false,
  trend,
}: StatCardProps): ReactElement {
  if (isLoading) return <StatCardSkeleton />;

  return (
    <div
      className={cn(
        "group rounded-xl border p-5 transition-colors duration-150",
        "hover:border-[var(--border-strong)]"
      )}
      style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--border-default)" }}
    >
      <div className="flex items-start justify-between">
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150"
          style={{ backgroundColor: "var(--surface-3)" }}
        >
          <Icon
            size={15}
            strokeWidth={1.5}
            style={{ color: "var(--text-muted)" }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <p
          className="text-3xl font-semibold leading-none tracking-tight tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {trend && (
          <span
            className="mb-0.5 text-xs font-medium"
            style={{
              color:
                trend === "up"      ? "var(--success-fg)" :
                trend === "down"    ? "var(--danger-fg)"  :
                                      "var(--text-muted)",
            }}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
          </span>
        )}
      </div>
    </div>
  );
}
