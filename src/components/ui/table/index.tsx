import { type ReactElement } from "react";
import { cn } from "@/lib/cn";

// ─── Root ─────────────────────────────────────────────────────────────────────

interface TableProps {
  children:   React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps): ReactElement {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full border-collapse text-sm", className)}
      >
        {children}
      </table>
    </div>
  );
}

// ─── Head ─────────────────────────────────────────────────────────────────────

interface TableHeadProps {
  children:   React.ReactNode;
  className?: string;
}

export function TableHead({ children, className }: TableHeadProps): ReactElement {
  return (
    <thead className={cn("border-b border-subtle", className)}>
      {children}
    </thead>
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────

interface TableBodyProps {
  children:   React.ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps): ReactElement {
  return (
    <tbody className={cn(className)}>
      {children}
    </tbody>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface TableRowProps {
  children:   React.ReactNode;
  className?: string;
  onClick?:   () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps): ReactElement {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors duration-100",
        onClick && "cursor-pointer hover:bg-[var(--surface-3)]",
        className
      )}
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      {children}
    </tr>
  );
}

// ─── Header cell ──────────────────────────────────────────────────────────────

interface TableThProps {
  children?:  React.ReactNode;
  className?: string;
  align?:     "left" | "right" | "center";
}

export function TableTh({ children, className, align = "left" }: TableThProps): ReactElement {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-xs font-medium uppercase tracking-wider",
        className
      )}
      style={{
        color:     "var(--text-muted)",
        textAlign: align ?? "left",
      }}
    >
      {children}
    </th>
  );
}

// ─── Data cell ────────────────────────────────────────────────────────────────

interface TableTdProps {
  children?:  React.ReactNode;
  className?: string;
  align?:     "left" | "right" | "center";
  mono?:      boolean;
}

export function TableTd({
  children,
  className,
  align = "left",
  mono  = false,
}: TableTdProps): ReactElement {
  return (
    <td
      className={cn(
        "px-4 py-3",
        align === "right"  && "text-right",
        align === "center" && "text-center",
        mono && "mono text-xs",
        className
      )}
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </td>
  );
}
