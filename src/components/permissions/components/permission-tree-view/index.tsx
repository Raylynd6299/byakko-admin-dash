import { type ReactElement, type CSSProperties, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type Announcements,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, Shield, Folder, Plus, SearchX, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { matchesText } from "@/lib/text-search";
import { resolveAnchor } from "@/lib/reorder";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { PermissionIcon } from "@/components/ui/permission-icon";
import { PermissionActions } from "@/components/permissions/components/permission-actions";
import { useReorderPermission } from "@/hooks/mutations/usePermissionMutations";
import type { Permission } from "@/types/permission.types";
import type { Category } from "@/types/category.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PermissionGroup {
  category:    Category | null;
  permissions: Permission[];
}

const UNCATEGORIZED_KEY = "__uncategorized__";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PermissionTreeViewProps {
  permissions:      Permission[];
  categories:       Category[];
  isLoading:        boolean;
  isError:          boolean;
  onRetry:          () => void;
  onCreateClick:    () => void;
  query:            string;
  onClearQuery:     () => void;
  collapsedIds:     ReadonlySet<string>;
  onToggleCollapse: (categoryId: string) => void;
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
    // Permissions within a group keep the server's persisted order
    // (sort_order, action) — never re-sorted here.
    groups.push({ category: cat, permissions: perms });
  }

  return groups.sort((a, b) => {
    if (!a.category) return 1;
    if (!b.category) return -1;
    return a.category.path.localeCompare(b.category.path);
  });
}

/**
 * Filters groups by the Permisos search predicate. A group stays visible
 * when its own category name/path matches, OR when at least one of its
 * permissions matches on action/description. When it matches only through
 * its permissions, only those permissions are listed; when it matches on
 * its own name/path, all of its permissions are listed. This never
 * re-sorts — persisted order survives filtering.
 */
function filterGroups(groups: PermissionGroup[], query: string): PermissionGroup[] {
  const filtered: PermissionGroup[] = [];
  for (const group of groups) {
    const categoryMatches = matchesText(query, group.category?.name, group.category?.path);
    const visiblePermissions = categoryMatches
      ? group.permissions
      : group.permissions.filter((p) => matchesText(query, p.action, p.description));

    if (categoryMatches || visiblePermissions.length > 0) {
      filtered.push({ category: group.category, permissions: visiblePermissions });
    }
  }
  return filtered;
}

function groupKey(category: Category | null): string {
  return category?.id ?? UNCATEGORIZED_KEY;
}

// ─── Permission Row (sortable) ──────────────────────────────────────────────────

interface PermissionRowProps {
  permission:  Permission;
  isFirst:     boolean;
  isLast:      boolean;
  isFiltering: boolean;
  onMoveUp:    () => void;
  onMoveDown:  () => void;
}

/**
 * A single draggable + keyboard-sortable permission row. The drag handle
 * wires dnd-kit's pointer/keyboard sensors; the move up/down buttons are
 * the touch and non-pointer accessible fallback — both call the SAME
 * `resolveAnchor` math (see `handleMove`/`handleDragEnd` below), so they
 * can never disagree about where a permission lands.
 */
function PermissionRow({
  permission,
  isFirst,
  isLast,
  isFiltering,
  onMoveUp,
  onMoveDown,
}: PermissionRowProps): ReactElement {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id:       permission.id,
    disabled: isFiltering,
  });

  const style: CSSProperties = {
    borderColor: "var(--border-subtle)",
    transform:   CSS.Transform.toString(transform),
    transition,
    opacity:     isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-4 py-2",
        "border-b last:border-b-0",
        "hover:bg-[var(--surface-2)] transition-colors duration-75"
      )}
    >
      {/* Drag handle — pointer + keyboard sensor activator */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-disabled={isFiltering}
        aria-label={t("permissions.reorder.dragHandle", { action: permission.action })}
        title={
          isFiltering
            ? t("permissions.reorder.disabledWhileFiltering")
            : t("permissions.reorder.dragHandle", { action: permission.action })
        }
        className={cn(
          "shrink-0 touch-none rounded p-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]",
          isFiltering ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"
        )}
        style={{ color: "var(--text-muted)" }}
      >
        <GripVertical size={13} strokeWidth={1.5} />
      </button>

      {/* Move up/down — the keyboard + touch fallback. Same resolveAnchor
          call as drag (see handleMove), so they can never disagree. */}
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst || isFiltering}
          aria-label={t("permissions.reorder.moveUp", { action: permission.action })}
          title={t("permissions.reorder.moveUp", { action: permission.action })}
          className="rounded p-0.5 hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-30"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowUp size={11} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast || isFiltering}
          aria-label={t("permissions.reorder.moveDown", { action: permission.action })}
          title={t("permissions.reorder.moveDown", { action: permission.action })}
          className="rounded p-0.5 hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-30"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowDown size={11} strokeWidth={2} />
        </button>
      </div>

      {/* Icon — decorative only. It never wires pointer/drag listeners, so
          it cannot steal the 5px PointerSensor activation from the drag
          handle above; the action text remains the row's accessible name. */}
      <PermissionIcon name={permission.icon} size={14} />

      {/* Action */}
      <span
        className="min-w-0 flex-1 font-mono text-sm"
        style={{ color: "var(--text-primary)" }}
      >
        {permission.action}
      </span>

      {/* Description */}
      <div
        className="hidden flex-[2] truncate text-sm sm:block"
        style={{ color: permission.description ? "var(--text-secondary)" : "var(--text-muted)" }}
      >
        {permission.description ?? "—"}
      </div>

      {/* Actions */}
      <div className="ml-auto shrink-0">
        <PermissionActions permission={permission} />
      </div>
    </div>
  );
}

