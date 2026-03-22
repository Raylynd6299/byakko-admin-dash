import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Shield, Folder, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { PermissionActions } from "@/components/permissions/components/permission-actions";
import type { Permission } from "@/types/permission.types";
import type { Category } from "@/types/category.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PermissionGroup {
  category:    Category | null;
  permissions: Permission[];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PermissionTreeViewProps {
  permissions: Permission[];
  categories:  Category[];
  isLoading:   boolean;
  isError:     boolean;
  onRetry:     () => void;
  onCreateClick: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildGroups(permissions: Permission[], categories: Category[]): PermissionGroup[] {
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // Group by categoryId
  const grouped = new Map<string | null, Permission[]>();
  for (const perm of permissions) {
    const key = perm.categoryId ?? null;
    const existing = grouped.get(key);
    if (existing) {
      existing.push(perm);
    } else {
      grouped.set(key, [perm]);
    }
  }

  // Build result — sort by category path (nulls last)
  const groups: PermissionGroup[] = [];
  for (const [categoryId, perms] of grouped.entries()) {
    const cat = categoryId ? (categoryMap.get(categoryId) ?? null) : null;
    // Sort permissions within group alphabetically
    const sorted = [...perms].sort((a, b) => a.action.localeCompare(b.action));
    groups.push({ category: cat, permissions: sorted });
  }

  return groups.sort((a, b) => {
    if (!a.category) return 1;
    if (!b.category) return -1;
    return a.category.path.localeCompare(b.category.path);
  });
}

// ─── Category Group ───────────────────────────────────────────────────────────

interface CategoryGroupProps {
  group:            PermissionGroup;
  defaultExpanded?: boolean;
}

function CategoryGroup({ group, defaultExpanded = true }: CategoryGroupProps): ReactElement {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const { t } = useTranslation();

  const categoryLabel = group.category
    ? group.category.path.replace(/\./g, " / ")
    : t("permissions.uncategorized");

  return (
    <div className="mb-1">
      {/* Category header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2",
          "text-left text-xs font-semibold uppercase tracking-wider",
          "transition-colors duration-100 hover:bg-[var(--surface-3)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
        )}
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronRight
          size={13}
          strokeWidth={2}
          className={cn("shrink-0 transition-transform duration-150", expanded && "rotate-90")}
        />
        <Folder size={13} strokeWidth={1.5} className="shrink-0" />
        <span className="truncate">{categoryLabel}</span>
        <span
          className="ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-normal"
          style={{
            backgroundColor: "var(--surface-3)",
            color:           "var(--text-muted)",
          }}
        >
          {group.permissions.length}
        </span>
      </button>

      {/* Permission rows */}
      {expanded && (
        <div
          className="ml-4 border-l"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {group.permissions.map((perm) => (
            <div
              key={perm.id}
              className={cn(
                "flex items-center gap-3 px-4 py-2",
                "border-b last:border-b-0",
                "hover:bg-[var(--surface-2)] transition-colors duration-75"
              )}
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {/* Action */}
              <span
                className="min-w-0 flex-1 font-mono text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {perm.action}
              </span>

              {/* Description */}
              <div
                className="hidden flex-[2] truncate text-sm sm:block"
                style={{ color: perm.description ? "var(--text-secondary)" : "var(--text-muted)" }}
              >
                {perm.description ?? "—"}
              </div>

              {/* Actions */}
              <div className="ml-auto shrink-0">
                <PermissionActions permission={perm} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function TreeSkeleton(): ReactElement {
  return (
    <div className="space-y-3 p-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-1">
          <div
            className="h-7 w-48 animate-pulse rounded-md"
            style={{ backgroundColor: "var(--surface-3)" }}
          />
          <div className="ml-6 space-y-1">
            {[1, 2].map((j) => (
              <div
                key={j}
                className="h-8 animate-pulse rounded"
                style={{ backgroundColor: "var(--surface-2)" }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PermissionTreeView({
  permissions,
  categories,
  isLoading,
  isError,
  onRetry,
  onCreateClick,
}: PermissionTreeViewProps): ReactElement {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div
        className="overflow-hidden rounded-xl border"
        style={{
          borderColor:     "var(--border-subtle)",
          backgroundColor: "var(--surface-1)",
        }}
      >
        <TreeSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex items-center justify-between rounded-xl border px-4 py-3"
        style={{
          borderColor:     "var(--border-subtle)",
          backgroundColor: "var(--surface-1)",
        }}
      >
        <span className="text-sm" style={{ color: "var(--danger-fg)" }}>
          {t("errorState.description")}
        </span>
        <button
          type="button"
          onClick={onRetry}
          className="text-xs underline"
          style={{ color: "var(--text-muted)" }}
        >
          {t("common.tryAgain")}
        </button>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div
        className="rounded-xl border"
        style={{
          borderColor:     "var(--border-subtle)",
          backgroundColor: "var(--surface-1)",
        }}
      >
        <EmptyState
          icon={Shield}
          title={t("permissions.noPermissions")}
          message={t("permissions.createFirst")}
          action={
            <Button size="sm" onClick={onCreateClick}>
              <Plus size={14} strokeWidth={2} />
              {t("permissions.newPermission")}
            </Button>
          }
        />
      </div>
    );
  }

  const groups = buildGroups(permissions, categories);

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        borderColor:     "var(--border-subtle)",
        backgroundColor: "var(--surface-1)",
      }}
    >
      {/* Table header */}
      <div
        className="grid grid-cols-[1fr_2fr_3rem] border-b px-4 py-2"
        style={{
          borderColor:     "var(--border-subtle)",
          backgroundColor: "var(--surface-2)",
        }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {t("permissions.action")}
        </span>
        <span
          className="hidden text-xs font-semibold uppercase tracking-wider sm:block"
          style={{ color: "var(--text-muted)" }}
        >
          {t("permissions.description")}
        </span>
        <span />
      </div>

      {/* Groups */}
      <div className="p-2">
        {groups.map((group) => (
          <CategoryGroup
            key={group.category?.id ?? "__uncategorized__"}
            group={group}
            defaultExpanded
          />
        ))}
      </div>
    </div>
  );
}
