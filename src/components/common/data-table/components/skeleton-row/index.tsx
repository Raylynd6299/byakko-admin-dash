import { type ReactElement } from "react";
import { TableRow } from "@/components/ui/table";
import { TableTd } from "@/components/ui/table";

interface SkeletonRowProps {
  columns: number;
}

export function SkeletonRow({ columns }: SkeletonRowProps): ReactElement {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, i) => (
        <TableTd key={i}>
          <div
            className="h-4 animate-pulse rounded"
            style={{
              backgroundColor: "var(--surface-3)",
              width: i === 0 ? "60%" : i === columns - 1 ? "40%" : "75%",
            }}
          />
        </TableTd>
      ))}
    </TableRow>
  );
}