// ─── Category Group ───────────────────────────────────────────────────────────

interface CategoryGroupProps {
  group:       PermissionGroup;
  isExpanded:  boolean;
  isFiltering: boolean;
  onToggle:    () => void;
  onMove:      (permission: Permission, direction: "up" | "down") => void;
}

function CategoryGroup({ group, isExpanded, isFiltering, onToggle, onMove }: CategoryGroupProps): ReactElement {
  const { t } = useTranslation();

  const categoryLabel = group.category
    ? group.category.path.replace(/\./g, " / ")
    : t("permissions.uncategorized");

  const sortableIds = group.permissions.map((p) => p.id);

  return (
    <div className="mb-1">
      {/* Category header row */}
      <button
        type="button"
        onClick={onToggle}
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
          className={cn("shrink-0 transition-transform duration-150", isExpanded && "rotate-90")}
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
      {isExpanded && (
        <div
          className="ml-4 border-l"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            {group.permissions.map((perm, index) => (
              <PermissionRow
                key={perm.id}
                permission={perm}
                isFirst={index === 0}
                isLast={index === group.permissions.length - 1}
                isFiltering={isFiltering}
                onMoveUp={() => onMove(perm, "up")}
                onMoveDown={() => onMove(perm, "down")}
              />
            ))}
          </SortableContext>
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
  query,
  onClearQuery,
  collapsedIds,
  onToggleCollapse,
}: PermissionTreeViewProps): ReactElement {
  const { t } = useTranslation();

  // Second live region (§13/B8): dnd-kit renders its OWN announcements via
  // the `accessibility.announcements` prop below, but the move up/down
  // buttons live OUTSIDE dnd-kit and are not covered by it — this state
  // feeds a second `role="status"` region so keyboard-only reordering via
  // those buttons is announced too.
  const [announcement, setAnnouncement] = useState<string>("");

  const reorderMutation = useReorderPermission();

  // Hooks must run unconditionally before the early returns below.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const isFiltering = Boolean(query);
  const allGroups = buildGroups(permissions, categories);
  const groups = isFiltering ? filterGroups(allGroups, query) : allGroups;

  // ─── Reorder helpers (drag drop + move up/down) ────────────────────────────
  // Both gestures resolve against `allGroups` — the unfiltered, persisted-
  // order view — never the search-filtered `groups`, because reorder is
  // disabled while filtering (§13/B9) and a filtered subset has no defined
  // order to reorder against.

  const findCategoryPermissions = (permissionId: string): Permission[] | undefined =>
    allGroups.find((g) => g.permissions.some((p) => p.id === permissionId))?.permissions;

  const categoryLabelFor = (permissionId: string): string => {
    const group = allGroups.find((g) => g.permissions.some((p) => p.id === permissionId));
    return group?.category ? group.category.path.replace(/\./g, " / ") : t("permissions.uncategorized");
  };

  const positionDescriptorFor = (permissionId: string): string => {
    const perms = findCategoryPermissions(permissionId);
    if (!perms) return "";
    const index = perms.findIndex((p) => p.id === permissionId);
    return t("permissions.reorder.position", { index: index + 1, total: perms.length });
  };

  const actionLabelFor = (permissionId: string): string =>
    permissions.find((p) => p.id === permissionId)?.action ?? permissionId;

  const runReorder = (perm: Permission, overId: string, orderedIds: string[]): void => {
    const { afterPermissionId } = resolveAnchor(orderedIds, perm.id, overId);
    reorderMutation.mutate(
      { id: perm.id, clientId: perm.clientId, overId, afterPermissionId },
      {
        onSuccess: () => setAnnouncement(t("permissions.reorder.moveSuccess", { action: perm.action })),
        onError:   () => setAnnouncement(t("permissions.reorder.moveError", { action: perm.action })),
      }
    );
  };

  const handleMove = (perm: Permission, direction: "up" | "down"): void => {
    const categoryPermissions = findCategoryPermissions(perm.id) ?? [];
    const index = categoryPermissions.findIndex((p) => p.id === perm.id);
    const neighbourIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || neighbourIndex < 0 || neighbourIndex >= categoryPermissions.length) {
      return;
    }
    const overId = categoryPermissions[neighbourIndex].id;
    runReorder(perm, overId, categoryPermissions.map((p) => p.id));
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const categoryPermissions = findCategoryPermissions(String(active.id));
    if (!categoryPermissions) {
      return;
    }

    // Defensive guard: per-category SortableContext scoping makes a
    // cross-category drop structurally impossible in the UI, but dnd-kit's
    // collision detector still runs globally — confirm `over` resolved to
    // an id within the SAME category subset before acting on it.
    if (!categoryPermissions.some((p) => p.id === over.id)) {
      return;
    }

    const perm = categoryPermissions.find((p) => p.id === active.id);
    if (!perm) {
      return;
    }

    runReorder(perm, String(over.id), categoryPermissions.map((p) => p.id));
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      t("permissions.reorder.dragStart", { action: actionLabelFor(String(active.id)) }),
    onDragOver: ({ active, over }) => {
      if (!over) {
        return t("permissions.reorder.dragOverNone", { action: actionLabelFor(String(active.id)) });
      }
      return t("permissions.reorder.dragOver", {
        action:   actionLabelFor(String(active.id)),
        position: positionDescriptorFor(String(over.id)),
        category: categoryLabelFor(String(over.id)),
      });
    },
    onDragEnd: ({ active, over }) => {
      if (!over) {
        return t("permissions.reorder.dragEndNone", { action: actionLabelFor(String(active.id)) });
      }
      return t("permissions.reorder.dragEnd", {
        action:   actionLabelFor(String(active.id)),
        position: positionDescriptorFor(String(over.id)),
        category: categoryLabelFor(String(over.id)),
      });
    },
    onDragCancel: ({ active }) =>
      t("permissions.reorder.dragCancel", { action: actionLabelFor(String(active.id)) }),
  };

  if (isFiltering && groups.length === 0) {
    return (
      <div
        className="rounded-xl border"
        style={{
          borderColor:     "var(--border-subtle)",
          backgroundColor: "var(--surface-1)",
        }}
      >
        <EmptyState
          icon={SearchX}
          title={t("permissions.search.noResultsTitle")}
          message={t("permissions.search.noResultsMessage", { query })}
          action={
            <Button variant="outline" size="sm" onClick={onClearQuery}>
              {t("permissions.search.clear")}
            </Button>
          }
        />
      </div>
    );
  }

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
        className="grid grid-cols-[1fr_2fr_4.5rem] border-b px-4 py-2"
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

      {/* Filtering hint (§13/B9): reordering is disabled while a search
          query narrows the visible set, because a filtered subset has no
          defined order to reorder against. */}
      {isFiltering && (
        <div
          className="border-b px-4 py-1.5 text-[11px]"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
        >
          {t("permissions.reorder.disabledWhileFiltering")}
        </div>
      )}

      {/* Second live region (§13/B8) — covers the move up/down buttons,
          which dnd-kit's own announcements do not reach. */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Groups */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{ announcements }}
      >
        <div className="p-2">
          {groups.map((group) => {
            const key = groupKey(group.category);
            // Matching groups auto-expand while filtering, derived — never
            // written to collapse state — so the admin's collapse choice
            // survives once the filter clears.
            const isExpanded = isFiltering ? true : !collapsedIds.has(key);
            return (
              <CategoryGroup
                key={key}
                group={group}
                isExpanded={isExpanded}
                isFiltering={isFiltering}
                onToggle={() => onToggleCollapse(key)}
                onMove={handleMove}
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
