import { type ReactElement } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableTh,
  TableTd,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SkeletonRow } from "./components/skeleton-row";
import type { LucideIcon } from "lucide-react";

// ─── Column definition ────────────────────────────────────────────────────────

export interface Column<TRow> {
  key:        string;
  header:     string;
  align?:     "left" | "right" | "center";
  mono?:      boolean;
  width?:     string;
  render:     (row: TRow) => React.ReactNode;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DataTableProps<TRow> {
  data:           TRow[];
  columns:        Column<TRow>[];
  keyExtractor:   (row: TRow) => string;
  isLoading?:     boolean;
  isError?:       boolean;
  onRetry?:       () => void;
  onRowClick?:    (row: TRow) => void;
  emptyTitle?:    string;
  emptyMessage?:  string;
  emptyIcon?:     LucideIcon;
  emptyAction?:   React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<TRow>({
  data,
  columns,
  keyExtractor,
  isLoading    = false,
  isError      = false,
  onRetry,
  onRowClick,
  emptyTitle,
  emptyMessage,
  emptyIcon,
  emptyAction,
}: DataTableProps<TRow>): ReactElement {
  return (
    <div
      className="rounded-xl border"
      style={{
        backgroundColor: "var(--surface-1)",
        borderColor:     "var(--border-default)",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableTh key={col.key} align={col.align} className={col.width}>
                {col.header}
              </TableTh>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} columns={columns.length} />
            ))
          ) : isError ? (
            <tr>
              <td colSpan={columns.length}>
                <ErrorState onRetry={onRetry} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  title={emptyTitle}
                  message={emptyMessage}
                  icon={emptyIcon}
                  action={emptyAction}
                />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                onClick={onRowClick ? (): void => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TableTd key={col.key} align={col.align} mono={col.mono}>
                    {col.render(row)}
                  </TableTd>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
