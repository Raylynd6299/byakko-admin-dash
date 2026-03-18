import { type ReactElement } from "react";

export function StatCardSkeleton(): ReactElement {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--border-default)" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="h-4 w-24 animate-pulse rounded"
          style={{ backgroundColor: "var(--surface-3)" }}
        />
        <div
          className="h-8 w-8 animate-pulse rounded-lg"
          style={{ backgroundColor: "var(--surface-3)" }}
        />
      </div>
      <div
        className="mt-4 h-8 w-16 animate-pulse rounded"
        style={{ backgroundColor: "var(--surface-3)" }}
      />
    </div>
  );
}